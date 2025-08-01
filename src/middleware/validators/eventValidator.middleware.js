import { body } from "express-validator";

export const createEventValidator = [
  body('topic')
    .exists().withMessage('Topic is required')
    .isString().withMessage('Topic should be a string')
    .isLength({ min: 5, max: 100 }).withMessage('Topic must be between 5 and 100 characters'),

  body('description')
    .exists().withMessage('Description is required')
    .isString().withMessage('Description should be a string')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),

  body('startDateTime')
    .exists().withMessage('Start date/time is required')
    .isISO8601().withMessage('Start date/time must be a valid ISO8601 date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),

  body('endDateTime')
    .exists().withMessage('End date/time is required')
    .isISO8601().withMessage('End date/time must be a valid ISO8601 date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDateTime)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('status')
    .optional()
    .isIn(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'])
    .withMessage('Invalid status value'),

];

export const updateEventValidator = [
  body('topic')
    .optional()
    .isString().withMessage('Topic should be a string')
    .isLength({ min: 5, max: 100 }).withMessage('Topic must be between 5 and 100 characters'),

  body('description')
    .optional()
    .isString().withMessage('Description should be a string')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),

  body('startDateTime')
    .optional()
    .isISO8601().withMessage('Start date/time must be a valid ISO8601 date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),

  body('endDateTime')
    .optional()
    .isISO8601().withMessage('End date/time must be a valid ISO8601 date')
    .custom((value, { req }) => {
      // Only validate against startDateTime if it's also being updated
      if (req.body.startDateTime && new Date(value) <= new Date(req.body.startDateTime)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('zoomLink')
    .optional()
    .isURL().withMessage('Zoom link must be a valid URL'),

  body('status')
    .optional()
    .isIn(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'])
    .withMessage('Invalid status value')
];