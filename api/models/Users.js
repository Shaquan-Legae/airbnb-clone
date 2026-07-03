const mongoose = require("mongoose");
const { Schema } = mongoose;
const UserSchema = new Schema({
  name: String,
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  country: String,
  city: String,
  bio: String,
  profilePhoto: String,
  role: { type: String, enum: ["host", "guest"], default: "guest" },
  hostProfile: {
    fullName: String,
    phone: String,
    country: String,
    city: String,
    governmentId: String,
    bio: String,
    experience: Number,
    emergencyContact: String,
    becameHostAt: Date,
  },
});

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
