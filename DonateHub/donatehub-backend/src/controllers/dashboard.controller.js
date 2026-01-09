const User = require('../models/user.model');
const Donation = require('../models/donation.model');
const Item = require('../models/item.model');
const Transaction = require('../models/transaction.model');
const Notification = require('../models/notification.model');

// Get comprehensive dashboard data
exports.getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user._id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get user info
    const user = await User.findById(userId)
      .select('firstName lastName avatar email phone userType stats preferences')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all data in parallel for better performance
    const [
      recentDonations,
      recentItems,
      recentTransactions,
      pendingRequests,
      recentNotifications,
      monthlyStats,
      categoryStats,
      topPerformers
    ] = await Promise.all([
      // Recent donations (last 30 days)
      Donation.find({
        donor: userId,
        createdAt: { $gte: thirtyDaysAgo }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('recipient', 'firstName lastName avatar')
      .lean(),

      // Recent items listed
      Item.find({
        seller: userId,
        createdAt: { $gte: thirtyDaysAgo }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('buyer', 'firstName lastName avatar')
      .lean(),

      // Recent transactions
      Transaction.find({
        $or: [{ donor: userId }, { recipient: userId }],
        createdAt: { $gte: thirtyDaysAgo }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('donor recipient', 'firstName lastName avatar')
      .populate('donation item')
      .lean(),

      // Pending requests
      Transaction.find({
        recipient: userId,
        status: 'pending'
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('donor', 'firstName lastName avatar')
      .populate('donation item')
      .lean(),

      // Recent notifications
      Notification.find({
        user: userId,
        createdAt: { $gte: thirtyDaysAgo }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),

      // Monthly statistics
      Transaction.aggregate([
        {
          $match: {
            donor: userId,
            status: 'completed',
            completedDate: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$completedDate" }
            },
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 30 }
      ]),

      // Category-wise statistics
      Donation.aggregate([
        {
          $match: {
            donor: userId,
            status: { $in: ['approved', 'completed'] }
          }
        },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
            totalQuantity: { $sum: "$quantity" }
          }
        }
      ]),

      // Top performing donations/items
      Donation.find({ donor: userId })
        .sort({ favorites: -1, views: -1 })
        .limit(5)
        .select('title type favorites views status images')
        .lean()
    ]);

    // Format quick stats
    const quickStats = {
      totalDonations: user.stats?.totalDonations || 0,
      itemsListed: user.stats?.totalItemsListed || 0,
      itemsReceived: user.stats?.totalItemsReceived || 0,
      teachingSessions: user.stats?.totalTeachingSessions || 0,
      totalAmountDonated: user.stats?.totalAmountDonated || 0,
      rating: user.stats?.rating || 0,
      reviewCount: user.stats?.reviewCount || 0
    };

    // Format user listings for display
    const formattedListings = recentItems.map(item => ({
      id: item._id,
      title: item.title,
      status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      statusColor: getStatusColor(item.status),
      category: item.category,
      isFree: item.isFree,
      price: item.isFree ? 'Free' : `$${item.price}`,
      views: item.views,
      listedDate: formatDate(item.createdAt),
      image: item.images?.[0]?.url || null,
      buyer: item.buyer ? 
        `${item.buyer.firstName} ${item.buyer.lastName}` : 
        null
    }));

    // Format donations
    const formattedDonations = recentDonations.map(donation => ({
      id: donation._id,
      title: donation.title,
      type: donation.type,
      typeIcon: getDonationIcon(donation.type),
      status: donation.status.charAt(0).toUpperCase() + donation.status.slice(1),
      statusColor: getStatusColor(donation.status),
      quantity: donation.quantity,
      recipient: donation.recipient ? 
        `${donation.recipient.firstName} ${donation.recipient.lastName}` : 
        'Available',
      views: donation.views,
      favorites: donation.favorites?.length || 0,
      listedDate: formatDate(donation.createdAt),
      image: donation.images?.[0]?.url || null
    }));

    // Format notifications
    const formattedNotifications = recentNotifications.map(notification => ({
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      timeAgo: formatTimeAgo(notification.createdAt),
      timestamp: notification.createdAt
    }));

    // Format pending requests
    const formattedPendingRequests = pendingRequests.map(request => ({
      id: request._id,
      type: request.type,
      requester: `${request.donor.firstName} ${request.donor.lastName}`,
      requesterAvatar: request.donor.avatar,
      itemTitle: request.item?.title || request.donation?.title,
      amount: request.amount,
      requestedDate: formatDate(request.createdAt),
      timeAgo: formatTimeAgo(request.createdAt)
    }));

    // Calculate donation impact
    const donationGoal = user.preferences?.donationGoal || 100;
    const progressPercentage = Math.min(
      Math.round((quickStats.totalAmountDonated / donationGoal) * 100),
      100
    );

    // Format monthly stats for chart
    const formattedMonthlyStats = monthlyStats.map(stat => ({
      date: stat._id,
      amount: stat.totalAmount,
      count: stat.count
    }));

    // Format category stats
    const formattedCategoryStats = categoryStats.map(stat => ({
      category: stat._id,
      count: stat.count,
      totalQuantity: stat.totalQuantity,
      percentage: Math.round((stat.count / quickStats.totalDonations) * 100) || 0
    }));

    // Top performers
    const formattedTopPerformers = topPerformers.map(item => ({
      id: item._id,
      title: item.title,
      type: item.type,
      favorites: item.favorites?.length || 0,
      views: item.views || 0,
      status: item.status,
      image: item.images?.[0]?.url || null
    }));

    // Recent activity
    const recentActivity = [
      ...recentTransactions.map(t => ({
        type: 'transaction',
        data: t,
        date: t.createdAt
      })),
      ...recentDonations.map(d => ({
        type: 'donation',
        data: d,
        date: d.createdAt
      })),
      ...recentItems.map(i => ({
        type: 'item',
        data: i,
        date: i.createdAt
      }))
    ]
    .sort((a, b) => b.date - a.date)
    .slice(0, 10)
    .map(activity => formatActivity(activity, userId));

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
      quickStats,
      donationImpact: {
        current: quickStats.totalAmountDonated,
        goal: donationGoal,
        progress: progressPercentage,
        label: 'Monthly Donation Goal'
      },
      listings: formattedListings,
      donations: formattedDonations,
      notifications: formattedNotifications,
      pendingRequests: formattedPendingRequests,
      recentActivity,
      charts: {
        monthlyStats: formattedMonthlyStats,
        categoryStats: formattedCategoryStats
      },
      topPerformers: formattedTopPerformers,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard overview',
      error: error.message
    });
  }
};

// Get detailed analytics
exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = 'month' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch(period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get analytics data
    const [
      donationTrends,
      itemTrends,
      revenueStats,
      engagementStats,
      popularCategories,
      performanceMetrics
    ] = await Promise.all([
      // Donation trends
      Donation.aggregate([
        {
          $match: {
            donor: userId,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 },
            totalQuantity: { $sum: "$quantity" }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Item trends
      Item.aggregate([
        {
          $match: {
            seller: userId,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            listed: { $sum: 1 },
            sold: { $sum: { $cond: [{ $eq: ["$status", "sold"] }, 1, 0] } }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Revenue stats
      Transaction.aggregate([
        {
          $match: {
            donor: userId,
            status: 'completed',
            completedDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m", date: "$completedDate" }
            },
            totalAmount: { $sum: "$amount" },
            transactionCount: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Engagement stats
      Donation.aggregate([
        {
          $match: {
            donor: userId,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$views" },
            totalFavorites: { $sum: { $size: "$favorites" } },
            avgViews: { $avg: "$views" }
          }
        }
      ]),

      // Popular categories
      Donation.aggregate([
        {
          $match: {
            donor: userId,
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
            totalViews: { $sum: "$views" },
            avgRating: { $avg: "$ratings.donorRating" }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),

      // Performance metrics
      Promise.all([
        Donation.countDocuments({ donor: userId, status: 'approved' }),
        Donation.countDocuments({ donor: userId, status: 'completed' }),
        Item.countDocuments({ seller: userId, status: 'sold' }),
        Transaction.countDocuments({ donor: userId, status: 'completed' })
      ]).then(([approvedDonations, completedDonations, soldItems, completedTransactions]) => ({
        approvalRate: approvedDonations > 0 ? 
          Math.round((completedDonations / approvedDonations) * 100) : 0,
        completionRate: completedDonations > 0 ? 
          Math.round((completedTransactions / completedDonations) * 100) : 0,
        salesRate: soldItems > 0 ? 
          Math.round((soldItems / (soldItems + completedDonations)) * 100) : 0
      }))
    ]);

    res.json({
      success: true,
      period,
      startDate,
      endDate,
      analytics: {
        donationTrends,
        itemTrends,
        revenueStats,
        engagementStats: engagementStats[0] || {},
        popularCategories,
        performanceMetrics
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching analytics'
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

const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return `${Math.floor(seconds / 604800)} weeks ago`;
};

const formatActivity = (activity, userId) => {
  const { type, data } = activity;
  
  switch(type) {
    case 'transaction':
      const isDonor = data.donor._id.toString() === userId.toString();
      return {
        id: data._id,
        type: 'transaction',
        icon: isDonor ? '↗️' : '↙️',
        color: isDonor ? 'primary' : 'success',
        title: `${isDonor ? 'Sent' : 'Received'} ${data.type}`,
        description: isDonor ? 
          `Sent to ${data.recipient.firstName}` : 
          `Received from ${data.donor.firstName}`,
        amount: data.amount,
        timestamp: data.createdAt,
        timeAgo: formatTimeAgo(data.createdAt)
      };
    
    case 'donation':
      return {
        id: data._id,
        type: 'donation',
        icon: getDonationIcon(data.type),
        color: getStatusColor(data.status),
        title: `Created ${data.type} donation`,
        description: data.title,
        status: data.status,
        timestamp: data.createdAt,
        timeAgo: formatTimeAgo(data.createdAt)
      };
    
    case 'item':
      return {
        id: data._id,
        type: 'item',
        icon: '📦',
        color: getStatusColor(data.status),
        title: data.status === 'sold' ? 'Item sold' : 'Item listed',
        description: data.title,
        price: data.isFree ? 'Free' : `$${data.price}`,
        timestamp: data.createdAt,
        timeAgo: formatTimeAgo(data.createdAt)
      };
    
    default:
      return null;
  }
};