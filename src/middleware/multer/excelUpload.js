import multer from "multer";
import path from "path";

// Set storage destination and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/bulkservices/upload"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

// Optional: filter to allow only Excel files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files (.xls, .xlsx) are allowed"), false);
  }
};

const excelUpload = multer({ storage, fileFilter });

export default excelUpload;
