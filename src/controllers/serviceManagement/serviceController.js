import Service from "../../models/serviceManagement/Service.js";
import Subcategory from "../../models/category/Subcategory.js";
import Subsubcategory from "../../models/category/Subsubcategory.js";
import Theme from "../../models/category/Theme.js";

export const createService = async (req, res) => {
  try {
    const {
      serviceName,
      categoryId,
      subCategoryId,
      subSubCategoryId,
      themeId,
      packageDetails,
      requiredDetails,
      customizedInputs,
      balloonColors,
      originalPrice,
      offerPrice,
      images,
      caption,
      metaTitle,
      metaDescription,
      keywords,
      faqs,
    } = req.body;

    if (
      !serviceName ||
      !categoryId ||
      !subCategoryId ||
      !packageDetails ||
      !originalPrice ||
      !offerPrice ||
      !balloonColors ||
      !images
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Parse customizedInputs
    let parsedCustomizedInputs = [];
    try {
      parsedCustomizedInputs = customizedInputs
        ? JSON.parse(customizedInputs)
        : [];
      if (!Array.isArray(parsedCustomizedInputs)) throw new Error();
      for (const input of parsedCustomizedInputs) {
        if (!input.label || !input.inputType) {
          return res.status(400).json({
            success: false,
            message: "Each customized input must include label and inputType.",
          });
        }
      }
    } catch {
      return res
        .status(400)
        .json({ success: false, message: "Invalid customizedInputs format." });
    }

    // Parse balloonColors and images
    const parsedBalloonColors = JSON.parse(balloonColors);
    const parsedImages = JSON.parse(images);

    // Parse faqs
    let parsedFaqs = [];
    try {
      parsedFaqs = faqs ? JSON.parse(faqs) : [];
      if (!Array.isArray(parsedFaqs)) parsedFaqs = [];
    } catch {
      parsedFaqs = [];
    }

    const newService = new Service({
      serviceName,
      categoryId,
      subCategoryId,
      subSubCategoryId: subSubCategoryId || null,
      themeId: themeId || null,
      packageDetails,
      requiredDetails,
      customizedInputs: parsedCustomizedInputs,
      balloonColors: parsedBalloonColors,
      originalPrice: Number(originalPrice),
      offerPrice: Number(offerPrice),
      images: parsedImages,
      caption: caption || "",
      metaTitle: metaTitle || "",
      metaDescription: metaDescription || "",
      keywords: keywords || "",
      faqs: parsedFaqs,
    });

    await newService.save();

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: newService,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create service",
      error: error.message,
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const existingService = await Service.findById(serviceId);
    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const {
      serviceName,
      categoryId,
      subCategoryId,
      subSubCategoryId,
      themeId,
      packageDetails,
      requiredDetails,
      customizedInputs,
      balloonColors,
      originalPrice,
      offerPrice,
      images,
      caption,
      metaTitle,
      metaDescription,
      keywords,
      faqs,
    } = req.body;

    if (
      !serviceName ||
      !categoryId ||
      !subCategoryId ||
      !packageDetails ||
      !originalPrice ||
      !offerPrice ||
      !balloonColors ||
      !images
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Parse inputs only if they are strings
    let parsedCustomizedInputs = [];
    try {
      parsedCustomizedInputs = Array.isArray(customizedInputs)
        ? customizedInputs
        : customizedInputs
        ? JSON.parse(customizedInputs)
        : [];

      for (const input of parsedCustomizedInputs) {
        if (!input.label || !input.inputType) {
          return res.status(400).json({
            success: false,
            message: "Each customized input must include label and inputType.",
          });
        }
      }
    } catch {
      return res
        .status(400)
        .json({ success: false, message: "Invalid customizedInputs format." });
    }

    let parsedBalloonColors = [];
    let parsedImages = [];
    try {
      parsedBalloonColors = Array.isArray(balloonColors)
        ? balloonColors
        : JSON.parse(balloonColors);
      parsedImages = Array.isArray(images) ? images : JSON.parse(images);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid format for balloonColors or images.",
      });
    }

    let parsedFaqs = [];
    try {
      parsedFaqs = Array.isArray(faqs) ? faqs : faqs ? JSON.parse(faqs) : [];
    } catch {
      parsedFaqs = [];
    }

    // Update fields
    existingService.serviceName = serviceName;
    existingService.categoryId = categoryId;
    existingService.subCategoryId = subCategoryId;
    existingService.subSubCategoryId = subSubCategoryId || null;
    existingService.themeId = themeId || null;
    existingService.packageDetails = packageDetails;
    existingService.requiredDetails = requiredDetails;
    existingService.customizedInputs = parsedCustomizedInputs;
    existingService.balloonColors = parsedBalloonColors;
    existingService.originalPrice = Number(originalPrice);
    existingService.offerPrice = Number(offerPrice);
    existingService.images = parsedImages;
    existingService.caption = caption || "";
    existingService.metaTitle = metaTitle || "";
    existingService.metaDescription = metaDescription || "";
    existingService.keywords = keywords || "";
    existingService.faqs = parsedFaqs;

    await existingService.save();

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: existingService,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update service",
      error: error.message,
    });
  }
};

