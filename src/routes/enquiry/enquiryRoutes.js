import express from "express";
import { submitInquiry, getEnquiries } from "../../controllers/enquiry/enquiryController.js";

const router = express.Router();

// POST /api/enquiries - Submit a new enquiry
router.post("/create", submitInquiry);

// PATCH /api/enquiries/:id/status - Update status of an existing enquiry
// router.put("/:id/status", updateInquiryStatus);

// GET /api/enquiries - Get all enquiries
router.get("/", getEnquiries);

export default router;
