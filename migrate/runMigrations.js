const config     = require('../app/config');
const db         = require('../app/db');
const fs         = require('fs');
const SQL        = require('@yo1dog/sql');
const CError     = require('@yo1dog/cerror');
const MultiError = require('@yo1dog/multi-error');

/**
 * @callback MigrationRunFn
 * @param {IMigrationContext} context
 * @returns {Promise<string | undefined | void>} 
 * 
 * @typedef IMigrationDef
 * @property {MigrationRunFn} run
 * 
 * @typedef IMigration
 * @property {string} slug
 * @property {string} filename
 * @property {MigrationRunFn} run
 * 
 * @typedef IMigrationContext
 * @property {IMigrationAttempt[]} migrationAttempts
 * 
 * @typedef IMigrationAttempt
 * @property {string}           id
 * @property {string}           slug
 * @property {TMigrationStatus} status
 * @property {Date}             start_ts
 * @property {Date | null}      end_ts
 * @property {string | null}    err
 * @property {string | null}    result
 * 
 * @typedef {'pending'|'failed'|'complete'} TMigrationStatus
 */


async function start() {
  console.log('Running migrations...');
  console.log(new Date().toISOString());
  const startTimeMs = Date.now();
  
  // check if we should force re-running of failed migrations
  const force = (process.argv[2] || '').trim() === '-f';
  if (force) {
    console.log('Force enabled.');
  }
  
  // connect to the db
  const psqlUrl = config.psqlUrlAdmin;
  if (!psqlUrl) throw new Error(`PSQL admin URL is not configured.`);
  
  console.log(`Using PSQL URL '${psqlUrl}'.`);
  db.init({psqlUrl});
  
  await initMigrations();
  await runMigrations({force});
  
  const endTimeMs = Date.now();
  console.log(`Took ${endTimeMs - startTimeMs}ms`);
  
  process.exit(0);
}
start().catch(err => {
  console.error(err);
  process.exit(1);
});

/**
 * @param {{
 *   force?: boolean
 * }} options 
 */
async function runMigrations({force}) {
  // get all the migration functions
  console.log('Getting migrations...');
  const dir = `${__dirname}/migrations`;
  const migrations = getMigrations(dir);
  
  console.log(`${migrations.length} migrations found`);
  
  // run each migration
  console.log('Processing migrations...');
  let numMigrationsRan = 0;
  
  for (const migration of migrations) {
    const {didRun, noRunReason} = await processMigration(migration, {force})
    .catch(err => {throw new CError(err, `Error processing migration with slug '${migration.slug}' from file '${migration.filename}'.`);});
    
    if (didRun) {
      ++numMigrationsRan;
      continue;
    }
    
    if (noRunReason === 'previously-ran') {
      continue;
    }
    
    console.log('');
    console.error('!!!!!');
    console.error('Stopped early');
    console.error('!!!!!');
    break;
  }
  
  console.log('-----');
  console.log(`${numMigrationsRan} migrations ran`);
}

/**
 * @param {IMigration} migration 
 * @param {{
 *   force?: boolean
 * }} options 
 * @returns {Promise<{didRun: boolean, noRunReason?: string}>}
 */
async function processMigration(migration, {force}) {
  // get all the attempts for the migration
  const result = await db.getPool().query(SQL`
    SELECT
      id, slug, status, start_ts, end_ts, err, result
    FROM migration_attempt
    WHERE slug = ${migration.slug}
    ORDER BY start_ts DESC
  `)
  .catch(err => {throw new CError(err, `Error SELECTing migration_attempt with slug '${migration.slug}'.`);});
  
  const migrationAttempts = result.rows;
  
  // check if the migration should run
  const noRunReason = checkMigrationShouldRun(migration, migrationAttempts, force);
  if (noRunReason) {
    return {
      didRun: false,
      noRunReason
    };
  }
  
  // create a new attempt
  const startDate = new Date();
  const migrationAttemptId = await createMigrationAttempt(migration, startDate);
  
  // run the migration
  const {migrationResult, migrationErr} = await runMigration(migration, migrationAttempts);
  
  // update the attempt
  const endDate = new Date();
  await updateMigrationAttempt(migration, migrationAttemptId, migrationResult, migrationErr, endDate);
  
  console.log(`${migration.slug} completed in ${endDate.getTime() - startDate.getTime()}ms`);
  return {didRun: true};
}

/**
 * @param {IMigration} migration 
 * @param {IMigrationAttempt[]} migrationAttempts 
 * @param {boolean} force 
 * @returns {string | undefined}
 */
