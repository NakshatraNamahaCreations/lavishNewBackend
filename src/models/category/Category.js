import mongoose from "mongoose";
import Subcategory from "./Subcategory.js";
import Subsubcategory from "./Subsubcategory.js";
import Theme from "./Theme.js";

const CategorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);

export default Category;

