/** @type {string[] | null} */
let _apiKeys = null;

module.exports = {
    /** @param {string[]} apiKeys */
  init(apiKeys) {
    _apiKeys = apiKeys;
  },

  /** @param {string} apiKey */
  check(apiKey) {
    if (!_apiKeys) throw new Error('Atempting to check API key before initalizing.');
    return _apiKeys.includes(apiKey);
  },

  /** @returns {string[]} */
  getKeys() {
    if (!_apiKeys) throw new Error('Atempting to get API keys before initalizing.');
    return _apiKeys.slice(0);
  }
};