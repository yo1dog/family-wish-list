const express  = require('express');
const pathUtil = require('path');

/**
 * @typedef RequestState
 * @property {string | undefined} [apiKey]
 * @property {{[key: string]: any} | undefined} [authUser]
 */

const app = express();

// pretty-print JSON
app.set('json spaces', '  ');

// setup views
app.set('view engine', 'ejs');
app.set('views', pathUtil.join(__dirname, 'web', 'views'));

// common router and error handlers
app.use(require('./common/commonRouter'));
app.use(require('./common/handlers/handleNotFound'));
app.use(require('./common/handlers/handleErrors'));
  
module.exports = app;
