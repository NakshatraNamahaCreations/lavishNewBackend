import mongoose from "mongoose";


const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true }, // NEW
  mobile: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: "" }, // NEW
  isActive: { type: Boolean, default: false },
  accessTabs: [{ type: String }]
}, { timestamps: true });

export default mongoose.model("Admin", AdminSchema)