// import express from "express";
// import axios from "axios";
// import qs from "qs";
// import dotenv from "dotenv";
// import Order from "../../models/order/Order.js";
// import User from "../../models/User.js";
// import Payment from "../../models/payment/Payment.js";
// import sendOrderConfirmation from "../../config/mailer.js";
// import { notifyBooking } from "../../services/eventNotification.js";
// import moment from "moment";
// // Load environment variables from .env file
// dotenv.config();

// const router = express.Router();

// const getNextOrderId = async () => {
//   try {
//     // Find the most recent order based on orderId, sorted in descending order
//     const latestOrder = await Order.findOne().sort({ orderId: -1 });

//     // If no orders exist, start with "ORD0001"
//     const lastOrderNum = latestOrder
//       ? parseInt(latestOrder.orderId.slice(3), 10)
//       : 0;

//     // Increment the order number
//     const nextOrderNum = lastOrderNum + 1;

//     // Return the new orderId, padded with leading zeros to 4 digits
//     return `ORD${nextOrderNum.toString().padStart(4, "0")}`;
//   } catch (error) {
//     console.error("Error generating order ID:", error);
//     throw new Error("Error generating order ID");
//   }
// };

// // PhonePe API credentials
// const CLIENT_ID = process.env.CLIENT_ID || "SU2506192241154959940199";
// const CLIENT_SECRET =
//   process.env.CLIENT_SECRET || "fc3e078a-4083-4ccb-930d-4206417fee39";
// const TOKEN_URL =
//   "https://api.phonepe.com/apis/identity-manager/v1/oauth/token";
// const PAYMENT_URL = "https://api.phonepe.com/apis/pg/checkout/v2/pay";
// const STATUS_URL = "https://api.phonepe.com/apis/pg/checkout/v2/status";

// // Cache for storing access token
// let cachedToken = {
//   accessToken: null,
//   expiresAt: null,
// };

// // Function to get access token from PhonePe
// async function getAccessToken() {
//   // Check if cached token is still valid
//   if (cachedToken.accessToken && cachedToken.expiresAt > Date.now()) {
//     console.log("Using cached access token");
//     return cachedToken.accessToken;
//   }

//   const data = qs.stringify({
//     client_id: CLIENT_ID,
//     client_version: "1",
//     client_secret: CLIENT_SECRET,
//     grant_type: "client_credentials",
//   });

//   const config = {
//     method: "post",
//     url: TOKEN_URL,
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     data: data,
//   };

//   try {
//     const response = await axios.request(config);
//     console.log("Access token response:", response.data);
//     const { access_token, expires_in } = response.data;

//     // Cache the token with expiry time (subtract 30 seconds for safety)
//     cachedToken = {
//       accessToken: access_token,
//       expiresAt: Date.now() + (expires_in - 30) * 1000,
//     };

//     return access_token;
//   } catch (error) {
//     console.error("Access token error:", error.response?.data || error.message);
//     throw new Error(`Failed to get access token: ${error.message}`);
//   }
// }

// // Endpoint to initiate payment
// router.post("/initiate-payment", async (req, res) => {
//   try {
//     const {
//       eventDate,
//       eventTime,
//       pincode,
//       balloonsColor,
//       subTotal,
//       grandTotal,
//       merchantOrderId,
//       paidAmount,
//       dueAmount,
//       deliveryCharges,
//       couponDiscount,
//       address,
//       customerName,
//       customerId,
//       items,
//       addNote,
//       occasion,
//       decorLocation,
//       otherOccasion,
//       otherDecorLocation,
//       source,
//       slotExtraCharge,
//     } = req.body;

//     // Validate required fields
//     if (
//       !eventDate ||
//       !eventTime ||
//       !pincode ||
//       !subTotal ||
//       !grandTotal ||
//       !paidAmount ||
//       !address ||
//       !items ||
//       items.length === 0
//     ) {
//       return res.status(400).json({
//         message: "Missing required fields",
//         required: {
//           eventDate: !eventDate,
//           eventTime: !eventTime,
//           pincode: !pincode,
//           subTotal: !subTotal,
//           grandTotal: !grandTotal,
//           paidAmount: !paidAmount,
//           deliveryCharges: !deliveryCharges,
//           address: !address,
//           items: !items || items.length === 0,
//         },
//       });
//     }

//     // Generate orderId on the backend
//     const orderId = await getNextOrderId(); // Generate unique orderId

