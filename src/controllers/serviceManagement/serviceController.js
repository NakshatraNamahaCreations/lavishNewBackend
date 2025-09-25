import Service from "../../models/serviceManagement/Service.js";
import Subcategory from "../../models/category/Subcategory.js";
import SubSubCategory from "../../models/category/Subsubcategory.js";

// export const createService = async (req, res) => {
//   console.log("req.body", req.body);
//   try {
//     const {
//       serviceName,
//       categoryId,
//       subCategoryId,
//       subSubCategoryId,
//       themeId,
//       packageDetails,
//       requiredDetails,
//       customizedInputs,
//       balloonColors,
//       originalPrice,
//       offerPrice,
//       images,
//     } = req.body;

//     if (
//       !serviceName ||
//       !categoryId ||
//       !subCategoryId ||
//       !packageDetails ||
//       !originalPrice ||
//       !offerPrice ||
//       !balloonColors ||
//       !images
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide all required fields",
//       });
//     }

//     // Parse inputs
//     let parsedCustomizedInputs = [];
//     try {
//       parsedCustomizedInputs = customizedInputs ? JSON.parse(customizedInputs) : [];

//       if (!Array.isArray(parsedCustomizedInputs)) {
//         return res.status(400).json({
//           success: false,
//           message: "customizedInputs must be an array of objects.",
//         });
//       }

//       for (const input of parsedCustomizedInputs) {
//         if (!input.label || !input.inputType) {
//           return res.status(400).json({
//             success: false,
//             message: "Each customized input must include label and inputType.",
//           });
//         }
//       }
//     } catch (error) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid customizedInputs format.",
//       });
//     }

//     const parsedBalloonColors = JSON.parse(balloonColors);
//     const parsedImages = JSON.parse(images);

//     // const imagePaths = req.files.map((file) => file.filename);

//     const newService = new Service({
//       serviceName,
//       categoryId,
//       subCategoryId,
//       subSubCategoryId: subSubCategoryId || null,
//       themeId: themeId || null,
//       packageDetails,
//       requiredDetails,
//       customizedInputs: parsedCustomizedInputs,
//       balloonColors: parsedBalloonColors,
//       originalPrice: Number(originalPrice),
//       offerPrice: Number(offerPrice),
//       images: parsedImages,
//     });

//     await newService.save();

//     return res.status(201).json({
//       success: true,
//       message: "Service created successfully",
//       data: newService,
//     });
//   } catch (error) {
//     console.error("Error creating service:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to create service",
//       error: error.message,
//     });
//   }
// };


// export const updateService = async (req, res) => {
//   try {
//     const { serviceId } = req.params;

//     const {
//       serviceName,
//       categoryId,
//       subCategoryId,
//       subSubCategoryId,
//       themeId,
//       packageDetails,
//       requiredDetails,
//       customizedInputs,
//       balloonColors,
//       originalPrice,
//       offerPrice,
//       images
//     } = req.body;

//     const service = await Service.findById(serviceId);
//     if (!service) {
//       return res.status(404).json({
//         success: false,
//         message: "Service not found",
//       });
//     }

//     // Safe parse: customizedInputs
//     let parsedCustomizedInputs = [];
//     if (customizedInputs) {
//       try {
//         parsedCustomizedInputs = typeof customizedInputs === "string"
//           ? JSON.parse(customizedInputs)
//           : customizedInputs;

//         if (!Array.isArray(parsedCustomizedInputs)) {
//           return res.status(400).json({
//             success: false,
//             message: "customizedInputs must be an array of objects.",
//           });
//         }

//         for (const input of parsedCustomizedInputs) {
//           if (!input.label || !input.inputType) {
//             return res.status(400).json({
//               success: false,
//               message: "Each customized input must include label and inputType.",
//             });
//           }
//         }
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid customizedInputs format.",
//         });
//       }
//     } else {
//       parsedCustomizedInputs = service.customizedInputs;
//     }

//     // Safe parse: balloonColors
//     let parsedBalloonColors = [];
//     if (balloonColors) {
//       try {
//         parsedBalloonColors = typeof balloonColors === "string"
//           ? JSON.parse(balloonColors)
//           : balloonColors;
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid balloonColors format.",
//         });
//       }
//     } else {
//       parsedBalloonColors = service.balloonColors;
//     }

