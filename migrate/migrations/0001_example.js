const SQL = require('@yo1dog/sql');
const db = require('../../app/db');
const transactionWrap = require('../../app/utils/sql/transactionWrap');


/** @type {import('../runMigrations').MigrationRunFn} */
module.exports = async function run(context) {
  return await transactionWrap(db.getPool(), async dbClient => {
    // NOTE: transactionWrap is required for multiple queries to be executed as part of a
    //       transaction. It is good practice to always include it in migrations.
    // NOTE: Multiple commands in a single query are executed in a transaction.
    // NOTE: If multiple commands exist in a query, the result is an array containing the
    //       result for each command.
    // NOTE: fwl_owner role required for structure commands (CREATE, DROP, ALTER, etc.)
    const minVal = 0;
    const maxVal = 10;
    await db.query(dbClient, SQL`
      SET ROLE fwl_owner;
      CREATE TEMP TABLE fubar (id SERIAL, col INT);
      INSERT INTO fubar (col) SELECT generate_series(-5, 15);
      INSERT INTO fubar (col) VALUES (NULL), (NULL), (NULL);
    `);
    const deleteResult     = await dbClient.query(SQL`DELETE FROM fubar WHERE col IS NULL RETURNING id`);
    const lowUpdateResult  = await dbClient.query(SQL`UPDATE fubar SET col = ${minVal} WHERE col < ${minVal}`);
    const highUpdateResult = await dbClient.query(SQL`UPDATE fubar SET col = ${maxVal} WHERE col > ${maxVal}`);
    
    // this optional return string is saved in the `result` column on the `migration_attempt`
    // row in the database. This can be usefull for recording notes/results of migrations and
    // keeping paper trails for future debugging. It does not have to be JSON.
    return JSON.stringify({
      deletedIds    : deleteResult.rows.map(row => row.id),
      numClampedUp  : lowUpdateResult.rowCount,
      numClampedDown: highUpdateResult.rowCount
    });
  });
};