//     // Ensure each item has customizedInputs (default to empty array if not provided)
//     const processedItems = items.map((item) => ({
//       ...item,
//       customizedInputs: Array.isArray(item.customizedInputs)
//         ? item.customizedInputs
//         : [],
//     }));

//     const order = new Order({
//       orderId, // Use the backend generated orderId
//       eventDate,
//       eventTime,
//       pincode,
//       balloonsColor: balloonsColor || [],
//       subTotal,
//       grandTotal,
//       paidAmount,
//       dueAmount: dueAmount || 0,
//       deliveryCharges,
//       couponDiscount: couponDiscount || 0,
//       addNote,
//       address,
//       items: processedItems,
//       customerName: customerName,
//       customerId: customerId,
//       orderStatus: "created",
//       occasion,
//       decorLocation,
//       otherOccasion,
//       otherDecorLocation,
//       source,
//       slotExtraCharge,
//       paymentStatus: "PENDING",
//     });

//     const savedOrder = await order.save();

//     if (!grandTotal || !orderId) {
//       return res.status(400).json({
//         success: false,
//         error: "Amount and merchantOrderId are required",
//       });
//     }

//     const accessToken = await getAccessToken();
//     console.log("Access token for payment:", accessToken);

//     const paymentData = {
//       merchantOrderId: orderId,
//       amount: grandTotal * 100,
//       expireAfter: 1200,
//       metaInfo: {
//         udf1: "info1",
//         udf2: "info2",
//         udf3: "info3",
//         udf4: "info4",
//         udf5: "info5",
//       },
//       paymentFlow: {
//         type: "PG_CHECKOUT",
//         message: "Payment message used for collect requests",
//         merchantUrls: {
//           // redirectUrl: `http://localhost:5000/api/payment/verify-payment?orderId=${orderId}&customerId=${customerId}`,
//           redirectUrl: `https://api.lavisheventzz.com/api/payment/verify-payment?orderId=${orderId}&customerId=${customerId}`,
//         },
//       },
//     };

//     const config = {
//       method: "post",
//       url: PAYMENT_URL,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `O-Bearer ${accessToken}`,
//       },
//       data: JSON.stringify(paymentData),
//     };

//     const response = await axios.request(config);
//     console.log("PhonePe payment response:", response.data);

//     const paymentUrl = response.data.redirectUrl;
//     console.log("Payment URL:", paymentUrl);
//     if (!paymentUrl) {
//       throw new Error("No payment URL found in PhonePe response");
//     }

//     res.json({
//       success: true,
//       data: {
//         paymentUrl,
//       },
//     });
//   } catch (error) {
//     console.error(
//       "Payment initiation error:",
//       error.response?.data || error.message
//     );
//     res.status(500).json({
//       success: false,
//       error: `Payment initiation failed: ${error.message}`,
//     });
//   }
// });

// // Endpoint to verify payment
// router.get("/verify-payment", async (req, res) => {
//   console.log("Verify-payment endpoint hit:", {
//     query: req.query,
//     timestamp: new Date().toISOString(),
//   });

//   const { orderId, customerId } = req.query;

//   try {
//     // Validate query parameters
//     if (!orderId || !customerId) {
//       console.error("Missing query parameters:", { orderId, customerId });
//       return res.status(400).json({
//         success: false,
//         error: "Order ID and Customer ID are required.",
//       });
//     }

//     // Find the order in the database
//     const order = await Order.findOne({ orderId, customerId });
//     if (!order) {
//       console.error("Order not found:", { orderId, customerId });
//       return res.status(404).json({
//         success: false,
//         error: "Order not found.",
//       });
//     }

//     // Get access token
//     const accessToken = await getAccessToken();
//     console.log(
//       "Access token for verification:",
//       accessToken ? "Generated" : "Failed to generate"
//     );

//     // Construct the status check URL
//     const statusUrl = `https://api.phonepe.com/apis/pg/checkout/v2/order/${orderId}/status`;
//     console.log("Status check URL:", statusUrl);

//     const config = {
//       method: "get",
//       url: statusUrl,
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `O-Bearer ${accessToken}`,
//       },
//     };

//     // Log the full request configuration (redact sensitive data)
//     console.log("Request configuration:", {
//       url: config.url,
//       method: config.method,
//       headers: {
//         ...config.headers,
//         Authorization: "O-Bearer <redacted>",
//       },
//     });

