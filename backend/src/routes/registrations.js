const express = require('express');
const router = express.Router();
const {
  createRegistration, getRegistrations, getRegistrationsByEvent, updateStatus, deleteRegistration,
} = require('../controllers/registrationController');
const { protect } = require('../middleware/auth');

router.post('/', createRegistration);
router.get('/', protect, getRegistrations);
router.get('/event/:eventId', protect, getRegistrationsByEvent);
router.patch('/:id/status', protect, updateStatus);
router.delete('/:id', protect, deleteRegistration);

module.exports = router;