//     // Safe parse: images
//     let parsedImages = [];
//     if (images) {
//       try {
//         parsedImages = typeof images === "string"
//           ? JSON.parse(images)
//           : images;
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid images format.",
//         });
//       }
//     } else {
//       parsedImages = service.images;
//     }

//     // Update all fields
//     service.serviceName = serviceName || service.serviceName;
//     service.categoryId = categoryId || service.categoryId;
//     service.subCategoryId = subCategoryId || service.subCategoryId;
//     service.subSubCategoryId = subSubCategoryId || null;
//     service.themeId = themeId || null;
//     service.packageDetails = packageDetails || service.packageDetails;
//     service.requiredDetails = requiredDetails || service.requiredDetails;
//     service.customizedInputs = parsedCustomizedInputs;
//     service.balloonColors = parsedBalloonColors;
//     service.originalPrice = originalPrice || service.originalPrice;
//     service.offerPrice = offerPrice || service.offerPrice;
//     service.images = parsedImages;

//     await service.save();

//     return res.status(200).json({
//       success: true,
//       message: "Service updated successfully",
//       data: service,
//     });
//   } catch (error) {
//     console.error("Error updating service:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update service",
//       error: error.message,
//     });
//   }
// };


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
      parsedCustomizedInputs = customizedInputs ? JSON.parse(customizedInputs) : [];
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
      return res.status(400).json({ success: false, message: "Invalid customizedInputs format." });
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
      return res.status(400).json({ success: false, message: "Invalid customizedInputs format." });
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



// export const getAllService = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const { search } = req.query;

//     // Build the match filter for search
//     const matchFilter = {};
//     if (search) {
//       matchFilter.$or = [
//         { serviceName: { $regex: search, $options: "i" } }, // Case-insensitive search for serviceName
//         { "categoryId.category": { $regex: search, $options: "i" } }, // Case-insensitive search for category name
//         { "subCategoryId.subCategory": { $regex: search, $options: "i" } }, // Case-insensitive search for subCategory name
//         {
//           "subSubCategoryId.subSubCategory": { $regex: search, $options: "i" },
//         }, // Case-insensitive search for subSubCategory name
//         { "themeId.theme": { $regex: search, $options: "i" } }, // Case-insensitive search for theme name
//       ];
//     }

//     // Use aggregation to join related collections and apply filters
//     const services = await Service.aggregate([
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

//       // Match filter for search
//       { $match: matchFilter },

//       // Sort by createdAt
//       { $sort: { createdAt: -1 } },

//       // Pagination
//       { $skip: skip },
//       { $limit: limit },
//     ]);

//     // Count total services matching the filter
//     const totalServices = await Service.aggregate([
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

//       // Match filter for search
//       { $match: matchFilter },

//       // Count documents
//       { $count: "total" },
//     ]);

//     const total = totalServices.length > 0 ? totalServices[0].total : 0;

//     return res.status(200).json({
//       success: true,
//       count: services.length,
//       total,
//       page,
//       totalPages: Math.ceil(total / limit),
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

