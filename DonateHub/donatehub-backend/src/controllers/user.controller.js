const User = require('../models/user.model');
const Donation = require('../models/donation.model');
const Item = require('../models/item.model');
const Transaction = require('../models/transaction.model');
const Notification = require('../models/notification.model');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;
    
    const user = await User.findById(userId)
      .select('-password -tokens -verificationToken -resetPasswordToken');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Get user stats
    const [donationsCount, itemsCount, transactionsCount] = await Promise.all([
      Donation.countDocuments({ donor: userId }),
      Item.countDocuments({ seller: userId }),
      Transaction.countDocuments({ 
        $or: [{ donor: userId }, { recipient: userId }] 
      })
    ]);

    res.json({
      success: true,
      user,
      stats: {
        donationsCount,
        itemsCount,
        transactionsCount
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching profile' 
    });
  }
};

// Update profile with avatar
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    if (req.file) {
      updates.avatar = req.file.path || `/uploads/${req.file.filename}`;
    }

    const allowedUpdates = ['firstName', 'lastName', 'phone', 'address', 'bio', 'avatar'];
    
    // Filter updates
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const user = await User.findByIdAndUpdate(
      req.user._id,
      filteredUpdates,
      { new: true, runValidators: true }
    ).select('-password -tokens');

    res.json({ 
      success: true,
      message: 'Profile updated successfully',
      user 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating profile' 
    });
  }
};

// Get notifications
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const query = { user: req.user._id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching notifications' 
    });
  }
};

// Mark notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: req.params.id,
        user: req.user._id 
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Notification marked as read',
      notification 
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating notification' 
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Notification deleted successfully' 
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error deleting notification' 
    });
  }
};

