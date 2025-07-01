import moment from "moment";
import Order from "../models/order/Order.js";
import "../models/User.js";  
import { notifyEventCompleted } from "../services/eventNotification.js";

const sendCompletionMessages = async () => {
  const today = moment().format("MMM DD, YYYY");

  const orders = await Order.find({
    eventDate: today,
    orderStatus: "completed",
    paymentStatus: "PAID",
  }).populate("customerId");

  for (let order of orders) {
    await notifyEventCompleted(order);
  }
};

export default sendCompletionMessages;
