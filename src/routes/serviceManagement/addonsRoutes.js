import express from "express";
import {
  createAddon,
  updateAddon,
  deleteAddon,
  getAllAddons,
  getAddonById,
  getAddonsBySubCategory,
} from "../../controllers/serviceManagement/AddonsController.js";
import upload from "../../middleware/multer/multer.js";
import { adminauthenticateToken } from "../../middleware/admin/authMiddleware.js";

const router = express.Router();

router.post(
  "/create",
  adminauthenticateToken,
  createAddon
);

router.put(
  "/update/:addonId",
  adminauthenticateToken,
  updateAddon
);

router.delete("/delete/:addonId", deleteAddon);
router.get("/", getAllAddons);
router.get("/:addonId", getAddonById);
router.get("/subcategory/:subCategoryId", getAddonsBySubCategory);

export default router;
