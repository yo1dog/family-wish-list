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
  const email           = (req.body.email     || '').trim();
  const password        = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;
  
  if (!email    ) return returnFormError('Please enter your email address.');
  if (!password ) return returnFormError('Please enter your password.');
  
  if (password !== passwordConfirm) {
    return returnFormError('Passwords must match.');
  }
  
  const passwordHash = authUtil.hashPassword(password);
  
  // update user
  const result = await db.query(SQL`
    UPDATE usr
    SET password_hash = ${passwordHash}
    WHERE email = ${email}
  `)
  .catch(err => {throw new CError(err, `Error UPDATEing user.`);});
  
  if (result.rowCount === 0) {
    return returnFormError('Email not found.');
  }
  
  // redirect
  return res.redirect(callbackUrl || defaultCallbackUrl);
  
  
  /** @param {string} message */
  function returnFormError(message) {
    return res.render('auth/resetPasswordView.ejs', createViewData(req, {
      formErrorMessage: message,
      email,
      callbackUrl
    }));
  }
});