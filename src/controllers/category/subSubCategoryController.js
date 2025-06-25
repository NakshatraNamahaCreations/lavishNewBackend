// import Category from "../../models/category/Category.js"
// import SubSubCategory from "../../models/category/Subsubcategory.js";
// import SubCategory from "../../models/category/Subcategory.js";
// import Subsubcategory from "../../models/category/Subsubcategory.js";
// import Theme from "../../models/category/Theme.js";

// export const createSubSubCategory = async (req, res) => {
//   try {
//     const { subSubCategory, subCategory } = req.body;

//     // Validate required fields
//     if (!subSubCategory || !subCategory) {
//       return res.status(400).json({
//         success: false,
//         message: "Sub-subcategory name and subcategory ID are required",
//       });
//     }

//     // Check if image file is uploaded
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Image is required for sub-subcategory",
//       });
//     }

//     // Check if sub-subcategory already exists in this subcategory
//     const existingSubSubCategory = await SubSubCategory.findOne({
//       subSubCategory: { $regex: new RegExp(`^${subSubCategory}$`, "i") },
//       subCategory,
//     });

//     if (existingSubSubCategory) {
//       return res.status(400).json({
//         success: false,
//         message: "This sub-subcategory already exists in this subcategory",
//       });
//     }

//     // Create new sub-subcategory
//     const newSubSubCategory = new SubSubCategory({
//       subSubCategory,
//       subCategory,
//       //   category: subCategoryExists.category, // Get category from the subcategory
//       // image: imagePath,
//       image: req.file.filename,
//     });

//     await newSubSubCategory.save();

//     return res.status(201).json({
//       success: true,
//       message: "Sub-subcategory created successfully",
//       data: newSubSubCategory,
//     });
//   } catch (error) {
//     console.error("Error creating sub-subcategory:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create sub-subcategory",
//       error: error.message,
//     });
//   }
// };

// export const getAllSubSubCategories = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const search = req.query.search || "";

//     const skip = (page - 1) * limit;

//     // Step 1: Prepare base query
//     let searchQuery = {};

//     if (search) {
//       // Find matching subcategories
//       const matchingSubCategories = await SubCategory.find({
//         subCategory: { $regex: search, $options: "i" },
//       });

//       // Find matching categories
//       const matchingCategories = await Category.find({
//         category: { $regex: search, $options: "i" },
//       });

//       // Get subcategory IDs from matched categories
//       const subCategoriesFromCategories = await SubCategory.find({
//         category: { $in: matchingCategories.map((cat) => cat._id) },
//       });

//       const allSubCategoryIds = [
//         ...matchingSubCategories.map((sub) => sub._id.toString()),
//         ...subCategoriesFromCategories.map((sub) => sub._id.toString()),
//       ];

//       // Build search query
//       searchQuery = {
//         $or: [
//           { subSubCategory: { $regex: search, $options: "i" } },
//           { subCategory: { $in: allSubCategoryIds } },
//         ],
//       };
//     }

//     const subSubCategories = await SubSubCategory.find(searchQuery)
//       .populate({
//         path: "subCategory",
//         select: "subCategory category",
//         populate: {
//           path: "category",
//           select: "category",
//         },
//       })
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const total = await SubSubCategory.countDocuments(searchQuery);

//     return res.status(200).json({
//       success: true,
//       count: subSubCategories.length,
//       data: subSubCategories,
//       pagination: {
//         totalItems: total,
//         totalPages: Math.ceil(total / limit),
//         currentPage: page,
//         limit,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching sub-subcategories:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch sub-subcategories",
//       error: error.message,
//     });
//   }
// };



// export const getSubSubCategoriesBySubCategory = async (req, res) => {
//   try {
//     const { subCategoryId } = req.params;

//     const subSubCategories = await SubSubCategory.find({
//       subCategory: subCategoryId,
//     })
//       .populate({
//         path: "subCategory",
//         select: "subCategory",
//         populate: {
//           path: "category",
//           select: "category",
//         },
//       })
//       .sort({ subSubCategory: 1 });

//     return res.status(200).json({
//       success: true,
//       count: subSubCategories.length,
//       data: subSubCategories,
//     });
//   } catch (error) {
//     console.error("Error fetching sub-subcategories by subcategory:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch sub-subcategories by subcategory",
//       error: error.message,
//     });
//   }
// };

