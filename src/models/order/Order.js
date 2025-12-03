import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'categoryType'
  },
  serviceName: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  image: { type: String },
  categoryType: {
    type: String,
    required: true,
    enum: ['Service', 'Addon']
  },
  customizedInputs: [
    {
      label: { type: String },
      value: mongoose.Schema.Types.Mixed,
    },
  ]
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    eventDate: { type: String, required: true },
    eventTime: { type: String, required: true },

    rescheduledEventDate: { type: String },
    rescheduledEventTime: { type: String },
    rescheduledAddress: { type: String },

    pincode: { type: String, required: true },
    balloonsColor: { type: [String], required: true },

    subTotal: { type: Number, required: true },
    grandTotal: { type: Number, required: true },

    deliveryCharges: { type: Number },
    couponDiscount: { type: Number },
    addNote: { type: String },

    orderStatus: {
      type: String,
      default: "created",
    },

    reason: { type: String },

    address: { type: String, required: true },
    customerName: { type: String, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [itemSchema],

    occasion: { type: String },
    otherOccasion: { type: String },
    otherDecorLocation: { type: String },
    decorLocation: { type: String },

    source: { type: String },
    slotExtraCharge: { type: Number, default: 0 },

    /** 🔥 NEW IMPORTANT FIELDS */
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    paymentType: { type: String, enum: ["FULL", "HALF"], default: "FULL" },
    paymentPercentage: { type: Number, default: 100 },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "PARTIAL PAID", "FAILED"],
      default: "PENDING",
    },

    merchantTransactionId: { type: String, required: true },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;

// import mongoose from "mongoose";

// const itemSchema = new mongoose.Schema({
//   refId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     refPath: 'categoryType'
//   },
//   serviceName: { type: String, required: true },
//   price: { type: Number, required: true },
//   originalPrice: { type: Number, required: true },
//   quantity: { type: Number, default: 1 },
//   image: { type: String },
//   categoryType: {
//     type: String,
//     required: true,
//     enum: ['Service', 'Addon']
//   },
//   customizedInputs: [
//     {
//       label: { type: String },
//       value: mongoose.Schema.Types.Mixed,
//     },
//   ]

// });

// const orderSchema = new mongoose.Schema({
//   orderId: { type: String, required: true, unique: true },
//   eventDate: { type: String, required: true },
//   eventTime: { type: String, required: true },
//   rescheduledEventDate: { type: String },
//   rescheduledEventTime: { type: String },
//   rescheduledAddress: { type: String },
//   pincode: { type: String, required: true },
//   balloonsColor: {
//     type: [String],
//     required: true,
//   },
//   subTotal: { type: Number, required: true },
//   grandTotal: { type: Number, required: true },
//   deliveryCharges: { type: Number },
//   couponDiscount: { type: Number },
//   addNote: { type: String },
//   orderStatus: {
//     type: String,
//     required: true,
//     default: "created",

//   },
//   reason: { type: String },
//   address: { type: String, required: true },
//   customerName: { type: String, required: true },
//   customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   items: [itemSchema],
//   occasion: { type: String },
//   otherOccasion: { type: String },
//   otherDecorLocation: { type: String },
//   decorLocation: { type: String },
//   source: { type: String },
//   slotExtraCharge: { type: Number, default: 0 },
//   paymentStatus: {
//     type: String,
//     enum: ['PENDING', 'PAID','PARTIAL PAID', 'FAILED'],
//     default: 'PENDING',
//   },
//   merchantTransactionId: { type: String, required: true }
  

// }, { timestamps: true });

// const Order = mongoose.model('Order', orderSchema);

// export default Order;


// my old working code

// import mongoose from "mongoose";

// const itemSchema = new mongoose.Schema({
//   refId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     refPath: 'categoryType'
//   },
//   serviceName: { type: String, required: true },
//   price: { type: Number, required: true },
//   originalPrice: { type: Number, required: true },
//   quantity: { type: Number, default: 1 },
//   image: { type: String },
//   categoryType: {
//     type: String,
//     required: true,
//     enum: ['Service', 'Addon']
//   },
//   customizedInputs: [
//     {
//       label: { type: String },
//       value: mongoose.Schema.Types.Mixed,
//     },
//   ]

// });

// const orderSchema = new mongoose.Schema({
//   orderId: { type: String, required: true, unique: true },
//   eventDate: { type: String, required: true },
//   eventTime: { type: String, required: true },
//   rescheduledEventDate: { type: String },
//   rescheduledEventTime: { type: String },
//   rescheduledAddress: { type: String },
//   pincode: { type: String, required: true },
//   balloonsColor: {
//     type: [String],
//     required: true,
//   },
//   subTotal: { type: Number, required: true },
//   grandTotal: { type: Number, required: true },
//   deliveryCharges: { type: Number },
//   couponDiscount: { type: Number },
//   addNote: { type: String },
//   orderStatus: {
//     type: String,
//     required: true,
//     default: "created",

//   },
//   reason: { type: String },
//   address: { type: String, required: true },
//   customerName: { type: String, required: true },
//   customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   items: [itemSchema],
//   occasion: { type: String },
//   otherOccasion: { type: String },
//   otherDecorLocation: { type: String },
//   decorLocation: { type: String },
//   source: { type: String },
//   slotExtraCharge: { type: Number, default: 0 },
//   paymentStatus: {
//     type: String,
//     enum: ['PENDING', 'PAID', 'FAILED'],
//     default: 'PENDING',
//   },

// }, { timestamps: true });

// const Order = mongoose.model('Order', orderSchema);

// export default Order;







