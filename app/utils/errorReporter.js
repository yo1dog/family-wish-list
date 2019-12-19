const CError     = require('@yo1dog/cerror');
const MultiError = require('@yo1dog/multi-error');


module.exports = class ErrorReporter {
  /**
   * @param {Error} err 
   */
  async report(err) { // eslint-disable-line handle-callback-err
    // noop
  }
  
  /**
   * @param {Error} err 
   * @param {(err: Error) => Error} [wrapErrFn] 
   */
  reportDetatched(err, wrapErrFn) {
    this.report(err)
    .catch(reportErr => {
      reportErr = wrapErrFn? wrapErrFn(err) : new CError(err, 'Error reporting error.');
      console.error(new MultiError(reportErr, err));
    });
  }
  
  /**
   * @param {number} [timeout] 
   */
  async flush(timeout) {
    // noop
  }
};