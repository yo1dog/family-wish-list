const db     = require('../../../db');
const SQL    = require('@yo1dog/sql');
const CError = require('@yo1dog/cerror');

/**
 * @param {object} options
 * @param {string} [options.referringUrl]
 * @param {string} [options.authorName]
 */
module.exports = async function suggestionsViewData({referringUrl, authorName} = {}) {
  const {rows: suggestions} = await db.query(SQL`
    SELECT
      author_name,
      text
    FROM suggestion
  `)
  .catch(err => {throw new CError(err, `Error SELECTing suggestions.`);});
  
  return {
    referringUrl,
    authorName,
    suggestions
  };
};