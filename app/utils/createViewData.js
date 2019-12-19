
const getRequestState = require('./getRequestState');
const urlUtil         = require('url');


/**
 * @param {import('express').Request} req
 * @param {{[key: string]: any}} data
 */
module.exports = function createViewData(req, data = {}) {
  const state = getRequestState(req);
  const reqUrlObj = urlUtil.parse(req.url);
  
  return {
    data: {
      authUser: state.authUser,
      currentUrl: (reqUrlObj.path || '/') + (reqUrlObj.hash || ''),
      ...data
    }
  };
};