// export const updateSubSubCategory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { subSubCategory, subCategory } = req.body;

//     // Validate required fields
//     if (!subSubCategory || !subCategory) {
//       return res.status(400).json({
//         success: false,
//         message: "Sub-subcategory name and subcategory ID are required",
//       });
//     }

//     // Check if subcategory exists
//     const subCategoryExists = await SubCategory.findById(subCategory);
//     if (!subCategoryExists) {
//       return res.status(404).json({
//         success: false,
//         message: "Subcategory not found",
//       });
//     }

//     // Check if sub-subcategory exists
//     const subSubCategoryExists = await SubSubCategory.findById(id);
//     if (!subSubCategoryExists) {
//       return res.status(404).json({
//         success: false,
//         message: "Sub-subcategory not found",
//       });
//     }

//     const duplicateSubSubCategory = await SubSubCategory.findOne({
//       _id: { $ne: id },
//       subSubCategory: { $regex: new RegExp(`^${subSubCategory}$`, "i") },
//       subCategory,
//     });

//     if (duplicateSubSubCategory) {
//       return res.status(400).json({
//         success: false,
//         message: "This sub-subcategory already exists in this subcategory",
//       });
//     }

//     // Prepare updated fields
//     const updatedFields = {
//       subSubCategory,
//       subCategory,
//       image: req.file ? req.file.filename : subSubCategoryExists.image,
//     };

//     // Update sub-subcategory
//     const updatedSubSubCategory = await SubSubCategory.findByIdAndUpdate(
//       id,
//       updatedFields,
//       { new: true }
//     );

//     if (!updatedSubSubCategory) {
//       return res.status(500).json({
//         success: false,
//         message: "Failed to update sub-subcategory",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Sub-subcategory updated successfully",
//       data: updatedSubSubCategory,
//     });
//   } catch (error) {
//     console.error("Error updating sub-subcategory:", error);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while updating the sub-subcategory",
//       error: error.message,
//     });
//   }
// };

// export const deleteSubSubCategory = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // 1. Find SubSubCategory by ID first (to check existence)
//     const subSubCategory = await Subsubcategory.findById(id);
//     if (!subSubCategory) {
//       return res.status(404).json({
//         success: false,
//         message: "Sub-subcategory not found",
//       });
//     }

//     // 2. Delete all Themes linked to this SubSubCategory
//     await Theme.deleteMany({ subSubCategory: id });

//     // 3. Delete the SubSubCategory
//     await Subsubcategory.findByIdAndDelete(id);

//     return res.status(200).json({
//       success: true,
//       message: "Sub-subcategory and its related Themes deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error deleting sub-subcategory:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete sub-subcategory",
//       error: error.message,
//     });
//   }
// };



import Category from "../../models/category/Category.js"
import SubSubCategory from "../../models/category/Subsubcategory.js";
import SubCategory from "../../models/category/Subcategory.js";
import Subsubcategory from "../../models/category/Subsubcategory.js";
import Theme from "../../models/category/Theme.js";

export const createSubSubCategory = async (req, res) => {
  try {
    const { subSubCategory, subCategory, image } = req.body;

    // Validate required fields
    if (!subSubCategory || !subCategory || !image) {
      return res.status(400).json({
        success: false,
        message: "Sub-subcategory name, subcategory ID and image are required",
      });
    }


    // Check if sub-subcategory already exists in this subcategory
    const existingSubSubCategory = await SubSubCategory.findOne({
      subSubCategory: { $regex: new RegExp(`^${subSubCategory}$`, "i") },
      subCategory,
    });

    if (existingSubSubCategory) {
      return res.status(400).json({
        success: false,
        message: "This sub-subcategory already exists in this subcategory",
      });
    }

    // Create new sub-subcategory
    const newSubSubCategory = new SubSubCategory({
      subSubCategory,
      subCategory,
      image
    });

    await newSubSubCategory.save();

    return res.status(201).json({
      success: true,
      message: "Sub-subcategory created successfully",
      data: newSubSubCategory,
    });
  } catch (error) {
    console.error("Error creating sub-subcategory:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create sub-subcategory",
      error: error.message,
    });
  }
};

