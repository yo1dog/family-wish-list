const APIError         = require('@yo1dog/api-error');
const apiKeyManager    = require('../../utils/apiKeyManager');
const wrapAsyncHandler = require('../../utils/wrapAsyncHandler');
const getRequestState  = require('../../utils/getRequestState');


module.exports = createRequireAPIKeyMiddleware();
module.exports.create = createRequireAPIKeyMiddleware;

/** @returns {import('express').Handler} */
function createRequireAPIKeyMiddleware() {
  return wrapAsyncHandler(async (req, res, next) => {
    const state = getRequestState(req);
    
    // check if any API keys were configured
    if (apiKeyManager.getKeys().length === 0) {
      return next();
    }
    
    // check for API key
    if (!state.apiKey) {
      throw new APIError(401, 'API key required.');
    }
    
    return next();
  });
}