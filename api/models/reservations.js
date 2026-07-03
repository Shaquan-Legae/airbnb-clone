const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "rejected"],
      default: "pending",
    },
    pricing: {
      nightlyPrice: Number,
      nights: Number,
      subtotal: Number,
      weeklyDiscount: Number,
      cleaningFee: Number,
      serviceFee: Number,
      taxes: Number,
      total: Number,
    },
  },
  { timestamps: true },
);

const ReservationModel = mongoose.model("Reservation", reservationSchema);
module.exports = ReservationModel;
