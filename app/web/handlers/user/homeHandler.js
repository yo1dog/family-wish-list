const wrapAsyncHandler = require('../../../utils/wrapAsyncHandler');
const createViewData   = require('../../../utils/createViewData');


module.exports = wrapAsyncHandler(async (req, res, next) => {
  return res.render('user/homeView.ejs', createViewData(req, {}));
});