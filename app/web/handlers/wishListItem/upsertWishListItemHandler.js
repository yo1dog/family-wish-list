const createViewHandler          = require('../../../utils/createViewHandler');
const getRequestState            = require('../../../utils/getRequestState');
const upsertWishListItemViewData = require('../../views/wishListItem/upsertWishListItemViewData');


module.exports = createViewHandler('wishListItem/upsertWishListItemView.ejs', async (req) => {
  const {authUser} = getRequestState(req);
  if (!authUser) throw new Error(`Auth user required.`);
  
  return await upsertWishListItemViewData({
    itemId    : req.params.itemId,
    wishListId: req.params.wishListId,
    authUserId: authUser.id
  });
});