const APIError         = require('@yo1dog/api-error');
const wrapAsyncHandler = require('../../utils/wrapAsyncHandler');


/** @type {import('express').RequestHandler} */
module.exports = wrapAsyncHandler(async (req, res, next) => {
  throw new APIError(404);
});