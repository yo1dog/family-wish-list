const pg = require('pg');
const PGError = require('@yo1dog/pg-error');

pg.types.setTypeParser(20, val => BigInt(val));


/** @type {pg.Pool | null} */
let pool = null;

const db = {
  /**
   * @param {{
   *   psqlUrl             : string;
   *   maxNumClients?      : number;
   *   clientIdleTimeoutMs?: number;
   * }} options
   */
  init({
    psqlUrl,
    maxNumClients = 10,
    clientIdleTimeoutMs = 60 * 1000
  }) {
    pool = new pg.Pool({
      connectionString : psqlUrl,
      max              : maxNumClients,
      idleTimeoutMillis: clientIdleTimeoutMs
    });
  },
  
  /**
   * @returns {pg.Pool}
   */
  getPool() {
    if (!pool) {
      throw new Error('Attempting to get database connection pool before the database was initalized.');
    }
    
    return pool;
  },
  
  /**
   * @param {pg.Pool | pg.ClientBase | string | pg.QueryConfig} arg1 
   * @param {string | pg.QueryConfig} [arg2] 
   * @returns {Promise<pg.QueryResult>}
   */
  async query(arg1, arg2) {
    /** @type {pg.Pool | pg.ClientBase} */ let client;
    /** @type {string | pg.QueryConfig} */ let sql;
    
    if (isPool(arg1) || isClient(arg1)) {
      if (!arg2) throw new Error('Client given but no SQL.');
      client = arg1;
      sql = arg2;
    }
    else {
      client = db.getPool();
      sql = arg1;
    }
    
    try {
      return await client.query(sql);
    }
    catch(err) {
      throw new PGError(err, sql);
    }
  }
};

/** @type {(val: any) => val is pg.Pool} */
function isPool(val) {
  return val && val.constructor && val.constructor.name === 'Pool';
}

/** @type {(val: any) => val is pg.ClientBase} */
function isClient(val) {
  return val instanceof pg.Client;
}

module.exports = db;