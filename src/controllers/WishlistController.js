import Wishlist from "../models/Wishlist.js";

export const createWishlist = async (req, res) => {
  const { customerId, serviceId, serviceName, servicePrice, serviceImages } = req.body;

  try {
    // Check if the user already has this service in their wishlist
    let existingWishlist = await Wishlist.findOne({ customerId, serviceId });

    if (existingWishlist) {
      return res.status(400).json({
        message: 'This service is already in your wishlist.',
      });
    }

    // Create a new wishlist entry with all required fields
    const wishlist = new Wishlist({
      customerId,
      serviceId,
      serviceName,
      servicePrice,
      serviceImages
    });

    await wishlist.save();

    res.status(201).json({
      message: 'Service added to wishlist successfully',
      wishlist,
    });
  } catch (error) {
    console.error('Error creating wishlist:', error);
    res.status(500).json({ message: 'Server error while creating wishlist' });
  }
};

export const removeItemFromWishlist = async (req, res) => {
  const { customerId, serviceId } = req.params;
  console.log("customerId", customerId)
  console.log("ServcieId", serviceId)

  try {
    // Find the wishlist and remove the item
    const wishlist = await Wishlist.findOneAndDelete({ customerId, serviceId });

    if (!wishlist) {
      return res.status(404).json({ message: 'Service not found in wishlist.' });
    }

    res.status(200).json({
      message: 'Service removed from wishlist successfully',
    });
  } catch (error) {
    console.error('Error removing service from wishlist:', error);
    res.status(500).json({ message: 'Server error while removing service from wishlist' });
  }
};


export const getWishlist = async (req, res) => {
  const { customerId } = req.params;

  try {
    const wishlist = await Wishlist.find({ customerId })
      .populate('customerId', 'firstName lastName email')  // Populate customer details
      .populate('serviceId', 'name description images')  // Populate service details with images
      .sort({ createdAt: -1 });

    if (!wishlist || wishlist.length === 0) {
      return res.status(404).json({ message: 'No wishlist found for this user.' });
    }

    res.status(200).json({
      message: 'Wishlist fetched successfully',
      wishlist,
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server error while fetching wishlist' });
  }
};
