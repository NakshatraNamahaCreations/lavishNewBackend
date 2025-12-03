import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
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

    // FULL = 100%, HALF = 50%
    paymentMethod: {
      type: String,
      enum: ["FULL", "HALF"],
      required: true,
    },

    // ONLINE / CASH (for remaining payments)
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
  },
  { timestamps: true }
);

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
