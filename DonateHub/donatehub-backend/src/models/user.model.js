const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters']
  },
  
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return /^[+]?[0-9\s\-()]{10,}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  
  address: {
    street: String,
    city: String,
    state: String,
    country: {
      type: String,
      default: 'USA'
    },
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/demo/image/upload/v1674578274/default-avatar.png'
  },
  
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  userType: {
    type: String,
    enum: ['donor', 'recipient', 'both'],
    default: 'both'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verificationToken: String,
  verificationTokenExpires: Date,
  
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  lastLogin: Date,
  
  // Additional fields for dashboard
  preferences: {
    donationGoal: {
      type: Number,
      default: 100
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    }
  },
  
  stats: {
    totalDonations: {
      type: Number,
      default: 0
    },
    totalItemsListed: {
      type: Number,
      default: 0
    },
    totalItemsReceived: {
      type: Number,
      default: 0
    },
    totalTeachingSessions: {
      type: Number,
      default: 0
    },
    totalAmountDonated: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  
  badges: [{
    name: String,
    icon: String,
    earnedAt: Date,
    description: String
  }],
  
  tokens: [{
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ location: '2dsphere' });

// Virtuals
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('addressString').get(function() {
  if (!this.address) return '';
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update stats after certain operations
userSchema.post('save', async function(doc, next) {
  // Update stats based on user's activities
  // This would be called after donations/items/transactions are saved
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate auth token
userSchema.methods.generateAuthToken = async function() {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { 
      userId: this._id,
      email: this.email,
      role: this.role,
      firstName: this.firstName 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  // Add token to user's tokens array
  this.tokens = this.tokens.concat({ token });
  await this.save();
  
  return token;
};

// Method to remove token
userSchema.methods.removeToken = async function(tokenToRemove) {
  this.tokens = this.tokens.filter(tokenObj => tokenObj.token !== tokenToRemove);
  await this.save();
};

// Method to update user stats
userSchema.methods.updateStats = async function() {
  const Donation = require('./donation.model');
  const Item = require('./item.model');
  const Transaction = require('./transaction.model');
  
  const [donations, items, receivedItems, teachingSessions, totalAmount] = await Promise.all([
    Donation.countDocuments({ donor: this._id }),
    Item.countDocuments({ seller: this._id }),
    Transaction.countDocuments({ 
      recipient: this._id, 
      type: 'purchase', 
      status: 'completed' 
    }),
    Donation.countDocuments({ 
      donor: this._id, 
      type: 'knowledge', 
      status: 'completed' 
    }),
    Transaction.aggregate([
      {
        $match: {
          donor: this._id,
          type: { $in: ['donation', 'purchase'] },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ])
  ]);
  
  this.stats.totalDonations = donations;
  this.stats.totalItemsListed = items;
  this.stats.totalItemsReceived = receivedItems;
  this.stats.totalTeachingSessions = teachingSessions;
  this.stats.totalAmountDonated = totalAmount[0]?.total || 0;
  
  await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;