//     // Make request to PhonePe to check payment status
//     const response = await axios.request(config);
//     console.log(
//       "PhonePe status response:",
//       JSON.stringify(response.data, null, 2)
//     );

//     // Validate response structure
//     if (!response.data || typeof response.data !== "object") {
//       console.error("Invalid response structure from PhonePe:", response.data);
//       return res.status(500).json({
//         success: false,
//         error: "Invalid response from payment gateway.",
//       });
//     }

//     if (response.data.state === "COMPLETED") {
//       await Order.findOneAndUpdate(
//         { orderId, customerId },
//         {
//           paymentStatus: "PAID",
//           updatedAt: new Date(),
//         },
//         { new: true }
//       );

//       const payment = new Payment({
//         orderId,
//         customerId,
//         amount: order.grandTotal,
//         status: "COMPLETED",
//       });

//       await payment.save();

//       const populatedOrder = await Order.findOne({ orderId }).populate(
//         "customerId",
//         "email firstName lastName mobile"
//       );
//       if (
//         populatedOrder &&
//         populatedOrder.customerId &&
//         populatedOrder.customerId.email
//       ) {
//         const customerEmail = populatedOrder.customerId.email;
//         try {
//           await sendOrderConfirmation(customerEmail, populatedOrder);
//         } catch (emailError) {
//           console.error(
//             "Failed to send email, but payment was successful:",
//             emailError
//           );
//         }
//       } else {
//         console.warn("Customer email not found for order:", {
//           orderId,
//           customerId,
//         });
//       }

//       // ✅ 📱 Send WhatsApp Booking Confirmation
//       try {
//         await notifyBooking(populatedOrder);
//         // right before: await notifyBooking(populatedOrder);
//         console.log("📞 Triggering notifyBooking()", {
//           orderId: populatedOrder?.orderId,
//           hasCustomer: !!populatedOrder?.customerId,
//           mobile: populatedOrder?.customerId?.mobile,
//           items: populatedOrder?.items?.length,
//           grandTotal: populatedOrder?.grandTotal,
//         });
//       } catch (whatsappError) {
//         console.error(
//           "Failed to send WhatsApp message:",
//           whatsappError.message
//         );
//       }

//       res.redirect(
//         `https://lavisheventzz.com/payment/success?orderId=${orderId}`
//         // `http://localhost:5173/payment/success?orderId=${orderId}`
//       );
//     } else {
//       // Delete the order if payment failed or was canceled
//       await Order.findOneAndDelete({ orderId, customerId });

//       res.redirect(
//         `https://lavisheventzz.com/payment/failure?orderId=${orderId}`
//         // `http://localhost:5173/payment/failure?orderId=${orderId}`
//       );
//     }
//   } catch (error) {
//     console.error("Payment verification error:", {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//       request: {
//         url: `https://api.phonepe.com/apis/pg/checkout/v2/order/${orderId}/status`,
//         headers: {
//           Authorization: "O-Bearer <redacted>",
//           "Content-Type": "application/json",
//         },
//       },
//       orderId,
//       customerId,
//     });

//     // Handle specific error cases
//     let statusCode = error.response?.status || 500;
//     let errorMessage = `Payment verification failed: ${error.message}`;

//     if (
//       statusCode === 400 &&
//       error.response?.data?.message === "Bad Request - Api Mapping Not Found"
//     ) {
//       errorMessage =
//         "Invalid API endpoint or parameters. Check PhonePe API configuration and orderId.";
//     } else if (statusCode === 401) {
//       errorMessage =
//         "Authentication failed with payment gateway. Check API credentials.";
//     } else if (statusCode === 404) {
//       errorMessage =
//         "Payment status not found for the given order. Verify orderId.";
//     }

//     res.status(statusCode).json({
//       success: false,
//       error: errorMessage,
//     });
//   }
// });


// router.get("/", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
//     const limit =
//       parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
//     const skip = (page - 1) * limit;
//     const { search, bookingDate } = req.query;

//     // Build match conditions
//     let match = {};

//     // Booking Date filter
//     if (bookingDate) {
//       const date = new Date(bookingDate);
//       const nextDate = new Date(date);
//       nextDate.setDate(date.getDate() + 1);
//       match.createdAt = { $gte: date, $lt: nextDate };
//     }

