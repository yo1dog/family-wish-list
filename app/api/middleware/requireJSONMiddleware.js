const APIError         = require('@yo1dog/api-error');
const wrapAsyncHandler = require('../../utils/wrapAsyncHandler');


module.exports = createRequireJSONMiddleware();
module.exports.create = createRequireJSONMiddleware;

/** @returns {import('express').Handler} */
function createRequireJSONMiddleware() {
  return wrapAsyncHandler(async (req, res, next) => {
    if (req.headers['content-type'] !== 'application/json') {
      throw new APIError(415, 'JSON required.');
    }
    return next();
  });
}
