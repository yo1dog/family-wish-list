/**
 * @param {string} str
 * @returns {string}
 */
module.exports = function escapeLikeStr(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
};