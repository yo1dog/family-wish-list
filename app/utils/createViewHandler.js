const wrapAsyncHandler = require('./wrapAsyncHandler');
const createViewData   = require('./createViewData');


/**
 * @param {string} viewFilepath
 * @param {(req: import('express').Request) => Promise<{[key: string]: any}> | {[key: string]: any}} [getDataFn]
 */
module.exports = function createViewHandler(viewFilepath, getDataFn) {
  return wrapAsyncHandler(async (req, res, next) => {
    const data = getDataFn? await getDataFn(req) : {};
    return res.render(viewFilepath, createViewData(req, data));
  });
};