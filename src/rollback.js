// rollback.js
import mongoose from "mongoose";
import fs from "fs";
import Order from "./models/order/Order.js"; // <-- Update path

async function rollback() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.log("❌ Please provide backup JSON file path");
    console.log("Example: node rollback.js backups/orders-backup-123.json");
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.log(`❌ Backup file not found: ${filePath}`);
    process.exit(1);
  }

  await mongoose.connect("YOUR_MONGO_URL_HERE");

  const backupData = JSON.parse(fs.readFileSync(filePath));

  console.log(`♻️ Restoring ${backupData.length} orders...`);

  for (const oldOrder of backupData) {
    await Order.updateOne({ _id: oldOrder._id }, oldOrder);
  }

  console.log("✅ ROLLBACK COMPLETE");

  process.exit();
}

rollback();
