const createViewHandler = require('../../../utils/createViewHandler');


module.exports = createViewHandler('auth/loginView.ejs', req => ({
  callbackUrl: req.query.callbackUrl
}));