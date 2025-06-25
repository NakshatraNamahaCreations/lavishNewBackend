// import mongoose from "mongoose";
// import Subsubcategory from "./Subsubcategory.js"

// const SubCategorySchema = new mongoose.Schema({
//   subCategory: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Category", 
//     required: true
//   }
// }, { timestamps: true });


// // Create compound index to ensure unique subcategories within a category
// SubCategorySchema.index({ subCategory: 1, category: 1 }, { unique: true });

// const   SubCategory = mongoose.model("SubCategory", SubCategorySchema);

// export default SubCategory;

import mongoose from "mongoose";
import Subsubcategory from "./Subsubcategory.js";
import Theme from "./Theme.js";

const SubcategorySchema = new mongoose.Schema({
  subCategory: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  }
}, { timestamps: true });

SubcategorySchema.index({ subCategory: 1, category: 1 }, { unique: true });

SubcategorySchema.pre('remove', async function (next) {
  try {
    const subsubcategories = await Subsubcategory.find({ subCategory: this._id });
    const subsubIds = subsubcategories.map(subsub => subsub._id);

    await Theme.deleteMany({ subSubCategory: { $in: subsubIds } });
    await Subsubcategory.deleteMany({ subCategory: this._id });

    next();
  } catch (error) {
    console.error('Error in Subcategory pre-remove hook:', error);
    next(error);
  }
});

const Subcategory = mongoose.models.Subcategory || mongoose.model("Subcategory", SubcategorySchema);

export default Subcategory;
