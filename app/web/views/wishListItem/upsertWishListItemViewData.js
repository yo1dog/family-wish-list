const getWishListName = require('../../../utils/getWishListName');
const db              = require('../../../db');
const SQL             = require('@yo1dog/sql');
const CError          = require('@yo1dog/cerror');


/**
 * @param {object} options
 * @param {number|string} [options.wishListId]
 * @param {number|string} [options.itemId]
 * @param {number|string} options.authUserId
 */
module.exports = async function upsertWishListItemViewData({wishListId, itemId, authUserId}) {
  // get the item
  let item;
  if (itemId) {
    const result = await db.query(SQL`
      SELECT
        id,
        name,
        description,
        url,
        image_url,
        wish_list_id
      FROM wish_list_item
      WHERE id = ${itemId}
    `)
    .catch(err => {throw new CError(err, `Error SELECTing item with ID '${itemId}'.`);});
    
    item = result.rows[0];
    wishListId = item.wish_list_id;
  }
  else {
    item = {};
  }
  
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
  
  const wishListName = getWishListName(
    wishList.owner_user_id === authUserId,
    wishList.owner_user_first_name
  );
  
  return {
    wishList,
    item,
    wishListName
  };
};