export const getAllService = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;

    const { search } = req.query;

    // Build the match filter for search
    const matchFilter = {};
    if (search) {
      matchFilter.$or = [
        { serviceName: { $regex: search, $options: "i" } },
        { "categoryId.category": { $regex: search, $options: "i" } },
        { "subCategoryId.subCategory": { $regex: search, $options: "i" } },
        { "subSubCategoryId.subSubCategory": { $regex: search, $options: "i" } },
        { "themeId.theme": { $regex: search, $options: "i" } },
      ];
    }

    // Base aggregation pipeline
    const basePipeline = [
      // Lookup for category
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryId",
        },
      },
      { $unwind: { path: "$categoryId", preserveNullAndEmptyArrays: true } },

      // Lookup for subCategory
      {
        $lookup: {
          from: "subcategories",
          localField: "subCategoryId",
          foreignField: "_id",
          as: "subCategoryId",
        },
      },
      { $unwind: { path: "$subCategoryId", preserveNullAndEmptyArrays: true } },

      // Lookup for subSubCategory
      {
        $lookup: {
          from: "subsubcategories",
          localField: "subSubCategoryId",
          foreignField: "_id",
          as: "subSubCategoryId",
        },
      },
      {
        $unwind: { path: "$subSubCategoryId", preserveNullAndEmptyArrays: true },
      },

      // Lookup for theme
      {
        $lookup: {
          from: "themes",
          localField: "themeId",
          foreignField: "_id",
          as: "themeId",
        },
      },
      { $unwind: { path: "$themeId", preserveNullAndEmptyArrays: true } },

      // Apply search filter
      { $match: matchFilter },

      // Sort by createdAt
      { $sort: { createdAt: -1 } },
    ];

    let services, total, totalPages;

    if (page && limit) {
      // ✅ Paginated query
      services = await Service.aggregate([
        ...basePipeline,
        { $skip: skip },
        { $limit: limit },
      ]);

      const totalDocs = await Service.aggregate([
        ...basePipeline,
        { $count: "total" },
      ]);
      total = totalDocs.length > 0 ? totalDocs[0].total : 0;
      totalPages = Math.ceil(total / limit);
    } else {
      // ✅ Fetch all services
      services = await Service.aggregate(basePipeline);
      total = services.length;
      totalPages = 1;
    }

    return res.status(200).json({
      success: true,
      count: services.length,
      total,
      page: page || 1,
      totalPages,
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

export const getServiceById = async (req, res) => {
  try {
    const { serviceId } = req.params;
    // console.log("Fetching service with ID:", serviceId);

    const service = await Service.findById(serviceId)
      .populate("categoryId", "category ")
      .populate("subCategoryId", "subCategory keywords caption metaTitle metaDescription faqs subCategory createdAt ")
      .populate("subSubCategoryId", "subSubCategory keywords caption metaTitle metaDescription faqs subCategory createdAt ")
      .populate("themeId", "theme keywords caption metaTitle metaDescription faqs subCategory createdAt ");

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
      count: totalCount
    })
  } catch (error) {
    console.log("Error", error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch service Count",
      error: error.message,
    });
  }
}


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

// Controller to get services by subCategoryId, subSubCategoryId, or themeId
// export const getServicesByCategoryOrTheme = async (req, res) => {
//   try {
//     const { id } = req.params;  // Extract the ID from URL params

//     // Find services where the `id` matches either subCategoryId, subSubCategoryId, or themeId
//     const services = await Service.find({
//       $or: [
//         { subCategoryId: id },        // Check for subCategoryId match
//         { subSubCategoryId: id },     // Check for subSubCategoryId match
//         { themeId: id },              // Check for themeId match
//       ]
//     }).populate("categoryId", "category",)  // Optionally populate category field
//       .populate("subCategoryId", "subCategory keywords caption metaTitle metaDescription faqs createdAt")  // Optionally populate subCategory field
//       .populate("subSubCategoryId", "subSubCategory keywords caption metaTitle metaDescription faqs createdAt")  // Optionally populate subSubCategory field
//       .populate("themeId", "theme keywords caption metaTitle metaDescription faqs createdAt");  // Optionally populate theme field

//     if (!services || services.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No services found for this ID."
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: services  // Return all matched services
//     });
//   } catch (error) {
//     console.error("Error fetching services:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch services.",
//       error: error.message,
//     });
//   }
// };

export const getServicesByCategoryOrTheme = async (req, res) => {
  try {
    const { id } = req.params; // Extract the ID from URL params
    let { page = 1, limit = 12 } = req.query; // Extract page & limit from query, defaults if not passed

    page = parseInt(page);
    limit = parseInt(limit);

    // Build query
    const query = {
      $or: [
        { subCategoryId: id },
        { subSubCategoryId: id },
        { themeId: id },
      ],
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
      return res.status(404).json({
        success: false,
        message: "No services found for this ID.",
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

    console.log(`➡️ Fetching services for subcategory: ${subCategoryName}, Page: ${page}, Limit: ${limit}`);

    // Step 1: Find the subcategory by name (case-insensitive)
    const subCategory = await Subcategory.findOne({
      subCategory: { $regex: new RegExp(`^${subCategoryName}$`, "i") }
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
      console.warn(`❌ No services found under '${subCategoryName}' on page ${page}.`);
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
    console.error(`🔥 Error fetching services for '${req.params.subCategoryName}':`, error);
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

    const services = await Service.find({ serviceName: { $regex: regex } })
      .limit(6)

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