function checkMigrationShouldRun(migration, migrationAttempts, force = false) {
  const latestMigrationAttempt = migrationAttempts[0];
  
  // check if the migration has ever been run
  if (!latestMigrationAttempt) {
    return;
  }
  
  // check if the migration failed previosuly
  if (latestMigrationAttempt.status === 'failed') {
    const msg = `${migration.slug} previously failed on ${latestMigrationAttempt.end_ts? latestMigrationAttempt.end_ts.toISOString() : '<unknown>'}.`;
    
    // check if we should rerun the failed migration
    if (!force) {
      console.error(msg);
      console.error('Not rerunning (Use the -f flag to force rerunning of failed migrations).');
      return 'previously-failed';
    }
    
    console.log(msg + ' Rerunning...');
    return;
  }
  
  // check if the migration is pending
  if (latestMigrationAttempt.status === 'pending') {
    const msg = `${migration.slug} started on ${latestMigrationAttempt.start_ts.toISOString()} but has not finished. It is either currently running or quit unexpectedly.`;
    
    // check if we should rerun the pending migration
    if (!force) {
      console.error(msg);
      console.error('Not rerunning (Use the -f flag to force rerunning of pending migrations).');
      return 'previously-pending';
    }
    
    console.log(msg + ' Rerunning...');
    return;
  }
  
  // the migration has already completed successfully
  console.log(`${migration.slug} already completed on ${latestMigrationAttempt.end_ts? latestMigrationAttempt.end_ts.toISOString() : '<unknown>'}.`);
  return 'previously-ran';
}

/**
 * @param {IMigration} migration 
 * @param {Date} startDate 
 */
async function createMigrationAttempt(migration, startDate) {
  const result = await db.getPool().query(SQL`
    INSERT INTO migration_attempt (
      slug,
      status,
      start_ts
    ) VALUES (
      ${migration.slug},
      'pending',
      ${startDate}
    )
    RETURNING id
  `)
  .catch(err => {throw new CError(err, `Error INSERTing migration_attempt with slug '${migration.slug}'.`);});
  
  const migrationAttemptId = result.rows[0].id;
  return migrationAttemptId;
}

/**
 * @param {IMigration} migration 
 * @param {IMigrationAttempt[]} migrationAttempts 
 * @returns {Promise<{
 *   migrationResult?: string;
 *   migrationErr?: Error;
 * }>}
 */
async function runMigration(migration, migrationAttempts) {
  console.log(`Running ${migration.slug} ...`);
  
  /** @type {IMigrationContext} */
  const context = {migrationAttempts};
  
  /** @type {string | undefined} */ let migrationResult;
  /** @type {Error | undefined} */ let migrationErr;
  try {
    migrationResult = await migration.run(context) || undefined;
  } catch (err) {
    migrationErr = err;
  }
  
  return {migrationResult, migrationErr};
}

/**
 * @param {IMigration}         migration 
 * @param {number}             migrationAttemptId 
 * @param {string | undefined} migrationResult 
 * @param {Error | undefined}  migrationErr 
 * @param {Date}               endDate 
 */
async function updateMigrationAttempt(migration, migrationAttemptId, migrationResult, migrationErr, endDate) {
  let psqlErr;
  try {
    await db.getPool().query(SQL`
      UPDATE migration_attempt SET
        status = ${migrationErr? 'failed' : 'complete'},
        end_ts = ${endDate},
        err    = ${(migrationErr && migrationErr.stack) || null},
        result = ${typeof migrationResult !== 'undefined'? migrationResult : null}
      WHERE id = ${migrationAttemptId}
    `);
  } catch(err) {
    psqlErr = err;
  }
  
  const pgErr = psqlErr? new CError(psqlErr, `Error UPDATEing migration_attempt with ID '${migrationAttemptId}' and slug '${migration.slug}'.`) : null;
  const migrationCErr = migrationErr? new CError(migrationErr, `Error running migration with slug '${migration.slug}'.`) : null;
  
  if (pgErr && migrationCErr) {
    throw new MultiError(pgErr, migrationCErr);
  }
  if (pgErr) {
    throw pgErr;
  }
  if (migrationCErr) {
    throw migrationCErr;
  }
}

/**
 * @param {string} dir 
 * @return {IMigration[]}
 */
function getMigrations(dir) {
  const filenames = fs.readdirSync(dir);
  filenames.sort((a, b) => a.localeCompare(b));
  
  /** @type {IMigration[]} */
  const migrations = [];
  
  for (const filename of filenames) {
    // ignore non-js files
    if (!filename.endsWith('.js')) continue;
    
    migrations.push({
      run     : require(`${dir}/${filename}`),
      slug    : filename.substring(0, filename.length - 3),
      filename: filename
    });
  }
  
  return migrations;
}

async function initMigrations() {
  // check if migrations have been initalized
  const result = await db.getPool().query(SQL`
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'migration_attempt'
  `)
  .catch(err => {throw new CError(err, `Error checking if migrations have been initialized.`);});
  
  if (result.rows.length > 0) {
    return;
  }
  
  // initalize migrations
  console.log(`Initalizing migrations...`);
  await db.getPool().query(SQL`
    SET ROLE fwl_owner;
    
    CREATE TYPE migration_attempt_status AS ENUM (
      'pending',
      'failed',
      'complete'
    );
    
    CREATE TABLE migration_attempt (
      id       SERIAL                   NOT NULL PRIMARY KEY,
      slug     TEXT                     NOT NULL,
      status   migration_attempt_status NOT NULL,
      start_ts TIMESTAMP WITH TIME ZONE NOT NULL,
      end_ts   TIMESTAMP WITH TIME ZONE,
      err      TEXT,
      result   TEXT
    );
    CREATE INDEX ON migration_attempt (slug);
  `)
  .catch(err => {throw new CError(err, `Error creating migration tables.`);});
  
  console.log(`Migrations initalized.`);
}