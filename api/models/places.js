const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  photos: [String],

  perks: {
    type: String,
    required = true
  },

  price: {
    type: Number,
    required: true,
  },
  beds: {
    type: Number,
    required: true,
  },
  checkIn: Number,
  checkOut: Number,
  maxGuests: Number,
});

const PlaceModel = mongoose.model("Place", placeSchema);
module.exports = PlaceModel;
