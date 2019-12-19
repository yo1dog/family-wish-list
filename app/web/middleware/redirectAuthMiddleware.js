const wrapAsyncHandler = require('../../utils/wrapAsyncHandler');
const getRequestState  = require('../../utils/getRequestState');


module.exports = createRedirectAuthMiddleware();
module.exports.create = createRedirectAuthMiddleware;

/**
 * @returns {import('express').Handler}
 */
function createRedirectAuthMiddleware() {
  return wrapAsyncHandler(async (req, res, next) => {
    const callbackURL = req.query.callbackURL;
    const redirectUrl = callbackURL || '/home';
    
    const state = getRequestState(req);
    
    // check for authorized user
    if (state.authUser) {
      return res.redirect(redirectUrl);
    }
    
    return next();
  });
}
