import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Refers to the User model
    required: true
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',  // Refers to the Service model
    required: true
  },
  serviceName: { type: String, required: true },  // Service name for display
  servicePrice: { type: Number, required: true },  // Service price for display
  serviceImages: { type: [String], required: true },  // Service images for display
}, { timestamps: true });

export default mongoose.model("Wishlist", WishlistSchema);
