const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    driver: { type: Boolean },
    rental: { type: Boolean },
    seller: { type: Boolean },
  },
  verified: {
    type: Boolean,
    default: false,
  },
  location: {
    latitude: Number,
    longitude: Number,
  },
  verificationToken: String,
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  saleCars: [{ type: mongoose.Schema.Types.ObjectId, ref: "CarSelling" }],
  rentCars: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rent" }],
  car: { type: mongoose.Schema.Types.ObjectId, ref: "Car" },
});

const Seller = mongoose.model("Seller", sellerSchema);

module.exports = Seller;
