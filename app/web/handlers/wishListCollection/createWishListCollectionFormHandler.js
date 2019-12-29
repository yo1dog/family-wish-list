const wrapAsyncHandler            = require('../../../utils/wrapAsyncHandler');
const getRequestState             = require('../../../utils/getRequestState');
const createViewData              = require('../../../utils/createViewData');
const wishListCollectionsViewData = require('../../views/wishListCollection/wishListCollectionsViewData');
const db                          = require('../../../db');
const SQL                         = require('@yo1dog/sql');
const CError                      = require('@yo1dog/cerror');
const APIError                    = require('@yo1dog/api-error');


module.exports = wrapAsyncHandler(async (req, res, next) => {
  const {authUser} = getRequestState(req);
  if (!authUser) throw new Error(`Auth user required.`);
  
  if (!authUser.is_admin) {
    throw new APIError(401, 'Must be an admin to create collections.');
  }
  
  // get form data
  const collectionName = (req.body.collectionName || '').trim();
  
  if (!collectionName) {
    return returnFormError('Please enter a collection name.');
  }
  
  // create collection
  const {rows: [{id: collectionId}]} = await db.query(SQL`
    INSERT INTO wish_list_collection (
      owner_user_id,
      name
    ) VALUES (
      ${authUser.id},
      ${collectionName}
    )
    RETURNING id
  `)
  .catch(err => {throw new CError(err, `Error INSERTing collection.`);});
  
  // redirect
  return res.redirect(`/collections/${collectionId}`);
  
  /** @param {string} message */
  async function returnFormError(message) {
    return res.render('wishListCollection/wishListCollectionsView.ejs', createViewData(req, {
      ...await wishListCollectionsViewData(),
      formErrorMessage: message,
    }));
  }
});