//     // Aggregation pipeline
//     let pipeline = [
//       { $match: match },
//       // Join with Order to get customerName and order details
//       {
//         $lookup: {
//           from: "orders",
//           localField: "orderId",
//           foreignField: "orderId",
//           as: "orderDetails",
//         },
//       },
//       { $unwind: { path: "$orderDetails", preserveNullAndEmptyArrays: true } },
//       // Join with User to get customer info
//       {
//         $lookup: {
//           from: "users",
//           localField: "customerId",
//           foreignField: "_id",
//           as: "customer",
//         },
//       },
//       { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
//     ];

//     // Search filter
//     if (search) {
//       const searchRegex = new RegExp(search, "i");
//       pipeline.push({
//         $match: {
//           $or: [
//             { orderId: { $regex: searchRegex } },
//             { amount: !isNaN(Number(search)) ? Number(search) : -1 },
//             { "orderDetails.customerName": { $regex: searchRegex } },
//             { "customer.firstName": { $regex: searchRegex } },
//             { "customer.lastName": { $regex: searchRegex } },
//           ],
//         },
//       });
//     }

//     // Count total
//     const totalPipeline = [...pipeline, { $count: "total" }];
//     const totalResult = await Payment.aggregate(totalPipeline);
//     const total = totalResult[0]?.total || 0;

//     // Pagination and sorting
//     pipeline.push({ $sort: { createdAt: -1 } });
//     pipeline.push({ $skip: skip });
//     pipeline.push({ $limit: limit });

//     // Project only needed fields
//     pipeline.push({
//       $project: {
//         _id: 1,
//         orderId: 1,
//         amount: 1,
//         status: 1,
//         createdAt: 1,
//         "orderDetails.customerName": 1,
//         "customer.firstName": 1,
//         "customer.lastName": 1,
//         "customer.email": 1,
//       },
//     });

//     const payments = await Payment.aggregate(pipeline);

//     res.json({
//       success: true,
//       data: payments,
//       pagination: {
//         total,
//         page,
//         limit,
//         pages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: `Failed to fetch payments: ${error.message}`,
//     });
//   }
// });

// router.get("/earnings", async (req, res) => {
//   try {
//     // ✅ 1. Total Earning (all time with status COMPLETED)
//     const totalEarningsResult = await Payment.aggregate([
//       { $match: { status: "COMPLETED" } },
//       {
//         $group: {
//           _id: null,
//           totalEarning: { $sum: "$amount" },
//         },
//       },
//     ]);

//     const totalEarning = totalEarningsResult[0]?.totalEarning || 0;

//     // ✅ 2. Monthly Earning (current month with status COMPLETED)
//     const startOfMonth = moment().startOf("month").toDate();
//     const endOfMonth = moment().endOf("month").toDate();

//     const monthlyEarningsResult = await Payment.aggregate([
//       {
//         $match: {
//           status: "COMPLETED",
//           createdAt: { $gte: startOfMonth, $lte: endOfMonth },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           monthlyEarning: { $sum: "$amount" },
//         },
//       },
//     ]);

//     const monthlyEarning = monthlyEarningsResult[0]?.monthlyEarning || 0;

//     return res.status(200).json({
//       success: true,
//       totalEarning,
//       monthlyEarning,
//     });
//   } catch (error) {
//     console.error("❌ Error in getEarnings:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch earnings",
//       error: error.message,
//     });
//   }
// });

// // ✅ API: Monthly Earnings (only for COMPLETED payments)
// router.get("/monthly-earnings", async (req, res) => {
//   try {
//     const year = new Date().getFullYear();

//     const data = await Payment.aggregate([
//       {
//         $match: {
//           status: "COMPLETED",
//           createdAt: {
//             $gte: new Date(`${year}-01-01`),
//             $lte: new Date(`${year}-12-31`),
//           },
//         },
//       },
//       {
//         $group: {
//           _id: { $month: "$createdAt" },
//           total: { $sum: "$amount" },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     const monthlyEarnings = Array.from({ length: 12 }, (_, i) => {
//       const monthData = data.find((d) => d._id === i + 1);
//       return monthData ? monthData.total : 0;
//     });

//     return res.json({ success: true, monthlyEarnings });
//   } catch (err) {
//     console.error("Error fetching monthly earnings:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to fetch earnings" });
//   }
// });

// export default router;




import express from "express";
import axios from "axios";
import qs from "qs";
import dotenv from "dotenv";
import Order from "../../models/order/Order.js";
import User from "../../models/User.js";
import Payment from "../../models/payment/Payment.js";
import sendOrderConfirmation from "../../config/mailer.js";
import { notifyBooking } from "../../services/eventNotification.js";
import moment from "moment";
// Load environment variables from .env file
dotenv.config();