export const getAllService = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;

    const query = {};

    if (search) {
      query.serviceName = { $regex: search, $options: "i" };
    }

    const services = await Service.find(query)
      .select(
        "serviceName offerPrice rating images categoryId subCategoryId subSubCategoryId themeId createdAt"
      )
      .populate({ path: "categoryId", select: "category" })
      .populate({ path: "subCategoryId", select: "subCategory" })
      .populate({ path: "subSubCategoryId", select: "subSubCategory" })
      .populate({ path: "themeId", select: "theme" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Service.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: services.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch services",
      error: error.message,
    });
  }
};

// export const getAllService = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page);
//     const limit = parseInt(req.query.limit);
//     const skip = (page - 1) * limit;

//     const { search } = req.query;

//     // Build the match filter for search
//     const matchFilter = {};
//     if (search) {
//       matchFilter.$or = [
//         { serviceName: { $regex: search, $options: "i" } },
//         { "categoryId.category": { $regex: search, $options: "i" } },
//         { "subCategoryId.subCategory": { $regex: search, $options: "i" } },
//         {
//           "subSubCategoryId.subSubCategory": { $regex: search, $options: "i" },
//         },
//         { "themeId.theme": { $regex: search, $options: "i" } },
//       ];
//     }

//     // Base aggregation pipeline
//     const basePipeline = [
//       // Lookup for category
//       {
//         $lookup: {
//           from: "categories",
//           localField: "categoryId",
//           foreignField: "_id",
//           as: "categoryId",
//         },
//       },
//       { $unwind: { path: "$categoryId", preserveNullAndEmptyArrays: true } },

//       // Lookup for subCategory
//       {
//         $lookup: {
//           from: "subcategories",
//           localField: "subCategoryId",
//           foreignField: "_id",
//           as: "subCategoryId",
//         },
//       },
//       { $unwind: { path: "$subCategoryId", preserveNullAndEmptyArrays: true } },

//       // Lookup for subSubCategory
//       {
//         $lookup: {
//           from: "subsubcategories",
//           localField: "subSubCategoryId",
//           foreignField: "_id",
//           as: "subSubCategoryId",
//         },
//       },
//       {
//         $unwind: {
//           path: "$subSubCategoryId",
//           preserveNullAndEmptyArrays: true,
//         },
//       },

//       // Lookup for theme
//       {
//         $lookup: {
//           from: "themes",
//           localField: "themeId",
//           foreignField: "_id",
//           as: "themeId",
//         },
//       },
//       { $unwind: { path: "$themeId", preserveNullAndEmptyArrays: true } },

//       // Apply search filter
//       { $match: matchFilter },

//       // Sort by createdAt
//       { $sort: { createdAt: -1 } },
//     ];

//     let services, total, totalPages;

//     if (page && limit) {
//       // ✅ Paginated query
//       services = await Service.aggregate([
//         ...basePipeline,
//         { $skip: skip },
//         { $limit: limit },
//       ]);

//       const totalDocs = await Service.aggregate([
//         ...basePipeline,
//         { $count: "total" },
//       ]);
//       total = totalDocs.length > 0 ? totalDocs[0].total : 0;
//       totalPages = Math.ceil(total / limit);
//     } else {
//       // ✅ Fetch all services
//       services = await Service.aggregate(basePipeline);
//       total = services.length;
//       totalPages = 1;
//     }

//     return res.status(200).json({
//       success: true,
//       count: services.length,
//       total,
//       page: page || 1,
//       totalPages,
//       data: services,
//     });
//   } catch (error) {
//     console.error("Error fetching services:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch services",
//       error: error.message,
//     });
//   }
// };

export const getServiceById = async (req, res) => {
  try {
    const { serviceId } = req.params;
    // console.log("Fetching service with ID:", serviceId);

    const service = await Service.findById(serviceId)
      .populate("categoryId", "category ")
      .populate(
        "subCategoryId",
        "subCategory keywords caption metaTitle metaDescription faqs subCategory createdAt "
      )
      .populate(
        "subSubCategoryId",
        "subSubCategory keywords caption metaTitle metaDescription faqs subCategory createdAt "
      )
      .populate(
        "themeId",
        "theme keywords caption metaTitle metaDescription faqs subCategory createdAt "
      );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("Error fetching service by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch service",
      error: error.message,
    });
  }
};

export const getServiceCount = async (req, res) => {
  try {
    const totalCount = await Service.countDocuments();
    console.log("Total number of documents:", totalCount);
    return res.status(200).json({
      success: true,
      count: totalCount,
    });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch service Count",
      error: error.message,
    });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Find and delete the service
    const service = await Service.findByIdAndDelete(serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete service",
      error: error.message,
    });
  }
};

