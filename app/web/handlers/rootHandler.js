const wrapAsyncHandler = require('../../utils/wrapAsyncHandler');
const getRequestState  = require('../../utils/getRequestState');


module.exports = wrapAsyncHandler(async (req, res, next) => {
  const state = getRequestState(req);
  return res.redirect(state.authUser? '/home' : '/login');
});