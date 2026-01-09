const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  type: {
    type: String,
    enum: ['donation', 'purchase'],
    required: true
  },
  
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  },
  
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'paypal', 'bank_transfer', 'other']
  },
  
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  trackingNumber: String,
  
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }],
  
  donorRating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  recipientRating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  donorReview: String,
  recipientReview: String,
  
  completedDate: Date,
  cancelledDate: Date
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ donor: 1, status: 1 });
transactionSchema.index({ recipient: 1, status: 1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ trackingNumber: 1 });

// Method to add message
transactionSchema.methods.addMessage = async function(senderId, message) {
  this.messages.push({
    sender: senderId,
    message: message
  });
  await this.save();
  return this.messages[this.messages.length - 1];
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;