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
import Counter from "../../models/Counter.js";
// Load environment variables from .env file
dotenv.config();

const router = express.Router();

const getNextOrderId = async () => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { key: "order_seq" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    return `ORD${counter.value}`;
  } catch (error) {
    console.error("Error generating order ID:", error);
    throw new Error("Order ID generation failed");
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
      paymentType, // FULL or HALF
    } = req.body;

    // Convert payment type → percentage
    const paymentPercentage = paymentType === "HALF" ? 50 : 100;

    // ---- SAFE VALIDATION ----
    if (
      !eventDate ||
      !eventTime ||
      !pincode ||
      subTotal == null ||
      grandTotal == null ||
      paidAmount == null ||
      !address ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "Missing required fields",
        required: {
          eventDate: !eventDate,
          eventTime: !eventTime,
          pincode: !pincode,
          subTotal: subTotal == null,
          grandTotal: grandTotal == null,
          paidAmount: paidAmount == null,
          address: !address,
          items: !items || items.length === 0,
        },
      });
    }

    // Generate backend orderId
    const orderId = await getNextOrderId();

    // Generate a UNIQUE PhonePe transaction id (never repeated)
    const merchantTransactionId = `TXN_${Date.now()}_${Math.floor(
      Math.random() * 99999
    )}`;

    // Ensure customizedInputs always exists
    const processedItems = items.map((item) => ({
      ...item,
      customizedInputs: Array.isArray(item.customizedInputs)
        ? item.customizedInputs
        : [],
    }));

    // ----- Save Order in DB -----
    const order = new Order({
      orderId,
      merchantTransactionId, // <-- NEW
      eventDate,
      eventTime,
      pincode,
      balloonsColor: balloonsColor || [],
      subTotal,
      grandTotal,
      paidAmount, // half or full
      dueAmount: dueAmount || 0,
      deliveryCharges,
      couponDiscount: couponDiscount || 0,
      addNote,
      address,
      items: processedItems,
      customerName,
      customerId,
      orderStatus: "created",
      occasion,
      decorLocation,
      otherOccasion,
      otherDecorLocation,
      source,
      slotExtraCharge,
      paymentPercentage, // 50 or 100
      paymentType, // FULL or HALF
      paymentStatus: "PENDING",
    });

    await order.save();

    // ---- Get PhonePe Access Token ----
    const accessToken = await getAccessToken();

    // Charge ONLY paidAmount
    const amountToCharge = paidAmount * 100;

    // Payment Payload
    const paymentData = {
      merchantOrderId: merchantTransactionId, // MUST be unique
      amount: amountToCharge,
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
          redirectUrl: `https://api.lavisheventzz.com/api/payment/verify-payment?orderId=${orderId}&customerId=${customerId}&tx=${merchantTransactionId}`,
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

    // Send request to PhonePe
    const response = await axios.request(config);

    const paymentUrl = response.data.redirectUrl;

    if (!paymentUrl) {
      throw new Error("No payment URL returned from PhonePe.");
    }

    // ---- SUCCESS ----
    return res.json({
      success: true,
      data: { paymentUrl },
    });
  } catch (error) {
    console.error(
      "Payment initiation error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      error: `Payment initiation failed: ${error.message}`,
    });
  }
});

// VERIFY PAYMENT
router.get("/verify-payment", async (req, res) => {
  console.log("Verify-payment endpoint hit:", {
    query: req.query,
    timestamp: new Date().toISOString(),
  });

  const { orderId, customerId, tx } = req.query;

  try {
    // --------------------------
    // 1. VALIDATE INPUT
    // --------------------------
    if (!orderId || !customerId || !tx) {
      return res.status(400).json({
        success: false,
        error: "Order ID, Customer ID and Transaction ID are required.",
      });
    }

    // --------------------------
    // 2. FIND ORDER
    // --------------------------
    const order = await Order.findOne({ orderId, customerId });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found.",
      });
    }

    // --------------------------
    // 3. GET ACCESS TOKEN
    // --------------------------
    const accessToken = await getAccessToken();

    const statusUrl = `https://api.phonepe.com/apis/pg/checkout/v2/order/${tx}/status`;

    const config = {
      method: "get",
      url: statusUrl,
      headers: {
        "Content-Type": "application/json",
        Authorization: `O-Bearer ${accessToken}`,
      },
    };

    // --------------------------
    // 4. CHECK PAYMENT STATUS
    // --------------------------
    const response = await axios.request(config);
    const phonePeData = response.data;

    console.log(
      "PhonePe status response:",
      JSON.stringify(phonePeData, null, 2)
    );

    if (!phonePeData || typeof phonePeData !== "object") {
      return res.status(500).json({
        success: false,
        error: "Invalid response from PhonePe.",
      });
    }

    // --------------------------
    // 5. PAYMENT SUCCESS
    // --------------------------
    if (phonePeData.state === "COMPLETED") {
      const isHalfPayment = order.paymentType === "HALF";

      const paidNow = Number(order.paidAmount); // amount already stored when order created
      const newDueAmount = isHalfPayment
        ? Number(order.grandTotal) - paidNow
        : 0;

      const newPaymentStatus = isHalfPayment ? "PARTIAL PAID" : "PAID";

      // Update Order
      await Order.findOneAndUpdate(
        { orderId, customerId },
        {
          paymentStatus: newPaymentStatus,
          paidAmount: paidNow,
          dueAmount: newDueAmount,
          updatedAt: new Date(),
        },
        { new: true }
      );

      // Add payment history
      const paymentRecord = new Payment({
        orderId,
        customerId,
        amount: paidNow,
        paymentType: order.paymentType === "HALF" ? "INITIAL" : "FULL", // or FINAL based on your logic
        paymentMethod: order.paymentType, // FULL or HALF
        paymentMode: "ONLINE",
        status: "COMPLETED",
        transactionId: tx,
      });

      await paymentRecord.save();

      // Send Email
      const fullOrder = await Order.findOne({ orderId }).populate(
        "customerId",
        "email firstName lastName mobile"
      );

      if (fullOrder?.customerId?.email) {
        try {
          await sendOrderConfirmation(fullOrder.customerId.email, fullOrder);
        } catch (err) {
          console.error("Failed to send email:", err);
        }
      }

      // Send WhatsApp
      try {
        await notifyBooking(fullOrder);
      } catch (err) {
        console.error("Failed to send WhatsApp:", err.message);
      }

      // Redirect to SUCCESS page
      return res.redirect(
        `https://lavisheventzz.com/payment/success?orderId=${orderId}`
      );
    }

    // --------------------------
    // 6. PAYMENT FAILED / CANCELLED
    // --------------------------
    await Order.findOneAndUpdate(
      { orderId, customerId },
      {
        paymentStatus: "FAILED",
        updatedAt: new Date(),
      }
    );

    return res.redirect(
      `https://lavisheventzz.com/payment/failure?orderId=${orderId}`
    );
  } catch (error) {
    // --------------------------
    // 7. ERROR HANDLING
    // --------------------------
    console.error("Payment verification error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    return res.status(error.response?.status || 500).json({
      success: false,
      error: `Payment verification failed: ${error.message}`,
    });
  }
});


