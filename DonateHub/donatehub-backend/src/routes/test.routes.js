const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Donation = require('../models/donation.model');
const Item = require('../models/item.model');

// Test routes for debugging
router.get('/test/db', async (req, res) => {
  try {
    // Test database connection and basic operations
    const testData = {
      timestamp: new Date(),
      message: 'Database test successful'
    };
    
    res.json({
      success: true,
      message: 'Database is working',
      data: testData,
      mongodb: {
        connected: true,
        host: process.env.MONGODB_URI || 'mongodb://localhost:27017/donatehub'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});

// Quick test for dashboard data
router.get('/test/dashboard', async (req, res) => {
  try {
    // Get user count
    const userCount = await User.countDocuments();
    
    // Get donation count
    const donationCount = await Donation.countDocuments();
    
    // Get item count
    const itemCount = await Item.countDocuments();
    
    res.json({
      success: true,
      message: 'Dashboard test data',
      data: {
        users: userCount,
        donations: donationCount,
        items: itemCount,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Dashboard test failed',
      error: error.message
    });
  }
});

// Mock dashboard data
router.get('/test/mock-dashboard', (req, res) => {
  res.json({
    success: true,
    greeting: "Welcome back, John! 👋",
    subtitle: "Here's what's happening with your donations today",
    user: {
      firstName: "John",
      lastName: "Doe",
      fullName: "John Doe",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      email: "john@example.com",
      userType: "both"
    },
    quickStats: {
      totalDonations: 24,
      itemsListed: 12,
      itemsReceived: 8,
      teachingSessions: 5,
      pendingRequests: 3,
      monthlyTotal: 65
    },
    donationImpact: {
      current: 65,
      goal: 100,
      progress: 65,
      label: "Monthly Donation Goal"
    },
    listings: [
      {
        id: "1",
        title: "Mathematics Tutor",
        status: "Active",
        statusColor: "success",
        category: "Teaching",
        price: "$10/hr",
        views: 45,
        listedDate: "2024-01-15",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
      },
      {
        id: "2",
        title: "Winter Jacket",
        status: "Active",
        statusColor: "success",
        category: "Clothing",
        price: "Free",
        views: 23,
        listedDate: "2024-01-10",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
      },
      {
        id: "3",
        title: "Blood Donation Available",
        status: "Active",
        statusColor: "success",
        category: "Blood",
        price: "Free",
        views: 67,
        listedDate: "2024-01-08",
        image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
      },
      {
        id: "4",
        title: "Used Laptop",
        status: "Sold",
        statusColor: "info",
        category: "Electronics",
        price: "$150",
        views: 89,
        listedDate: "2024-01-05",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
      }
    ],
    donations: [
      {
        id: "1",
        title: "Math Tutoring Session",
        type: "knowledge",
        typeIcon: "🧠",
        status: "Completed",
        statusColor: "success",
        views: 45,
        listedDate: "2024-01-15",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
      },
      {
        id: "2",
        title: "Winter Clothing Donation",
        type: "items",
        typeIcon: "📦",
        status: "Approved",
        statusColor: "info",
        views: 23,
        listedDate: "2024-01-10",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
      }
    ],
    notifications: [
      {
        id: "1",
        title: "New message from Sarah",
        message: "Sarah sent you a message regarding your laptop donation",
        type: "message_received",
        isRead: false,
        timeAgo: "2 hours ago"
      },
      {
        id: "2",
        title: "Your item was favorited",
        message: "Someone added your 'Winter Jacket' to their favorites",
        type: "item_sold",
        isRead: true,
        timeAgo: "5 hours ago"
      },
      {
        id: "3",
        title: "Donation request approved",
        message: "Your blood donation request has been approved",
        type: "donation_approved",
        isRead: true,
        timeAgo: "1 day ago"
      }
    ],
    lastUpdated: new Date().toISOString()
  });
});

// Route to create test user
router.post('/test/create-user', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({
        success: true,
        message: 'User already exists',
        user: {
          id: existingUser._id,
          email: existingUser.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName
        }
      });
    }
    
    // Create new user
    const user = await User.create({
      firstName: firstName || 'John',
      lastName: lastName || 'Doe',
      email: email || 'john@example.com',
      password: password || 'password123',
      phone: '+1234567890',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001'
      },
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      bio: 'Test user for dashboard',
      userType: 'both'
    });
    
    res.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create test user',
      error: error.message
    });
  }
});

