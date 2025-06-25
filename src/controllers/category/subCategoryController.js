import SubCategory from "../../models/category/Subcategory.js";
import Subsubcategory from "../../models/category/Subsubcategory.js";
import Theme from "../../models/category/Theme.js";


export const createSubCategory = async (req, res) => {
  try {
    const { subCategory, category } = req.body;

    // Validate required fields
    if (!subCategory || !category) {
      return res.status(400).json({
        success: false,
        message: "Subcategory name and category are required",
      });
    }

    // Check if subcategory already exists in this category
    const existingSubCategory = await SubCategory.findOne({
      subCategory: { $regex: new RegExp(`^${subCategory}$`, "i") },
      category,
    });

    if (existingSubCategory) {
      return res.status(400).json({
        success: false,
        message: "This subcategory already exists in this category",
      });
    }

    // Create new subcategory
    const newSubCategory = new SubCategory({
      subCategory,
      category,
    });

    await newSubCategory.save();

    return res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      data: newSubCategory,
    });
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create subcategory",
      error: error.message,
    });
  }
};

export const getAllSubCategories = async (req, res) => {
  try {
    const subcategories = await SubCategory.find()
      .populate("category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: subcategories.length,
      data: subcategories,
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subcategories",
      error: error.message,
    });
  }
};

export const updatedSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const subcategory = await SubCategory.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      subcategory,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating subcategory.",
      error: error.message,
    });
  }
};

export const deleteSubCategory = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Find all Subsubcategories under this Subcategory
    const subsubcategories = await Subsubcategory.find({ subCategory: id });
    const subsubIds = subsubcategories.map((subsub) => subsub._id);

    // 2. Delete all Themes linked to these Subsubcategories
    await Theme.deleteMany({ subSubCategory: { $in: subsubIds } });

    // 3. Delete all Subsubcategories under this Subcategory
    await Subsubcategory.deleteMany({ subCategory: id });

    // 4. Finally, delete the Subcategory
    const deletedSubcategory = await SubCategory.findByIdAndDelete(id);

    if (!deletedSubcategory) {
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Subcategory and related data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting Subcategory:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const searchSubCategory = async (req, res) => {
  try {
    const { searchText } = req.params;
    console.log('Searching for subcategory with text:', searchText);

    if (!searchText) {
      return res.status(400).json({
        success: false,
        message: "Search text is required"
      });
    }

    // Clean and prepare the search text
    const cleanedSearchText = searchText.trim().toLowerCase();
    console.log('Cleaned search text:', cleanedSearchText);

    // First, fetch all subcategories
    const allSubcategories = await SubCategory.find()
      .populate("category", "category");
    
    console.log('Total subcategories found:', allSubcategories.length);

    // Filter subcategories where the search text is included in the subCategory name
    const matchingSubcategories = allSubcategories.filter(subcategory => 
      subcategory.subCategory.toLowerCase().includes(cleanedSearchText)
    );

    console.log('Matching subcategories found:', matchingSubcategories.length);

    // If no subcategories found, return empty array
    return res.status(200).json({
      success: true,
      count: matchingSubcategories.length,
      data: matchingSubcategories,
      searchText: cleanedSearchText // Include the search text in response for debugging
    });

  } catch (error) {
    console.error("Error searching subcategories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search subcategories",
      error: error.message
    });
  }
};

export const getSubCategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Validate category ID format
    // if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    //     return res.status(400).json({
    //         success: false,
    //         message: 'Invalid category ID format'
    //     });
    // }

    const subcategories = await SubCategory.find({ category: categoryId })
      .populate("category", "category")
      // .sort({ subCategory: 1 });

    return res.status(200).json({
      success: true,
      count: subcategories.length,
      data: subcategories,
    });
  } catch (error) {
    console.error("Error fetching subcategories by category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subcategories by category",
      error: error.message,
    });
  }
};

// export const deleteSubCategory = async (req, res) => {
//     const { id } = req.params;
//     try {
//         const deleted = await SubCategory.findByIdAndDelete(id);
//         if (!deleted) {
//             return res.status(404).json({ success: false, message: "SubCategory not found" });
//         }
//         return res.status(200).json({ success: true, message: "SubCategory deleted" });
//     } catch (error) {
//         return res.status(500).json({ success: false, message: error.message });
//     }
// };
