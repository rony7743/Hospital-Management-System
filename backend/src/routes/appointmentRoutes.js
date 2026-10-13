const express = require('express');
const router = express.Router();
const { bookAppointment, getAppointments } = require('../controllers/appointmentController');
const { optionalAuthenticateToken } = require('../middleware/auth');

router.get('/', optionalAuthenticateToken, getAppointments);
router.post('/', optionalAuthenticateToken, bookAppointment);

module.exports = router;