// Route to create test donations
router.post('/test/create-donations', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create sample donations
    const donations = [
      {
        donor: userId,
        type: 'knowledge',
        title: 'Mathematics Tutor',
        description: 'Offering math tutoring for high school students',
        quantity: 1,
        location: 'New York, NY',
        knowledgeDetails: {
          subject: 'Mathematics',
          expertiseLevel: 'expert',
          duration: 60,
          online: true,
          format: 'online'
        },
        status: 'approved',
        views: 45,
        createdAt: new Date('2024-01-15')
      },
      {
        donor: userId,
        type: 'items',
        title: 'Winter Jacket',
        description: 'Warm winter jacket in good condition',
        quantity: 1,
        location: 'New York, NY',
        itemDetails: {
          condition: 'good',
          brand: 'North Face',
          estimatedValue: 80,
          category: 'clothing'
        },
        status: 'approved',
        views: 23,
        createdAt: new Date('2024-01-10')
      },
      {
        donor: userId,
        type: 'blood',
        title: 'Blood Donation Available',
        description: 'O+ blood available for donation',
        quantity: 1,
        location: 'New York Blood Center',
        bloodDetails: {
          bloodType: 'O+',
          eligibleToDonate: true
        },
        status: 'approved',
        views: 67,
        createdAt: new Date('2024-01-08')
      },
      {
        donor: userId,
        type: 'cash',
        title: 'Help Local Food Bank',
        description: 'Donating $50 to help the local food bank',
        quantity: 1,
        location: 'New York, NY',
        cashDetails: {
          amount: 50,
          currency: 'USD',
          paymentMethod: 'bank_transfer'
        },
        status: 'completed',
        views: 34,
        createdAt: new Date('2024-01-12'),
        completedDate: new Date('2024-01-13')
      }
    ];
    
    await Donation.insertMany(donations);
    
    res.json({
      success: true,
      message: 'Test donations created successfully',
      count: donations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create test donations',
      error: error.message
    });
  }
});

// Route to create test items
router.post('/test/create-items', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create sample items
    const items = [
      {
        seller: userId,
        title: 'Used Laptop',
        description: 'Dell Latitude laptop, 8GB RAM, 256GB SSD',
        category: 'electronics',
        price: 150,
        originalPrice: 300,
        condition: 'good',
        quantity: 1,
        location: 'New York, NY',
        status: 'sold',
        views: 89,
        soldDate: new Date('2024-01-06'),
        createdAt: new Date('2024-01-05')
      },
      {
        seller: userId,
        title: 'Math Textbooks',
        description: 'Collection of high school math textbooks',
        category: 'books',
        price: 0,
        isFree: true,
        condition: 'good',
        quantity: 3,
        location: 'New York, NY',
        status: 'active',
        views: 12,
        createdAt: new Date('2024-01-03')
      },
      {
        seller: userId,
        title: 'Office Chair',
        description: 'Ergonomic office chair in excellent condition',
        category: 'furniture',
        price: 40,
        isFree: false,
        condition: 'like-new',
        quantity: 1,
        location: 'Bronx, NY',
        status: 'active',
        views: 28,
        createdAt: new Date('2024-01-07')
      }
    ];
    
    await Item.insertMany(items);
    
    res.json({
      success: true,
      message: 'Test items created successfully',
      count: items.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create test items',
      error: error.message
    });
  }
});

// Route to get dashboard stats for a user
router.get('/test/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user info
    const user = await User.findById(userId)
      .select('firstName lastName email avatar userType');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get counts
    const [
      totalDonations,
      totalItemsListed,
      completedDonations,
      soldItems
    ] = await Promise.all([
      Donation.countDocuments({ donor: userId }),
      Item.countDocuments({ seller: userId }),
      Donation.countDocuments({ donor: userId, status: 'completed' }),
      Item.countDocuments({ seller: userId, status: 'sold' })
    ]);
    
    // Get latest donations
    const donations = await Donation.find({ donor: userId })
      .sort({ createdAt: -1 })
      .limit(4)
      .select('title type status views images createdAt');
    
    // Get latest items
    const items = await Item.find({ seller: userId })
      .sort({ createdAt: -1 })
      .limit(4)
      .select('title category status price isFree views images createdAt');
    
    res.json({
      success: true,
      greeting: `Welcome back, ${user.firstName}! 👋`,
      subtitle: "Here's what's happening with your donations today",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        avatar: user.avatar,
        email: user.email,
        userType: user.userType
      },
      quickStats: {
        totalDonations,
        itemsListed: totalItemsListed,
        itemsReceived: 8, // Mock data
        teachingSessions: 5, // Mock data
        completedDonations,
        soldItems,
        monthlyTotal: 65 // Mock data
      },
      donationImpact: {
        current: 65,
        goal: 100,
        progress: 65,
        label: 'Monthly Donation Goal'
      },
      listings: items.map(item => ({
        id: item._id,
        title: item.title,
        status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        statusColor: getStatusColor(item.status),
        category: item.category,
        price: item.isFree ? 'Free' : `$${item.price}`,
        views: item.views || 0,
        listedDate: formatDate(item.createdAt),
        image: item.images?.[0]?.url || null
      })),
      donations: donations.map(donation => ({
        id: donation._id,
        title: donation.title,
        type: donation.type,
        typeIcon: getDonationIcon(donation.type),
        status: donation.status.charAt(0).toUpperCase() + donation.status.slice(1),
        statusColor: getStatusColor(donation.status),
        views: donation.views || 0,
        listedDate: formatDate(donation.createdAt),
        image: donation.images?.[0]?.url || null
      })),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
});

// Helper functions
const getDonationIcon = (type) => {
  const icons = {
    blood: '🩸',
    cash: '💰',
    food: '🍎',
    books: '📚',
    knowledge: '🧠',
    items: '📦'
  };
  return icons[type] || '🎁';
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    approved: 'info',
    completed: 'success',
    rejected: 'error',
    cancelled: 'error',
    active: 'success',
    sold: 'info',
    draft: 'default'
  };
  return colors[status] || 'default';
};

const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

module.exports = router;