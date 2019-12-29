const createViewHandler           = require('../../../utils/createViewHandler');
const getRequestState             = require('../../../utils/getRequestState');
const wishListCollectionsViewData = require('../../views/wishListCollection/wishListCollectionsViewData');


module.exports = createViewHandler('wishListCollection/wishListCollectionsView.ejs', async (req) => {
  const {authUser} = getRequestState(req);
  if (!authUser) throw new Error(`Auth user required.`);
  
  return await wishListCollectionsViewData();
});