// paymentMigration.js
import mongoose from "mongoose";
import fs from "fs";
import dotenv from "dotenv";
import Payment from "./models/payment/Payment.js"; // <-- update path if needed

dotenv.config();

// --------------------------------------------
// SAFE BACKUP FUNCTION
// --------------------------------------------
function backupPayments(data) {
  const backupDir = "./backups";
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

  const filePath = `${backupDir}/payments-backup-${Date.now()}.json`;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  return filePath;
}

// --------------------------------------------
// MAIN PAYMENT MIGRATION
// --------------------------------------------
async function migratePayments() {
  const isDryRun = process.argv.includes("--dry");

  console.log(
    isDryRun
      ? "\n🔍 DRY RUN MODE — No changes will be saved.\n"
      : "\n🚀 STARTING PAYMENT MIGRATION...\n"
  );

  // Connect to database
  await mongoose.connect("mongodb+srv://lavish_events:inZOZJfpNeyuwEX1@cluster0.hytzt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

  const payments = await Payment.find({});
  console.log(`📌 Found ${payments.length} payment records`);

  // Backup before updating
  const backupFile = backupPayments(payments);
  console.log(`📦 Backup saved: ${backupFile}`);

  let updated = 0;

  for (const p of payments) {
    const update = {};

    // 1️⃣ OLD paymentType → set to FULL
    if (!p.paymentType) update.paymentType = "FULL";

    // 2️⃣ OLD paymentMethod → set to FULL (it was always full payment earlier)
    if (!p.paymentMethod) update.paymentMethod = "FULL";

    // 3️⃣ OLD paymentMode → always ONLINE for older bookings
    if (!p.paymentMode) update.paymentMode = "ONLINE";

    // 4️⃣ OLD status → change PAID to COMPLETED
    if (!p.status || p.status === "PAID") update.status = "COMPLETED";

    // 5️⃣ Generate transactionId if missing
    if (!p.transactionId) {
      update.transactionId = `TXN_OLD_${Date.now()}_${Math.floor(
        Math.random() * 999999
      )}`;
    }

    // If no changes needed, skip
    if (Object.keys(update).length === 0) continue;

    console.log(`🟡 Updating payment for OrderID: ${p.orderId}`);

    if (!isDryRun) {
      await Payment.updateOne({ _id: p._id }, update);
    }

    updated++;
  }

  // Summary
  console.log("\n----------------------------------------");
  console.log(
    isDryRun ? "🔍 PAYMENT DRY RUN SUMMARY" : "✅ PAYMENT MIGRATION SUMMARY"
  );
  console.log("----------------------------------------");
  console.log(`Payments Processed: ${payments.length}`);
  console.log(`Payments Updated:   ${updated}`);
  console.log(`Backup File:        ${backupFile}`);
  console.log("----------------------------------------\n");

  process.exit();
}

migratePayments();
