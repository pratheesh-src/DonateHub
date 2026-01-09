const Item = require('../models/item.model');
const Transaction = require('../models/transaction.model');
const Notification = require('../models/notification.model');

// Create item
exports.createItem = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      originalPrice,
      condition,
      quantity,
      location,
      coordinates,
      specifications,
      tags,
      shipping
    } = req.body;

    const isFree = price === 0 || req.body.isFree === true;

    const item = await Item.create({
      seller: req.user._id,
      title,
      description,
      category,
      price: isFree ? 0 : parseFloat(price),
      originalPrice: parseFloat(originalPrice) || parseFloat(price),
      isFree,
      condition: condition || 'good',
      quantity: parseInt(quantity) || 1,
      location,
      coordinates,
      specifications: specifications ? JSON.parse(specifications) : {},
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      shipping: shipping ? JSON.parse(shipping) : { available: false },
      images: req.files?.map(file => ({
        url: file.path || `/uploads/${file.filename}`,
        publicId: file.filename,
        isPrimary: false
      })) || []
    });

    // Make first image primary if exists
    if (item.images.length > 0) {
      item.images[0].isPrimary = true;
      await item.save();
    }

    res.status(201).json({
      message: 'Item listed successfully',
      item
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ message: 'Server error creating item' });
  }
};

// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      condition,
      location,
      isFree,
      search,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { status: 'active' };
    
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (location) query.location = new RegExp(location, 'i');
    if (isFree !== undefined) query.isFree = isFree === 'true';
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await Item.countDocuments(query);

    // Get items with population
    const items = await Item.find(query)
      .populate('seller', 'firstName lastName avatar rating')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Increment views for each item
    await Promise.all(
      items.map(item => 
        Item.findByIdAndUpdate(item._id, { $inc: { views: 1 } })
      )
    );

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
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error fetching items' });
  }
};

// Get single item
exports.getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('seller', 'firstName lastName avatar email phone rating')
      .populate('buyer', 'firstName lastName avatar')
      .lean();

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if item is available
    if (item.status !== 'active' && req.user?.role !== 'admin') {
      return res.status(404).json({ message: 'Item not available' });
    }

    // Increment views
    await Item.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Get similar items
    const similarItems = await Item.find({
      _id: { $ne: item._id },
      category: item.category,
      status: 'active'
    })
    .limit(4)
    .populate('seller', 'firstName lastName avatar')
    .select('title price images location condition')
    .lean();

    res.json({ 
      item,
      similarItems 
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Server error fetching item' });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check permissions
    if (item.seller.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Can't update sold items
    if (item.status === 'sold' && req.user.role !== 'admin') {
      return res.status(400).json({ 
        message: 'Cannot update sold items' 
      });
    }

    // Update item
    Object.assign(item, req.body);
    
    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: file.path || `/uploads/${file.filename}`,
        publicId: file.filename,
        isPrimary: false
      }));
      
      // Keep existing images unless specified to replace
      if (!req.body.replaceImages) {
        item.images = [...item.images, ...newImages];
      } else {
        item.images = newImages;
      }
    }

    await item.save();

    res.json({ 
      message: 'Item updated successfully',
      item 
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error updating item' });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check permissions
    if (item.seller.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Can only delete items that haven't been sold
    if (item.status === 'sold' && req.user.role !== 'admin') {
      return res.status(400).json({ 
        message: 'Cannot delete sold items' 
      });
    }

    await item.deleteOne();

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error deleting item' });
  }
};

// Purchase item
exports.purchaseItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status !== 'active') {
      return res.status(400).json({ 
        message: 'Item is not available for purchase' 
      });
    }

    // Check if user is purchasing their own item
    if (item.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        message: 'Cannot purchase your own item' 
      });
    }

    // Check quantity
    if (item.quantity < 1) {
      return res.status(400).json({ 
        message: 'Item is out of stock' 
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      donor: req.user._id,
      recipient: item.seller,
      type: 'purchase',
      item: item._id,
      amount: item.price,
      status: 'pending',
      shippingAddress: req.body.shippingAddress
    });

    // Update item
    item.quantity -= 1;
    if (item.quantity === 0) {
      item.status = 'pending';
    }
    item.buyer = req.user._id;
    await item.save();

    // Create notification for seller
    await Notification.create({
      user: item.seller,
      type: 'item_sold',
      title: 'Item Purchase Request',
      message: `${req.user.firstName} ${req.user.lastName} wants to purchase your item: ${item.title}`,
      data: { 
        itemId: item._id,
        transactionId: transaction._id,
        buyerId: req.user._id
      }
    });

    res.json({ 
      message: 'Purchase request sent successfully',
      transaction 
    });
  } catch (error) {
    console.error('Purchase item error:', error);
    res.status(500).json({ message: 'Server error processing purchase' });
  }
};

// Get my items
exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ seller: req.user._id })
      .populate('buyer', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

    res.json({ items });
  } catch (error) {
    console.error('Get my items error:', error);
    res.status(500).json({ message: 'Server error fetching items' });
  }
};

// Toggle favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const isFavorite = item.favorites.includes(req.user._id);
    
    if (isFavorite) {
      // Remove from favorites
      item.favorites = item.favorites.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      // Add to favorites
      item.favorites.push(req.user._id);
    }

    await item.save();

    res.json({ 
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      isFavorite: !isFavorite
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Server error toggling favorite' });
  }
};