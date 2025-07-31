import { body } from "express-validator";

export const updateProfileValidator = [
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
  body("mobile").optional().isMobilePhone().withMessage("Valid phone number required"),
  body("bio").optional().isString().isLength({ max: 500 }),
];

export const updatePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];
