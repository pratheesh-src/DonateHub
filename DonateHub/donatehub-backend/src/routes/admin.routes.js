const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { adminAuth } = require('../middleware/auth.middleware');

// Dashboard stats
router.get('/stats', 
  adminAuth,
  adminController.getDashboardStats
);

// User management
router.get('/users', 
  adminAuth,
  adminController.getAllUsers
);

router.put('/users/:id', 
  adminAuth,
  adminController.updateUser
);

router.delete('/users/:id', 
  adminAuth,
  adminController.deleteUser
);

// Donation management
router.get('/donations', 
  adminAuth,
  adminController.getAllDonations
);

router.put('/donations/:id/status', 
  adminAuth,
  adminController.updateDonationStatus
);

// Item management
router.get('/items', 
  adminAuth,
  adminController.getAllItems
);

router.put('/items/:id/status', 
  adminAuth,
  adminController.updateItemStatus
);

// Transaction management
router.get('/transactions', 
  adminAuth,
  adminController.getAllTransactions
);

router.put('/transactions/:id/status', 
  adminAuth,
  adminController.updateTransactionStatus
);

// Featured items/donations
router.put('/featured/:type/:id', 
  adminAuth,
  adminController.toggleFeatured
);

module.exports = router;