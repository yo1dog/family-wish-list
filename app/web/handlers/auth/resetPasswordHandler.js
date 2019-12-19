const createViewHandler = require('../../../utils/createViewHandler');


module.exports = createViewHandler('auth/resetPasswordView.ejs', req => ({
  callbackURL: req.query.callbackURL
}));