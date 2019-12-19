const wrapAsyncHandler = require('../../../utils/wrapAsyncHandler');
const authUtil         = require('../../../utils/authUtil');


module.exports = wrapAsyncHandler(async (req, res, next) => {
  // unset auth token cookie
  res.cookie(authUtil.cookieName, '');
  
  // redirect
  return res.redirect('/');
});