const express = require('express');
const { createCandidateAvailability, getCandidateAvailability } = require('../controllers/candidateController');
const { validateCandidateAvailability } = require('../middleware/validation');

const router = express.Router();

router.post('/availability', validateCandidateAvailability, createCandidateAvailability);
router.get('/availability', getCandidateAvailability);

module.exports = router;