// models/Theme.js
import mongoose from "mongoose";

const ThemeSchema = new mongoose.Schema({
  theme: {
    type: String,
    required: true,
    trim: true
  },
  subSubCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subsubcategory",
    required: true
  },
  image: {
    type: String,
    required: true
  }
}, { timestamps: true });

// ✅ Correct protection
const Theme = mongoose.models.Theme || mongoose.model("Theme", ThemeSchema);

export default Theme;
