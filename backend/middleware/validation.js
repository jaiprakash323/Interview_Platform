const { body, validationResult } = require('express-validator');

const validatePanelistAvailability = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('slots').isArray({ min: 1 }).withMessage('At least one slot is required'),
  body('slots.*.start_datetime').isISO8601().withMessage('Valid start datetime required'),
  body('slots.*.end_datetime').isISO8601().withMessage('Valid end datetime required')
    .custom((value, { req }) => {
      if (value <= req.body.start_datetime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('slots.*.interview_type').notEmpty().withMessage('Interview type required'),
  body('slots.*.max_daily_interviews').isInt({ min: 1 }).withMessage('Max daily interviews must be positive'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateCandidateAvailability = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('slots').isArray({ min: 1 }).withMessage('At least one slot is required'),
  body('slots.*.start_datetime').isISO8601().withMessage('Valid start datetime required'),
  body('slots.*.end_datetime').isISO8601().withMessage('Valid end datetime required')
    .custom((value, { req }) => {
      if (value <= req.body.start_datetime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateInterview = [
  body('candidate_id').isInt().withMessage('Valid candidate ID required'),
  body('panelist_id').isInt().withMessage('Valid panelist ID required'),
  body('start_datetime').isISO8601().withMessage('Valid start datetime required'),
  body('end_datetime').isISO8601().withMessage('Valid end datetime required')
    .custom((value, { req }) => {
      if (value <= req.body.start_datetime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('round_details').optional().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validatePanelistAvailability, validateCandidateAvailability, validateInterview };