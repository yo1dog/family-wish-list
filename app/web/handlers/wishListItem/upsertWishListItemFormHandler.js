const wrapAsyncHandler           = require('../../../utils/wrapAsyncHandler');
const getRequestState            = require('../../../utils/getRequestState');
const createViewData             = require('../../../utils/createViewData');
const upsertWishListItemViewData = require('../../views/wishListItem/upsertWishListItemViewData');
const db                         = require('../../../db');
const SQL                        = require('@yo1dog/sql');
const CError                     = require('@yo1dog/cerror');
const APIError                   = require('@yo1dog/api-error');


module.exports = wrapAsyncHandler(async (req, res, next) => {
  const {authUser} = getRequestState(req);
  if (!authUser) throw new Error(`Auth user required.`);
  
  const itemId     = req.params.itemId; 
  let   wishListId = req.params.wishListId;
  
  if (itemId) {
    const result = await db.query(SQL`
      SELECT
        creator_user_id,
        wish_list_id
      FROM wish_list_item
      WHERE id = ${itemId}
    `)
    .catch(err => {throw new CError(err, `Error SELECTing wish list item with ID '${itemId}'.`);});
    
    if (result.rows[0].creator_user_id !== authUser.id) {
      throw new APIError(401);
    }
    
    // eslint-disable-next-line require-atomic-updates
    wishListId = result.rows[0].wish_list_id;
  }
  
  /* eslint-disable @typescript-eslint/camelcase */
  const item = {
    id         : itemId,
    name       : (req.body.name        || '').trim(),
    url        : (req.body.url         || '').trim(),
    image_url  : (req.body.imageURL    || '').trim(),
    description: (req.body.description || '').trim()
  };
  /* eslint-enable */
  
  if (!item.name) {
    return returnFormError('Please enter a name.');
  }
  
  // insert or update
  if (item.id) {
    await db.query(SQL`
      UPDATE wish_list_item SET
        name        = ${item.name},
        description = ${item.description},
        url         = ${item.url},
        image_url   = ${item.image_url}
      WHERE id = ${item.id}
    `)
    .catch(err => {throw new CError(err, `Error UPDATEing wish list item with ID '${item.id}'.`);});
  }
  else {
    await db.query(SQL`
      INSERT INTO wish_list_item (
        wish_list_id,
        creator_user_id,
        name,
        description,
        url,
        image_url
      ) VALUES (
        ${wishListId},
        ${authUser.id},
        ${item.name},
        ${item.description},
        ${item.url},
        ${item.image_url}
      )
    `)
    .catch(err => {throw new CError(err, `Error INSERTing wish list item.`);});
  }
  
  // redirect
  return res.redirect(`/wishLists/${wishListId}`);
  
  
  /** @param {string} message */
  async function returnFormError(message) {
    const viewData = await upsertWishListItemViewData({
      itemId,
      wishListId,
      // @ts-ignore
      authUserId: authUser.id
    });
    Object.assign(viewData.item, item);
    
    return res.render('wishListItem/upsertWishListItemView.ejs', createViewData(req, {
      ...viewData,
      formErrorMessage: message
    }));
  }
});