export const getServicesByCategoryOrTheme = async (req, res) => {
  try {
    const { id } = req.params; 
    let { page = 1, limit = 12 } = req.query; // Extract page & limit from query, defaults if not passed

    page = parseInt(page);
    limit = parseInt(limit);

    // Build query
    const query = {
      $or: [{ subCategoryId: id }, { subSubCategoryId: id }, { themeId: id }],
    };

    // Count total services for pagination
    const totalServices = await Service.countDocuments(query);

    // Fetch services with pagination
    const services = await Service.find(query)
      .populate("categoryId", "category")
      .populate(
        "subCategoryId",
        "subCategory keywords caption metaTitle metaDescription faqs createdAt"
      )
      .populate(
        "subSubCategoryId",
        "subSubCategory keywords caption metaTitle metaDescription faqs createdAt"
      )
      .populate(
        "themeId",
        "theme keywords caption metaTitle metaDescription faqs createdAt"
      )
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }); // optional: newest first

    if (!services || services.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        page,
        totalPages: 0,
        totalServices: 0,
      });
    }

    return res.status(200).json({
      success: true,
      data: services,
      page,
      totalPages: Math.ceil(totalServices / limit),
      totalServices,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch services.",
      error: error.message,
    });
  }
};

export const getServicesBySubCategory = async (req, res) => {
  try {
    const { subCategoryName } = req.params; // Get subcategory name from URL
    const { page = 1, limit = 10 } = req.query; // Default: page 1, 10 per page

    console.log(
      `➡️ Fetching services for subcategory: ${subCategoryName}, Page: ${page}, Limit: ${limit}`
    );

    // Step 1: Find the subcategory by name (case-insensitive)
    const subCategory = await Subcategory.findOne({
      subCategory: { $regex: new RegExp(`^${subCategoryName}$`, "i") },
    });

    if (!subCategory) {
      console.warn(`❌ Subcategory '${subCategoryName}' not found.`);
      return res.status(404).json({
        success: false,
        message: `Subcategory '${subCategoryName}' not found.`,
      });
    }

    console.log(`✅ Found Subcategory ID: ${subCategory._id}`);

    // Step 2: Count total services for pagination
    const totalServices = await Service.countDocuments({
      subCategoryId: subCategory._id,
    });

    // Step 3: Fetch services with pagination
    const services = await Service.find({
      subCategoryId: subCategory._id,
    })
      .populate("categoryId", "category")
      .populate("subCategoryId", "subCategory")
      .populate("subSubCategoryId", "subSubCategory")
      .populate("themeId", "theme")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    if (!services.length) {
      console.warn(
        `❌ No services found under '${subCategoryName}' on page ${page}.`
      );
      return res.status(404).json({
        success: false,
        message: `No services found for '${subCategoryName}' subcategory on page ${page}.`,
      });
    }

    console.log(`✅ Found ${services.length} service(s) on page ${page}`);

    return res.status(200).json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      totalServices,
      totalPages: Math.ceil(totalServices / limit),
      data: services,
    });
  } catch (error) {
    console.error(
      `🔥 Error fetching services for '${req.params.subCategoryName}':`,
      error
    );
    return res.status(500).json({
      success: false,
      message: "Failed to fetch services.",
      error: error.message,
    });
  }
};

export const getServiceBySearchValue = async (req, res) => {
  try {
    const { searchValue } = req.params;

    if (!searchValue) {
      return res.status(400).json({
        success: false,
        message: "Search value is required",
      });
    }

    const regex = new RegExp(searchValue, "i");

    const services = await Service.find({
      serviceName: { $regex: regex },
    }).limit(6);

    if (!services.length) {
      return res.status(404).json({
        success: false,
        message: `No services found matching "${searchValue}"`,
      });
    }

    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error(`Search error:`, error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const findServicesByDynamicId = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Default pagination values
    const limit = parseInt(req.query.limit) || 10; // default 10 per page
    const page = parseInt(req.query.page) || 1;    // default page 1
    const skip = (page - 1) * limit;

    if (!id) {
      return res.status(400).json({ success: false, message: "ID is required" });
    }

    // ✅ Fetch services with pagination
    const [services, total] = await Promise.all([
      Service.find({
        $or: [
          { subCategoryId: id },
          { subSubCategoryId: id },
          { themeId: id },
        ],
      })
        .populate("categoryId", "name")
        .populate("subCategoryId", "subCategory")
        .populate("subSubCategoryId", "subSubCategory")
        .populate("themeId", "theme")
        .skip(skip)
        .limit(limit)
        .lean(),
      Service.countDocuments({
        $or: [
          { subCategoryId: id },
          { subSubCategoryId: id },
          { themeId: id },
        ],
      }),
    ]);

    if (!services.length) {
      return res.status(404).json({
        success: false,
        message: "No services found for given ID",
      });
    }

    return res.json({
      success: true,
      count: services.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: services,
    });
  } catch (err) {
    console.error("Error fetching services:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
