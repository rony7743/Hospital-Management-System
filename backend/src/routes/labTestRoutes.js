const express = require('express');
const router = express.Router();
const { getLabCatalog, getLabTests, bookLabTest } = require('../controllers/labTestController');
const { optionalAuthenticateToken } = require('../middleware/auth');

router.get('/catalog', getLabCatalog);
router.get('/', optionalAuthenticateToken, getLabTests);
router.post('/', optionalAuthenticateToken, bookLabTest);

module.exports = router;