export const getAllSubSubCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    // Step 1: Prepare base query
    let searchQuery = {};

    if (search) {
      // Find matching subcategories
      const matchingSubCategories = await SubCategory.find({
        subCategory: { $regex: search, $options: "i" },
      });

      // Find matching categories
      const matchingCategories = await Category.find({
        category: { $regex: search, $options: "i" },
      });

      // Get subcategory IDs from matched categories
      const subCategoriesFromCategories = await SubCategory.find({
        category: { $in: matchingCategories.map((cat) => cat._id) },
      });

      const allSubCategoryIds = [
        ...matchingSubCategories.map((sub) => sub._id.toString()),
        ...subCategoriesFromCategories.map((sub) => sub._id.toString()),
      ];

      // Build search query
      searchQuery = {
        $or: [
          { subSubCategory: { $regex: search, $options: "i" } },
          { subCategory: { $in: allSubCategoryIds } },
        ],
      };
    }

    const subSubCategories = await SubSubCategory.find(searchQuery)
      .populate({
        path: "subCategory",
        select: "subCategory category",
        populate: {
          path: "category",
          select: "category",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SubSubCategory.countDocuments(searchQuery);

    return res.status(200).json({
      success: true,
      count: subSubCategories.length,
      data: subSubCategories,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching sub-subcategories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sub-subcategories",
      error: error.message,
    });
  }
};



export const getSubSubCategoriesBySubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;

    const subSubCategories = await SubSubCategory.find({
      subCategory: subCategoryId,
    })
      .populate({
        path: "subCategory",
        select: "subCategory",
        populate: {
          path: "category",
          select: "category",
        },
      })
      .sort({ subSubCategory: 1 });

    return res.status(200).json({
      success: true,
      count: subSubCategories.length,
      data: subSubCategories,
    });
  } catch (error) {
    console.error("Error fetching sub-subcategories by subcategory:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sub-subcategories by subcategory",
      error: error.message,
    });
  }
};

export const updateSubSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { subSubCategory, subCategory, image } = req.body;

    // Validate required fields
    if (!subSubCategory || !subCategory || !image) {
      return res.status(400).json({
        success: false,
        message: "Sub-subcategory name, subcategory ID and image are required",
      });
    }

    // Check if subcategory exists
    const subCategoryExists = await SubCategory.findById(subCategory);
    if (!subCategoryExists) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    // Check if sub-subcategory exists
    const subSubCategoryExists = await SubSubCategory.findById(id);
    if (!subSubCategoryExists) {
      return res.status(404).json({
        success: false,
        message: "Sub-subcategory not found",
      });
    }

    const duplicateSubSubCategory = await SubSubCategory.findOne({
      _id: { $ne: id },
      subSubCategory: { $regex: new RegExp(`^${subSubCategory}$`, "i") },
      subCategory,
    });

    if (duplicateSubSubCategory) {
      return res.status(400).json({
        success: false,
        message: "This sub-subcategory already exists in this subcategory",
      });
    }

    // Prepare updated fields
    const updatedFields = {
      subSubCategory,
      subCategory,
      image: image ? image : subSubCategoryExists.image,
    };

    // Update sub-subcategory
    const updatedSubSubCategory = await SubSubCategory.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true }
    );

    if (!updatedSubSubCategory) {
      return res.status(500).json({
        success: false,
        message: "Failed to update sub-subcategory",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sub-subcategory updated successfully",
      data: updatedSubSubCategory,
    });
  } catch (error) {
    console.error("Error updating sub-subcategory:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the sub-subcategory",
      error: error.message,
    });
  }
};

export const deleteSubSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find SubSubCategory by ID first (to check existence)
    const subSubCategory = await Subsubcategory.findById(id);
    if (!subSubCategory) {
      return res.status(404).json({
        success: false,
        message: "Sub-subcategory not found",
      });
    }

    // 2. Delete all Themes linked to this SubSubCategory
    await Theme.deleteMany({ subSubCategory: id });

    // 3. Delete the SubSubCategory
    await Subsubcategory.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Sub-subcategory and its related Themes deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting sub-subcategory:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete sub-subcategory",
      error: error.message,
    });
  }
};
