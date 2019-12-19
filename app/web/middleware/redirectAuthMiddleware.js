const wrapAsyncHandler = require('../../utils/wrapAsyncHandler');
const getRequestState  = require('../../utils/getRequestState');


module.exports = createRedirectAuthMiddleware();
module.exports.create = createRedirectAuthMiddleware;

/**
 * @returns {import('express').Handler}
 */
function createRedirectAuthMiddleware() {
  return wrapAsyncHandler(async (req, res, next) => {
    const callbackUrl = req.query.callbackUrl;
    const redirectUrl = callbackUrl || '/home';
    
    const state = getRequestState(req);
    
    // check for authorized user
    if (state.authUser) {
      return res.redirect(redirectUrl);
    }
    
    return next();
  });
}
