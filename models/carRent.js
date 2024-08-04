const mongoose = require("mongoose");

// Define the schema
const RentSchema = new mongoose.Schema({
  brand: String,
  model: String,
  type: String,
  transmission: String,
  carImage: String,
  pricePerDay: Number,
  description: String,
  properties: {
    motor_power_hp: Number,
    fuel_type: String,
    engine_capacity_cc: Number,
    traction: String,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Create the model
const Rent = mongoose.model("Rent", RentSchema);

module.exports = Rent;
