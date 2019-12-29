const db     = require('../../../db');
const SQL    = require('@yo1dog/sql');
const CError = require('@yo1dog/cerror');


/**
 * @param {object} options
 * @param {number|string} options.collectionId
 */
module.exports = async function wishListCollectionViewData({collectionId}) {
  // get the collection
  const {rows: [collection]} = await db.query(SQL`
    SELECT
      id,
      name
    FROM wish_list_collection
    WHERE id = ${collectionId}
  `)
  .catch(err => {throw new CError(err, `Error SELECTing collection with ID '${collectionId}'.`);});
  
  // get the wish lists
  const {rows: wishLists} = await db.query(SQL`
    SELECT
      wish_list.id,
      wish_list.owner_user_id,
      usr.first_name AS owner_user_first_name
    FROM wish_list
    LEFT JOIN usr ON
      usr.id = wish_list.owner_user_id
    WHERE wish_list_collection_id = ${collectionId}
    ORDER BY
      usr.first_name ASC,
      usr.id ASC
  `)
  .catch(err => {throw new CError(err, `Error SELECTing wish lists for collection with ID '${collectionId}'.`);});
  
  return {
    collection,
    wishLists
  };
};