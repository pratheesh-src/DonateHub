const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');
const { auth } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const upload = require('../utils/upload');
const { body } = require('express-validator');

// Validation rules
const createDonationValidation = [
  body('type').isIn(['blood', 'cash', 'books', 'food', 'knowledge', 'items'])
    .withMessage('Valid donation type is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('location').notEmpty().withMessage('Location is required'),
];

// Public routes
router.get('/', donationController.getAllDonations);
router.get('/type/:type', donationController.getDonationsByType);
router.get('/:id', donationController.getDonation);

// Protected routes
router.post('/', 
  auth,
  upload.array('images', 5),
  validate(createDonationValidation),
  donationController.createDonation
);

router.put('/:id', 
  auth,
  upload.array('images', 5),
  donationController.updateDonation
);

router.delete('/:id', 
  auth,
  donationController.deleteDonation
);

router.post('/:id/request', 
  auth,
  donationController.requestDonation
);

router.get('/user/my', 
  auth,
  donationController.getMyDonations
);

router.post('/:id/favorite', 
  auth,
  donationController.toggleFavorite
);

module.exports = router;