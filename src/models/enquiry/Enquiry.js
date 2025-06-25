import mongoose from "mongoose";

const EnquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: Number,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    service: {
      type: String,
      default: "",
      trim: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    // status: {
    //   type: String,
    //   enum: [
    //     "",
    //     "Interested",
    //     "Not Interested",
    //     "Follow Up",
    //     "Converted",
    //     "Spam",
    //     "Pending",
    //   ],
    //   default: "",
    //   trim: true,
    // },
  },
  { timestamps: true }
);

const Enquiry = mongoose.model("Enquiry", EnquirySchema);

export default Enquiry;
