const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  type: {
    type: String,
    enum: [
      'donation_request',
      'donation_approved',
      'donation_rejected',
      'item_sold',
      'message_received',
      'transaction_update',
      'system'
    ],
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  data: mongoose.Schema.Types.Mixed,
  
  isRead: {
    type: Boolean,
    default: false
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ user: 1, type: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;