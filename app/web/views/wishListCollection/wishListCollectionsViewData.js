const db     = require('../../../db');
const SQL    = require('@yo1dog/sql');
const CError = require('@yo1dog/cerror');


module.exports = async function wishListCollectionsViewData() {
  const {rows: collections} = await db.query(SQL`
    SELECT
      id,
      name
    FROM wish_list_collection
    ORDER BY
      is_hidden ASC,
      id DESC
  `)
  .catch(err => {throw new CError(err, `Error SELECTing collections.`);});
  
  return {
    collections
  };
};