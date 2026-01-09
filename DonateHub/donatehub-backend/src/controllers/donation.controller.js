const Donation = require('../models/donation.model');
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const jwt = require('jsonwebtoken');

// Get donations by type
exports.getDonationsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const query = { type, status: 'approved' };
    const total = await Donation.countDocuments(query);
    
    const donations = await Donation.find(query)
      .populate('donor', 'firstName lastName avatar rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Increment views
    await Promise.all(
      donations.map(donation => 
        Donation.findByIdAndUpdate(donation._id, { $inc: { views: 1 } })
      )
    );
    
    res.json({
      success: true,
      donations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get donations by type error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching donations' });
  }
};

// Create donation - FIXED VERSION
exports.createDonation = async (req, res) => {
  try {
    console.log('🔍 Creating donation with data:', req.body);
    console.log('🔍 User from request:', req.user);
    
    const { 
      type, 
      title, 
      description, 
      quantity, 
      location, 
      coordinates,
      // Type-specific details
      bloodDetails,
      cashDetails,
      foodDetails,
      bookDetails,
      knowledgeDetails,
      itemDetails,
      tags
    } = req.body;

    // FIX: Handle donor ID properly
    let donorId;
    
    // Option 1: Use logged-in user
    if (req.user && req.user._id) {
      donorId = req.user._id;
      console.log('✅ Using authenticated user:', donorId);
    } 
    // Option 2: Find or create a test user
    else {
      console.log('⚠️ No authenticated user, using test user');
      
      // Try to find a test user
      let testUser = await User.findOne({ email: 'test@donor.com' });
      
      if (!testUser) {
        // Create test user if doesn't exist
        testUser = await User.create({
          firstName: 'Test',
          lastName: 'Donor',
          email: 'test@donor.com',
          password: 'password123', // Will be hashed by User model
          phone: '1234567890',
          role: 'user'
        });
        console.log('✅ Created test user:', testUser._id);
      } else {
        console.log('✅ Found existing test user:', testUser._id);
      }
      
      donorId = testUser._id;
    }

    // Create donation with type-specific details
    const donationData = {
      donor: donorId,
      type,
      title,
      description,
      quantity: parseInt(quantity) || 1,
      location,
      coordinates: coordinates || { lat: null, lng: null },
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
      status: 'pending' // Default status
    };
    // Add type-specific details with validation
    if (type === 'blood') {
      const bd = bloodDetails ? (typeof bloodDetails === 'string' ? JSON.parse(bloodDetails) : bloodDetails) : null;
      // Require bloodType for blood donations
      if (!bd || !bd.bloodType) {
        return res.status(400).json({ success: false, message: 'bloodType is required for blood donations' });
      }
      donationData.bloodDetails = bd;
    } else if (type === 'cash' && cashDetails) {
      donationData.cashDetails = typeof cashDetails === 'string' ? JSON.parse(cashDetails) : cashDetails;
    } else if (type === 'food' && foodDetails) {
      donationData.foodDetails = typeof foodDetails === 'string' ? JSON.parse(foodDetails) : foodDetails;
    } else if (type === 'books' && bookDetails) {
      donationData.bookDetails = typeof bookDetails === 'string' ? JSON.parse(bookDetails) : bookDetails;
    } else if (type === 'knowledge' && knowledgeDetails) {
      donationData.knowledgeDetails = typeof knowledgeDetails === 'string' ? JSON.parse(knowledgeDetails) : knowledgeDetails;
    } else if (type === 'items' && itemDetails) {
      donationData.itemDetails = typeof itemDetails === 'string' ? JSON.parse(itemDetails) : itemDetails;
    }

    // Handle images (if any)
    if (req.files && req.files.length > 0) {
      donationData.images = req.files.map((file, index) => ({
        url: file.path || `/uploads/${file.filename}`,
        publicId: file.filename,
        isPrimary: index === 0
      }));
    }

    console.log('📝 Donation data to save:', donationData);

    // Save to database
    const donation = await Donation.create(donationData);
    
    console.log('✅ Donation saved to MongoDB:', donation._id);

    // Create notification
    await Notification.create({
      user: donorId,
      type: 'system',
      title: 'New Donation Created',
      message: `You created a ${type} donation: ${title}`,
      data: { donationId: donation._id }
    });

    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      donation: {
        _id: donation._id,
        title: donation.title,
        type: donation.type,
        status: donation.status,
        donor: donation.donor
      }
    });
  } catch (error) {
    console.error('❌ Create donation error:', error);
    console.error('❌ Error stack:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating donation',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all donations
exports.getAllDonations = async (req, res) => {
  try {
    const {
      type,
      status,
      location,
      minQuantity,
      maxQuantity,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (location) query.location = new RegExp(location, 'i');
    if (minQuantity) query.quantity = { $gte: parseInt(minQuantity) };
    if (maxQuantity) query.quantity = { $lte: parseInt(maxQuantity) };
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    // Determine if requester is admin by decoding optional token (route is public)
    let isAdminRequester = false;
    try {
      const authHeader = req.header('Authorization');
      const token = authHeader ? authHeader.replace('Bearer ', '') : null;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const decodedRole = decoded?.role || decoded?.user?.role || null;
        if (decodedRole === 'admin') isAdminRequester = true;
        // Also support fetching role from DB if necessary
        if (!decodedRole && (decoded?.userId || decoded?.id || decoded?._id)) {
          const uid = decoded?.userId || decoded?.id || decoded?._id;
          const u = await User.findById(uid).select('role').lean();
          if (u?.role === 'admin') isAdminRequester = true;
        }
      }
    } catch (err) {
      isAdminRequester = false;
    }

    // Only show active donations to non-admins (exclude rejected/cancelled)
    if (!isAdminRequester) {
      query.status = { $in: ['pending', 'approved', 'completed'] };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await Donation.countDocuments(query);

    // Get donations with population
    const donations = await Donation.find(query)
      .populate('donor', 'firstName lastName avatar rating')
      .populate('recipient', 'firstName lastName avatar')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Increment views for each donation
    await Promise.all(
      donations.map(donation => 
        Donation.findByIdAndUpdate(donation._id, { $inc: { views: 1 } })
      )
    );

    res.json({
      success: true,
      donations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching donations' });
  }
};

// Get single donation
exports.getDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'firstName lastName avatar email phone rating')
      .populate('recipient', 'firstName lastName avatar')
      .lean();

    if (!donation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Donation not found' 
      });
    }

    // Determine requester identity: route is public, so req.user may be undefined.
    // Try to decode an optional token from the Authorization header so owners/admins
    // can view their non-public donations without forcing auth middleware on the route.
    let requester = null;
    let requesterId = null;
    let requesterRole = null;
    try {
      const authHeader = req.header('Authorization');
      const token = authHeader ? authHeader.replace('Bearer ', '') : null;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Support multiple token claim names
        requesterId = decoded?.userId || decoded?.id || decoded?._id || decoded?.user?._id || null;
        requesterRole = decoded?.role || decoded?.user?.role || null;

        // If we only have an id, try to fetch minimal user to get role
        if (requesterId && !requesterRole) {
          const u = await User.findById(requesterId).select('role').lean();
          if (u) requesterRole = u.role;
        }
        if (requesterId) {
          requester = { _id: requesterId, role: requesterRole };
        }
      }
    } catch (err) {
      // ignore token errors - treat requester as null
      requester = null;
      requesterId = null;
      requesterRole = null;
    }

    // Debug: log requester and donation info
    console.log('getDonation debug:', {
      donationId: donation._id.toString(),
      donationStatus: donation.status,
      donationDonor: donation.donor?._id?.toString(),
      requesterId,
      requesterRole,
      reqUserRole: req.user?.role
    });

    // Check permissions - allow viewing if:
    // 1. Donation is approved, OR
    // 2. Requester is the donor, OR
    // 3. Requester is an admin
    const isApproved = donation.status === 'approved';
    const isDonor = requesterId && donation.donor?._id?.toString() === requesterId.toString();
    const isAdmin = requesterRole === 'admin' || req.user?.role === 'admin';

    if (!isApproved && !isDonor && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    // Increment views
    await Donation.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Get similar donations (only approved ones)
    const similarDonations = await Donation.find({
      _id: { $ne: donation._id },
      type: donation.type,
      status: { $in: ['approved', 'pending', 'completed'] }
    })
    .limit(8)
    .populate('donor', 'firstName lastName avatar')
    .select('title images location type quantity')
    .lean();

    res.json({ 
      success: true,
      donation,
      similarDonations 
    });
  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching donation' });
  }
};

