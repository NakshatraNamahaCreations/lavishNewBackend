import express from "express";
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getcoupons,
  getcouponswithPagination,
} from "../../controllers/serviceManagement/couponsController.js";
import { adminauthenticateToken } from "../../middleware/admin/authMiddleware.js";

const router = express.Router();

router.post("/create", createCoupon);
router.put("/update/:id", updateCoupon);
router.delete("/delete/:id", deleteCoupon);
router.get("/getcoupons", getcouponswithPagination);
router.get("/", getcoupons);


export default router;
