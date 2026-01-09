const mongoose = require('mongoose');
const User = require('../models/user.model');
const Donation = require('../models/donation.model');
const Item = require('../models/item.model');
const Transaction = require('../models/transaction.model');
require('dotenv').config();

const seedDashboardData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/donatehub');
    console.log('✅ Connected to MongoDB');

    // Find or create a test user
    let user = await User.findOne({ email: 'john@example.com' });
    
    if (!user) {
      user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+1234567890',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          zipCode: '10001'
        },
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        bio: 'Passionate donor and community helper',
        userType: 'both'
      });
      console.log('✅ Created test user:', user.email);
    }

    // Create sample donations
    const donations = [
      {
        donor: user._id,
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
        views: 45
      },
      {
        donor: user._id,
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
        views: 23
      },
      {
        donor: user._id,
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
        views: 67
      }
    ];

    // Create sample items
    const items = [
      {
        seller: user._id,
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
        soldDate: new Date('2024-01-06')
      },
      {
        seller: user._id,
        title: 'Math Textbooks',
        description: 'Collection of high school math textbooks',
        category: 'books',
        price: 0,
        isFree: true,
        condition: 'good',
        quantity: 3,
        location: 'New York, NY',
        status: 'active',
        views: 12
      }
    ];

    // Create sample transactions
    const transactions = [
      {
        donor: user._id,
        recipient: new mongoose.Types.ObjectId(), // Random recipient
        type: 'purchase',
        amount: 150,
        status: 'completed',
        completedDate: new Date('2024-01-06')
      },
      {
        donor: user._id,
        recipient: new mongoose.Types.ObjectId(), // Random recipient
        type: 'donation',
        amount: 50,
        status: 'completed',
        completedDate: new Date('2024-01-10')
      }
    ];

    // Insert data
    await Donation.insertMany(donations);
    await Item.insertMany(items);
    await Transaction.insertMany(transactions);

    // Update user stats
    await user.updateStats();

    console.log('✅ Dashboard data seeded successfully!');
    
    // Display summary
    const donationCount = await Donation.countDocuments({ donor: user._id });
    const itemCount = await Item.countDocuments({ seller: user._id });
    const transactionCount = await Transaction.countDocuments({ donor: user._id });
    
    console.log(`📊 Summary for ${user.firstName}:`);
    console.log(`- Total donations: ${donationCount}`);
    console.log(`- Items listed: ${itemCount}`);
    console.log(`- Transactions: ${transactionCount}`);

  } catch (error) {
    console.error('❌ Error seeding dashboard data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the seed function
seedDashboardData();