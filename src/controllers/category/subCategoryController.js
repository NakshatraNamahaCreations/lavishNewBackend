import SubCategory from "../../models/category/Subcategory.js";
import Subsubcategory from "../../models/category/Subsubcategory.js";
import Theme from "../../models/category/Theme.js";

// 📦 Backend (Create Controller)
export const createSubCategory = async (req, res) => {
  try {
    const {
      subCategory,
      category,
      keywords,
      caption,
      metaTitle,
      metaDescription,
      faqs,
    } = req.body;

    if (!subCategory || !category) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Subcategory and category are required.",
        });
    }

    let parsedFaqs = [];
    if (faqs) {
      try {
        parsedFaqs = typeof faqs === "string" ? JSON.parse(faqs) : faqs;
        if (
          !Array.isArray(parsedFaqs) ||
          !parsedFaqs.every((faq) => faq.question?.trim() && faq.answer?.trim())
        ) {
          throw new Error();
        }
      } catch {
        return res.status(400).json({
          success: false,
          message:
            "FAQs must be a valid JSON array of { question, answer } objects.",
        });
      }
    }

    const existing = await SubCategory.findOne({
      subCategory: { $regex: new RegExp(`^${subCategory}$`, "i") },
      category,
    });

    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Subcategory already exists in this category.",
        });
    }

    const newSubCategory = new SubCategory({
      subCategory,
      category,
      keywords,
      caption,
      metaTitle,
      metaDescription,
      faqs: parsedFaqs,
    });

    await newSubCategory.save();

    return res
      .status(201)
      .json({
        success: true,
        message: "Subcategory created successfully.",
        data: newSubCategory,
      });
  } catch (error) {
    console.error("Create Error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error.",
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

// 📦 Backend (Update Controller)
export const updatedSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subCategory,
      category,
      keywords,
      caption,
      metaTitle,
      metaDescription,
      faqs,
    } = req.body;

    const existing = await SubCategory.findById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Subcategory not found." });
    }

    const updateData = {};
    if (subCategory?.trim()) updateData.subCategory = subCategory.trim();
    if (category?.trim()) updateData.category = category.trim();
    if (caption?.trim()) updateData.caption = caption.trim();
    if (metaTitle?.trim()) updateData.metaTitle = metaTitle.trim();
    if (metaDescription?.trim())
      updateData.metaDescription = metaDescription.trim();
    if (keywords?.trim()) updateData.keywords = keywords.trim();

    if (faqs) {
      try {
        const parsedFaqs = typeof faqs === "string" ? JSON.parse(faqs) : faqs;
        if (
          !Array.isArray(parsedFaqs) ||
          !parsedFaqs.every((faq) => faq.question?.trim() && faq.answer?.trim())
        ) {
          throw new Error();
        }
        updateData.faqs = parsedFaqs;
      } catch {
        return res.status(400).json({
          success: false,
          message:
            "FAQs must be a valid JSON array of { question, answer } objects.",
        });
      }
    }

    const updated = await SubCategory.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    res
      .status(200)
      .json({
        success: true,
        message: "Subcategory updated successfully.",
        data: updated,
      });
  } catch (error) {
    console.error("Update Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error.",
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
    console.log("Searching for subcategory with text:", searchText);

    if (!searchText) {
      return res.status(400).json({
        success: false,
        message: "Search text is required",
      });
    }

    // Clean and prepare the search text
    const cleanedSearchText = searchText.trim().toLowerCase();
    console.log("Cleaned search text:", cleanedSearchText);

    // First, fetch all subcategories
    const allSubcategories = await SubCategory.find().populate(
      "category",
      "category"
    );

    console.log("Total subcategories found:", allSubcategories.length);

    // Filter subcategories where the search text is included in the subCategory name
    const matchingSubcategories = allSubcategories.filter((subcategory) =>
      subcategory.subCategory.toLowerCase().includes(cleanedSearchText)
    );

    console.log("Matching subcategories found:", matchingSubcategories.length);

    // If no subcategories found, return empty array
    return res.status(200).json({
      success: true,
      count: matchingSubcategories.length,
      data: matchingSubcategories,
      searchText: cleanedSearchText, // Include the search text in response for debugging
    });
  } catch (error) {
    console.error("Error searching subcategories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search subcategories",
      error: error.message,
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

    const subcategories = await SubCategory.find({
      category: categoryId,
    }).populate("category", "category");
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

export const getSubcategoryByName = async (req, res) => {
  try {
    const { name } = req.params;
    const formattedName = name.trim(); // Use as-is

    const subcategory = await SubCategory.findOne({
      subCategory: new RegExp(`^${formattedName}$`, "i"), // exact match, case-insensitive
    });

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: `Subcategory not found for: ${formattedName}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: subcategory,
    });
  } catch (error) {
    console.error("Error fetching subcategory by name:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};