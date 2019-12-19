const APIError         = require('@yo1dog/api-error');
const wrapAsyncHandler = require('../../utils/wrapAsyncHandler');
const getRequestState  = require('../../utils/getRequestState');


module.exports = createRequireAuthMiddleware();
module.exports.create = createRequireAuthMiddleware;

/**
 * @returns {import('express').Handler}
 */
function createRequireAuthMiddleware() {
  return wrapAsyncHandler(async (req, res, next) => {
    const state = getRequestState(req);
    
    // check for authorized user
    if (!state.authUser) {
      throw new APIError(401);
    }
    
    return next();
  });
}
