import express from 'express';

import {
    createReview,
    getReviewsAndImagesByServiceId,
    getReviews
} from "../controllers/reviewController.js";
import upload from "../middleware/multer/multiUploadMulter.js";

const router = express.Router();

router.post("/create", createReview);
router.get("/", getReviews);
router.get('/service/:serviceId/', getReviewsAndImagesByServiceId);


export default router;



// {
//     "message": "Reviews and images fetched successfully for this service",
//     "reviews": [
//       {
//         "_id": "682c794435d89a36cf1dabe1",
//         "serviceId": "682857dc707a0b03ebefebc1",
//         "rating": 4,
//         "reviewText": "Great service!",
//         "images": ["image1.jpg", "image2.jpg"],
//         "createdAt": "2025-05-20T12:44:52.264Z",
//         "customer": {
//           "_id": "681db1b5117e43dd67dde994",
//           "fullName": "Sonali Keshri",
//           "email": "rsonalikeshri@gmail.com"
//         }
//       }
//     ],
//     "images": [
//       "image1.jpg",
//       "image2.jpg",
//       "image3.jpg"
//     ]
//   }
  