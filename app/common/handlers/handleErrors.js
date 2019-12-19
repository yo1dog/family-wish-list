const APIError             = require('@yo1dog/api-error');
const CError               = require('@yo1dog/cerror');
const errorReporterManager = require('../../utils/errorReporterManager');


/** @type {import('express').ErrorRequestHandler} */
module.exports = function handleErrors(maybeErr, req, res, next) {
  // make the err an Error if it is not already
  const err = coerceError(maybeErr);
  
  const status = err instanceof APIError? err.status : 500;
  
  // log 500s
  if (status >= 500) {
    console.log(err);
    errorReporterManager.getErrorReporter().reportDetatched(err);
  }
  
  return res
    .status(status)
    .json({
      status : status,
      message: err.message,
      stack  : typeof err.stack === 'string'? err.stack.split('\n'): [],
      ...(err instanceof APIError? {
        code   : err.code,
        details: err.details
      }: {})
    })
    .end();
};

/**
 * @param {unknown} maybeErr
 * @return {APIError | Error}
 */
function coerceError(maybeErr) {
  // check if there is an APIError anywhere in the error chain
  const apiError = CError.getFirstInstanceOf(maybeErr, APIError);
  if (apiError) {
    return apiError;
  }
  
  /*
  // check if this is an error that is thrown when the body parser tries to parse
  // HTTP bodies as JSON and the JSON is invalid
  if (maybeErr instanceof SyntaxError) {
    return CError.chain(maybeErr, new APIError(400, 'Invalid JSON.'));
  }
  */
  
  // check if this is an error that is thrown when the client disconnects early
  if (maybeErr instanceof Error && maybeErr.message === 'request aborted') {
    return CError.chain(maybeErr, new APIError(400, maybeErr.message));
  }
  
  if (maybeErr instanceof Error) {
    return maybeErr;
  }
  
  // create an API error for non-errors
  return CError.chain(maybeErr, new APIError(500, hasMessage(maybeErr)? maybeErr.message : 'Non-Error'));
}

/**
 * @param {unknown} val
 * @returns {val is {message: string}}
 */
function hasMessage(val) {
  return val && typeof /** @type {any} */(val).message === 'string';
}