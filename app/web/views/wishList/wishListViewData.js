const db     = require('../../../db');
const SQL    = require('@yo1dog/sql');
const CError = require('@yo1dog/cerror');


/**
 * @param {object} options
 * @param {number|string} options.wishListId
 */
module.exports = async function wishListViewData({wishListId}) {
  // get the wish list
  const {rows: [wishList]} = await db.query(SQL`
    SELECT
      wish_list.id,
      wish_list.owner_user_id,
      wish_list.wish_list_collection_id,
      usr.first_name  AS owner_user_first_name,
      wish_list_collection.name AS wish_list_collection_name
    FROM wish_list
    LEFT JOIN usr ON
      usr.id = wish_list.owner_user_id
    LEFT JOIN wish_list_collection ON
      wish_list_collection.id = wish_list.wish_list_collection_id
    WHERE wish_list.id = ${wishListId}
  `)
  .catch(err => {throw new CError(err, `Error SELECTing wish list with ID '${wishListId}'.`);});
  
  // get the items
  const {rows: wishListItems} = await db.query(SQL`
    SELECT
      wish_list_item.id,
      wish_list_item.name,
      wish_list_item.description,
      wish_list_item.url,
      wish_list_item.image_url,
      wish_list_item.is_fulfilled,
      wish_list_item.creator_user_id,
      wish_list_item.covered_by_user_id,
      creator_user.first_name    AS creator_user_first_name,
      covered_by_user.first_name AS covered_by_user_first_name
    FROM wish_list_item
    LEFT JOIN usr AS creator_user    ON creator_user.id    = wish_list_item.creator_user_id
    LEFT JOIN usr AS covered_by_user ON covered_by_user.id = wish_list_item.covered_by_user_id
    WHERE wish_list_item.wish_list_id = ${wishListId}
    ORDER BY priority ASC
  `)
  .catch(err => {throw new CError(err, `Error SELECTing items for wish list with ID '${wishListId}'.`);});
  
  return {
    wishList,
    wishListItems
  };
};