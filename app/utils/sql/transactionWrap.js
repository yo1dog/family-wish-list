const CError     = require('@yo1dog/cerror');
const MultiError = require('@yo1dog/multi-error');

/**
 * @template T
 * @callback ExecFn
 * @param {import('pg').PoolClient} dbClient
 * @returns {Promise<T>}
 */

/**
 * Runs the given function inside of a PSQL transaction.
 * 
 * The transaction is started, then function is run. If the function returns an error,
 * the transaction is rolled-back. Otherwise, the transaction is commited.
 * 
 * @template T
 * @param {import('pg').Pool} dbPool
 * @param {ExecFn<T>} fn
 * @returns {Promise<T>}
 */
async function transactionWrap(dbPool, fn) {
  // get a client from the pool (this is required for transactions)
  // >>>>> the PSQL client has is retrieved from the pool here
  const dbClient = await dbPool.connect()
  .catch(err => {throw new CError(err, `Error getting a client from the connection pool.`);});
  
  // execute the transaction
  try {
    const fnReturn = await execTransaction(dbClient, fn);
    return fnReturn; // pass through the function's return
  }
  finally {
    // release the client back to the pool
    // >>>>> the PSQL client is always returned to the pool by this point
    dbClient.release();
  }
}

/**
 * @template T
 * @param {import('pg').PoolClient} dbClient 
 * @param {ExecFn<T>} fn 
 * @returns {Promise<T>}
 */
async function execTransaction(dbClient, fn) {
  // >>>>> the PSQL transaction starts here
  await dbClient.query('BEGIN')
  .catch(err => {throw new CError(err, `Error BEGINing PSQL transaction.`);});
  
  // run the given function
  /** @type {T} */
  let fnReturn;
  try {
    fnReturn = await fn(dbClient);
  }
  catch(fnErr) {
    // there was an error, rollback the transaction
    await rollback(dbClient, fnErr);
    // >>>>>  the PSQL transaction is always ended by this point
    throw fnErr;
  }
  
  // there was no error, commit the transaction
  await commit(dbClient);
  
  // >>>>>  the PSQL transaction is always ended by this point
  return fnReturn; // pass through the function's return
}

/**
 * @param {import('pg').PoolClient} dbClient 
 */
async function commit(dbClient) {
  try {
    await dbClient.query('COMMIT');
  }
  catch(err) {
    // if there was an error commiting, rollback the transaction
    const cerr = new CError(err, 'Error COMMITing PSQL transaction.');
    await rollback(dbClient, cerr);
    throw cerr;
  }
}

/**
 * @param {import('pg').PoolClient} dbClient 
 * @param {Error} err
 */
async function rollback(dbClient, err) {
  try {
    await dbClient.query('ROLLBACK');
  }
  catch(rollbackErr) {
    // there was an error rolling back the transaction
    throw new MultiError(
      new CError(rollbackErr, '!!! Error ROLLBACKing PSQL transaction. !!!'),
      err
    );
  }
}

module.exports = transactionWrap;