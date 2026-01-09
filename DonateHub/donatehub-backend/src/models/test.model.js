const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  testType: {
    type: String,
    enum: ['write', 'read', 'connection'],
    default: 'write'
  }
}, {
  timestamps: true
});

const Test = mongoose.model('Test', testSchema);

module.exports = Test;