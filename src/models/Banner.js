import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema(
  {
    bannerLink: {
      type: String,
    },
    bannerType: {
      type: String,
      required: true,
    },
    bannerImage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Banner = mongoose.model("Banner", BannerSchema);
export default Banner;