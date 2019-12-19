const wrapAsyncHandler = require('../../../utils/wrapAsyncHandler');
const authUtil         = require('../../../utils/authUtil');
const createViewData   = require('../../../utils/createViewData');
const db               = require('../../../db');
const SQL              = require('@yo1dog/sql');
const CError           = require('@yo1dog/cerror');
const PGError          = require('@yo1dog/pg-error');


module.exports = wrapAsyncHandler(async (req, res, next) => {
  // get callback
  const callbackUrl = req.query.callbackUrl;
  const defaultCallbackUrl = '/home';
  
  // get user data
  const firstName       = (req.body.firstName || '').trim();
  const lastName        = (req.body.lastName  || '').trim();
  const email           = (req.body.email     || '').trim();
  const password        = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;
  
  if (!firstName) return returnFormError('Please enter your first name.');
  if (!lastName ) return returnFormError('Please enter your last name.');
  if (!email    ) return returnFormError('Please enter your email address.');
  if (!password ) return returnFormError('Please enter your password.');
  
  if (password !== passwordConfirm) {
    return returnFormError('Passwords must match.');
  }
  
  const passwordHash = authUtil.hashPassword(password);
  const authToken = authUtil.createAuthToken();
  
  // create user
  try {
    await db.query(SQL`
      INSERT INTO usr (
        first_name,
        last_name,
        email,
        password_hash,
        auth_token
      ) VALUES (
        ${firstName},
        ${lastName},
        ${email},
        ${passwordHash},
        ${authToken}
      )
    `);
  }
  catch (err) {
    // check if duplicate email
    if (
      err instanceof PGError &&
      err.meta.code === '23505' &&
      err.meta.constraint === 'usr_email_idx'
    ) {
      return returnFormError('Email already in use.');
    }
    
    throw new CError(err, `Error INSERTing user.`);
  }
  
  // set auth token cookie
  res.cookie(authUtil.cookieName, authToken);
  
  // redirect
  return res.redirect(callbackUrl || defaultCallbackUrl);
  
  
  /** @param {string} message */
  function returnFormError(message) {
    return res.render('auth/registerView.ejs', createViewData(req, {
      formErrorMessage: message,
      firstName,
      lastName,
      email,
      callbackUrl
    }));
  }
});