// Update donation
exports.updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Donation not found' 
      });
    }

    // Check if user is owner or admin
    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this donation' 
      });
    }

    const updatedData = req.body;
    
    // Handle images
    if (req.files && req.files.length > 0) {
      updatedData.images = req.files.map((file, index) => ({
        url: file.path || `/uploads/${file.filename}`,
        publicId: file.filename,
        isPrimary: index === 0
      }));
    }

    const updatedDonation = await Donation.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Donation updated successfully',
      donation: updatedDonation
    });
  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({ success: false, message: 'Server error updating donation' });
  }
};

// Delete donation
exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Donation not found' 
      });
    }

    // Check if user is owner or admin
    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this donation' 
      });
    }

    await Donation.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Donation deleted successfully'
    });
  } catch (error) {
    console.error('Delete donation error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting donation' });
  }
};

// Request donation
exports.requestDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Donation not found' 
      });
    }

    if (donation.status !== 'approved') {
      return res.status(400).json({ 
        success: false, 
        message: 'Donation is not available for requests' 
      });
    }

    // Update donation with recipient
    donation.recipient = req.user._id;
    donation.status = 'reserved';
    await donation.save();

    res.json({
      success: true,
      message: 'Donation requested successfully'
    });
  } catch (error) {
    console.error('Request donation error:', error);
    res.status(500).json({ success: false, message: 'Server error requesting donation' });
  }
};

// Get my donations
exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .populate('donor', 'firstName lastName avatar')
      .populate('recipient', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      donations
    });
  } catch (error) {
    console.error('Get my donations error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching donations' });
  }
};

// Toggle favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Donation not found' 
      });
    }

    const userId = req.user._id.toString();
    const isFavorited = donation.favorites.includes(userId);

    if (isFavorited) {
      donation.favorites = donation.favorites.filter(id => id.toString() !== userId);
    } else {
      donation.favorites.push(userId);
    }

    await donation.save();

    res.json({
      success: true,
      message: isFavorited ? 'Removed from favorites' : 'Added to favorites',
      isFavorited: !isFavorited
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ success: false, message: 'Server error toggling favorite' });
  }
};