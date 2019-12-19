const createViewHandler = require('../../../utils/createViewHandler');


module.exports = createViewHandler('auth/registerView.ejs', req => ({
  callbackURL: req.query.callbackURL
}));