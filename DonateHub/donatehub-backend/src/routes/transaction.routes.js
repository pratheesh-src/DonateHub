const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { auth } = require('../middleware/auth.middleware');

// Protected routes
router.get('/my', 
  auth,
  transactionController.getMyTransactions
);

router.get('/:id', 
  auth,
  transactionController.getTransaction
);

router.put('/:id/status', 
  auth,
  transactionController.updateTransactionStatus
);

router.post('/:id/message', 
  auth,
  transactionController.sendMessage
);

router.post('/:id/rating', 
  auth,
  transactionController.submitRating
);

module.exports = router;