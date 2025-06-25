import express, { Router } from "express";
import {
  createService,
  getAllService,
  getServiceById,
  updateService,
  deleteService,
  getServicesByCategoryOrTheme,
  getServiceCount,
  getServicesBySubCategory,
  getServiceBySearchValue,

} from "../../controllers/serviceManagement/serviceController.js";
import { adminauthenticateToken } from "../../middleware/admin/authMiddleware.js";
import upload from "../../middleware/multer/multiUploadMulter.js";
import excelUpload from "../../middleware/multer/excelUpload.js";
import { bulkCreateServices } from "../../controllers/serviceManagement/bulkServicesController.js";

const router = express.Router();

router.post(
  "/create",
  adminauthenticateToken,
  createService
);

router.post(
  "/bulk-upload",
  adminauthenticateToken,
  excelUpload.single("excelFile"),
  bulkCreateServices
);

router.put(
  "/update/:serviceId",
  adminauthenticateToken,
  updateService
);
router.delete(
  "/delete/:serviceId",
  deleteService
);
router.get("/", getAllService);
router.get("/getCount", getServiceCount);
router.get("/:serviceId", getServiceById);
// router.get("/getServicesCount", getServiceCount);

router.get("/filter/:id", getServicesByCategoryOrTheme);
router.get("/by-subcategory/:subCategoryName", getServicesBySubCategory);
router.get("/search/:searchValue", getServiceBySearchValue);

export default router;