const router = express.Router();

const getNextOrderId = async () => {
  try {
    // Find the most recent order based on orderId, sorted in descending order
    const latestOrder = await Order.findOne().sort({ orderId: -1 });

    // If no orders exist, start with "ORD0001"
    const lastOrderNum = latestOrder
      ? parseInt(latestOrder.orderId.slice(3), 10)
      : 0;

    // Increment the order number
    const nextOrderNum = lastOrderNum + 1;

    // Return the new orderId, padded with leading zeros to 4 digits
    return `ORD${nextOrderNum.toString().padStart(4, "0")}`;
  } catch (error) {
    console.error("Error generating order ID:", error);
    throw new Error("Error generating order ID");
  }
};

// PhonePe API credentials
const CLIENT_ID = process.env.CLIENT_ID || "SU2506192241154959940199";
const CLIENT_SECRET =
  process.env.CLIENT_SECRET || "fc3e078a-4083-4ccb-930d-4206417fee39";
const TOKEN_URL =
  "https://api.phonepe.com/apis/identity-manager/v1/oauth/token";
const PAYMENT_URL = "https://api.phonepe.com/apis/pg/checkout/v2/pay";
const STATUS_URL = "https://api.phonepe.com/apis/pg/checkout/v2/status";

// Cache for storing access token
let cachedToken = {
  accessToken: null,
  expiresAt: null,
};

// Function to get access token from PhonePe
async function getAccessToken() {
  // Check if cached token is still valid
  if (cachedToken.accessToken && cachedToken.expiresAt > Date.now()) {
    console.log("Using cached access token");
    return cachedToken.accessToken;
  }

  const data = qs.stringify({
    client_id: CLIENT_ID,
    client_version: "1",
    client_secret: CLIENT_SECRET,
    grant_type: "client_credentials",
  });

  const config = {
    method: "post",
    url: TOKEN_URL,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    console.log("Access token response:", response.data);
    const { access_token, expires_in } = response.data;

    // Cache the token with expiry time (subtract 30 seconds for safety)
    cachedToken = {
      accessToken: access_token,
      expiresAt: Date.now() + (expires_in - 30) * 1000,
    };

    return access_token;
  } catch (error) {
    console.error("Access token error:", error.response?.data || error.message);
    throw new Error(`Failed to get access token: ${error.message}`);
  }
}

