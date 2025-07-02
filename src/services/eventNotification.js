import {
  sendWhatsappMessage,
  sendWhatsappImage,
} from "../utils/sendWhatsapp.js";

export const notifyBooking = async (order) => {
  if (!order?.customerId?.mobile) {
    console.warn("⚠️ Skipping booking message: no mobile number found");
    return;
  }

  const mobile = order.customerId.mobile;
  const grandTotal = order.grandTotal;
  const serviceItem = order.items.find(
    (item) => item.categoryType === "Service"
  );

  if (!serviceItem) {
    console.warn("⚠️ No service item found in order.");
    return;
  }

  const imageUrl = serviceItem.image || "";
  const serviceName = serviceItem.serviceName || "Selected Service";
  const price = serviceItem.price || 0;

  const caption = `🎉 *Booking Confirmed!* 🎉

Hi ${order.customerName},

Your *${serviceName || "Event"}* is confirmed for:
📅 Date: ${order.eventDate}
⏰ Slot: ${order.eventTime}
📍 Location: ${order.address}

🪄 *Service*: ${serviceName}
💵 *Price*: ₹${price}
🏷 *Total Amount*: ₹${grandTotal}

We’re excited to create unforgettable memories for you. For any help, feel free to reach us.

– Lavish Eventzz 💖`;

  if (imageUrl) {
    await sendWhatsappImage(mobile, imageUrl, caption);
  } else {
    await sendWhatsappMessage(mobile, caption);
  }
};

// Send Reminder (used in cron)
export const notifyBeforeEvent = async (order) => {
  if (!order?.customerId?.mobile) return;

  const mobile = order.customerId.mobile;
  const grandTotal = order.grandTotal;
  const serviceItem = order.items.find(
    (item) => item.categoryType === "Service"
  );

  if (!serviceItem) {
    console.warn("⚠️ No service item found in order.");
    return;
  }

  const { image, serviceName, price, customizedInputs = [] } = serviceItem;
  const imageUrl = image || "";
  const customDetails = customizedInputs
    .map((i) => `🔧 *${i.label}*: ${i.value}`)
    .join("\n");

  const caption = `⏰ *Reminder Alert!* ⏰

Hi ${order.customerName},

Your *${order.occasion || "event"}* is scheduled for *tomorrow*:
📅 *Date*: ${order.eventDate}
⏰ *Time*: ${order.eventTime}
📍 *Location*: ${order.address}

🪄 *Service*: ${serviceName}
💵 *Price*: ₹${price}
🏷 *Total Amount*: ₹${grandTotal}
${customDetails ? "\n" + customDetails : ""}

We’re all set to celebrate with you! 🎈

– Lavish Eventzz 💖`;

  if (imageUrl) {
    await sendWhatsappImage(mobile, imageUrl, caption, {
      orderId: order.orderId,
      type: "reminder",
    });
  } else {
    await sendWhatsappMessage(mobile, caption, {
      orderId: order.orderId,
      type: "reminder",
    });
  }
};

// // Send Completion Message
// export const notifyEventCompleted = async (order) => {
//   const { customerId, customerName, orderId } = order;

//   if (!customerId || !customerId.mobile) {
//     console.warn("⚠️ Skipping completion message: customer mobile not found.");
//     return;
//   }

//   const mobile = customerId.mobile;
//   const serviceItem = order.items.find(
//     (item) => item.categoryType === "Service"
//   );
//   const serviceName =
//     serviceItem?.serviceName || "your event";

//     const reviewLink = `https://lavisheventzz.com/service/details/${serviceItem?.refId}`

//   const msg = `Hi ${customerName},

// We hope you had a fantastic time at your *${serviceName}*! 🎉

// We’d love to hear your thoughts and see your celebration moments 🥳
// Please take a moment to share your experience.

// – Lavish Eventzz 💖`;

//   await sendWhatsappMessage(mobile, msg, {
//     orderId,
//     type: "completed",
//   });
// };

