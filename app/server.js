const cluster       = require('cluster');
const config        = require('./config');
const CError        = require('@yo1dog/cerror');
const MultiError    = require('@yo1dog/multi-error');
const ErrorReporter = require('./utils/errorReporter');

/** @type {ErrorReporter | null} */
let errorReporter = null;


module.exports = {
  /**
   * @param {{
   *   isPrimaryWorker: boolean;
   * }} options 
   */
  start({isPrimaryWorker}) {
    (async () => {
      console.log('Starting server...');
      
      handleGracefulExits();
      
      errorReporter = createErrorReporter();
      configureErrorReporterManager(errorReporter);
      configureDB();
      configureAPIKeyManager();
      
      const app = require('./app');
      
      // start the HTTP server
      const {serverHttpPort} = config;
      console.log(`Starting Express server on port ${serverHttpPort}...`);
      app.listen(serverHttpPort);
      
      console.log(`Server listening on port ${serverHttpPort}.`);
      })()
    .catch(err => {throw err;});
  }
};

function createErrorReporter() {
  return new ErrorReporter();
}

/** @param {ErrorReporter} errorReporter */
function configureErrorReporterManager(errorReporter) {
  require('./utils/errorReporterManager').init(errorReporter);
}

function configureDB() {
  if (!config.psqlUrl) throw new Error(`PSQL URL not configured.`);
  
  console.log(`Using PSQL URL '${config.psqlUrl}'.`);
  
  require('./db').init({
    psqlUrl: config.psqlUrl
  });
}

function configureAPIKeyManager() {
  require('./utils/apiKeyManager').init(config.apiKeys);
}

function handleGracefulExits() {
  let exiting = false;
  
  // catch uncaught exceptions and unhandled rejections
  process.on('unhandledRejection', err => {
    throw err;
  });
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.on('uncaughtException', async err => {
    console.error('Uncaught exception!!!');
    
    // log the error
    console.error(err);
    
    // if we are already in the process of exiting then exit immediately
    // this prevents an infinite chain if our uncaught exception handler
    // throws an exception at any point
    if (exiting) {
      return process.exit(66);
    }
    exiting = true;
    
    // disconnect the worker
    if (cluster.worker) {
      cluster.worker.disconnect();
    }
    
    if (!errorReporter) {
      // if we don't have an error reporter, just exit
      return process.exit(68);
    }
    
    // always exit after a certain time
    setTimeout(() => {
      console.error('!!!!! EXITING BEFORE FLUSHING ERROR REPORTER !!!!!');
      return process.exit(69);
    }, 5*1000);
    
    // report the error
    await errorReporter.report(err)
    .catch(reportErr => {
      reportErr = new CError(reportErr, '!!!!! ERROR REPORTING UNCAUGHT ERROR !!!!!');
      console.error(new MultiError(reportErr, err));
    });
    
    // flush error reporter
    await errorReporter.flush(4*1000)
    .catch(flushErr => {
      console.error(new CError(flushErr, `!!!!! ERROR FLUSHING ERROR REPORTER !!!!!`));
    });
    
    // exit after flushing
    return process.exit(70);
  });
}