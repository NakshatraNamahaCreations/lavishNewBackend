
import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true,
    },
    subSubCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subsubcategory",
      required: false,
    },
    themeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theme",
      required: false,
    },
    packageDetails: {
      type: String,
      default: "",
    },
    requiredDetails: {
      type: String,
      default: "",
    },
    customizedInputs: [
      {
        label: {
          type: String,
          required: true,
        },
        inputType: {
          type: String,
          required: true,
        },
        maxValue: {
          type: Number,
        },
      },
    ],
    balloonColors: {
      type: [String],
      default: [],
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    offerPrice: {
      type: Number,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", ServiceSchema);
export default Service;
