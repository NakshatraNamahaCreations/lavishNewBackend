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

import mongoose from "mongoose";

// Define the schema for Payment
const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
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
    paymentType: {
      type: String,
      enum: ["partial", "full", "final"],
      default: "full",
    },
    paymentPercentage: {
      type: String,
      enum: ["50", "100"],
      default: "100",
    },
    paymentMethod: { // ← Add this field
      type: String,
      enum: ["online", "cash", ],
      default: "online",
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"],
      default: "PENDING",
    },
    transactionId: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;