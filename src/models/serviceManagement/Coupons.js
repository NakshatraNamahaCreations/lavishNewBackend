import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    couponName: {
      type: String,
      required: true,
      trim: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    couponCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    couponDetails: {
      type: String,
      default: "",
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
        type: Date,
        required: false,
        validate: {
          validator: function (value) {
            if (!value) return true;
            return !this.startDate || value >= this.startDate;
          },
          message: 'End date must be after or equal to start date.',
        },
      },
      
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

export default mongoose.model("Coupon", couponSchema);
