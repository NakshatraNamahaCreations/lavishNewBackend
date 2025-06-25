// import Theme from "../../models/category/Theme.js";
// import SubSubCategory from "../../models/category/Subsubcategory.js";
// import SubCategory from "../../models/category/Subcategory.js";
// import Category from "../../models/category/Category.js";


// export const addTheme = async (req, res) => {
//   try {
//     const { theme, subSubCategory } = req.body;
//     if (!theme || !subSubCategory) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide all required fields",
//       });
//     }

//     // Check if image file is uploaded
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "Image is required for sub-subcategory",
//       });
//     }

//     // const imagePath = `/images/uploads/${req.file.filename}`;

//     // Check if theme already exists
//     const existingTheme = await Theme.findOne({
//       theme: { $regex: new RegExp(`^${theme}$`, "i") },
//       subSubCategory,
//     });

//     if (existingTheme) {
//       return res.status(400).json({
//         success: false,
//         message: "This theme already exists in this sub-subcategory",
//       });
//     }
//     // Create new theme
//     const newTheme = new Theme({
//       theme,
//       subSubCategory,
//       image: req.file.filename,
//     });
//     await newTheme.save();

//     return res.status(201).json({
//       success: true,
//       message: "Theme added successfully",
//       theme: newTheme,
//     });
//   } catch (error) {
//     console.error("Error adding theme:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to add theme",
//       error: error.message,
//     });
//   }
// };

// // export const getAllThemes = async (req, res) => {
// //   try {
// //     const themes = await Theme.find()
// //       .populate({
// //         path: "subSubCategory",
// //         select: "subSubCategory",
// //         populate: {
// //           path: "subCategory",
// //           select: "subCategory",
// //           populate: {
// //             path: "category",
// //             select: "category",
// //           },
// //         },
// //       })
// //       .select("-__v")
// //       .sort({ createdAt: -1 });

// //     return res.status(200).json({
// //       success: true,
// //       count: themes.length,
// //       data: themes,
// //     });
// //   } catch (error) {
// //     console.error("Error fetching themes:", error);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Failed to fetch themes",
// //       error: error.message,
// //     });
// //   }
// // };

// // export const getAllThemes = async (req, res) => {
// //   try {
// //     const themes = await Theme.find()
// //       .populate({
// //         path: "subSubCategory",
// //         select: "subSubCategory",
// //         populate: {
// //           path: "subCategory",
// //           select: "subCategory",
// //           populate: {
// //             path: "category",
// //             select: "category",
// //           },
// //         },
// //       })
// //       .select("-__v")
// //       .sort({ createdAt: -1 });

// //     console.log("Fetched themes:", themes); // Debug: log themes data to check for missing fields

// //     return res.status(200).json({
// //       success: true,
// //       count: themes.length,
// //       data: themes,
// //     });
// //   } catch (error) {
// //     console.error("Error fetching themes:", error);
// //     return res.status(500).json({
// //       success: false,
// //       message: "Failed to fetch themes",
// //       error: error.message,
// //     });
// //   }
// // };



// export const getAllThemes = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const search = req.query.search || "";

//     const skip = (page - 1) * limit;

//     // Build search filters
//     let themeQuery = {};

//     if (search) {
//       // Search by theme name
//       const themeNameQuery = { theme: { $regex: search, $options: "i" } };
    
//       // Match sub-sub-category names
//       const matchingSubSubCats = await SubSubCategory.find({
//         subSubCategory: { $regex: search, $options: "i" },
//       });
    
//       // Match sub-category names
//       const matchingSubCats = await SubCategory.find({
//         subCategory: { $regex: search, $options: "i" },
//       });
    
//       // Match categories
//       const matchingCats = await Category.find({
//         category: { $regex: search, $options: "i" },
//       });
    
//       // From matching categories, find all subCategories
//       const subCatsFromCats = await SubCategory.find({
//         category: { $in: matchingCats.map((cat) => cat._id) },
//       });
    
//       // Find matching subSubCategory IDs from both subCategory matches and direct name match
//       const subSubCatsFromSubCats = await SubSubCategory.find({
//         subCategory: {
//           $in: [...matchingSubCats, ...subCatsFromCats].map((s) => s._id),
//         },
//       });
    
//       const allSubSubCatIds = [
//         ...matchingSubSubCats,
//         ...subSubCatsFromSubCats,
//       ].map((s) => s._id.toString());
    
//       const categoryMatchQuery = {
//         subSubCategory: { $in: allSubSubCatIds },
//       };
    
//       // Combine both theme name and category-based matches
//       themeQuery = {
//         $or: [themeNameQuery, categoryMatchQuery],
//       };
//     }
    

//     const total = await Theme.countDocuments(themeQuery);

//     const themes = await Theme.find(themeQuery)
//       .populate({
//         path: "subSubCategory",
//         select: "subSubCategory subCategory",
//         populate: {
//           path: "subCategory",
//           select: "subCategory category",
//           populate: {
//             path: "category",
//             select: "category",
//           },
//         },
//       })
//       .select("-__v")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     return res.status(200).json({
//       success: true,
//       count: themes.length,
//       data: themes,
//       pagination: {
//         totalItems: total,
//         totalPages: Math.ceil(total / limit),
//         currentPage: page,
//         limit,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching themes:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch themes",
//       error: error.message,
//     });
//   }
// };


