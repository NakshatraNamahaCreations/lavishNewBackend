import mongoose from "mongoose";
import Theme from "./Theme.js";

const SubsubcategorySchema = new mongoose.Schema(
  {
    subSubCategory: {
      type: String,
      required: true,
      trim: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    keywords: { type: String },
    caption: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    faqs: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
  },
  { timestamps: true }
);

SubsubcategorySchema.pre("remove", async function (next) {
  try {
    await Theme.deleteMany({ subSubCategory: this._id });
    next();
  } catch (error) {
    console.error("Error in Subsubcategory pre-remove hook:", error);
    next(error);
  }
});

const Subsubcategory =
  mongoose.models.Subsubcategory ||
  mongoose.model("Subsubcategory", SubsubcategorySchema);

export default Subsubcategory;
