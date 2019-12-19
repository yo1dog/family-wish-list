/** @type {import('./errorReporter') | null} */
let _errorReporter = null;

module.exports = {
  /**
   * @param {import('./errorReporter')} errorReporter
   */
  init(errorReporter) {
    _errorReporter = errorReporter;
  },
  
  getErrorReporter() {
    if (!_errorReporter) throw new Error('Attempting to get Error Reporter before initializing.');
    return _errorReporter;
  }
};