// Send Completion Message
export const notifyEventCompleted = async (order) => {
  const { customerId, customerName, orderId } = order;

  if (!customerId || !customerId.mobile) {
    console.warn("⚠️ Skipping completion message: customer mobile not found.");
    return;
  }

  const mobile = customerId.mobile;
  const serviceItem = order.items.find(
    (item) => item.categoryType === "Service"
  );
  const serviceName = serviceItem?.serviceName || "your event";
  const reviewLink = `https://lavisheventzz.com/service/details/${serviceItem?.refId}`;

  const msg = `Hi ${customerName},

We hope you had a fantastic time at your *${serviceName}*! 🎉

We’d love to hear your thoughts and see your celebration moments 🥳  
Please take a moment to share your experience:
${reviewLink}

– Lavish Eventzz 💖`;

  await sendWhatsappMessage(mobile, msg, {
    orderId,
    type: "completed",
    reviewLink, // also pass as meta if needed
  });
};

// Send Cancel/Reschedule Message
export const notifyEventUpdate = async (order, status) => {
  const {
    customerId,
    customerName,
    occasion,
    orderId,
    items,
    address,
    rescheduledAddress,
    eventDate,
    rescheduledEventDate,
    eventTime,
    rescheduledEventTime,
    grandTotal,
    reason,
  } = order;

  if (!customerId || !customerId.mobile) {
    console.warn(`⚠️ Skipping '${status}' message: customer mobile not found.`);
    return;
  }

  const mobile = customerId.mobile;

  // 🟡 Filter only 'Service' type items
  const serviceItems = (items || []).filter(
    (item) => item.categoryType === "Service"
  );

  if (serviceItems.length === 0) {
    console.warn("⚠️ No service items found in the order.");
    return;
  }

  // Derive service details (name + price + image)
  const serviceDetails = serviceItems
    .map((item) => {
      return `🔹 *${item.serviceName}* - ₹${item.price}`;
    })
    .join("\n");

  // Derive first image (for WhatsApp media)
  const serviceImage = serviceItems.length > 0 ? serviceItems[0].image : null;

  // Fallback logic for rescheduled details
  const finalDate = rescheduledEventDate || eventDate;
  const finalTime = rescheduledEventTime || eventTime;
  const finalAddress = rescheduledAddress || address;

  let msg = "";

  if (status === "cancelled") {
    msg = `⚠️ *Event Cancellation Notice* ⚠️

Hi ${customerName},

Your *${
      serviceItems[0].serviceName || "event"
    }* with *Order ID: ${orderId}* has been *cancelled*.

🗓️ Date: ${eventDate}
⏰ Time: ${eventTime}
📍 Address: ${address}

❌ Reason: ${reason || "Not specified"}

🧾 *Booked Services:*
${serviceDetails}

💰 *Total Amount*: ₹${grandTotal}

Please contact our support team for any clarification.

– Lavish Eventzz 💬`;
  } else if (status === "rescheduled") {
    msg = `📢 *Event Rescheduled Notice* 📢

Hi ${customerName},

Your *${
      serviceItems[0].serviceName || "event"
    }* with *Order ID: ${orderId}* has been *rescheduled*.

🆕 *New Event Details*:
🗓️ Date: ${finalDate}
⏰ Time: ${finalTime}
📍 Address: ${finalAddress}

🔄 Reason: ${reason || "Not specified"}

🧾 *Booked Services:*
${serviceDetails}

💰 *Total Amount*: ₹${grandTotal}

Please contact us for confirmation or changes.

– Lavish Eventzz 💬`;
  } else {
    console.warn(
      `⚠️ Skipping notifyEventUpdate – status '${status}' not applicable.`
    );
    return;
  }

  try {
    if (serviceImage) {
      // Send message with image
      await sendWhatsappImage(mobile, serviceImage, msg, {
        orderId,
        type: status,
      });
    } else {
      // Send message without image
      await sendWhatsappMessage(mobile, msg, {
        orderId,
        type: status,
      });
    }
    console.log(`✅ ${status} message sent to ${mobile}`);
  } catch (error) {
    console.error(`❌ Failed to send ${status} message:`, error.message);
  }
};
