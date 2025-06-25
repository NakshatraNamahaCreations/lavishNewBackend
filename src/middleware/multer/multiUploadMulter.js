import multer from "multer";

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/images"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

// Accept all files
const fileFilter = (req, file, cb) => {
  cb(null, true);
};

// Export the multer instance (not .array!)
const upload = multer({
  storage,
  fileFilter,
});

export default upload;
