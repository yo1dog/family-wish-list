const wrapAsyncHandler = require('../../../utils/wrapAsyncHandler');
const authUtil         = require('../../../utils/authUtil');
const createViewData   = require('../../../utils/createViewData');
const db               = require('../../../db');
const SQL              = require('@yo1dog/sql');
const CError           = require('@yo1dog/cerror');


module.exports = wrapAsyncHandler(async (req, res, next) => {
  // get callback
  const callbackUrl = req.query.callbackUrl;
  const defaultCallbackUrl = '/home';
  
  // get email and password
  const email    = (req.body.email || '').trim();
  const password = req.body.password;
  
  if (!email   ) return returnFormError('Please enter your email address.');
  if (!password) return returnFormError('Please enter your password.');
  
  // hash password
  const passwordHash = authUtil.hashPassword(password);
  
  // get user by login
  const result = await db.query(SQL`
    SELECT auth_token
    FROM usr
    WHERE email = ${email} AND password_hash = ${passwordHash}
  `)
  .catch(err => {throw new CError(err, `Error SELECTing user by login.`);});
  
  if (result.rows.length === 0) {
    return returnFormError('Invalid email or password.');
  }
  
  // set auth token cookie
  const authToken = result.rows[0].auth_token;
  res.cookie(authUtil.cookieName, authToken);
  
  // redirect
  return res.redirect(callbackUrl || defaultCallbackUrl);
  
  
  /** @param {string} message */
  function returnFormError(message) {
    return res.render('auth/loginView.ejs', createViewData(req, {
      formErrorMessage: message,
      email,
      callbackUrl
    }));
  }
});