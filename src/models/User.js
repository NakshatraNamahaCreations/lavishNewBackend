import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  mobile: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10-digit mobile number!`
    }
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  alternateMobile: { 
    type: String,
    validate: {
      validator: function(v) {
        return v === '' || /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10-digit mobile number!`
    }
  },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  addressLine1: { type: String, trim: true },
  addressLine2: { type: String, trim: true },
  city: { type: String, trim: true },
  // state: { type: String, trim: true },
  // landmark: { type: String, trim: true },
  pincode: { 
    type: String,
    trim: true,
  },
  // country: { type: String },
  // profileImage: { type: String, },
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
