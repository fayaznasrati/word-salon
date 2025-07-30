import { body, query } from 'express-validator';

export const createUserSchema = [
  query('username')
    .exists().withMessage('username is required')
    .isString().withMessage('should be a string')
    .trim().isLength({ min: 1, max: 50 })
    .withMessage('username maximum limit is 50 words'),

  body('name')
    .exists().withMessage('name is required')
    .isString().withMessage('should be a string')
    .custom(val => {
      const inval = val;
      val = val.split(' ');
      if (val.length >= inval.length) return false;
      return true;
    }).withMessage('only spaces are not allowed')
    .matches(/^[a-zA-Z0-9-\s]+$/)
    .withMessage('should contain proper characters A-Z a-z -')
    .trim().isLength({ min: 3, max: 50 })
    .withMessage('name maximum limit is 50 words'),

  body('user_detials')
    .custom(value => {
      return value === undefined;
    })
    .withMessage('wrong request')
];
