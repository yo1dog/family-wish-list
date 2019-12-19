const crypto = require('crypto');
const config = require('../config');


module.exports = {
  cookieName: 'fwl_authToken',
  
  /**
   * @param {string} password 
   * @returns {string}
   */
  hashPassword(password) {
    return (
      crypto.createHash('sha256')
      .update(password, 'utf8')
      .update(config.passwordPrivateKey)
      .digest('hex')
    );
  },
  
  createAuthToken() {
    return crypto.randomBytes(16).toString('hex');
  }
};