// export const getThemebySubSubcategoryId = async (req, res) => {
//   try {
//     const { subSubCategoryId } = req.params;

//     const themes = await Theme.find({
//       subSubCategory: subSubCategoryId,
//     })
//       .populate({
//         path: "subSubCategory",
//         select: "subSubCategory",
//         populate: {
//           path: "subCategory",
//           select: "subCategory",
//           populate: {
//             path: "category",
//             select: "category",
//           },
//         },
//       })
//       .sort({ theme: 1 });

//     return res.status(200).json({
//       success: true,
//       count: themes.length,
//       data: themes,
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

// export const updateTheme = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { theme, subSubCategory } = req.body;

//     // Validate required fields
//     if (!theme || !subSubCategory) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide all required fields",
//       });
//     }

//     // Check if the theme exists
//     const existingTheme = await Theme.findById(id);
//     if (!existingTheme) {
//       return res.status(404).json({
//         success: false,
//         message: "Theme not found",
//       });
//     }

//     // Check for duplicate theme within the same subSubCategory
//     const duplicateTheme = await Theme.findOne({
//       _id: { $ne: id },
//       theme: { $regex: new RegExp(`^${theme}$`, "i") },
//       subSubCategory,
//     });

//     if (duplicateTheme) {
//       return res.status(400).json({
//         success: false,
//         message: "This theme already exists in the specified sub-subcategory",
//       });
//     }

//     // Check if a new image file is uploaded and handle it
//     // let imagePath = existingTheme.image; // Default to the existing image
//     // if (req.file) {
//     //   imagePath = req.file.filename}`;
//     // }

//     const updatedFields = {
//       theme,
//       subSubCategory,
//       image: req.file ? req.file.filename : existingTheme.image,
//     };

//     // Update theme details
//     const updatedTheme = await Theme.findByIdAndUpdate(id, updatedFields, {
//       new: true,
//     });

//     if (!updatedTheme) {
//       return res.status(500).json({
//         success: false,
//         message: "Failed to update theme",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Theme updated successfully",
//       theme: updatedTheme,
//     });
//   } catch (error) {
//     console.error("Error updating theme:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update theme",
//       error: error.message,
//     });
//   }
// };

// export const deleteTheme = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedTheme = await Theme.findByIdAndDelete(id);
//     if (!deletedTheme) {
//       return res.status(404).json({
//         success: false,
//         message: "Theme not found",
//       });
//     }
//     return res.status(200).json({
//       success: true,
//       message: "Theme deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error deleting theme:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete theme",
//       error: error.message,
//     });
//   }
// };



import Theme from "../../models/category/Theme.js";
import SubSubCategory from "../../models/category/Subsubcategory.js";
import SubCategory from "../../models/category/Subcategory.js";
import Category from "../../models/category/Category.js";


export const addTheme = async (req, res) => {
  try {
    const { theme, subSubCategory, image } = req.body;
    if (!theme || !subSubCategory || !image) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }


    // Check if theme already exists
    const existingTheme = await Theme.findOne({
      theme: { $regex: new RegExp(`^${theme}$`, "i") },
      subSubCategory,
    });

    if (existingTheme) {
      return res.status(400).json({
        success: false,
        message: "This theme already exists in this sub-subcategory",
      });
    }
    // Create new theme
    const newTheme = new Theme({
      theme,
      subSubCategory,
      image,
    });
    await newTheme.save();

    return res.status(201).json({
      success: true,
      message: "Theme added successfully",
      theme: newTheme,
    });
  } catch (error) {
    console.error("Error adding theme:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add theme",
      error: error.message,
    });
  }
};


// export const getAllThemes = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const search = req.query.search || "";

//     const skip = (page - 1) * limit;

//     // Build search filters
//     let themeQuery = {};

//     if (search) {
//       // Search by theme name
//       const themeNameQuery = { theme: { $regex: search, $options: "i" } };
    
//       // Match sub-sub-category names
//       const matchingSubSubCats = await SubSubCategory.find({
//         subSubCategory: { $regex: search, $options: "i" },
//       });
    
//       // Match sub-category names
//       const matchingSubCats = await SubCategory.find({
//         subCategory: { $regex: search, $options: "i" },
//       });
    
//       // Match categories
//       const matchingCats = await Category.find({
//         category: { $regex: search, $options: "i" },
//       });
    
//       // From matching categories, find all subCategories
//       const subCatsFromCats = await SubCategory.find({
//         category: { $in: matchingCats.map((cat) => cat._id) },
//       });
    
//       // Find matching subSubCategory IDs from both subCategory matches and direct name match
//       const subSubCatsFromSubCats = await SubSubCategory.find({
//         subCategory: {
//           $in: [...matchingSubCats, ...subCatsFromCats].map((s) => s._id),
//         },
//       });
    
