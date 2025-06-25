import multer from "multer";

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "public/images"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
  });
  
const upload = multer({ storage });

export default upload;