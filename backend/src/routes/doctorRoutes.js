const express = require('express');
const router = express.Router();
const {
  getAllDoctors,
  getDoctorById,
  getAllDepartments,
} = require('../controllers/doctorController');

router.get('/departments', getAllDepartments);
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);

module.exports = router;

