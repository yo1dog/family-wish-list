const db               = require('../../db');
const APIError         = require('@yo1dog/api-error');
const SQL              = require('@yo1dog/sql');
const CError           = require('@yo1dog/cerror');
const wrapAsyncHandler = require('../../utils/wrapAsyncHandler');
const getRequestState  = require('../../utils/getRequestState');
const authUtil         = require('../../utils/authUtil');


module.exports = createParseAuthMiddleware();
module.exports.create = createParseAuthMiddleware;

/** @returns {import('express').Handler} */
function createParseAuthMiddleware() {
  return wrapAsyncHandler(async (req, res, next) => {
    const state = getRequestState(req);
    
    // get auth token
    const authToken = getAuthToken(req);
    if (!authToken) {
      return next();
    }
    
    // get authorized user
    const authUser = await getAuthUser(authToken);
    if (!authUser) {
      res.clearCookie(authUtil.cookieName);
      throw new APIError(401, 'Invalid auth token.');
    }
    
    // save authorizer user
    state.authUser = authUser;
    return next();
  });
}

/**
 * @param {import('express').Request} req
 * @returns {string | undefined}
 */
function getAuthToken(req) {
  // get from query string
  const qAuthToken = req.query.authToken;
  if (typeof qAuthToken === 'string' && qAuthToken.length > 0) {
    return qAuthToken;
  }
  
  // get from header
  const authHeaderVal = (req.header('Authorization') || '').trim();
  if (authHeaderVal) {
    const match = /^Bearer\s+(.+)$/i.exec(authHeaderVal);
    if (!match) {
      throw new APIError(400, 'Malformed Authorization header.');
    }
    
    const hAuthToken = match[1];
    return hAuthToken;
  }
  
  // get from cookie
  const cAuthToken = (req.cookies[authUtil.cookieName] || '').trim();
  if (cAuthToken) {
    return cAuthToken;
  }
}

/**
 * @param {string} authToken 
 * @returns {Promise<{[key: string]: any} | undefined>}
 */
async function getAuthUser(authToken) {
  const {rows: [authUser]} = await db.query(SQL`
    SELECT
      id,
      first_name,
      last_name,
      email,
      avatar_image_url,
      is_admin,
      auth_token
    FROM usr
    WHERE auth_token = ${authToken}
  `)
  .catch(err => {throw new CError(err, `Error SELECTing auth user.`);});
  
  return authUser;
}