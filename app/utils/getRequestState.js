const reqStateSym = Symbol('RequestStateSymbol');

/**
 * @param {import('express').Request} req
 * @returns {import('../app').RequestState}
 */
module.exports = function getRequestState(req) {
  return (/**@type {any}*/(req)[reqStateSym] = /**@type {any}*/(req)[reqStateSym] || {});
};

module.exports.reqStateSym = reqStateSym;