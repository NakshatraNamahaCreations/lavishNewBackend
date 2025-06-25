// import mongoose from "mongoose";

// const SubSubCategorySchema = new mongoose.Schema({
//   subSubCategory: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   subCategory: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "SubCategory",
//     required: true
//   },
//   image: {
//     type: String, 
//     required: true
//   }
// }, { timestamps: true });

// // Ensure unique sub-sub-category name within a subcategory
// SubSubCategorySchema.index({ subSubCategory: 1, subCategory: 1 }, { unique: true });

// const SubSubCategory = mongoose.model("SubSubCategory", SubSubCategorySchema);

// export default SubSubCategory;


import mongoose from "mongoose";
import Theme from "./Theme.js";

const SubsubcategorySchema = new mongoose.Schema({
  subSubCategory: {
    type: String,
    required: true,
    trim: true
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subcategory",
    required: true
  },
  image: {
    type: String,
    required: true
  }
}, { timestamps: true });


SubsubcategorySchema.pre('remove', async function (next) {
  try {
    await Theme.deleteMany({ subSubCategory: this._id });
    next();
  } catch (error) {
    console.error('Error in Subsubcategory pre-remove hook:', error);
    next(error);
  }
});

const Subsubcategory = mongoose.models.Subsubcategory || mongoose.model("Subsubcategory", SubsubcategorySchema);

export default Subsubcategory;
