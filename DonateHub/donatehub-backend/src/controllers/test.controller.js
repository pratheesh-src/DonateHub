const Test = require('../models/test.model');

exports.testPost = async (req, res) => {
  try {
    console.log('📝 Test POST received:', req.body);
    console.log('📝 Headers:', req.headers);
    
    const testData = {
      message: req.body.message || 'Test message',
      timestamp: new Date(),
      ip: req.ip,
      headers: req.headers,
      testType: 'POST',
      data: req.body
    };
    
    const test = await Test.create(testData);
    
    console.log('✅ Test data saved to MongoDB:', test._id);
    
    res.json({
      success: true,
      message: 'Test data saved successfully to MongoDB',
      data: test,
      receivedBody: req.body,
      mongoId: test._id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Test POST error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving test data to MongoDB',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.testGet = async (req, res) => {
  try {
    const tests = await Test.find().sort({ createdAt: -1 }).limit(10);
    
    console.log(`📊 Retrieved ${tests.length} test records from MongoDB`);
    
    res.json({
      success: true,
      message: 'Test data retrieved successfully from MongoDB',
      count: tests.length,
      tests,
      database: {
        name: 'donatehub',
        collection: 'tests'
      }
    });
  } catch (error) {
    console.error('❌ Test GET error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving test data from MongoDB',
      error: error.message
    });
  }
};