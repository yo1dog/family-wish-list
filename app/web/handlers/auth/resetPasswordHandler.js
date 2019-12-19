const createViewHandler = require('../../../utils/createViewHandler');


module.exports = createViewHandler('auth/resetPasswordView.ejs', req => ({
  callbackUrl: req.query.callbackUrl
}));