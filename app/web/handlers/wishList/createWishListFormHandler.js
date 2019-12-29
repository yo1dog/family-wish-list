const wrapAsyncHandler = require('../../../utils/wrapAsyncHandler');
const getRequestState   = require('../../../utils/getRequestState');
const db               = require('../../../db');
const SQL              = require('@yo1dog/sql');
const CError           = require('@yo1dog/cerror');
const APIError         = require('@yo1dog/api-error');
const PGError          = require('@yo1dog/pg-error');


module.exports = wrapAsyncHandler(async (req, res, next) => {
  const {authUser} = getRequestState(req);
  if (!authUser) throw new Error(`Auth user required.`);
  
  const {collectionId} = req.params;
  
  let wishListId;
  try {
    const result = await db.query(SQL`
      INSERT INTO wish_list (
        wish_list_collection_id,
        owner_user_id
      )
      VALUES (
        ${collectionId},
        ${authUser.id}
      )
      RETURNING id
    `);
    wishListId = result.rows[0].id;
  }
  catch (err) {
    // check if duplicate wish list
    if (
      err instanceof PGError  &&
      err.meta.code === '23505' &&
      err.meta.constraint === 'wish_list_wish_list_collection_id_owner_user_id_idx'
    ) {
      throw CError.chain(err, new APIError(400, 'Wish list already exists.'));
    }
    
    throw err;
  }
  
  // redirect
  return res.redirect(`/wishLists/${wishListId}`);
});