// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import sendCompletionMessages from "./cron/sendCompletions.js";

// dotenv.config();

// const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yourdbname";

// (async () => {
//   try {
//     await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
//     console.log("✅ Connected to MongoDB");

//     await sendCompletionMessages();
//     console.log("✅ Completion messages sent!");
//   } catch (err) {
//     console.error("❌ Error sending completion messages:", err);
//   } finally {
//     await mongoose.disconnect();
//     process.exit(0);
//   }
// })();


import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: "support@lavisheventzz.com",
    pass: "Support@020725",
  },
});

transporter.sendMail({
from: "support@lavisheventzz.com",
  to: "support@lavisheventzz.com",
  subject: "SMTP Test",
  text: "This is a test email from Node.js",
}, (err, info) => {
  if (err) {
    console.error("Error:", err);
  } else {
    console.log("Sent:", info.response);
  }
});