// Get comprehensive user dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // 1. Get user info
    const user = await User.findById(userId).select('firstName lastName email avatar userType');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 2. Get all stats in parallel
    const [
      totalDonations,
      totalItemsListed,
      totalItemsReceived,
      totalTeachingSessions,
      monthlyDonations,
      userDonations,
      userItems,
      userNotifications,
      pendingRequests
    ] = await Promise.all([
      // Total donations count
      Donation.countDocuments({ donor: userId }),
      
      // Items listed count
      Item.countDocuments({ seller: userId }),
      
      // Items received count (as buyer)
      Transaction.countDocuments({ 
        donor: userId,
        type: 'purchase',
        status: 'completed'
      }),
      
      // Teaching sessions count
      Donation.countDocuments({ 
        donor: userId,
        type: 'knowledge',
        status: 'completed'
      }),
      
      // Monthly donations amount
      Transaction.aggregate([
        {
          $match: {
            donor: userId,
            status: 'completed',
            createdAt: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      
      // User's donations (latest 10)
      Donation.find({ donor: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title type status views images createdAt')
        .lean(),
      
      // User's items (latest 10)
      Item.find({ seller: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title category status price isFree views images createdAt')
        .lean(),
      
      // Notifications (latest 5)
      Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title message type isRead createdAt')
        .lean(),
      
      // Pending requests
      Transaction.countDocuments({
        recipient: userId,
        status: 'pending'
      })
    ]);

    // Format donations for display
    const formattedDonations = userDonations.map(donation => {
      let statusText = donation.status.charAt(0).toUpperCase() + donation.status.slice(1);
      let statusColor = getStatusColor(donation.status);
      
      return {
        id: donation._id,
        title: donation.title,
        type: donation.type,
        typeIcon: getDonationIcon(donation.type),
        status: statusText,
        statusColor,
        views: donation.views || 0,
        listedDate: formatDate(donation.createdAt),
        image: donation.images?.[0]?.url || null
      };
    });

    // Format items for display
    const formattedItems = userItems.map(item => {
      let statusText = item.status.charAt(0).toUpperCase() + item.status.slice(1);
      let statusColor = getStatusColor(item.status);
      
      return {
        id: item._id,
        title: item.title,
        category: item.category,
        price: item.isFree ? 'Free' : `$${item.price}`,
        status: statusText,
        statusColor,
        views: item.views || 0,
        listedDate: formatDate(item.createdAt),
        image: item.images?.[0]?.url || null
      };
    });

    // Format notifications
    const formatTimeAgo = (date) => {
      const seconds = Math.floor((new Date() - date) / 1000);
      if (seconds < 60) return `${seconds} seconds ago`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
      if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
      return `${Math.floor(seconds / 604800)} weeks ago`;
    };

    const formattedNotifications = userNotifications.map(notif => ({
      id: notif._id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      isRead: notif.isRead,
      timeAgo: formatTimeAgo(notif.createdAt)
    }));

    // Calculate donation impact
    const monthlyTotal = monthlyDonations[0]?.total || 0;
    const donationGoal = 100; // Default goal
    const progressPercentage = Math.min(Math.round((monthlyTotal / donationGoal) * 100), 100);

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
        itemsReceived: totalItemsReceived,
        teachingSessions: totalTeachingSessions,
        pendingRequests,
        monthlyTotal
      },
      donationImpact: {
        current: monthlyTotal,
        goal: donationGoal,
        progress: progressPercentage,
        label: 'Monthly Donation Goal'
      },
      listings: formattedItems,
      donations: formattedDonations,
      notifications: formattedNotifications,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching dashboard stats',
      error: error.message 
    });
  }
};

// Get user activity timeline
exports.getActivityTimeline = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get activities from multiple sources
    const [donations, items, transactions] = await Promise.all([
      Donation.find({ donor: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Math.floor(parseInt(limit) / 3))
        .populate('recipient', 'firstName lastName')
        .lean(),
      
      Item.find({ seller: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Math.floor(parseInt(limit) / 3))
        .populate('buyer', 'firstName lastName')
        .lean(),
      
      Transaction.find({
        $or: [{ donor: userId }, { recipient: userId }]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Math.floor(parseInt(limit) / 3))
      .populate('donor recipient', 'firstName lastName')
      .lean()
    ]);

    // Combine and sort all activities
    const activities = [
      ...donations.map(d => ({ type: 'donation', data: d, date: d.createdAt })),
      ...items.map(i => ({ type: 'item', data: i, date: i.createdAt })),
      ...transactions.map(t => ({ type: 'transaction', data: t, date: t.createdAt }))
    ].sort((a, b) => b.date - a.date)
     .slice(0, parseInt(limit));

    // Format activities
    const formatTimeAgo = (date) => {
      const seconds = Math.floor((new Date() - date) / 1000);
      if (seconds < 60) return `${seconds} seconds ago`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
      return `${Math.floor(seconds / 86400)} days ago`;
    };

    const formattedActivities = activities.map(activity => {
      switch(activity.type) {
        case 'donation':
          return {
            id: activity.data._id,
            type: 'donation',
            action: 'created',
            title: activity.data.title,
            description: `Created ${activity.data.type} donation`,
            status: activity.data.status,
            icon: getDonationIcon(activity.data.type),
            color: getStatusColor(activity.data.status),
            timestamp: activity.data.createdAt,
            timeAgo: formatTimeAgo(activity.data.createdAt)
          };
        
        case 'item':
          return {
            id: activity.data._id,
            type: 'item',
            action: activity.data.status === 'sold' ? 'sold' : 'listed',
            title: activity.data.title,
            description: activity.data.status === 'sold' ? 'Item sold' : 'Item listed for sale',
            status: activity.data.status,
            icon: '📦',
            color: activity.data.status === 'sold' ? 'success' : 'info',
            timestamp: activity.data.createdAt,
            timeAgo: formatTimeAgo(activity.data.createdAt)
          };
        
        case 'transaction':
          const isDonor = activity.data.donor?._id?.toString() === userId.toString();
          return {
            id: activity.data._id,
            type: 'transaction',
            action: isDonor ? 'sent' : 'received',
            title: `Transaction ${activity.data.type}`,
            description: isDonor ? 'You sent a payment' : 'You received a payment',
            amount: activity.data.amount,
            status: activity.data.status,
            icon: isDonor ? '↗️' : '↙️',
            color: getStatusColor(activity.data.status),
            timestamp: activity.data.createdAt,
            timeAgo: formatTimeAgo(activity.data.createdAt)
          };
        
        default:
          return null;
      }
    }).filter(Boolean);

    res.json({
      success: true,
      activities: formattedActivities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Promise.all([
          Donation.countDocuments({ donor: userId }),
          Item.countDocuments({ seller: userId }),
          Transaction.countDocuments({
            $or: [{ donor: userId }, { recipient: userId }]
          })
        ]).then(counts => counts.reduce((a, b) => a + b, 0))
      }
    });
  } catch (error) {
    console.error('Get activity timeline error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching activity timeline' 
    });
  }
};

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