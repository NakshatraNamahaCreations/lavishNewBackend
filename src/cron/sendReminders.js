import moment from "moment";
import Order from "../models/order/Order.js";
import "../models/User.js"; // ✅ Correct path and ensures model registration
import { notifyBeforeEvent } from "../services/eventNotification.js";

const sendEventReminders = async () => {
  const tomorrow = moment().add(1, "days").format("MMM DD, YYYY");

  const orders = await Order.find({
    eventDate: tomorrow,
    orderStatus: "created",
    paymentStatus: "PAID",
  }).populate("customerId");

  for (let order of orders) {
    await notifyBeforeEvent(order);
  }
};

export default sendEventReminders;
