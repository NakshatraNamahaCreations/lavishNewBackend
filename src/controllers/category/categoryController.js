import Category from '../../models/category/Category.js';
import Subcategory from '../../models/category/Subcategory.js'
import Subsubcategory from '../../models/category/Subsubcategory.js'
import Theme from '../../models/category/Theme.js'


export const createCategory = async (req, res) => {
    try {
        const { category } = req.body;

        // Validate required fields
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({
            category: { $regex: new RegExp(`^${category}$`, 'i') }
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'This category already exists'
            });
        }

        // Create new category
        const newCategory = new Category({ category });
        await newCategory.save();

        return res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: newCategory
        });
    } catch (error) {
        console.error('Error creating category:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create category',
            error: error.message
        });
    }
};


export const getAllCategories = async (req, res) => {
    try {
        // const categories = await Category.find().sort({ createdAt: -1 });
        const categories = await Category.find();

        return res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
};

// export const deleteCategory = async (req, res) => {
//     const { id } = req.params;
//     try {
//         const deleted = await Category.findByIdAndDelete(id);
//         if (!deleted) {
//             return res.status(404).json({ success: false, message: "Category not found" });
//         }
//         return res.status(200).json({ success: true, message: "Category deleted" });
//     } catch (error) {
//         return res.status(500).json({ success: false, message: error.message });
//     }
// };

export const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        
      // 1. Find all Subcategories under Category
      const subcategories = await Subcategory.find({ category: id });
      const subcategoryIds = subcategories.map(sub => sub._id);
  
      // 2. Find all Subsubcategories under those Subcategories
      const subsubcategories = await Subsubcategory.find({ subCategory: { $in: subcategoryIds } });
      const subsubIds = subsubcategories.map(subsub => subsub._id);
  
      // 3. Delete all Themes linked to these Subsubcategories
      await Theme.deleteMany({ subSubCategory: { $in: subsubIds } });
  
      // 4. Delete all Subsubcategories
      await Subsubcategory.deleteMany({ subCategory: { $in: subcategoryIds } });
  
      // 5. Delete all Subcategories
      await Subcategory.deleteMany({ category: id });
  
      // 6. Finally delete the Category
      const deletedCategory = await Category.findByIdAndDelete(id);
  
      if (!deletedCategory) {
        return res.status(404).json({ success: false, message: "Category not found" });
      }
  
      return res.status(200).json({ success: true, message: "Category and related data deleted successfully" });
    } catch (error) {
      console.error("Error deleting Category:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
