import mongoose from "mongoose";
import dotenv from "dotenv";
import sendCompletionMessages from "./cron/sendCompletions.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yourdbname";

(async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Connected to MongoDB");

    await sendCompletionMessages();
    console.log("✅ Completion messages sent!");
  } catch (err) {
    console.error("❌ Error sending completion messages:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();