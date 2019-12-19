const express                 = require('express');
const parseAPIKeyMiddleware   = require('./middleware/parseAPIKeyMiddleware');
const requireAPIKeyMiddleware = require('./middleware/requireAPIKeyMiddleware');
const requireAuthMiddleware   = require('../common/middleware/requireAuthMiddleware');


const router = express.Router();

// parse API key
router.use(parseAPIKeyMiddleware);

// require API key for all paths
router.use(requireAPIKeyMiddleware);

// handlers
router.get('/whoami', requireAuthMiddleware, require('./handlers/whoAmIHandler'));
router.get('/',       require('./handlers/rootHandler'));


module.exports = router;