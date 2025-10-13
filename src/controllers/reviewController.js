import Review from '../models/Review.js';
import Service from '../models/serviceManagement/Service.js';
import axios from 'axios';
import dotenv from 'dotenv';
import handleMultipleFileUpload  from "../middleware/multer/uploadToBunnyCDN.js";

dotenv.config();


export const createReview = async (req, res) => {
  try {
    const { customerId, serviceId, rating, reviewText, folder = "ReviewImages" } = req.body;

    if (!customerId || !serviceId || !rating || !reviewText) {
      return res.status(400).json({ error: "Required fields missing." });
    }

    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
      return res.status(400).json({ error: "Rating must be between 0 and 5." });
    }

    let images = [];

    if (req.files?.length > 0) {
      const invalidFiles = req.files.filter((f) => !f.mimetype.startsWith("image/"));
      if (invalidFiles.length > 0) {
        return res.status(400).json({ error: "Only image files are allowed." });
      }

      images = await handleMultipleFileUpload(req.files, folder);
      images = images.filter(Boolean);
    }

    const reviewData = {
      customerId,
      serviceId,
      rating: parsedRating,
      reviewText,
      images,
      createdAt: new Date(),
    };

    const newReview = new Review(reviewData);
    const savedReview = await newReview.save();

    const reviewCount = await Review.countDocuments({ serviceId });
    const topReview = await Review.findOne({ serviceId }).sort({ rating: -1 });

    if (reviewCount === 1 || topReview) {
      await Service.findByIdAndUpdate(serviceId, {
        $set: { rating: topReview.rating },
      });
    }

    return res.status(201).json({
      message: "Review created successfully",
      review: savedReview,
    });
  } catch (error) {
    console.error("Create review error:", error.message);
    return res.status(500).json({ error: "Server error while creating review" });
  }
};

export const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('customerId', 'firstName lastName email')
            .sort({ createdAt: -1 });

        const reviewsWithFullName = reviews.map(review => {
            const user = review.customerId;

            const fullName = user
                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                : 'Unknown';

            return {
                ...review.toObject(),
                customer: user
                    ? {
                        _id: user._id,
                        fullName,
                        email: user.email
                    }
                    : {
                        fullName: 'Unknown'
                    }
            };
        });

        res.status(200).json({
            message: 'Reviews fetched successfully',
            reviews: reviewsWithFullName
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error while fetching reviews' });
    }
};

export const getReviewsAndImagesByServiceId = async (req, res) => {
    const { serviceId } = req.params;
    const page = parseInt(req.query.page) || 1;  // Default to page 1 if no page is specified
    const limit = parseInt(req.query.limit) || 2;  // Default to 2 reviews per page
    const skip = (page - 1) * limit;  // Skip the appropriate number of reviews for pagination

    try {
        // Count total number of reviews for pagination metadata
        const totalReviews = await Review.countDocuments({ serviceId });

        // Fetch all reviews (just for collecting all images)
        const allReviews = await Review.find({ serviceId });

        // Collect all images from all reviews
        const allImages = [];
        for (const review of allReviews) {
            if (Array.isArray(review.images)) {
                allImages.push(...review.images);
            }
        }

        // Fetch paginated reviews with customer info (limit to 2 reviews per page)
        const paginatedReviews = await Review.find({ serviceId })
            .populate('customerId', 'firstName lastName email')
            .sort({ createdAt: -1 })  // Sort by newest first
            .skip(skip)  // Skip reviews based on the page number
            .limit(limit);  // Limit to the number of reviews per page

        const reviewsWithCustomerInfo = paginatedReviews.map(review => {
            const user = review.customerId;
            const fullName = user
                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                : 'Unknown';

            const customer = user
                ? {
                    _id: user._id,
                    fullName,
                    email: user.email
                }
                : {
                    fullName: 'Unknown'
                };

            return {
                ...review.toObject(),
                customer
            };
        });

        res.status(200).json({
            message: 'Paginated reviews and all images fetched successfully',
            reviews: reviewsWithCustomerInfo,  // Paginated reviews
            totalReviews,  // Total count of reviews for pagination
            images: allImages  // All images from all reviews
        });
    } catch (error) {
        console.error('Error fetching reviews and images by serviceId:', error);
        res.status(500).json({ message: 'Server error while fetching reviews and images' });
    }
};


