// // cron/reminder.js
// import { notifyBeforeEvent } from "../notifications/whatsappNotification.js";
// import Order from "../models/Order.js";
// import moment from "moment";

// const sendEventReminders = async () => {
//   const tomorrow = moment().add(1, 'day').format("DD-MM-YYYY");

//   const orders = await Order.find({ eventDate: tomorrow, orderStatus: "confirmed" });

//   for (let order of orders) {
//     await notifyBeforeEvent(order);
//   }

//   console.log("✅ Event reminders sent");
// };

// export default sendEventReminders;
