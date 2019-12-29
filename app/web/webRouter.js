const express                  = require('express');
const pathUtil                 = require('path');
const redirectAuthMiddleware   = require('./middleware/redirectAuthMiddleware');
const redirectNoAuthMiddleware = require('./middleware/redirectNoAuthMiddleware');
const requireAuthMiddleware    = require('../common/middleware/requireAuthMiddleware');


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
router.post('/suggestions/create',   require('./handlers/suggestion/createSuggestionFormHandler'));
router.get ('/suggestions/thankyou', require('./handlers/suggestion/suggestionThankYouHandler'));

// collections
router.get ('/collections',               redirectNoAuthMiddleware, require('./handlers/wishListCollection/wishListCollectionsHandler'));
router.get ('/collections/:collectionId', redirectNoAuthMiddleware, require('./handlers/wishListCollection/wishListCollectionHandler'));
router.post('/collections/create',        requireAuthMiddleware,    require('./handlers/wishListCollection/createWishListCollectionFormHandler'));

// wish lists
router.get('/wishLists/:wishListId', redirectNoAuthMiddleware, require('./handlers/wishList/wishListHandler'));

// root
router.get('/', require('./handlers/rootHandler'));

// static
router.use('/', express.static(pathUtil.join(__dirname, 'static')));

module.exports = router;