const mongoose = require("mongoose");

// Define the schema
const carSellingSchema = new mongoose.Schema({
  make: String,
  model: String,
  type: String,
  transmission: String,
  carImage: String,
  price: Number,
  mileage: Number,
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
});

// Create the model
const CarSelling = mongoose.model("CarSelling", carSellingSchema);

module.exports = CarSelling;
