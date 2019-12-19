const pathUtil = require('path');
const dotenv   = require('dotenv');


dotenv.config({path: pathUtil.join(__dirname, '..', '.env')});

/* eslint-disable no-process-env */
module.exports = {
  serverHttpPort    : parseInt(process.env.PORT || '', 10) || 3000,
  psqlUrl           : process.env.PGURL,
  psqlUrlAdmin      : process.env.PGURL_ADMIN,
  passwordPrivateKey: Buffer.from(process.env.PASSWORD_PRIVATE_KEY || '', 'utf8'),
  apiKeys: (
    (process.env.API_KEYS || '')
    .split(',')
    .map(x => x.trim())
    .filter(x => x)
  )
};