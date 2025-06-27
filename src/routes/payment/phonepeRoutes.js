import express from "express";
import axios from "axios";
import qs from "qs";
import dotenv from "dotenv";
import Order from "../../models/order/Order.js";
import Payment from "../../models/payment/Payment.js";
import sendOrderConfirmation from "../../config/mailer.js";

// Load environment variables from .env file
dotenv.config();

const router = express.Router();

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
      orderId,
      eventDate,
      eventTime,
      pincode,
      balloonsColor,
      subTotal,
      grandTotal,
      merchantOrderId,
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
    } = req.body;

    // Validate required fields
    if (
      !orderId ||
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
          orderId: !orderId,
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

    // Ensure each item has customizedInputs (default to empty array if not provided)
    const processedItems = items.map((item) => ({
      ...item,
      customizedInputs: Array.isArray(item.customizedInputs)
        ? item.customizedInputs
        : [],
    }));

    const order = new Order({
      orderId,
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
      paymentStatus: "PENDING",
    });

    const savedOrder = await order.save();

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
      amount: grandTotal * 100,
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
      await Order.findOneAndUpdate(
        { orderId, customerId },
        {
          paymentStatus: "PAID",
          updatedAt: new Date(),
        },
        { new: true }
      );

      const payment = new Payment({
        orderId,
        customerId,
        amount: order.grandTotal,
        status: "COMPLETED",
      });

      await payment.save();

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

      res.redirect(
        `https://lavisheventzz.com/payment/success?orderId=${orderId}`
        // `http://localhost:5173/payment/success?orderId=${orderId}`
      );
    } else {
      // Delete the order if payment failed or was canceled
      await Order.findOneAndDelete({ orderId, customerId });

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
    // Pagination
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit =
      parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    // Search
    const { search } = req.query;
    let query = {};

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query = {
        $or: [
          { orderId: { $regex: searchRegex } },
          // We'll filter by customer name after population
        ],
      };
    }

    // Fetch payments with population
    let payments = await Payment.find(query)
      .populate("customerId", "email firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Filter by customer name if search is present
    if (search) {
      payments = payments.filter(
        (p) =>
          (p.customerId &&
            (p.customerId.firstName
              ?.toLowerCase()
              .includes(search.toLowerCase()) ||
              p.customerId.lastName
                ?.toLowerCase()
                .includes(search.toLowerCase()))) ||
          p.orderId?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // For Booking Date search (createdAt)
    if (req.query.bookingDate) {
      const date = new Date(req.query.bookingDate);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      payments = payments.filter(
        (p) => new Date(p.createdAt) >= date && new Date(p.createdAt) < nextDate
      );
    }

    // Total count for pagination
    const total = await Payment.countDocuments(query);

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
export default router;
