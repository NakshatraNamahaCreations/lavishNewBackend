// befroe migration
import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      // REMOVE THIS: unique: true,
      index: true, // Keep as index for faster queries
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    // CHANGE: Add paymentType to distinguish between initial and final payments
    paymentType: {
      type: String,
      enum: ["INITIAL", "FINAL", "FULL"],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["FULL", "HALF"],
      required: true,
    },
    paymentMode: {
      type: String,
      enum: ["ONLINE", "CASH"],
      default: "ONLINE",
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    // ADD: Transaction ID for uniqueness
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

// Add index for faster queries by orderId
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;


// import mongoose from "mongoose";

// // Define the schema for Payment
// const paymentSchema = new mongoose.Schema(
//   {
//     orderId: {
//       type: String,
//       required: true,
//       unique: true, 
//     },
//     customerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User", 
//       required: true,
//     },
//     amount: {
//       type: Number,
//       required: true,
//     },
//     status: {
//       type: String,
//     },

//   },
//   { timestamps: true } 
// );


// const Payment = mongoose.model("Payment", paymentSchema);

// export default Payment;
