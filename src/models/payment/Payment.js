import mongoose from "mongoose";

// Define the schema for Payment
const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true, // Ensures that each order has a unique payment entry
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a 'User' model for customers
      required: true,
    },
    // transactionId: { type: String },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
    },

  },
  { timestamps: true } // Add createdAt and updatedAt fields automatically
);

// Create a model from the schema
const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;

// import mongoose from 'mongoose';

// const PaymentSchema = new mongoose.Schema({
//   customerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User', // Assuming your user model is named 'User'
//     required: true,
//   },
//   orderId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Order',
//     required: true,
//   },
//   transactionId: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   amount: {
//     type: Number,
//     required: true, // in paise
//   },
//   status: {
//     type: String,
//     enum: ['INITIATED', 'SUCCESS', 'FAILED'],
//     default: 'INITIATED',
//   },
//   phonePeReferenceId: {
//     type: String,
//   },
// }, {
//   timestamps: true,
// });

// export default mongoose.model('Payment', PaymentSchema);
