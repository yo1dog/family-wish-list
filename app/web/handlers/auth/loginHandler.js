const createViewHandler = require('../../../utils/createViewHandler');


module.exports = createViewHandler('auth/loginView.ejs', req => ({
  callbackURL: req.query.callbackURL
}));