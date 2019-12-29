const wrapAsyncHandler = require('../../../utils/wrapAsyncHandler');
const getRequestState  = require('../../../utils/getRequestState');
const db               = require('../../../db');
const SQL              = require('@yo1dog/sql');
const CError           = require('@yo1dog/cerror');
const APIError         = require('@yo1dog/api-error');


module.exports = wrapAsyncHandler(async (req, res, next) => {
  const {authUser} = getRequestState(req);
  if (!authUser) throw new Error(`Auth user required.`);
  
  const {itemId} = req.params;
  if (!itemId) {
    throw new APIError(400, 'Item ID is required.');
  }
  
  const {rows: [item]} = await db.query(SQL`
    SELECT
      wish_list_id,
      creator_user_id
    FROM wish_list_item
    WHERE id = ${itemId}
  `)
  .catch(err => {throw new CError(err, `Error SELECTing wish list item with ID '${itemId}'.`);});
  
  if (!item) {
    throw new APIError(404, 'Item does not exist.');
  }
  if (item.creator_user_id !== authUser.id) {
    throw new APIError(401);
  }
  
  await db.query(SQL`
    DELETE FROM wish_list_item
    WHERE id = ${itemId}
  `)
  .catch(err => {throw new CError(err, `Error DELETEing wish list item with ID '${itemId}'.`);});
  
  // redirect
  return res.redirect(`/wishLists/${item.wish_list_id}`);
});