const wrapAsyncHandler    = require('../../../utils/wrapAsyncHandler');
const createViewData      = require('../../../utils/createViewData');
const suggestionsViewData = require('../../views/suggestion/suggestionsViewData');
const db                  = require('../../../db');
const SQL                 = require('@yo1dog/sql');
const CError              = require('@yo1dog/cerror');


module.exports = wrapAsyncHandler(async (req, res, next) => {
  // get referring URL
  const referringUrl = req.query.referringUrl;
  
  // get form data
  const authorName = (req.body.name || '').trim();
  const text       = (req.body.text || '').trim();
  
  if (!text) {
    return returnFormError('Please enter a suggestion.');
  }
  
  // create suggestion
  await db.query(SQL`
    INSERT INTO suggestion (
      author_name,
      text,
      referring_url
    ) VALUES (
      ${authorName || 'Anonymous'},
      ${text},
      ${referringUrl || null}
    )
  `)
  .catch(err => {throw new CError(err, `Error INSERTing suggestion.`);});
  
  // redirect
  return res.redirect('/suggestions/thankyou');
  
  
  /** @param {string} message */
  async function returnFormError(message) {
    return res.render('suggestion/suggestionsView.ejs', createViewData(req, {
      ...await suggestionsViewData(),
      formErrorMessage: message,
      referringUrl,
      authorName,
      text
    }));
  }
});