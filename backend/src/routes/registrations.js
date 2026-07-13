const express = require('express');
const router = express.Router();
const {
  createRegistration, getRegistrations, getRegistrationsByEvent, updateStatus, deleteRegistration,
} = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/', validate.registration.create, createRegistration);
router.get('/', protect, getRegistrations);
router.get('/event/:eventId', protect, getRegistrationsByEvent);
router.patch('/:id/status', protect, validate.registration.statusUpdate, updateStatus);
router.delete('/:id', protect, validate.idParam, deleteRegistration);

module.exports = router;
