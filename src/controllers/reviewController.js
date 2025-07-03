import Review from '../models/Review.js';
import Service from '../models/serviceManagement/Service.js';

// export const createReview = async (req, res) => {
//     try {
//         const { customerId, serviceId, rating, reviewText } = req.body;
//         let images = [];

//         if (req.body.images) {
//             try {
//                 images = JSON.parse(req.body.images);
//             } catch (e) {
//                 return res.status(400).json({ message: 'Invalid images format.' });
//             }
//         }

//         if (!customerId || !serviceId || !rating || !reviewText) {
//             return res.status(400).json({ message: 'Fill all the fields.' });
//         }

//         // Only add images field if images array is not empty
//         const reviewData = {
//             customerId,
//             serviceId,
//             rating,
//             reviewText,
//             createdAt: new Date(),
//         };
//         if (images.length > 0) {
//             reviewData.images = images;
//         }

//         const newReview = new Review(reviewData);
//         const savedReview = await newReview.save();

//         res.status(201).json({
//             message: 'Review created successfully',
//             review: savedReview,
//         });
//     } catch (error) {
//         console.error('Error creating review:', error);
//         res.status(500).json({ message: 'Server error while creating review' });
//     }
// };

export const createReview = async (req, res) => {
    try {
        const { customerId, serviceId, rating, reviewText } = req.body;
        let images = [];

        if (req.body.images) {
            try {
                images = JSON.parse(req.body.images);
            } catch (e) {
                return res.status(400).json({ message: 'Invalid images format.' });
            }
        }

        if (!customerId || !serviceId || !rating || !reviewText) {
            return res.status(400).json({ message: 'Fill all the fields.' });
        }

        // Create review object
        const reviewData = {
            customerId,
            serviceId,
            rating,
            reviewText,
            createdAt: new Date(),
        };
        if (images.length > 0) {
            reviewData.images = images;
        }

        // Save the review
        const newReview = new Review(reviewData);
        const savedReview = await newReview.save();

        // Count reviews for this service
        const reviewCount = await Review.countDocuments({ serviceId });

        if (reviewCount === 1) {
            // First review: set this rating in Service
            await Service.findByIdAndUpdate(
                serviceId,
                { $set: { rating: savedReview.rating } }
            );
        } else {
            // Not first review: find highest rating and update Service
            const highestReview = await Review.findOne({ serviceId }).sort({ rating: -1 });
            if (highestReview) {
                await Service.findByIdAndUpdate(
                    serviceId,
                    { $set: { rating: highestReview.rating } }
                );
            }
        }

        res.status(201).json({
            message: 'Review created successfully',
            review: savedReview,
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Server error while creating review' });
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


