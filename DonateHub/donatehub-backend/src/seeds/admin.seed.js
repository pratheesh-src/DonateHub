const mongoose = require('mongoose');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const adminExists = await User.findOne({ email: 'admin@donatehub.com' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@donatehub.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        userType: 'both',
        phone: '+1234567890'
      });
      
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin already exists');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedAdmin();