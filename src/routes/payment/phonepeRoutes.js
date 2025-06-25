import express from 'express';
import axios from 'axios';
import qs from 'qs';
import dotenv from 'dotenv';
import Order from '../../models/order/Order.js';
import Payment from '../../models/payment/Payment.js';

// Load environment variables from .env file
dotenv.config();

const router = express.Router();

// PhonePe API credentials
const CLIENT_ID = process.env.CLIENT_ID || 'SU2506192241154959940199';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'fc3e078a-4083-4ccb-930d-4206417fee39';
const TOKEN_URL = 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token';
const PAYMENT_URL = 'https://api.phonepe.com/apis/pg/checkout/v2/pay';
const STATUS_URL = 'https://api.phonepe.com/apis/pg/checkout/v2/status';

// Cache for storing access token
let cachedToken = {
  accessToken: null,
  expiresAt: null,
};

// Function to get access token from PhonePe
async function getAccessToken() {
  // Check if cached token is still valid
  if (cachedToken.accessToken && cachedToken.expiresAt > Date.now()) {
    console.log('Using cached access token');
    return cachedToken.accessToken;
  }

  const data = qs.stringify({
    client_id: CLIENT_ID,
    client_version: '1',
    client_secret: CLIENT_SECRET,
    grant_type: 'client_credentials',
  });

  const config = {
    method: 'post',
    url: TOKEN_URL,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: data,
  };

  try {
    const response = await axios.request(config);
    console.log('Access token response:', response.data);
    const { access_token, expires_in } = response.data;

    // Cache the token with expiry time (subtract 30 seconds for safety)
    cachedToken = {
      accessToken: access_token,
      expiresAt: Date.now() + (expires_in - 30) * 1000,
    };

    return access_token;
  } catch (error) {
    console.error('Access token error:', error.response?.data || error.message);
    throw new Error(`Failed to get access token: ${error.message}`);
  }
}

// Endpoint to initiate payment
router.post('/initiate-payment', async (req, res) => {
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
        message: 'Missing required fields',
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
      customizedInputs: Array.isArray(item.customizedInputs) ? item.customizedInputs : [],
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
      orderStatus: 'created',
      occasion,
      decorLocation,
      otherOccasion,
      otherDecorLocation,
      source,
      slotExtraCharge,
      paymentStatus: 'PENDING',
    });

    const savedOrder = await order.save();

    if (!grandTotal || !orderId) {
      return res.status(400).json({
        success: false,
        error: 'Amount and merchantOrderId are required',
      });
    }

    const accessToken = await getAccessToken();
    console.log('Access token for payment:', accessToken);

    const paymentData = {
      merchantOrderId: orderId,
      amount: grandTotal * 100,
      expireAfter: 1200,
      metaInfo: {
        udf1: 'info1',
        udf2: 'info2',
        udf3: 'info3',
        udf4: 'info4',
        udf5: 'info5',
      },
      paymentFlow: {
        type: 'PG_CHECKOUT',
        message: 'Payment message used for collect requests',
        merchantUrls: {
          redirectUrl: `https://api.lavisheventzz.com/api/payment/verify-payment?orderId=${orderId}&customerId=${customerId}`,
        },
      },
    };

    const config = {
      method: 'post',
      url: PAYMENT_URL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `O-Bearer ${accessToken}`,
      },
      data: JSON.stringify(paymentData),
    };

    const response = await axios.request(config);
    console.log('PhonePe payment response:', response.data);

    const paymentUrl = response.data.redirectUrl;
    console.log('Payment URL:', paymentUrl);
    if (!paymentUrl) {
      throw new Error('No payment URL found in PhonePe response');
    }

    res.json({
      success: true,
      data: {
        paymentUrl,
      },
    });
  } catch (error) {
    console.error('Payment initiation error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: `Payment initiation failed: ${error.message}`,
    });
  }
});

// Endpoint to verify payment
// router.get('/verify-payment', async (req, res) => {
//   const { orderId, customerId } = req.query;

//   try {
//     if (!orderId || !customerId) {
//       return res.status(400).json({ error: 'Order ID and Customer ID are required.' });
//     }

//     const accessToken = await getAccessToken();
//     console.log('Access token for verification:', accessToken);

//     const config = {
//       method: 'get',
//       url: `${STATUS_URL}?merchantOrderId=${orderId}`,
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `O-Bearer ${accessToken}`,
//       },
//     };

//     const response = await axios.request(config);
//     console.log('PhonePe status response:', response.data);

//     const { status } = response.data;

