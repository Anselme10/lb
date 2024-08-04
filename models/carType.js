const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  type: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  heading: { type: Number },
  isActive: { type: Boolean },
  // Define relationships with other models
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
  },
});

const Car = mongoose.model("Car", carSchema);

module.exports = Car;
