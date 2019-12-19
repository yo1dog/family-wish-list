const express             = require('express');
const cookieParser        = require('cookie-parser');
const parseAuthMiddleware = require('../common/middleware/parseAuthMiddleware');


const router = express.Router();

// parse cookies
router.use(cookieParser());

// parse bodies
router.use(express.json());
router.use(express.urlencoded({extended: true}));

// parse authorization
router.use(parseAuthMiddleware);

// sub routers
router.use('/api', require('../api/apiRouter'));
router.use('/',    require('../web/webRouter'));

module.exports = router;