import Blog from "../../models/Blogs/Blog.js"
import { uploadSingleFileToBunny } from "../../middleware/multer/fileUploader.js";


export const addBlog = async (req, res) => {
  try {
    const {
      title,
      redirectLink,
      metaTitle,
      metaDescription,
      description,
      faqs,
    } = req.body;

    const bannerFile = req.files?.["bannerImage"]?.[0];
    const thumbFile = req.files?.["thumbnailImage"]?.[0];

    // Basic field validation
    if (!title || !bannerFile || !metaTitle || !metaDescription || !description || !faqs) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Parse and validate FAQs
    let parsedFaqs = [];
    try {
      parsedFaqs = JSON.parse(faqs);
      if (!Array.isArray(parsedFaqs)) throw new Error();
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "FAQs must be a valid JSON array of {question, answer} objects.",
      });
    }

    // Check for duplicate title
    const existing = await Blog.findOne({ title });
    if (existing) {
      return res.status(409).json({ success: false, message: "Title already exists" });
    }

    // Upload files
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
      faqs: parsedFaqs,
    });

    await newBlog.save();

    return res.status(201).json({
      success: true,
      message: "Blog added successfully",
      data: newBlog,
    });
  } catch (error) {
    console.error("Error adding Blog:", error.stack); // full stack trace
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

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      redirectLink,
      metaTitle,
      metaDescription,
      description,
      faqs, 
    } = req.body;

    // ✅ Only validate required fields (redirectLink is optional)
    if (!title || !metaTitle || !metaDescription || !description) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const updates = {
      title,
      redirectLink: redirectLink || "", // optional
      metaTitle,
      metaDescription,
      description,
    };

    // ✅ Safely parse FAQs only if provided
    if (faqs) {
      try {
        const parsedFaqs = JSON.parse(faqs);
        if (!Array.isArray(parsedFaqs)) {
          return res.status(400).json({
            success: false,
            message: "FAQs must be a valid JSON array.",
          });
        }
        updates.faqs = parsedFaqs;
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid FAQs format. Must be JSON.",
        });
      }
    }

    // ✅ Upload new bannerImage if provided
    if (req.files?.["bannerImage"]?.[0]) {
      const bannerUrl = await uploadSingleFileToBunny(req.files["bannerImage"][0]);
      updates.bannerImage = bannerUrl;
    }

    // ✅ Upload new thumbnailImage if provided
    if (req.files?.["thumbnailImage"]?.[0]) {
      const thumbUrl = await uploadSingleFileToBunny(req.files["thumbnailImage"][0]);
      updates.thumbnailImage = thumbUrl;
    }

    // ✅ Update blog by ID
    const updatedBlog = await Blog.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: updatedBlog,
    });
  } catch (error) {
    console.error("Error updating blog:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Failed to update blog",
      error: error.message,
    });
  }
};

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
