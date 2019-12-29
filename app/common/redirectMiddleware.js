const wrapAsyncHandler = require('../utils/wrapAsyncHandler');


module.exports.create = createRedirectMiddleware;

/**
 * @param {string} url
 * @param {number} [status]
 * @returns {import('express').Handler}
 */
function createRedirectMiddleware(url, status = 301) {
  return wrapAsyncHandler(async (req, res, next) => {
    return res.redirect(url, status);
  });
}
