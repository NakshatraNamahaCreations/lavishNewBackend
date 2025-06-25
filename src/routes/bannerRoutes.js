// import express from "express";
// import {
//   addBanner,
//   getBanners,
//   updateBanner,
//   deleteBanner,
// } from "../controllers/bannerController.js";
// import upload from "../middleware/multer/multer.js";
// const router = express.Router();

// router.post("/create", upload.single("bannerImage"), addBanner);
// router.put("/update/:id", upload.single("bannerImage"), updateBanner);
// router.delete("/delete/:id", deleteBanner);
// router.get("/", getBanners);

// export default router;



import express from "express";
import {
  addBanner,
  getBanners,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController.js";
// import upload from "../middleware/multer/multer.js";
const router = express.Router();

router.post("/create", addBanner);
router.put("/update/:id", updateBanner);
router.delete("/delete/:id", deleteBanner);
router.get("/", getBanners);

export default router;
