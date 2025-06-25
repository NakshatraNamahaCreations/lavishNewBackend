import Coupon from "../../models/serviceManagement/Coupons.js";

export const createCoupon = async (req, res) => {
  try {
    const {
      couponName,
      discount,
      couponCode,
      couponDetails,
      startDate,
      // endDate, // Optional
    } = req.body;

    // Basic validation
    if (!couponName || discount === undefined || !couponCode || !startDate) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled." });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ couponCode });
    if (existingCoupon) {
      return res.status(409).json({ message: "Coupon code already exists." });
    }

    // Create new coupon — isActive will default to true as per schema
    const newCoupon = new Coupon({
      couponName,
      discount,
      couponCode,
      couponDetails,
      startDate: new Date(startDate),
      // ...(endDate && { endDate: new Date(endDate) }), 
    });

    await newCoupon.save();

    return res
      .status(201)
      .json({ message: "Coupon created successfully.", coupon: newCoupon });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body }; // Clone to avoid mutation

    // Validate and convert startDate if provided
    if (updateData.startDate) {
      const parsedStartDate = new Date(updateData.startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({ message: "Invalid start date." });
      }
      updateData.startDate = parsedStartDate;
    }

    // Validate and convert endDate if provided
    // if (updateData.endDate) {
    //   const parsedEndDate = new Date(updateData.endDate);
    //   if (isNaN(parsedEndDate.getTime())) {
    //     return res.status(400).json({ message: "Invalid end date." });
    //   }
    //   updateData.endDate = parsedEndDate;
    // } else {
    //   delete updateData.endDate; // Ensure it's not passed as undefined
    // }

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCoupon) {
      return res.status(404).json({ message: "Coupon not found." });
    }

    return res.status(200).json({
      message: "Coupon updated successfully.",
      coupon: updatedCoupon,
    });
  } catch (error) {
    console.error("Error updating coupon:", error.message);
    console.error("Stack Trace:", error.stack);
    return res.status(500).json({ message: "Internal server error." });
  }
};


export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCoupon = await Coupon.findByIdAndDelete(id);

    if (!deletedCoupon) {
      return res.status(404).json({ message: "Coupon not found." });
    }

    return res.status(200).json({ message: "Coupon deleted successfully." });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getcoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }); // Most recent first
    return res.status(200).json(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getcouponswithPagination = async (req, res) => {
  try {
    // Default values for page and limit
    const { page = 1, limit = 5 } = req.query; 

    const skip = (page - 1) * limit;

    // Fetch the coupons and total count in parallel
    const [coupons, total] = await Promise.all([
      Coupon.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)), // Fetching coupons
      Coupon.countDocuments(), // Counting total coupons
    ]);

    return res.status(200).json({
      total, // Total number of coupons in the database
      page: Number(page), // Current page
      pageSize: coupons.length, // Number of coupons fetched for the current page
      totalPages: Math.ceil(total / limit), // Total number of pages
      coupons, // Coupons data for the current page
    });
  } catch (error) {
    console.error("Error fetching paginated coupons:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
