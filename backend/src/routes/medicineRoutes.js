const express = require('express');
const router = express.Router();
const { getAllMedicines, getMedicineCategories } = require('../controllers/medicineController');

router.get('/categories', getMedicineCategories);
router.get('/', getAllMedicines);

module.exports = router;

