const createViewHandler          = require('../../../utils/createViewHandler');
const getRequestState            = require('../../../utils/getRequestState');
const wishListCollectionViewData = require('../../views/wishListCollection/wishListCollectionViewData');


module.exports = createViewHandler('wishListCollection/wishListCollectionView.ejs', async (req) => {
  const {authUser} = getRequestState(req);
  if (!authUser) throw new Error(`Auth user required.`);
  
  return await wishListCollectionViewData({collectionId: req.params.collectionId});
});