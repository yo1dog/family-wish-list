/**
 * @callback AsyncHandler
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<any>}
 */

/**
 * @param {AsyncHandler} asyncHandler
 * @returns {import('express').Handler}
 */
module.exports = function wrapAsyncHandler(asyncHandler) {
  return async function wrappedAsyncHandler(req, res, next) {
    try {
      await asyncHandler(req, res, next);
    }
    catch(err) {
      return next(err);
    }
  };
};