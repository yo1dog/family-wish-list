const SQL = require('@yo1dog/sql');

/**
 * @param {{[key: string]: any} | {[key: string]: any}[]} cvMapArr
 * @returns {{
 *   columnsSQL?: SQL.SQLQuery;
 *   valuesSQL? : SQL.SQLQuery;
 * }}
 */
module.exports = function createColumnsValuesSQL(cvMapArr) {
  const cvMaps = Array.isArray(cvMapArr)? cvMapArr.slice(0) : [cvMapArr];
  
  if (cvMaps.length === 0) {
    cvMaps.push({});
  }
  
  const columns = Object.keys(cvMaps[0]);
  const columnsSQL = SQL`(${SQL.join(columns, ', ')})`;
  
  
  const valuesSQL = SQL``;
  for (let i = 0; i < cvMaps.length; ++i) {
    const cvMap = cvMaps[i];
    
    if (i > 0) {
      valuesSQL.append(', ');
    }
    
    valuesSQL.append('(');
    
    for (let j = 0; j < columns.length; ++j) {
      const column = columns[j];
      const value = cvMap[column];
      
      if (j > 0) {
        valuesSQL.append(', ');
      }
      
      if (SQL.isSQL(value)) {
        valuesSQL.append(value);
      }
      else {
        valuesSQL.appendValue(value);
      }
    }
    
    valuesSQL.append(')');
  }
  
  return {
    columnsSQL,
    valuesSQL
  };
};