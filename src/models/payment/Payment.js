import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming your user model is named 'User'
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true, // in paise
  },
  status: {
    type: String,
    enum: ['INITIATED', 'SUCCESS', 'FAILED'],
    default: 'INITIATED',
  },
  phonePeReferenceId: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Payment', PaymentSchema);
