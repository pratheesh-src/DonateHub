const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { body } = require('express-validator');

// Validation rules
const registerValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileValidation = [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
];

// Public routes
router.post('/register', 
  validate(registerValidation),
  authController.register
);

router.post('/login', 
  validate(loginValidation),
  authController.login
);

router.post('/forgot-password', 
  authController.forgotPassword
);

router.post('/reset-password', 
  authController.resetPassword
);

router.post('/refresh-token', 
  authController.refreshToken
);

// Protected routes
router.get('/me', 
  auth,
  authController.getCurrentUser
);

router.put('/profile', 
  auth,
  validate(updateProfileValidation),
  authController.updateProfile
);

router.post('/logout', 
  auth,
  authController.logout
);

module.exports = router;