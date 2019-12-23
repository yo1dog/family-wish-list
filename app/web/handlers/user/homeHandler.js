const createViewHandler = require('../../../utils/createViewHandler');
const getRequestState   = require('../../../utils/getRequestState');
const homeViewData      = require('../../views/user/homeViewData');


module.exports = createViewHandler('user/homeView.ejs', async (req) => {
  const {authUser} = getRequestState(req);
  if (!authUser) throw new Error(`Auth user required.`);
  
  return await homeViewData(authUser.id);
});