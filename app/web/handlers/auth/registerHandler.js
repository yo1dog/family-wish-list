const createViewHandler = require('../../../utils/createViewHandler');


module.exports = createViewHandler('auth/registerView.ejs', req => ({
  callbackUrl: req.query.callbackUrl
}));