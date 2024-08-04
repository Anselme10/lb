const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  type: { type: String, required: true },
  status: { type: String },
  originLatitude: { type: Number, required: true },
  originLongitude: { type: Number, required: true },
  destinationLAtitude: { type: Number, required: true },
  destinationLongitude: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