router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const paymentMethod = req.query.paymentMethod || ""; // FULL / HALF
    const paymentMode = req.query.paymentMode || "";     // ONLINE / CASH

    const match = {};

    // Basic search on orderId and transactionId
    if (search) {
      const regex = new RegExp(search, "i");
      match.$or = [{ orderId: regex }, { transactionId: regex }];
    }

    // Filter by paymentMethod
    if (paymentMethod) match.paymentMethod = paymentMethod;

    // Filter by paymentMode
    if (paymentMode) match.paymentMode = paymentMode;

    const total = await Payment.countDocuments(match);

    const data = await Payment.aggregate([
      { $match: match },

      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "orderId",
          as: "order",
        },
      },
      { $unwind: "$order" },

      {
        $lookup: {
          from: "users",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },

      // Search customerName also
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { "order.customerName": new RegExp(search, "i") },
                  { orderId: new RegExp(search, "i") },
                  { transactionId: new RegExp(search, "i") }
                ],
              },
            },
          ]
        : []),

      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },

      {
        $project: {
          _id: 0,
          orderId: 1,
          paidAmount: "$amount",
          paymentMethod: 1,
          paymentMode: 1,
          transactionId: 1,
          status: 1,
          date: "$createdAt",
          grandTotal: "$order.grandTotal",
          customerName: "$order.customerName",
          eventDate: "$order.eventDate",
          eventTime: "$order.eventTime",
        },
      },
    ]);

    res.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
});

router.get("/earnings", async (req, res) => {
  try {
    const total = await Payment.aggregate([
      { $match: { status: "COMPLETED" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalEarning = total[0]?.total || 0;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthly = await Payment.aggregate([
      {
        $match: {
          status: "COMPLETED",
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const monthlyEarning = monthly[0]?.total || 0;

    res.json({
      success: true,
      totalEarning,
      monthlyEarning,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
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
          _id: { month: { $month: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const monthly = Array.from({ length: 12 }, (_, i) => {
      const x = data.find((d) => d._id.month === i + 1);
      return x ? x.total : 0;
    });

    res.json({ success: true, monthlyEarnings: monthly });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get("/payment-history/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    const payments = await Payment.find({ orderId }).sort({ createdAt: 1 });

    const totalPaid = payments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      data: payments,
      summary: {
        totalPayments: payments.length,
        totalPaid,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});




export default router;


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

// router.get("/payment-history/:orderId", async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: "Order ID is required",
//       });
//     }

//     // Find all payment records for this order
//     const payments = await Payment.find({ orderId: orderId }).sort({
//       createdAt: 1,
//     });

//     // Calculate total paid amount
//     const totalPaid = payments
//       .filter((p) => p.status === "COMPLETED")
//       .reduce((sum, payment) => sum + payment.amount, 0);

//     const response = {
//       success: true,
//       data: {
//         payments: payments.map((payment) => ({
//           _id: payment._id,
//           transactionId: payment.transactionId,
//           amount: payment.amount,
//           paymentType: payment.paymentType,
//           paymentMethod: payment.paymentMethod,
//           paymentMode: payment.paymentMode,
//           status: payment.status,
//           createdAt: payment.createdAt,
//           updatedAt: payment.updatedAt,
//         })),
//         summary: {
//           totalPaid,
//           totalPayments: payments.length,
//         },
//       },
//     };

//     return res.status(200).json(response);
//   } catch (error) {
//     console.error("Error fetching payment history:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch payment history",
//       error: error.message,
//     });
//   }
// });