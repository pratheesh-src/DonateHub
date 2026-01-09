const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'clothing', 'electronics', 'furniture', 'books', 
      'food', 'services', 'other'
    ]
  },
  
  subcategory: String,
  
  price: {
    type: Number,
    required: true,
    min: 0
  },
  
  originalPrice: Number,
  
  isFree: {
    type: Boolean,
    default: false
  },
  
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair', 'poor'],
    default: 'good'
  },
  
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  
  location: {
    type: String,
    required: true
  },
  
  coordinates: {
    lat: Number,
    lng: Number
  },
  
  images: [{
    url: String,
    publicId: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  specifications: mongoose.Schema.Types.Mixed,
  
  tags: [String],
  
  status: {
    type: String,
    enum: ['draft', 'active', 'pending', 'sold', 'expired', 'cancelled'],
    default: 'active'
  },
  
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  soldDate: Date,
  
  views: {
    type: Number,
    default: 0
  },
  
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  shipping: {
    available: {
      type: Boolean,
      default: false
    },
    cost: Number,
    methods: [String]
  },
  
  availability: {
    startDate: Date,
    endDate: Date
  }
}, {
  timestamps: true
});

// Indexes
itemSchema.index({ seller: 1 });
itemSchema.index({ category: 1, status: 1 });
itemSchema.index({ price: 1 });
itemSchema.index({ location: 'text', title: 'text', description: 'text' });
itemSchema.index({ createdAt: -1 });
itemSchema.index({ isFeatured: 1, status: 1 });
itemSchema.index({ isFree: 1, status: 1 });

// Method to check availability
itemSchema.methods.isAvailable = function() {
  if (this.status !== 'active') return false;
  if (this.quantity < 1) return false;
  
  if (this.availability.startDate && this.availability.endDate) {
    const now = new Date();
    return now >= this.availability.startDate && now <= this.availability.endDate;
  }
  
  return true;
};

// Method to increment views
itemSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;