import Balloon from "../../models/category/Balloon.js";

export const addBalloon = async (req, res) => {
  try {
    const { balloonColor, qty } = req.body;

    if (!balloonColor || !qty) {
      return res.status(400).json({
        success: false,
        message: "Balloon Color and qty are required",
      });
    }

    const existingBalloon = await Balloon.findOne({
      balloonColor: { $regex: new RegExp(`^${balloonColor}$`, "i") }
    });

    if (existingBalloon) {
      return res.status(400).json({
        success: false,
        message: "This Balloon Color already exists.",
      });
    }
    const newBalloon = new Balloon({
      balloonColor,
      qty,
    });

    await newBalloon.save();

    return res.status(201).json({
      success: true,
      message: "Balloon Added successfully",
      data: newBalloon,
    });
  } catch (error) {
    console.error("Error adding Balloon", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add Balloon",
      error: error.message,
    });
  }
};

export const getAllBalloons = async (req, res) => {
  try {
    const allBalloons = await Balloon.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: allBalloons.length,
      data: allBalloons,
    });
  } catch (error) {
    console.error("Error fetching balloons:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Balloons",
      error: error.message,
    });
  }
};

export const updateBalloon = async (req, res) => {
  try {
    const { id } = req.params;
    const { balloonColor, qty } = req.body;

    if (!balloonColor || !qty) {
      return res.status(400).json({
        success: false,
        message: "Balloon Color and qty are required",
      });
    }

    const updatedBalloon = await Balloon.findByIdAndUpdate(
      id,
      {
        balloonColor,
        qty,
      },
      { new: true }
    );
    if (!updatedBalloon) {
      return res.status(500).json({
        success: false,
        message: "Failed to update Balloon",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Balloon updated successfully",
      data: updatedBalloon,
    });
  } catch (error) {
    console.error("Error updating Balloon:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the Balloon",
      error: error.message,
    });
  }
};

export const deleteBalloon = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBalloon = await Balloon.findByIdAndDelete(id);
    if (!deletedBalloon) {
      return res.status(404).json({
        success: false,
        message: "Balloon Not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Balloon deleted Successfully",
      data: deletedBalloon,
    });
  } catch (error) {
    console.error("Error deleting Balloon:", error);
    return res.status(200).json({
      success: true,
      message: "An error occurred while deleting the Balloon",
      error: error.message,
    });
  }
};
