const express = require('express');
const { createPanelistAvailability, getPanelistAvailability } = require('../controllers/panelistController');
const { validatePanelistAvailability } = require('../middleware/validation');

const router = express.Router();

router.post('/availability', validatePanelistAvailability, createPanelistAvailability);
router.get('/availability', getPanelistAvailability);

module.exports = router;