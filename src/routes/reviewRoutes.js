import express from "express";

import {
  createReview,
  getReviewsAndImagesByServiceId,
  getReviews,
} from "../controllers/reviewController.js";
import upload from "../middleware/multer/multiUploadMulter.js";

const router = express.Router();

router.post("/create", upload.array("images", 5), createReview);
router.get("/", getReviews);
router.get("/service/:serviceId/", getReviewsAndImagesByServiceId);

export default router;
