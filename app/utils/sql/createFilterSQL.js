const SQL = require('@yo1dog/sql');

/**
 * @typedef FilterConfig
 * @property {string} columnName
 * @property {any} value
 */

/**
 * @param {(SQL.SQLQuery | FilterConfig)[]} filters
 * @param {string} [defaultRefName]
 * @returns {SQL.SQLQuery}
 */
module.exports = function createFilterSQL(filters, defaultRefName) {
  if (!filters || filters.length === 0) {
    return SQL``;
  }
  
  const sql = SQL``;
  for (let i = 0; i < filters.length; ++i) {
    const filter = filters[i];
    
    let filterSQL;
    if (SQL.isSQL(filter)) {
      filterSQL = filter;
    }
    else {
      const {columnName, value} = filter;
      
      if (typeof value === 'undefined') {
        continue;
      }
      
      if (!defaultRefName) {
        filterSQL = SQL(columnName);
      }
      else if (columnName.includes('.')) {
        filterSQL = SQL(columnName);
      }
      else {
        filterSQL = SQL(`${defaultRefName}.${columnName}`);
      }
      
      if (SQL.isSQL(value)) {
        filterSQL.append(value);
      }
      else {
        filterSQL.append('=').appendValue(value);
      }
    }
    
    if (!sql.isEmpty()) {
      sql.append(' AND ');
    }
    
    sql.append(filterSQL);
  }
  
  if (sql.isEmpty()) {
    return sql;
  }
  return SQL`WHERE `.append(sql);
};