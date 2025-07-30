import { body } from "express-validator";

export const registerValidator = [
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
  body("email").exists().isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

export const loginValidator = [
    body("email").exists().isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const forgotPasswordValidator = [
    body("email").exists().isEmail().withMessage("Valid email is required"),
];

export const resetPasswordValidator = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];
