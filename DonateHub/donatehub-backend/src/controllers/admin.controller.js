const User = require('../models/user.model');
const Donation = require('../models/donation.model');
const Item = require('../models/item.model');
const Transaction = require('../models/transaction.model');
const Notification = require('../models/notification.model');

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalDonations,
      pendingDonations,
      totalItems,
      activeItems,
      totalTransactions,
      pendingTransactions,
      recentUsers,
      recentDonations,
      recentTransactions
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Donation.countDocuments(),
      Donation.countDocuments({ status: 'pending' }),
      Item.countDocuments(),
      Item.countDocuments({ status: 'active' }),
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: 'pending' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName email role createdAt'),
      Donation.find().sort({ createdAt: -1 }).limit(5)
        .populate('donor', 'firstName lastName'),
      Transaction.find().sort({ createdAt: -1 }).limit(5)
        .populate('donor recipient', 'firstName lastName')
    ]);

    // Calculate revenue (sum of all completed transactions)
    const revenueResult = await Transaction.aggregate([
      { $match: { status: 'completed', type: 'purchase' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalDonations,
        pendingDonations,
        totalItems,
        activeItems,
        totalTransactions,
        pendingTransactions,
        totalRevenue
      },
      recentActivity: {
        users: recentUsers,
        donations: recentDonations,
        transactions: recentTransactions
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    if (role) query.role = role;
    if (status) query.isActive = status === 'active';

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await User.countDocuments(query);

    // Get users
    const users = await User.find(query)
      .select('-password -tokens -verificationToken -resetPasswordToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating password through this route
    delete updates.password;
    delete updates.tokens;

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -tokens');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If deactivating user, remove all tokens
    if (updates.isActive === false) {
      await User.findByIdAndUpdate(id, { $set: { tokens: [] } });
    }

    res.json({ 
      message: 'User updated successfully',
      user 
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin accounts
    if (user.role === 'admin') {
      return res.status(400).json({ 
        message: 'Cannot delete admin accounts' 
      });
    }

    // Delete user
    await user.deleteOne();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

// Get all donations (admin)
exports.getAllDonations = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      status, 
      search 
    } = req.query;

    // Build query
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await Donation.countDocuments(query);

    // Get donations
    const donations = await Donation.find(query)
      .populate('donor recipient', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      donations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all donations error:', error);
    res.status(500).json({ message: 'Server error fetching donations' });
  }
};

// Update donation status
exports.updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    donation.status = status;
    await donation.save();

    // Create notification for donor
    if (status === 'approved' || status === 'rejected') {
      await Notification.create({
        user: donation.donor,
        type: status === 'approved' ? 'donation_approved' : 'donation_rejected',
        title: `Donation ${status}`,
        message: `Your donation "${donation.title}" has been ${status}`,
        data: { donationId: donation._id }
      });
    }

    res.json({ 
      message: `Donation ${status} successfully`,
      donation 
    });
  } catch (error) {
    console.error('Update donation status error:', error);
    res.status(500).json({ message: 'Server error updating donation' });
  }
};

// Get all items (admin)
exports.getAllItems = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      status, 
      search 
    } = req.query;

    // Build query
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await Item.countDocuments(query);

    // Get items
    const items = await Item.find(query)
      .populate('seller buyer', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all items error:', error);
    res.status(500).json({ message: 'Server error fetching items' });
  }
};

// Update item status
exports.updateItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.status = status;
    await item.save();

    res.json({ 
      message: 'Item status updated successfully',
      item 
    });
  } catch (error) {
    console.error('Update item status error:', error);
    res.status(500).json({ message: 'Server error updating item' });
  }
};

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      status, 
      search 
    } = req.query;

    // Build query
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      const users = await User.find({
        $or: [
          { firstName: new RegExp(search, 'i') },
          { lastName: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') }
        ]
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      query.$or = [
        { donor: { $in: userIds } },
        { recipient: { $in: userIds } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await Transaction.countDocuments(query);

    // Get transactions
    const transactions = await Transaction.find(query)
      .populate('donor recipient', 'firstName lastName email')
      .populate('donation item')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
};

// Update transaction status
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.status = status;
    
    if (status === 'completed') {
      transaction.completedDate = new Date();
      
      // Update item status if it's a purchase
      if (transaction.type === 'purchase' && transaction.item) {
        await Item.findByIdAndUpdate(transaction.item, { 
          status: 'sold',
          soldDate: new Date()
        });
      }
    }

    await transaction.save();

    // Create notification for both parties
    await Notification.create({
      user: transaction.donor,
      type: 'transaction_update',
      title: 'Transaction Update',
      message: `Your transaction #${transaction._id} has been updated to ${status}`,
      data: { transactionId: transaction._id }
    });

    await Notification.create({
      user: transaction.recipient,
      type: 'transaction_update',
      title: 'Transaction Update',
      message: `Transaction #${transaction._id} has been updated to ${status}`,
      data: { transactionId: transaction._id }
    });

    res.json({ 
      message: 'Transaction status updated successfully',
      transaction 
    });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({ message: 'Server error updating transaction' });
  }
};

// Toggle item/donation featured status
exports.toggleFeatured = async (req, res) => {
  try {
    const { id, type } = req.params;
    const { isFeatured } = req.body;

    let Model;
    if (type === 'item') {
      Model = Item;
    } else if (type === 'donation') {
      Model = Donation;
    } else {
      return res.status(400).json({ message: 'Invalid type' });
    }

    const doc = await Model.findByIdAndUpdate(
      id,
      { isFeatured },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ message: `${type} not found` });
    }

    res.json({ 
      message: `Featured status updated for ${type}`,
      [type]: doc 
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ message: 'Server error updating featured status' });
  }
};