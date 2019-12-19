const express                  = require('express');
const pathUtil                 = require('path');
const redirectAuthMiddleware   = require('./middleware/redirectAuthMiddleware');
const redirectNoAuthMiddleware = require('./middleware/redirectNoAuthMiddleware');


const router = express.Router();

// auth
router.get ('/login',         redirectAuthMiddleware, require('./handlers/auth/loginHandler'));
router.post('/login',         require('./handlers/auth/loginFormHandler'));
router.get ('/logout',        require('./handlers/auth/logoutHandler'));
router.get ('/register',      redirectAuthMiddleware, require('./handlers/auth/registerHandler'));
router.post('/register',      require('./handlers/auth/registerFormHandler'));
router.get ('/resetPassword', redirectAuthMiddleware, require('./handlers/auth/resetPasswordHandler'));
router.post('/resetPassword', require('./handlers/auth/resetPasswordFormHandler'));

// user
router.get('/home', redirectNoAuthMiddleware, require('./handlers/user/homeHandler'));

// suggestion
router.get ('/suggestions',          require('./handlers/suggestion/suggestionsHandler'));
router.post('/suggestions',          require('./handlers/suggestion/createSuggestionFormHandler'));
router.get ('/suggestions/thankyou', require('./handlers/suggestion/suggestionThankYouHandler'));


// root
router.get('/', require('./handlers/rootHandler'));

// static
router.use('/', express.static(pathUtil.join(__dirname, 'static')));

module.exports = router;