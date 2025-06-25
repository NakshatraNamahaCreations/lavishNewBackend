// import Banner from "../models/Banner.js";

// export const addBanner = async (req, res) => {
//   const { bannerLink, bannerType } = req.body;
//   console.log(bannerLink, bannerType, req.file);

//   if (!bannerType || !req.file) {
//     return res.status(400).json({ message: "Please fill in all fields." });
//   }

//   try {
//     const newBanner = new Banner({
//       bannerLink,
//       bannerType,
//       bannerImage: req.file.filename,
//     });
//     await newBanner.save();

//     return res.status(201).json({
//       message: "Banner created Successfully",
//       data: newBanner,
//     });
//   } catch (error) {
//     console.error("Error in adding banner:", error);
//     res.status(500).json({
//       message: "Internal server error.",
//       error: error.message,
//     });
//   }
// };

// export const getBanners = async (req, res) => {
//   try {
//     const banners = await Banner.find().sort({ createdAt: -1 });
//     return res.status(200).json({
//       message: "Banners retrieved successfully",
//       data: banners,
//     });
//   } catch (error) {
//     console.error("Error in getting banners:", error);
//     res.status(500).json({
//       message: "Internal server error.",
//       error: error.message,
//     });
//   }
// };


// export const updateBanner = async (req, res) => {
//   const { id } = req.params;
//   const { bannerLink, bannerType } = req.body;

//   console.log("Body:", req.body);
//   console.log("File:", req.file);


//   if (!bannerType) {
//     return res
//       .status(400)
//       .json({ message: "Please fill in all required fields." });
//   }

//   try {
//     const updateData = {
//       bannerLink,
//       bannerType,
//     };

//     if (req.file) {
//       updateData.bannerImage = req.file.filename;
//     }

//     const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, {
//       new: true,
//     });

//     if (!updatedBanner) {
//       return res.status(404).json({ message: "Banner not found." });
//     }

//     return res.status(200).json({
//       message: "Banner updated successfully",
//       data: updatedBanner,
//     });
//   } catch (error) {
//     console.error("Error updating banner:", error.message);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };


// export const deleteBanner = async (req, res) => {
//   const { id } = req.params;

//   try {
//     // Delete the banner using its ID
//     const banner = await Banner.findByIdAndDelete(id);

//     // If no banner is found with the provided ID
//     if (!banner) {
//       return res.status(404).json({ message: "Banner not found" });
//     }

//     // Return success response
//     return res.status(200).json({
//       message: "Banner deleted successfully",
//       data: banner,
//     });
//   } catch (error) {
//     console.error("Error in deleting banner:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };



import Banner from "../models/Banner.js";

export const addBanner = async (req, res) => {
  const { bannerLink, bannerType, bannerImage } = req.body;
  
  // Validate required fields
  if (!bannerType) {
    return res.status(400).json({ message: "Banner type is required." });
  }

  if (!bannerImage) {
    return res.status(400).json({ message: "Banner image link is required." });
  }

  try {
    const newBanner = new Banner({
      bannerLink: bannerLink || "",
      bannerType,
      bannerImage
    });
    
    await newBanner.save();

    return res.status(201).json({
      message: "Banner created successfully",
      data: newBanner,
    });
  } catch (error) {
    console.error("Error in adding banner:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Banners retrieved successfully",
      data: banners,
    });
  } catch (error) {
    console.error("Error in getting banners:", error);
    res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};


export const updateBanner = async (req, res) => {
  const { id } = req.params;
  const { bannerLink, bannerType, bannerImage } = req.body;

  // Validate required fields
  if (!bannerType) {
    return res.status(400).json({ message: "Banner type is required." });
  }

  if (!bannerImage) {
    return res.status(400).json({ message: "Banner image link is required." });
  }

  try {
    const updateData = {
      bannerLink: bannerLink || "",
      bannerType,
      bannerImage
    };

    const updatedBanner = await Banner.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedBanner) {
      return res.status(404).json({ message: "Banner not found." });
    }

    return res.status(200).json({
      message: "Banner updated successfully",
      data: updatedBanner,
    });
  } catch (error) {
    console.error("Error updating banner:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const deleteBanner = async (req, res) => {
  const { id } = req.params;

  try {
    // Delete the banner using its ID
    const banner = await Banner.findByIdAndDelete(id);

    // If no banner is found with the provided ID
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    // Return success response
    return res.status(200).json({
      message: "Banner deleted successfully",
      data: banner,
    });
  } catch (error) {
    console.error("Error in deleting banner:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
