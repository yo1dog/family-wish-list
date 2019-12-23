const wrapAsyncHandler = require('../../utils/wrapAsyncHandler');
const getRequestState  = require('../../utils/getRequestState');
const db               = require('../../db');
const SQL              = require('@yo1dog/sql');
const APIError         = require('@yo1dog/api-error');


module.exports = wrapAsyncHandler(async (req, res, next) => {
  const {authUser} = getRequestState(req);
  if (!authUser) throw new Error(`Auth user required.`);
  
  const {
    itemId,
    isCovered,
    isFulfilled
  } = req.body;
  
  if (typeof itemId === 'undefined') throw new APIError(400, `itemId is required.`);
  if (typeof itemId !== 'string'   ) throw new APIError(400, `itemId must be a string.`);
  if (itemId.length === 0          ) throw new APIError(400, `itemId must not be empty.`);
  
  if (typeof isCovered === 'undefined') throw new APIError(400, `isCovered is required.`);
  if (typeof isCovered !== 'boolean'  ) throw new APIError(400, `isCovered must be a boolean.`);
  
  if (typeof isFulfilled !== 'undefined') {
    if (typeof isFulfilled !== 'boolean') throw new APIError(400, `isFulfilled must be a boolean.`);
  }
  
  if (isFulfilled && !isCovered) {
    throw new APIError(400, `Item can not be fulfilled it is not covered.`);
  }
  
  await db.transactionWrap(async (dbClient) => {
    // get item info
    const {rows: [itemInfo]} = await db.query(dbClient, SQL`
      SELECT
        wish_list_item.covered_by_user_id,
        wish_list.owner_user_id AS wish_list_owner_user_id
      FROM wish_list_item
      LEFT JOIN wish_list ON
        wish_list.id = wish_list_item.wish_list_id
      WHERE wish_list_item.id = ${itemId}
      FOR UPDATE OF wish_list_item
    `);
    
    // make sure the item exists
    if (!itemInfo) {
      throw new APIError(400, `Unable to find wish list item with ID '${itemId}'.`);
    }
    
    // make sure the item is not already covered by someone else
    if (
      itemInfo.covered_by_user_id &&
      itemInfo.covered_by_user_id !== authUser.id
    ) {
      throw new APIError(400, `The given wish list item is covered by user with ID '${itemInfo.covered_by_user_id}'.`);
    }
    
    // make sure the person covering is not the owner of the item
    if (itemInfo.wish_list_owner_user_id === authUser.id) {
      throw new APIError(400, `The owner of a wish list item can not cover said item.`);
    }
    
    // update the item
    await db.query(dbClient, SQL`
      UPDATE wish_list_item SET
        covered_by_user_id = ${isCovered? authUser.id : null},
        is_fulfilled = ${isFulfilled}
      WHERE id = ${itemId}
    `);
  });
  
  return res.status(204).end();
});