import mongoose from "mongoose";

const BalloonSchema = new mongoose.Schema(
  {
    balloonColor: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    qty: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Balloon = mongoose.models.Balloon || mongoose.model("Balloon", BalloonSchema);

export default Balloon;
