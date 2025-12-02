import mongoose from "mongoose";

// paymentSchema.js
const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: false, // Remove unique constraint as there can be multiple payments
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
      enum: ['Online', 'Cash', 'Bank Transfer'],
      default: 'Online'
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'FAILED', 'PENDING', 'REFUNDED'],
      default: 'PENDING'
    },
    paymentPercentage: {
      type: Number,
      enum: [50, 100]
    },
    transactionId: String,
    merchantOrderId: String,
    paymentGateway: {
      type: String,
      default: 'PhonePe'
    },
    isPartialPayment: {
      type: Boolean,
      default: false
    },
    // For partial payments
    paidAmount: Number,
    dueAmount: Number,
    grandTotal: Number
  },
  { timestamps: true }
);


const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;


//my working code
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
