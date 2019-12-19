const APIError         = require('@yo1dog/api-error');
const apiKeyManager    = require('../../utils/apiKeyManager');
const wrapAsyncHandler = require('../../utils/wrapAsyncHandler');
const getRequestState  = require('../../utils/getRequestState');


module.exports = createParseAPIKeyMiddleware();
module.exports.create = createParseAPIKeyMiddleware;

function createParseAPIKeyMiddleware() {
  return wrapAsyncHandler(async (req, res, next) => {
    const state = getRequestState(req);
    
    // check if any API keys were configured
    if (apiKeyManager.getKeys().length === 0) {
      return next();
    }
    
    // get API key
    const apiKey = getAPIKey(req);
    if (!apiKey) {
      return next();
    }
    
    // check API key
    if (!apiKeyManager.check(apiKey)) {
      throw new APIError(401, 'Invalid API key.');
    }
    
    // save API key
    state.apiKey = apiKey;
    
    return next();
  });
}

/**
 * @param {import('express').Request} req
 * @returns {string | undefined}
 */
function getAPIKey(req) {
  // get the API key from the query string or header
  const qAPIKey = req.query.apiKey;
  if (typeof qAPIKey === 'string' && qAPIKey.length > 0) {
    return qAPIKey;
  }
  
  const hAPIKey = req.header('X-Api-Key');
  return hAPIKey;
}