const SQL = require('@yo1dog/sql');

/**
 * @param {{
 *   skip : [number];
 *   limit: [number];
 * }} options
 * @returns {SQL.SQLQuery}
 */
module.exports = function createPagingSQL({skip, limit}) {
  const sql = SQL``;
  
  if (typeof skip !== 'undefined' && skip !== null) {
    sql.append('OFFSET ').appendValue(skip);
  }
  
  if (typeof limit !== 'undefined' && limit !== null) {
    if (!sql.isEmpty()) {
      sql.append(' ');
    }
    
    sql.append('LIMIT ').appendValue(limit);
  }
  
  return sql;
};