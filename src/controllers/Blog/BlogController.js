import Blog from "../../models/Blogs/Blog.js"
import { uploadSingleFileToBunny } from "../../middleware/multer/fileUploader.js";

// Add Blog
// export const addBlog = async (req, res) => {
//   try {
//     const {
//       title,
//       redirectLink,
//       metaTitle,
//       metaDescription,
//       description,
//     } = req.body;

//     const bannerFile = req.files?.['bannerImage']?.[0];
//     const thumbFile = req.files?.['thumbnailImage']?.[0];

//     if (
//       !title || !bannerFile || !thumbFile ||
//       !redirectLink || !metaTitle || !metaDescription || !description
//     ) {
//       return res.status(400).json({ success: false, message: "All fields are required" });
//     }

//     const bannerImage = await uploadSingleFileToBunny(bannerFile);
//     const thumbnailImage = await uploadSingleFileToBunny(thumbFile);

//     if (!bannerImage || !thumbnailImage) {
//       return res.status(500).json({ success: false, message: "Image upload failed" });
//     }

//     const newBlog = new Blog({
//       title,
//       bannerImage,
//       thumbnailImage,
//       redirectLink,
//       metaTitle,
//       metaDescription,
//       description,
//     });

//     await newBlog.save();

//     return res.status(201).json({
//       success: true,
//       message: "Blog added successfully",
//       data: newBlog,
//     });
//   } catch (error) {
//     console.error("Error adding Blog:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to add blog",
//       error: error.message,
//     });
//   }
// };

export const addBlog = async (req, res) => {
  try {
    const {
      title,
      redirectLink,
      metaTitle,
      metaDescription,
      description,
      faqs, // Get FAQs from the request body
    } = req.body;

    const bannerFile = req.files?.["bannerImage"]?.[0];
    const thumbFile = req.files?.["thumbnailImage"]?.[0];

    if (
      !title ||
      !bannerFile ||
      !redirectLink ||
      !metaTitle ||
      !metaDescription ||
      !description ||
      !faqs
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const bannerImage = await uploadSingleFileToBunny(bannerFile);
    let thumbnailImage = null;

    if (thumbFile) {
      thumbnailImage = await uploadSingleFileToBunny(thumbFile);
    }

    const newBlog = new Blog({
      title,
      bannerImage,
      thumbnailImage,
      redirectLink,
      metaTitle,
      metaDescription,
      description,
      faqs: JSON.parse(faqs), // Store FAQs as an array of objects
    });

    await newBlog.save();

    return res.status(201).json({
      success: true,
      message: "Blog added successfully",
      data: newBlog,
    });
  } catch (error) {
    console.error("Error adding Blog:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add blog",
      error: error.message,
    });
  }
};
// Get All Blogs (with search & pagination)
export const getAllBlogs = async (req, res) => {
  try {
    const { search = '', page, limit } = req.query;

    const query = {
      title: { $regex: search, $options: "i" },
    };

    if (page && limit) {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const parsedLimit = parseInt(limit);

      const [blogs, totalCount] = await Promise.all([
        Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit),
        Blog.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        message: "Blogs fetched with pagination",
        data: blogs,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parsedLimit),
        totalCount,
      });
    } else {
      const blogs = await Blog.find(query).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        message: "All Blogs fetched successfully",
        count: blogs.length,
        data: blogs,
      });
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Blogs",
      error: error.message,
    });
  }
};

// Get Blog By ID
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog fetched successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error fetching blog by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog",
      error: error.message,
    });
  }
};

// controllers/blogController.js

// export const getBlogByTitle = async (req, res) => {
//   try {
//     const { title } = req.params;

//     const blog = await Blog.findOne({ title });

//     if (!blog) {
//       return res.status(404).json({
//         success: false,
//         message: "Blog not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Blog fetched successfully",
//       data: blog,
//     });
//   } catch (error) {
//     console.error("Error fetching blog by title:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch blog",
//       error: error.message,
//     });
//   }
// };
export const getBlogByTitle = async (req, res) => {
  try {
    const { title } = req.params;

    // Use a case-insensitive search for the title
    const blog = await Blog.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog fetched successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error fetching blog by title:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blog",
      error: error.message,
    });
  }
};



// Update Blog
// export const updateBlog = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       title,
//       redirectLink,
//       metaTitle,
//       metaDescription,
//       description,
//     } = req.body;

//     if (!title || !redirectLink || !metaTitle || !metaDescription || !description) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     const updates = {
//       title,
//       redirectLink,
//       metaTitle,
//       metaDescription,
//       description,
//     };

//     if (req.files?.['bannerImage']?.[0]) {
//       updates.bannerImage = await uploadSingleFileToBunny(req.files['bannerImage'][0]);
//     }

//     if (req.files?.['thumbnailImage']?.[0]) {
//       updates.thumbnailImage = await uploadSingleFileToBunny(req.files['thumbnailImage'][0]);
//     }

//     const updatedBlog = await Blog.findByIdAndUpdate(id, updates, { new: true });

//     if (!updatedBlog) {
//       return res.status(404).json({
//         success: false,
//         message: "Blog not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Blog updated successfully",
//       data: updatedBlog,
//     });
//   } catch (error) {
//     console.error("Error updating blog:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update blog",
//       error: error.message,
//     });
//   }
// };

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      redirectLink,
      metaTitle,
      metaDescription,
      description,
      faqs, // Fetch FAQs from request body
    } = req.body;

    // Validation for required fields
    if (!title || !redirectLink || !metaTitle || !metaDescription || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Prepare the update object
    const updates = {
      title,
      redirectLink,
      metaTitle,
      metaDescription,
      description,
      faqs: faqs ? JSON.parse(faqs) : [], // Ensure the FAQs are parsed and set if provided
    };

    // Handle file uploads for bannerImage and thumbnailImage
    if (req.files?.['bannerImage']?.[0]) {
      updates.bannerImage = await uploadSingleFileToBunny(req.files['bannerImage'][0]);
    }

    if (req.files?.['thumbnailImage']?.[0]) {
      updates.thumbnailImage = await uploadSingleFileToBunny(req.files['thumbnailImage'][0]);
    }

    // Find and update the blog document
    const updatedBlog = await Blog.findByIdAndUpdate(id, updates, { new: true });

    // If the blog is not found
    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Return success response with updated data
    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: updatedBlog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update blog",
      error: error.message,
    });
  }
};

// Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Blog.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete blog",
      error: error.message,
    });
  }
};
