const express = require('express');
const router = express.Router();
const { getAllWards, getAllBeds } = require('../controllers/wardBedController');

router.get('/', getAllWards);
router.get('/beds', getAllBeds);

module.exports = router;

