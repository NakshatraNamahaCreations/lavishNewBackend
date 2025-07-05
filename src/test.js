// // import mongoose from "mongoose";
// // import dotenv from "dotenv";
// // import sendCompletionMessages from "./cron/sendCompletions.js";

// // dotenv.config();

// // const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yourdbname";

// // (async () => {
// //   try {
// //     await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
// //     console.log("✅ Connected to MongoDB");

// //     await sendCompletionMessages();
// //     console.log("✅ Completion messages sent!");
// //   } catch (err) {
// //     console.error("❌ Error sending completion messages:", err);
// //   } finally {
// //     await mongoose.disconnect();
// //     process.exit(0);
// //   }
// // })();


// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: "smtp.hostinger.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: "support@lavisheventzz.com",
//     pass: "Support@020725",
//   },
// });

// transporter.sendMail({
// from: "support@lavisheventzz.com",
//   to: "support@lavisheventzz.com",
//   subject: "SMTP Test",
//   text: "This is a test email from Node.js",
// }, (err, info) => {
//   if (err) {
//     console.error("Error:", err);
//   } else {
//     console.log("Sent:", info.response);
//   }
// });


import express from "express";
import multer from "multer";
import axios from "axios";
import "dotenv/config";

// Bunny CDN configuration
const BUNNY_STORAGE_ZONE =  "lavisheventzz-bengaluru";
const BUNNY_ACCESS_KEY =  "70f17657-01af-4272-a72aaecfd7f3-300e-401b";
const BUNNY_CDN_HOST =  "lavisheventzz-bangalore.b-cdn.net";

// Multer configuration (memory storage)
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};
const upload = multer({ storage, fileFilter });

// Handle single file upload to Bunny CDN
const handleFileUpload = async (file, folder = "TestImages") => {
  // if (!BUNNY_ACCESS_KEY || BUNNY_ACCESS_KEY === "70f17657-01af-4272-a72aaecfd7f3-300e-401b") {
  //   throw new Error("Invalid Bunny CDN access key. Please set BUNNY_ACCESS_KEY in .env file.");
  // }

  const encodedFolder = encodeURI(folder.trim());
  const encodedFileName = encodeURIComponent(`${Date.now()}-${file.originalname}`);
  const fullPath = `${encodedFolder}/${encodedFileName}`;

  try {
    const response = await axios.put(
      `https://uk.storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${fullPath}`,
      file.buffer,
      {
        headers: {
          AccessKey: "70f17657-01af-4272-a72aaecfd7f3-300e-401b",
          "Content-Type": "application/octet-stream",
        },
      }
    );

    if (response.status === 201) {
      return `https://${BUNNY_CDN_HOST}/${fullPath}`;
    } else {
      throw new Error(`Upload failed with status ${response.status}: ${response.statusText}`);
    }
  } catch (err) {
    console.error(`Upload failed for ${file.originalname}:`, err.message);
    if (err.response) {
      console.error("Bunny CDN error details:", {
        status: err.response.status,
        statusText: err.response.statusText,
        data: err.response.data,
      });
    }
    throw err;
  }
};

// Express app
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hello, I am working" });
});

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadResponse = await handleFileUpload(file);

    return res.status(201).json({
      message: "File uploaded successfully",
      url: uploadResponse,
    });
  } catch (error) {
    console.error("Upload error:", error.message);
    return res.status(500).json({ message: "File upload failed", error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});