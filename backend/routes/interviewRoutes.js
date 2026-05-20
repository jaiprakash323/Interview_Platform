const express = require('express');
const { scheduleInterview, updateInterviewStatus, getUpcomingInterviews, getAllInterviews } = require('../controllers/interviewController');
const { validateInterview } = require('../middleware/validation');

const router = express.Router();

router.post('/', validateInterview, scheduleInterview);
router.put('/:id/status', updateInterviewStatus);
router.get('/upcoming', getUpcomingInterviews);
router.get('/', getAllInterviews);

module.exports = router;