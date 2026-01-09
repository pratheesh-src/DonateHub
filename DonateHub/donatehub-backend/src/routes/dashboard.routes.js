const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { auth } = require('../middleware/auth.middleware');

// Dashboard routes
router.get('/overview', 
  auth,
  dashboardController.getDashboardOverview
);

router.get('/analytics', 
  auth,
  dashboardController.getAnalytics
);

module.exports = router;