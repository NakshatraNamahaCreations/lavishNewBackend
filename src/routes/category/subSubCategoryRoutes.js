// import express from "express";
// import {
//   createSubSubCategory,
//   getAllSubSubCategories,
//   getSubSubCategoriesBySubCategory,
//   updateSubSubCategory,
//   deleteSubSubCategory
// } from "../../controllers/category/subSubCategoryController.js";
// import { authenticateToken } from "../../middleware/authMiddleware.js";
// import upload from "../../middleware/multer/multer.js";

// const router = express.Router();

// // Protected route - requires authentication and file upload
// router.post( "/create", authenticateToken, upload.single("image"), createSubSubCategory );
// router.put( "/update/:id", authenticateToken, upload.single("image"), updateSubSubCategory);
// router.delete( "/delete/:id", deleteSubSubCategory);

// // Public routes
// router.get("/", getAllSubSubCategories);
// router.get("/subcategory/:subCategoryId", getSubSubCategoriesBySubCategory);

// export default router;


import express from "express";
import {
  createSubSubCategory,
  getAllSubSubCategories,
  getSubSubCategoriesBySubCategory,
  updateSubSubCategory,
  deleteSubSubCategory
} from "../../controllers/category/subSubCategoryController.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";
// import upload from "../../middleware/multer/multer.js";

const router = express.Router();

// Protected route - requires authentication and file upload
router.post( "/create", authenticateToken, createSubSubCategory );
router.put( "/update/:id", authenticateToken, updateSubSubCategory);
router.delete( "/delete/:id", deleteSubSubCategory);

// Public routes
router.get("/", getAllSubSubCategories);
router.get("/subcategory/:subCategoryId", getSubSubCategoriesBySubCategory);

export default router;
