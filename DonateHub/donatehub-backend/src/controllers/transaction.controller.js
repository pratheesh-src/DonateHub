const Transaction = require('../models/transaction.model');
const Notification = require('../models/notification.model');

// Get my transactions
exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ donor: req.user._id }, { recipient: req.user._id }]
    })
    .populate('donor recipient', 'firstName lastName avatar')
    .populate('donation item')
    .sort({ createdAt: -1 });

    res.json({ transactions });
  } catch (error) {
    console.error('Get my transactions error:', error);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
};

// Get single transaction
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('donor recipient', 'firstName lastName avatar email phone')
      .populate('donation item');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check permissions
    if (transaction.donor._id.toString() !== req.user._id.toString() &&
        transaction.recipient._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error fetching transaction' });
  }
};

// Update transaction status
exports.updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check permissions
    if (transaction.recipient.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    transaction.status = status;
    
    if (status === 'completed') {
      transaction.completedDate = new Date();
    } else if (status === 'cancelled') {
      transaction.cancelledDate = new Date();
      
      // If it's a purchase and was cancelled, restore item quantity
      if (transaction.type === 'purchase' && transaction.item) {
        await Item.findByIdAndUpdate(transaction.item, {
          $inc: { quantity: 1 },
          status: 'active',
          buyer: null
        });
      }
    }

    await transaction.save();

    // Create notification for the other party
    const otherParty = transaction.donor.toString() === req.user._id.toString() 
      ? transaction.recipient 
      : transaction.donor;

    await Notification.create({
      user: otherParty,
      type: 'transaction_update',
      title: 'Transaction Status Updated',
      message: `Transaction #${transaction._id} has been ${status}`,
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

// Send message in transaction
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check permissions
    if (transaction.donor.toString() !== req.user._id.toString() &&
        transaction.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const newMessage = await transaction.addMessage(req.user._id, message);

    // Create notification for the other party
    const otherParty = transaction.donor.toString() === req.user._id.toString() 
      ? transaction.recipient 
      : transaction.donor;

    await Notification.create({
      user: otherParty,
      type: 'message_received',
      title: 'New Message',
      message: `You have a new message regarding transaction #${transaction._id}`,
      data: { 
        transactionId: transaction._id,
        messageId: newMessage._id 
      }
    });

    res.json({ 
      message: 'Message sent successfully',
      transaction 
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

// Submit rating
exports.submitRating = async (req, res) => {
  try {
    const { rating, review, forUser } = req.body;

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check permissions
    if (transaction.donor.toString() !== req.user._id.toString() &&
        transaction.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if transaction is completed
    if (transaction.status !== 'completed') {
      return res.status(400).json({ 
        message: 'Can only rate completed transactions' 
      });
    }

    // Update rating based on who is submitting
    if (forUser === 'donor' && transaction.donor.toString() === req.user._id.toString()) {
      transaction.recipientRating = rating;
      transaction.recipientReview = review;
    } else if (forUser === 'recipient' && transaction.recipient.toString() === req.user._id.toString()) {
      transaction.donorRating = rating;
      transaction.donorReview = review;
    } else {
      return res.status(400).json({ 
        message: 'Invalid rating submission' 
      });
    }

    await transaction.save();

    // Update user's average rating (would need to implement this)
    // This is a placeholder - you'd want to calculate and update user's average rating

    res.json({ 
      message: 'Rating submitted successfully',
      transaction 
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ message: 'Server error submitting rating' });
  }
};