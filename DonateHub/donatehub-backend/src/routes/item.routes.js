const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const { auth } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const upload = require('../utils/upload');
const { body } = require('express-validator');

// Validation rules
const createItemValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('location').notEmpty().withMessage('Location is required'),
];

// Public routes
router.get('/', itemController.getAllItems);
router.get('/:id', itemController.getItem);

// Protected routes
router.post('/', 
  auth,
  upload.array('images', 5),
  validate(createItemValidation),
  itemController.createItem
);

router.put('/:id', 
  auth,
  upload.array('images', 5),
  itemController.updateItem
);

router.delete('/:id', 
  auth,
  itemController.deleteItem
);

router.post('/:id/purchase', 
  auth,
  itemController.purchaseItem
);

router.get('/user/my', 
  auth,
  itemController.getMyItems
);

router.post('/:id/favorite', 
  auth,
  itemController.toggleFavorite
);

module.exports = router;