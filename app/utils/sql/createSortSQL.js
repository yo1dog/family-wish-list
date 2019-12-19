const SQL = require('@yo1dog/sql');

/**
 * @typedef SortOptions
 * @property {string} columnName
 * @property {1|-1} directionNum
 */

/**
 * @param {SortOptions[]} sortOptions
 * @returns {SQL.SQLQuery}
 */
module.exports = function createSortSQL(sortOptions) {
  if (!sortOptions) {
    return SQL``;
  }
  
  if (Array.isArray(sortOptions)) {
    return SQL`ORDER BY `.append(sortOptions.map(createSQLSortPartStr).join(', '));
  }
  
  return SQL`ORDER BY `.append(createSQLSortPartStr(sortOptions));
};

/** @param {SortOptions} options */
function createSQLSortPartStr({columnName, directionNum}) {
  return `${columnName} ${directionNum < 0? 'DESC' : 'ASC'}`;
}
