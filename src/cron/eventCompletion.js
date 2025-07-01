// import mongoose from "mongoose";
// import moment from "moment";
// import dotenv from "dotenv";
// import Order from "../models/order/Order.js";
// import { notifyEventCompleted } from "../services/eventNotification.js";

// dotenv.config();

// export const runEventCompletionCron = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log("✅ Connected to MongoDB");

//     const now = moment();
//     const orders = await Order.find({ orderStatus: "created" }).populate(
//       "customerId",
//       "mobile"
//     );

//     console.log(`📋 Found ${orders.length} orders to check`);

//     for (const order of orders) {
//       if (!order.eventDate || !order.eventTime) {
//         console.warn(`⚠️ Skipping order ${order.orderId}: missing date/time`);
//         continue;
//       }

//       try {
//         const [_, endTime] = order.eventTime.split(" - ");
//         const eventEndDateTime = moment(
//           `${order.eventDate} ${endTime}`,
//           "MMM DD, YYYY hh:mm A"
//         );

//         if (!eventEndDateTime.isValid()) {
//           console.warn(`⚠️ Invalid date/time for order ${order.orderId}`);
//           continue;
//         }

//         if (eventEndDateTime.isBefore(now)) {
//           console.log(`📩 Sending completion message for order ${order.orderId}`);
//           await notifyEventCompleted(order);
//           order.orderStatus = "completed";
//           await order.save();
//         }
//       } catch (err) {
//         console.error(`❌ Error processing order ${order.orderId}:`, err.message);
//       }
//     }

//     console.log("🎯 Event completion cron finished.");
//   } catch (err) {
//     console.error("❌ Error in completion cron job:", err.message);
//   } finally {
//     await mongoose.disconnect();
//     console.log("🔌 Disconnected from MongoDB");
//   }
// };

// // For manual testing
// runEventCompletionCron();


// import { notifyEventCompleted } from "../notifications/whatsappNotification.js";

// const markEventComplete = async (req, res) => {
//   const { orderId } = req.params;

//   const order = await Order.findByIdAndUpdate(orderId, {
//     orderStatus: "completed",
//   }, { new: true });

//   if (order) {
//     await notifyEventCompleted(order);
//     res.json({ success: true, message: "Event marked completed." });
//   } else {
//     res.status(404).json({ error: "Order not found" });
//   }
// };
