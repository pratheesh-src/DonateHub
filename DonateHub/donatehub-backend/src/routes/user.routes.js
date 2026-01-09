const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth } = require('../middleware/auth.middleware');
const upload = require('../utils/upload');

// Protected routes
router.get('/profile/:id?', 
  auth,
  userController.getUserProfile
);

router.put('/profile', 
  auth,
  upload.single('avatar'),
  userController.updateProfile
);

router.get('/notifications', 
  auth,
  userController.getNotifications
);

router.put('/notifications/:id/read', 
  auth,
  userController.markNotificationRead
);

router.delete('/notifications/:id', 
  auth,
  userController.deleteNotification
);

// Dashboard routes
router.get('/dashboard/stats', 
  auth,
  userController.getDashboardStats
);

router.get('/dashboard/activity', 
  auth,
  userController.getActivityTimeline
);

module.exports = router;