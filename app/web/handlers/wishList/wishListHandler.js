const createViewHandler = require('../../../utils/createViewHandler');
const getRequestState   = require('../../../utils/getRequestState');
const wishListViewData  = require('../../views/wishList/wishListViewData');


module.exports = createViewHandler('wishList/wishListView.ejs', async (req) => {
  const {authUser} = getRequestState(req);
  if (!authUser) throw new Error(`Auth user required.`);
  
  return await wishListViewData({wishListId: req.params.wishListId});
});