//     if (status === 'PAYMENT_SUCCESS') {
//       const updatedOrder = await Order.findOneAndUpdate(
//         { orderId: orderId },
//         { paymentStatus: 'PAID' },
//         { new: true }
//       );
//       res.json({ success: true, paymentStatus: 'completed', order: updatedOrder });
//     } else {
//       const updatedOrder = await Order.findOneAndUpdate(
//         { orderId: orderId },
//         { paymentStatus: 'FAILED' },
//         { new: true }
//       );
//       res.json({ success: false, paymentStatus: status, order: updatedOrder });
//     }
//   } catch (error) {
//     console.error('Payment verification error:', error.response?.data || error.message);
//     res.status(500).json({
//       success: false,
//       error: `Payment verification failed: ${error.message}`,
//     });
//   }
// });

// Endpoint to verify payment
// Endpoint to verify payment
router.get('/verify-payment', async (req, res) => {
  const { orderId, customerId } = req.query;

  try {
    // Validate query parameters
    if (!orderId || !customerId) {
      console.error('Missing query parameters:', { orderId, customerId });
      return res.status(400).json({
        success: false,
        error: 'Order ID and Customer ID are required.',
      });
    }

    // Find the order in the database
    const order = await Order.findOne({ orderId, customerId });
    if (!order) {
      console.error('Order not found:', { orderId, customerId });
      return res.status(404).json({
        success: false,
        error: 'Order not found.',
      });
    }

    // Get access token
    const accessToken = await getAccessToken();
    console.log('Access token for verification:', accessToken);

    // Construct the status check URL
    const statusUrl = `${STATUS_URL}/${CLIENT_ID}/${orderId}`;
    console.log('Status check URL:', statusUrl);

    const config = {
      method: 'get',
      url: statusUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`, // Updated to standard Bearer token format
        'X-VERIFY': `SHA256(${orderId}||${accessToken})`, // Add X-VERIFY header if required
      },
    };

    // Make request to PhonePe to check payment status
    const response = await axios.request(config);
    console.log('PhonePe status response:', response.data);

    const { code, data } = response.data;
    if (!code || !data) {
      console.error('Invalid response structure from PhonePe:', response.data);
      return res.status(500).json({
        success: false,
        error: 'Invalid response from payment gateway.',
      });
    }

    // Map PhonePe status codes to internal status
    let paymentStatus;
    if (code === 'PAYMENT_SUCCESS') {
      paymentStatus = 'PAID';
      // Verify amount if available
      if (data.amount && data.amount !== order.grandTotal * 100) {
        console.warn('Amount mismatch:', {
          expected: order.grandTotal * 100,
          received: data.amount,
        });
        paymentStatus = 'PENDING';
      }
    } else if (['PAYMENT_FAILED', 'PAYMENT_DECLINED', 'PAYMENT_ERROR'].includes(code)) {
      paymentStatus = 'FAILED';
    } else {
      paymentStatus = 'PENDING'; // Handle other statuses like PAYMENT_PENDING
    }

    // Update order in database
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId, customerId },
      {
        paymentStatus,
        transactionId: data.transactionId || order.transactionId || null,
        updatedAt: new Date(),
      },
      { new: true }
    );

    // Save payment details in Payment model
    const payment = new Payment({
      orderId,
      customerId,
      transactionId: data.transactionId || null,
      amount: order.grandTotal,
      status: paymentStatus,
      paymentGateway: 'PhonePe',
      paymentDetails: data, // Store full response for debugging
    });
    await payment.save();

    // Redirect user to appropriate page
    const redirectUrl =
      paymentStatus === 'PAID'
        ? `https://lavisheventzz.com/payment/success?orderId=${orderId}`
        : `https://lavisheventzz.com/payment/failure?orderId=${orderId}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Payment verification error:', {
      message: error.message,
      response: error.response?.data,
      orderId,
      customerId,
      statusUrl: `${STATUS_URL}/${CLIENT_ID}/${orderId}`,
    });

    // Handle specific error cases
    let statusCode = error.response?.status || 500;
    let errorMessage = `Payment verification failed: ${error.message}`;

    if (statusCode === 400 && error.response?.data?.message === 'Bad Request - Api Mapping Not Found') {
      errorMessage = 'Invalid API endpoint or parameters. Please check PhonePe API configuration.';
    } else if (statusCode === 401) {
      errorMessage = 'Authentication failed with payment gateway. Check API credentials.';
    } else if (statusCode === 404) {
      errorMessage = 'Payment status not found for the given order.';
    }

    // Update order to reflect failure
    await Order.findOneAndUpdate(
      { orderId, customerId },
      { paymentStatus: 'FAILED', updatedAt: new Date() },
      { new: true }
    );

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
    });
  }
});

export default router;




