import { sendWhatsappMessage } from "../utils/sendWhatsapp.js";

// Send Booking Message
export const notifyBooking = async (order) => {
  if (!order?.customerId?.mobile) {
    console.warn("⚠️ Skipping booking message: no mobile number found");
    return;
  }

  const msg = `Hi ${order.customerName}, your event '${order.occasion || "Event"}' is confirmed for ${order.eventDate} in Slot ${order.eventTime}. – Lavish Eventzz`;
  await sendWhatsappMessage(order.customerId.mobile, msg);
};


// // Send Reminder (used in cron)
// export const notifyBeforeEvent = async (order) => {
//   if (!order?.customerId?.mobile) return;

//   const msg = `Reminder: Your event '${order.occasion}' is scheduled for tomorrow (${order.eventDate}) in Slot ${order.eventTime}. – Lavish Eventzz`;
//   await sendWhatsappMessage(order.customerId.mobile, msg);
// };

// // Send Completion Message
// export const notifyEventCompleted = async (order) => {
//   const { customerId, customerName, occasion } = order;

//   if (!customerId || !customerId.mobile) {
//     console.warn("⚠️ Skipping completion message: customer mobile not found.");
//     return;
//   }

//   const msg = `Hi ${customerName}, hope you enjoyed your event '${occasion}'. Please share your experience with us 🙏 – Lavish Eventzz`;

//   try {
//     await sendWhatsappMessage(customerId.mobile, msg);
//   } catch (err) {
//     console.error("❌ Failed to send event completion message:", err.message);
//   }
// };


// // Send Cancel/Reschedule Message
// export const notifyEventUpdate = async (order, status) => {
//   const { customerId, occasion } = order;

//   if (!customerId || !customerId.mobile) {
//     console.warn(`⚠️ Skipping '${status}' message: customer mobile not found.`);
//     return;
//   }

//   const msg = `Your event '${occasion}' has been ${status}. Contact our team for support. – Lavish Eventzz`;

//   try {
//     await sendWhatsappMessage(customerId.mobile, msg);
//   } catch (err) {
//     console.error(`❌ Failed to send ${status} notification:`, err.message);
//   }
// };
