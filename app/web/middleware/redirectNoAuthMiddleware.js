const wrapAsyncHandler = require('../../utils/wrapAsyncHandler');
const getRequestState  = require('../../utils/getRequestState');
const urlUtil          = require('url');


module.exports = createRedirectNoAuthMiddleware();
module.exports.create = createRedirectNoAuthMiddleware;

/**
 * @returns {import('express').Handler}
 */
function createRedirectNoAuthMiddleware() {
  return wrapAsyncHandler(async (req, res, next) => {
    const reqUrlObj = urlUtil.parse(req.url);
    const currentUrl = (reqUrlObj.path || '/') + (reqUrlObj.hash || '');
    
    const redirectUrl = `/login?callbackUrl=${encodeURIComponent(currentUrl)}`;
    
    const state = getRequestState(req);
    
    // check for authorized user
    if (!state.authUser) {
      return res.redirect(redirectUrl);
    }
    
    return next();
  });
}
