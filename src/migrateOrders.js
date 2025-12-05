// migratePayments.js
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Order from "./models/order/Order.js"; // <-- Update path

// ---------------------------------------
// PAYMENT STATUS FUNCTION
// ---------------------------------------
function calculatePaymentStatus(order) {
  let paidAmount = order.paidAmount || 0;

  const isOldBooking = !order.paymentType;

  if (isOldBooking) {
    return {
      paidAmount: order.grandTotal,
      dueAmount: 0,
      paymentStatus: "PAID",
      paymentType: "FULL",
      percentage: 100,
    };
  }

  if (order.paymentType === "FULL") {
    return {
      paidAmount: order.grandTotal,
      dueAmount: 0,
      paymentStatus: "PAID",
      paymentType: "FULL",
      percentage: 100,
    };
  }

  if (order.paymentType === "HALF") {
    paidAmount = order.paidAmount || 0;
    const dueAmount = order.grandTotal - paidAmount;

    return {
      paidAmount,
      dueAmount,
      paymentStatus: paidAmount >= order.grandTotal ? "PAID" : "PARTIAL PAID",
      paymentType: "HALF",
      percentage: order.paymentPercentage || 50,
    };
  }

  return {
    paidAmount: 0,
    dueAmount: order.grandTotal,
    paymentStatus: "PENDING",
    paymentType: "FULL",
    percentage: 0,
  };
}

// ---------------------------------------
// MAIN MIGRATION LOGIC
// ---------------------------------------
async function migrate() {
  const isDryRun = process.argv.includes("--dry");

  console.log(isDryRun ? "\n🔍 DRY RUN MODE — No changes will be saved.\n" : "\n🚀 STARTING LIVE MIGRATION...\n");

  await mongoose.connect("mongodb+srv://lavish_events:inZOZJfpNeyuwEX1@cluster0.hytzt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"); // Update DB

  const orders = await Order.find({});
  console.log(`📌 Found ${orders.length} orders`);

  // BACKUP OLD DATA BEFORE MIGRATION
  const backupDir = "./backups";
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

  const backupFile = `${backupDir}/orders-backup-${Date.now()}.json`;
  fs.writeFileSync(backupFile, JSON.stringify(orders, null, 2));

  console.log(`📦 Backup saved: ${backupFile}`);

  let changed = 0;

  for (const order of orders) {
    const newState = calculatePaymentStatus(order);

    const hasChange =
      order.paidAmount !== newState.paidAmount ||
      order.dueAmount !== newState.dueAmount ||
      order.paymentStatus !== newState.paymentStatus ||
      !order.paymentType;

    if (hasChange) {
      console.log(`🟡 Updating order ${order.orderId}`);

      order.paidAmount = newState.paidAmount;
      order.dueAmount = newState.dueAmount;
      order.paymentStatus = newState.paymentStatus;
      order.paymentType = newState.paymentType;
      order.paymentPercentage = newState.percentage;

      if (!order.merchantTransactionId) {
        order.merchantTransactionId =
          `MIGRATED_${Date.now()}_${Math.floor(Math.random() * 99999)}`;
      }

      if (!isDryRun) await order.save();

      changed++;
    }
  }

  console.log("\n-------------------------------------");
  console.log(isDryRun ? "🔍 DRY RUN SUMMARY" : "✅ LIVE MIGRATION SUMMARY");
  console.log("-------------------------------------");
  console.log(`Total Orders Processed: ${orders.length}`);
  console.log(`Orders Updated:         ${changed}`);
  console.log(`Backup File:            ${backupFile}`);
  console.log("-------------------------------------");

  process.exit();
}

migrate();
