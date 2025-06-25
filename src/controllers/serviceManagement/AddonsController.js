import Addons from "../../models/serviceManagement/Addons.js";
import Subcategory from "../../models/category/Subcategory.js";


export const createAddon = async (req, res) => {
  try {
    const {
      subCategory,
      addonsName,
      price,
      samedaydelivery,
      addonsDescription,
      customizedInputs,
      image
    } = req.body;

    // Validate required fields
    if (
      !subCategory ||
      !addonsName ||
      !price ||
      !samedaydelivery ||
      !addonsDescription ||
      !image
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields, including an image.",
      });
    }

    // Parse customizedInputs (expects a JSON stringified array of objects)
    let parsedCustomizedInputs = [];
    try {
      parsedCustomizedInputs = customizedInputs
        ? JSON.parse(customizedInputs)
        : [];

      if (!Array.isArray(parsedCustomizedInputs)) {
        return res.status(400).json({
          success: false,
          message: "customizedInputs must be an array of objects.",
        });
      }

      // Basic validation for required keys in each object
      for (let input of parsedCustomizedInputs) {
        if (
          !input.label ||
          !input.inputType
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Each customized input must include label, inputType, and maxValue.",
          });
        }
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid format for customizedInputs. Must be a valid JSON array.",
      });
    }

    // Check if the subcategory exists
    const subCategoryExists = await Subcategory.findById(subCategory);
    if (!subCategoryExists) {
      return res.status(404).json({ message: "Subcategory not found." });
    }

    // Create the new addon object
    const addon = {
      addonsName,
      image,
      price,
      samedaydelivery,
      addonsDescription,
      customizedInputs: parsedCustomizedInputs,
    };

    // Check if Addons document already exists for the subCategory
    const existingAddons = await Addons.findOne({ subCategory });

    if (existingAddons) {
      existingAddons.addons.push(addon);
      await existingAddons.save();
      return res.status(200).json({
        message: "Addon added successfully.",
        data: existingAddons,
      });
    } else {
      const newAddons = new Addons({
        subCategory,
        addons: [addon],
      });

      await newAddons.save();

      return res.status(201).json({
        message: "Addons created successfully.",
        data: newAddons,
      });
    }
  } catch (error) {
    console.error("Error creating or updating addons:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const updateAddon = async (req, res) => {
  try {
    const { addonId } = req.params;
    const {
      subCategory,
      addonsName,
      price,
      samedaydelivery,
      addonsDescription,
      customizedInputs,
      image
    } = req.body;

    if (
      !addonId ||
      !subCategory ||
      !addonsName ||
      !price ||
      !samedaydelivery ||
      !addonsDescription ||
      !image
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const subCategoryExists = await Subcategory.findById(subCategory);
    if (!subCategoryExists) {
      return res.status(404).json({ message: "Subcategory not found." });
    }

    const addonsDocument = await Addons.findOne({ "addons._id": addonId });
    if (!addonsDocument) {
      return res.status(404).json({ message: "Addon not found." });
    }

    const addon = addonsDocument.addons.id(addonId);
    if (!addon) {
      return res.status(404).json({ message: "Addon not found." });
    }

    let parsedCustomizedInputs = [];
    if (customizedInputs) {
      try {
        parsedCustomizedInputs = JSON.parse(customizedInputs);

        if (!Array.isArray(parsedCustomizedInputs)) {
          return res.status(400).json({
            message: "customizedInputs must be an array of objects.",
          });
        }

        for (let input of parsedCustomizedInputs) {
          if (
            !input.label ||
            !input.inputType ||
            input.maxValue === undefined
          ) {
            return res.status(400).json({
              message:
                "Each customized input must include label, inputType, and maxValue.",
            });
          }
        }
      } catch (err) {
        return res.status(400).json({
          message: "Invalid format for customizedInputs.",
        });
      }
    }

    // Update fields
    addon.addonsName = addonsName;
    addon.price = price;
    addon.samedaydelivery = samedaydelivery;
    addon.addonsDescription = addonsDescription;
    addon.customizedInputs = parsedCustomizedInputs;
    addon.image = image;


    if (addonsDocument.subCategory.toString() !== subCategory) {
      addonsDocument.subCategory = subCategory;
    }

    await addonsDocument.save();

    return res.status(200).json({
      success: true,
      message: "Addon updated successfully.",
      data: addonsDocument,
    });
  } catch (error) {
    console.error("Error updating addon:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update addon.",
      error: error.message,
    });
  }
};

export const deleteAddon = async (req, res) => {
  try {
    const { addonId } = req.params;

    // Validate required fields
    if (!addonId) {
      return res.status(400).json({ message: "Addon ID is required." });
    }

    console.log("Deleting addon with ID:", addonId);

    // Find and remove the addon by its ID
    const updatedAddons = await Addons.findOneAndUpdate(
      { "addons._id": addonId },
      { $pull: { addons: { _id: addonId } } },
      { new: true }
    );

    if (!updatedAddons) {
      console.log("Addon not found in the database.");
      return res.status(404).json({ message: "Addon not found." });
    }

    console.log("Addon deleted successfully:", updatedAddons);
    res
      .status(200)
      .json({ message: "Addon deleted successfully.", data: updatedAddons });
  } catch (error) {
    console.error("Error deleting addon:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

export const getAllAddons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const skip = (page - 1) * limit;

    // Aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: "subcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategoryDoc",
        },
      },
      { $unwind: "$subCategoryDoc" },
      { $unwind: "$addons" },
      {
        $project: {
          _id: "$addons._id",
          addonsName: "$addons.addonsName",
          image: "$addons.image",
          price: "$addons.price",
          addonsDescription: "$addons.addonsDescription",
          samedaydelivery: "$addons.samedaydelivery",
          createdAt: "$addons.createdAt",
          subCategoryId: "$subCategoryDoc._id",
          subCategory: "$subCategoryDoc.subCategory",
          customizedInputs: "$addons.customizedInputs",
        },
      },
    ];

    // Add $match stage if search term exists
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { addonsName: { $regex: search, $options: "i" } },
            { subCategory: { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // Add pagination stages
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    // Count pipeline for total results
    const countPipeline = [...pipeline.filter(stage => !("$skip" in stage) && !("$limit" in stage)), { $count: "totalItems" }];

    const [addons, countResult] = await Promise.all([
      Addons.aggregate(pipeline),
      Addons.aggregate(countPipeline),
    ]);

    const totalItems = countResult[0]?.totalItems || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      message: "Addons fetched successfully.",
      data: addons,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching addons:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};



export const getAddonsBySubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;

    // Validate required fields
    if (!subCategoryId) {
      return res.status(400).json({ message: "Subcategory ID is required." });
    }

    // Find addons for the given subcategory
    const addons = await Addons.findOne({
      subCategory: subCategoryId,
    }).populate("subCategory", "_id subCategory");

    // Check if addons exist for the subcategory
    if (!addons) {
      return res
        .status(404)
        .json({ message: "No addons found for this subcategory." });
    }

    res
      .status(200)
      .json({ message: "Addons fetched successfully.", data: addons });
  } catch (error) {
    console.error("Error fetching addons by subcategory:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

export const getAddonById = async (req, res) => {
  try {
    const { addonId } = req.params;

    // Validate required fields
    if (!addonId) {
      return res.status(400).json({ message: "Addon ID is required." });
    }

    // Find the Addons document containing the addon
    const addonsDocument = await Addons.findOne({
      "addons._id": addonId,
    }).populate("subCategory", "_id subCategory");

    // Check if the Addons document exists
    if (!addonsDocument) {
      return res.status(404).json({ message: "Addon not found." });
    }

    // Find the specific addon within the Addons document
    const addon = addonsDocument.addons.id(addonId);
    if (!addon) {
      return res.status(404).json({ message: "Addon not found." });
    }

    // Include the subcategory details in the response
    const subCategory = addonsDocument.subCategory;

    // Return the addon details along with the subcategory
    res.status(200).json({
      success: true,
      message: "Addon fetched successfully.",
      data: {
        ...addon.toObject(),
        subCategory,
      },
    });
  } catch (error) {
    console.error("Error fetching addon by ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};
