const wrapAsyncHandler = require('../../utils/wrapAsyncHandler');


module.exports = wrapAsyncHandler(async (req, res, next) => {
  return res.status(200).json({ok: 1});
});