//       const allSubSubCatIds = [
//         ...matchingSubSubCats,
//         ...subSubCatsFromSubCats,
//       ].map((s) => s._id.toString());
    
//       const categoryMatchQuery = {
//         subSubCategory: { $in: allSubSubCatIds },
//       };
    
//       // Combine both theme name and category-based matches
//       themeQuery = {
//         $or: [themeNameQuery, categoryMatchQuery],
//       };
//     }
    

//     const total = await Theme.countDocuments(themeQuery);

//     const themes = await Theme.find(themeQuery)
//       .populate({
//         path: "subSubCategory",
//         select: "subSubCategory subCategory",
//         populate: {
//           path: "subCategory",
//           select: "subCategory category",
//           populate: {
//             path: "category",
//             select: "category",
//           },
//         },
//       })
//       .select("-__v")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     return res.status(200).json({
//       success: true,
//       count: themes.length,
//       data: themes,
//       pagination: {
//         totalItems: total,
//         totalPages: Math.ceil(total / limit),
//         currentPage: page,
//         limit,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching themes:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch themes",
//       error: error.message,
//     });
//   }
// };


export const getAllThemes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    // Build search filters
    let themeQuery = {};

    if (search) {
      // Search by theme name
      const themeNameQuery = { theme: { $regex: search, $options: "i" } };

      // Promise.all to run all search queries concurrently
      const [matchingSubSubCats, matchingSubCats, matchingCats] = await Promise.all([
        SubSubCategory.find({ subSubCategory: { $regex: search, $options: "i" } }),
        SubCategory.find({ subCategory: { $regex: search, $options: "i" } }),
        Category.find({ category: { $regex: search, $options: "i" } })
      ]);

      // From matching categories, find all subCategories concurrently
      const subCatsFromCats = await SubCategory.find({
        category: { $in: matchingCats.map((cat) => cat._id) },
      });

      // Find matching subSubCategory IDs from both subCategory matches and direct name match
      const subSubCatsFromSubCats = await SubSubCategory.find({
        subCategory: {
          $in: [...matchingSubCats, ...subCatsFromCats].map((s) => s._id),
        },
      });

      const allSubSubCatIds = [
        ...matchingSubSubCats,
        ...subSubCatsFromSubCats,
      ].map((s) => s._id.toString());

      const categoryMatchQuery = {
        subSubCategory: { $in: allSubSubCatIds },
      };

      // Combine both theme name and category-based matches
      themeQuery = {
        $or: [themeNameQuery, categoryMatchQuery],
      };
    }

    // Separate countDocuments and find queries into two promises
    const [total, themes] = await Promise.all([
      Theme.countDocuments(themeQuery),
      Theme.find(themeQuery)
        .populate({
          path: "subSubCategory",
          select: "subSubCategory subCategory",
          populate: {
            path: "subCategory",
            select: "subCategory category",
            populate: {
              path: "category",
              select: "category",
            },
          },
        })
        .select("-__v")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    return res.status(200).json({
      success: true,
      count: themes.length,
      data: themes,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching themes:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch themes",
      error: error.message,
    });
  }
};



export const getThemebySubSubcategoryId = async (req, res) => {
  try {
    const { subSubCategoryId } = req.params;

    const themes = await Theme.find({
      subSubCategory: subSubCategoryId,
    })
      .populate({
        path: "subSubCategory",
        select: "subSubCategory",
        populate: {
          path: "subCategory",
          select: "subCategory",
          populate: {
            path: "category",
            select: "category",
          },
        },
      })
      .sort({ theme: 1 });

    return res.status(200).json({
      success: true,
      count: themes.length,
      data: themes,
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

export const updateTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const { theme, subSubCategory, image } = req.body;

    // Validate required fields
      if (!theme || !subSubCategory || !image) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if the theme exists
    const existingTheme = await Theme.findById(id);
    if (!existingTheme) {
      return res.status(404).json({
        success: false,
        message: "Theme not found",
      });
    }

    // Check for duplicate theme within the same subSubCategory
    const duplicateTheme = await Theme.findOne({
      _id: { $ne: id },
      theme: { $regex: new RegExp(`^${theme}$`, "i") },
      subSubCategory,
    });

    if (duplicateTheme) {
      return res.status(400).json({
        success: false,
        message: "This theme already exists in the specified sub-subcategory",
      });
    }

    const updatedFields = {
      theme,
      subSubCategory,
      image: image ? image : existingTheme.image,
    };

    // Update theme details
    const updatedTheme = await Theme.findByIdAndUpdate(id, updatedFields, {
      new: true,
    });

    if (!updatedTheme) {
      return res.status(500).json({
        success: false,
        message: "Failed to update theme",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Theme updated successfully",
      theme: updatedTheme,
    });
  } catch (error) {
    console.error("Error updating theme:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update theme",
      error: error.message,
    });
  }
};

export const deleteTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTheme = await Theme.findByIdAndDelete(id);
    if (!deletedTheme) {
      return res.status(404).json({
        success: false,
        message: "Theme not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Theme deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting theme:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete theme",
      error: error.message,
    });
  }
};
