const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  type: {
    type: String,
    enum: ['blood', 'cash', 'books', 'food', 'knowledge', 'items'],
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
  
  // ============ TYPE-SPECIFIC FIELDS (NESTED) ============
  bloodDetails: {
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    lastDonationDate: Date,
    healthConditions: [String],
    hemoglobinLevel: Number,
    eligibleToDonate: {
      type: Boolean,
      default: true
    }
  },
  
  cashDetails: {
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank_transfer', 'paypal']
    }
  },
  
  foodDetails: {
    foodType: {
      type: String,
      enum: ['perishable', 'non_perishable', 'cooked', 'packaged']
    },
    category: {
      type: String,
      enum: ['vegetables', 'fruits', 'grains', 'dairy', 'meat', 'baked_goods']
    },
    expirationDate: Date,
    servings: Number,
    dietaryRestrictions: [String]
  },
  
  bookDetails: {
    bookTitle: String,
    author: String,
    isbn: String,
    genre: String,
    condition: {
      type: String,
      enum: ['new', 'like-new', 'good', 'fair', 'poor']
    }
  },
  
  knowledgeDetails: {
    subject: String,
    expertiseLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    duration: Number,
    online: Boolean,
    format: {
      type: String,
      enum: ['online', 'in_person', 'hybrid']
    }
  },
  
  itemDetails: {
    condition: {
      type: String,
      enum: ['new', 'like-new', 'good', 'fair', 'needs-repair']
    },
    brand: String,
    model: String,
    estimatedValue: Number,
    category: {
      type: String,
      enum: ['clothing', 'electronics', 'furniture', 'other']
    }
  },
  // ============ END TYPE-SPECIFIC FIELDS ============
  
  quantity: {
    type: Number,
    required: true,
    min: 1
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
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  scheduledDate: Date,
  completedDate: Date,
  
  ratings: {
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
    recipientReview: String
  },
  
  tags: [String],
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  views: {
    type: Number,
    default: 0
  },
  
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes
donationSchema.index({ type: 1, status: 1 });
donationSchema.index({ donor: 1 });
donationSchema.index({ location: 'text', title: 'text', description: 'text' });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ isFeatured: 1, status: 1 });

// Virtual to get the appropriate details based on type
donationSchema.virtual('typeDetails').get(function() {
  switch(this.type) {
    case 'blood': return this.bloodDetails;
    case 'cash': return this.cashDetails;
    case 'food': return this.foodDetails;
    case 'books': return this.bookDetails;
    case 'knowledge': return this.knowledgeDetails;
    case 'items': return this.itemDetails;
    default: return {};
  }
});

// Method to increment views
donationSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;