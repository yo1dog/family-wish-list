const createViewHandler   = require('../../../utils/createViewHandler');
const getRequestState     = require('../../../utils/getRequestState');
const suggestionsViewData = require('../../views/suggestion/suggestionsViewData');


module.exports = createViewHandler('suggestion/suggestionsView.ejs', async (req) => {
  const state = getRequestState(req);
  
  const referringURL = req.query.referringURL;
  const authorName   = state.authUser? `${state.authUser.first_name} ${state.authUser.last_name}` : 'Anonymous';
  
  return {
    ...await suggestionsViewData(),
    referringURL,
    authorName
  };
});