// Endpoint to initiate payment
router.post("/initiate-payment", async (req, res) => {
  try {
    const {
      eventDate,
      eventTime,
      pincode,
      balloonsColor,
      subTotal,
      grandTotal,
      // REMOVE merchantOrderId from destructuring since we generate it
      paidAmount,
      dueAmount,
      deliveryCharges,
      couponDiscount,
      address,
      customerName,
      customerId,
      items,
      addNote,
      occasion,
      decorLocation,
      otherOccasion,
      otherDecorLocation,
      source,
      slotExtraCharge,
      paymentPercentage,
      paymentType,
    } = req.body;

    // Validate required fields
    if (
      !eventDate ||
      !eventTime ||
      !pincode ||
      !subTotal ||
      !grandTotal ||
      !paidAmount ||
      !address ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "Missing required fields",
        required: {
          eventDate: !eventDate,
          eventTime: !eventTime,
          pincode: !pincode,
          subTotal: !subTotal,
          grandTotal: !grandTotal,
          paidAmount: !paidAmount,
          deliveryCharges: !deliveryCharges,
          address: !address,
          items: !items || items.length === 0,
        },
      });
    }

    // Generate orderId on the backend
    const orderId = await getNextOrderId(); // Generate unique orderId

    // Ensure each item has customizedInputs (default to empty array if not provided)
    const processedItems = items.map((item) => ({
      ...item,
      customizedInputs: Array.isArray(item.customizedInputs)
        ? item.customizedInputs
        : [],
    }));

    const order = new Order({
      orderId, // Use the backend generated orderId
      eventDate,
      eventTime,
      pincode,
      balloonsColor: balloonsColor || [],
      subTotal,
      grandTotal,
      paidAmount,
      dueAmount: dueAmount || 0,
      deliveryCharges,
      couponDiscount: couponDiscount || 0,
      addNote,
      address,
      items: processedItems,
      customerName: customerName,
      customerId: customerId,
      orderStatus: "created",
      occasion,
      decorLocation,
      otherOccasion,
      otherDecorLocation,
      source,
      slotExtraCharge,
      paymentPercentage: paymentPercentage || "100",
      paymentType: paymentType || "full",
      paymentStatus: "PENDING",
    });

    const savedOrder = await order.save();

    // Log order details for debugging
    console.log("Order created with payment details:", {
      orderId: savedOrder.orderId,
      paymentPercentage: savedOrder.paymentPercentage,
      paymentType: savedOrder.paymentType,
      paidAmount: savedOrder.paidAmount,
      dueAmount: savedOrder.dueAmount,
      grandTotal: savedOrder.grandTotal,
    });

    if (!grandTotal || !orderId) {
      return res.status(400).json({
        success: false,
        error: "Amount and merchantOrderId are required",
      });
    }

    const accessToken = await getAccessToken();
    console.log("Access token for payment:", accessToken);

    const paymentData = {
      merchantOrderId: orderId,
      amount: paidAmount * 100,
      expireAfter: 1200,
      metaInfo: {
        udf1: "info1",
        udf2: "info2",
        udf3: "info3",
        udf4: "info4",
        udf5: "info5",
      },
      paymentFlow: {
        type: "PG_CHECKOUT",
        message: "Payment message used for collect requests",
        merchantUrls: {
          // redirectUrl: `http://localhost:5000/api/payment/verify-payment?orderId=${orderId}&customerId=${customerId}`,
          redirectUrl: `https://api.lavisheventzz.com/api/payment/verify-payment?orderId=${orderId}&customerId=${customerId}`,
        },
      },
    };

    const config = {
      method: "post",
      url: PAYMENT_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${accessToken}`,
      },
      data: JSON.stringify(paymentData),
    };

    const response = await axios.request(config);
    console.log("PhonePe payment response:", response.data);

    const paymentUrl = response.data.redirectUrl;
    console.log("Payment URL:", paymentUrl);
    if (!paymentUrl) {
      throw new Error("No payment URL found in PhonePe response");
    }

    res.json({
      success: true,
      data: {
        paymentUrl,
      },
    });
  } catch (error) {
    console.error(
      "Payment initiation error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      error: `Payment initiation failed: ${error.message}`,
    });
  }
});

// Endpoint to verify payment
router.get("/verify-payment", async (req, res) => {
  console.log("Verify-payment endpoint hit:", {
    query: req.query,
    timestamp: new Date().toISOString(),
  });

  const { orderId, customerId } = req.query;

  try {
    // Validate query parameters
    if (!orderId || !customerId) {
      console.error("Missing query parameters:", { orderId, customerId });
      return res.status(400).json({
        success: false,
        error: "Order ID and Customer ID are required.",
      });
    }

    // Find the order in the database
    const order = await Order.findOne({ orderId, customerId });
    if (!order) {
      console.error("Order not found:", { orderId, customerId });
      return res.status(404).json({
        success: false,
        error: "Order not found.",
      });
    }

    // Log order details before verification
    console.log("Order found with payment details:", {
      orderId: order.orderId,
      paymentPercentage: order.paymentPercentage,
      paymentType: order.paymentType,
      paidAmount: order.paidAmount,
      dueAmount: order.dueAmount,
      grandTotal: order.grandTotal,
      currentPaymentStatus: order.paymentStatus,
    });

    // Get access token
    const accessToken = await getAccessToken();
    console.log(
      "Access token for verification:",
      accessToken ? "Generated" : "Failed to generate"
    );

    // Construct the status check URL
    const statusUrl = `https://api.phonepe.com/apis/pg/checkout/v2/order/${orderId}/status`;
    console.log("Status check URL:", statusUrl);

    const config = {
      method: "get",
      url: statusUrl,
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${accessToken}`,
      },
    };

    // Log the full request configuration (redact sensitive data)
    console.log("Request configuration:", {
      url: config.url,
      method: config.method,
      headers: {
        ...config.headers,
        Authorization: "O-Bearer <redacted>",
      },
    });

    // Make request to PhonePe to check payment status
    const response = await axios.request(config);
    console.log(
      "PhonePe status response:",
      JSON.stringify(response.data, null, 2)
    );

    // Validate response structure
    if (!response.data || typeof response.data !== "object") {
      console.error("Invalid response structure from PhonePe:", response.data);
      return res.status(500).json({
        success: false,
        error: "Invalid response from payment gateway.",
      });
    }

    if (response.data.state === "COMPLETED") {
      // Determine payment status based on paymentType
      let paymentStatus;
      if (order.paymentType === "partial") {
        paymentStatus = "PARTIAL PAID"; // For 50% payments
      } else {
        paymentStatus = "PAID"; // For 100% payments
        // For full payments, ensure dueAmount is 0
        order.dueAmount = 0;
      }

      // Update the order with correct payment status
      const updatedOrder = await Order.findOneAndUpdate(
        { orderId, customerId },
        {
          paymentStatus: paymentStatus,
          updatedAt: new Date(),
        },
        { new: true }
      );

      console.log("Order updated with payment status:", {
        orderId: updatedOrder.orderId,
        paymentStatus: updatedOrder.paymentStatus,
        paymentType: updatedOrder.paymentType,
        paymentPercentage: updatedOrder.paymentPercentage,
        paidAmount: updatedOrder.paidAmount,
        dueAmount: updatedOrder.dueAmount, // ← This should already be set
        grandTotal: updatedOrder.grandTotal,
      });

      // Create payment record with all details
      const payment = new Payment({
        orderId,
        customerId,
        amount: order.paidAmount, // Store the actual paid amount
        paymentType: order.paymentType,
        paymentPercentage: order.paymentPercentage,
        paymentMethod: "online", // ← Store payment method as online
        status: "COMPLETED",
        transactionId: response.data.transactionId || orderId,
        notes: "Initial booking payment",
      });

      await payment.save();

      console.log("Payment record created:", {
        orderId: payment.orderId,
        amount: payment.amount,
        paymentType: payment.paymentType,
        paymentPercentage: payment.paymentPercentage,
        paymentMethod: payment.paymentMethod,
        dueAmount: order.dueAmount, // Log the due amount
      });
      const populatedOrder = await Order.findOne({ orderId }).populate(
        "customerId",
        "email firstName lastName mobile"
      );
      if (
        populatedOrder &&
        populatedOrder.customerId &&
        populatedOrder.customerId.email
      ) {
        const customerEmail = populatedOrder.customerId.email;
        try {
          await sendOrderConfirmation(customerEmail, populatedOrder);
          console.log("Order confirmation email sent to:", customerEmail);
        } catch (emailError) {
          console.error(
            "Failed to send email, but payment was successful:",
            emailError
          );
        }
      } else {
        console.warn("Customer email not found for order:", {
          orderId,
          customerId,
        });
      }

      // ✅ 📱 Send WhatsApp Booking Confirmation
      try {
        await notifyBooking(populatedOrder);
        console.log("📞 Triggering notifyBooking()", {
          orderId: populatedOrder?.orderId,
          hasCustomer: !!populatedOrder?.customerId,
          mobile: populatedOrder?.customerId?.mobile,
          items: populatedOrder?.items?.length,
          grandTotal: populatedOrder?.grandTotal,
          paymentStatus: populatedOrder?.paymentStatus,
        });
      } catch (whatsappError) {
        console.error(
          "Failed to send WhatsApp message:",
          whatsappError.message
        );
      }

      res.redirect(
        `https://lavisheventzz.com/payment/success?orderId=${orderId}`
        // `http://localhost:5173/payment/success?orderId=${orderId}`
      );
    } else {
      // Update order status to FAILED instead of deleting
      await Order.findOneAndUpdate(
        { orderId, customerId },
        {
          paymentStatus: "FAILED",
          updatedAt: new Date(),
        }
      );

      // Create failed payment record
      const failedPayment = new Payment({
        orderId,
        customerId,
        amount: order.paidAmount,
        paymentType: order.paymentType,
        paymentPercentage: order.paymentPercentage,
        status: "FAILED",
      });

      await failedPayment.save();

      console.log("Payment failed, order updated to FAILED:", {
        orderId,
        paymentType: order.paymentType,
        paymentPercentage: order.paymentPercentage,
      });

      res.redirect(
        `https://lavisheventzz.com/payment/failure?orderId=${orderId}`
        // `http://localhost:5173/payment/failure?orderId=${orderId}`
      );
    }
  } catch (error) {
    console.error("Payment verification error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      request: {
        url: `https://api.phonepe.com/apis/pg/checkout/v2/order/${orderId}/status`,
        headers: {
          Authorization: "O-Bearer <redacted>",
          "Content-Type": "application/json",
        },
      },
      orderId,
      customerId,
    });

    // Update order status to FAILED in case of error
    await Order.findOneAndUpdate(
      { orderId, customerId },
      {
        paymentStatus: "FAILED",
        updatedAt: new Date(),
      }
    );

    // Create error payment record
    const errorPayment = new Payment({
      orderId,
      customerId,
      amount: 0,
      paymentType: "full",
      paymentPercentage: "100",
      status: "FAILED",
    });
    await errorPayment.save();

    // Handle specific error cases
    let statusCode = error.response?.status || 500;
    let errorMessage = `Payment verification failed: ${error.message}`;

    if (
      statusCode === 400 &&
      error.response?.data?.message === "Bad Request - Api Mapping Not Found"
    ) {
      errorMessage =
        "Invalid API endpoint or parameters. Check PhonePe API configuration and orderId.";
    } else if (statusCode === 401) {
      errorMessage =
        "Authentication failed with payment gateway. Check API credentials.";
    } else if (statusCode === 404) {
      errorMessage =
        "Payment status not found for the given order. Verify orderId.";
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit =
      parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search, bookingDate } = req.query;

    // Build match conditions
    let match = {};

    // Booking Date filter
    if (bookingDate) {
      const date = new Date(bookingDate);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      match.createdAt = { $gte: date, $lt: nextDate };
    }

    // Aggregation pipeline
    let pipeline = [
      { $match: match },
      // Join with Order to get customerName and order details
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "orderId",
          as: "orderDetails",
        },
      },
      { $unwind: { path: "$orderDetails", preserveNullAndEmptyArrays: true } },
      // Join with User to get customer info
      {
        $lookup: {
          from: "users",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
    ];

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, "i");
      pipeline.push({
        $match: {
          $or: [
            { orderId: { $regex: searchRegex } },
            { amount: !isNaN(Number(search)) ? Number(search) : -1 },
            { "orderDetails.customerName": { $regex: searchRegex } },
            { "customer.firstName": { $regex: searchRegex } },
            { "customer.lastName": { $regex: searchRegex } },
          ],
        },
      });
    }

    // Count total
    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await Payment.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    // Pagination and sorting
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Project only needed fields
    pipeline.push({
      $project: {
        _id: 1,
        orderId: 1,
        amount: 1,
        status: 1,
        createdAt: 1,
        "orderDetails.customerName": 1,
        "customer.firstName": 1,
        "customer.lastName": 1,
        "customer.email": 1,
      },
    });

    const payments = await Payment.aggregate(pipeline);

    res.json({
      success: true,
      data: payments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Failed to fetch payments: ${error.message}`,
    });
  }
});

router.get("/earnings", async (req, res) => {
  try {
    // ✅ 1. Total Earning (all time with status COMPLETED)
    const totalEarningsResult = await Payment.aggregate([
      { $match: { status: "COMPLETED" } },
      {
        $group: {
          _id: null,
          totalEarning: { $sum: "$amount" },
        },
      },
    ]);

    const totalEarning = totalEarningsResult[0]?.totalEarning || 0;

    // ✅ 2. Monthly Earning (current month with status COMPLETED)
    const startOfMonth = moment().startOf("month").toDate();
    const endOfMonth = moment().endOf("month").toDate();

    const monthlyEarningsResult = await Payment.aggregate([
      {
        $match: {
          status: "COMPLETED",
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          monthlyEarning: { $sum: "$amount" },
        },
      },
    ]);

    const monthlyEarning = monthlyEarningsResult[0]?.monthlyEarning || 0;

    return res.status(200).json({
      success: true,
      totalEarning,
      monthlyEarning,
    });
  } catch (error) {
    console.error("❌ Error in getEarnings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch earnings",
      error: error.message,
    });
  }
});

// ✅ API: Monthly Earnings (only for COMPLETED payments)
router.get("/monthly-earnings", async (req, res) => {
  try {
    const year = new Date().getFullYear();

    const data = await Payment.aggregate([
      {
        $match: {
          status: "COMPLETED",
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyEarnings = Array.from({ length: 12 }, (_, i) => {
      const monthData = data.find((d) => d._id === i + 1);
      return monthData ? monthData.total : 0;
    });

    return res.json({ success: true, monthlyEarnings });
  } catch (err) {
    console.error("Error fetching monthly earnings:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch earnings" });
  }
});

export default router;

