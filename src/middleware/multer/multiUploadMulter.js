// import multer from "multer";

// // Multer storage configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "public/images"),
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });

// // Accept all files
// const fileFilter = (req, file, cb) => {
//   cb(null, true);
// };

// // Export the multer instance (not .array!)
// const upload = multer({
//   storage,
//   fileFilter,
// });

// export default upload;

import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { files: 5 },
});

export default upload;
