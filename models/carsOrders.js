const mongoose = require("mongoose");

const carsOrderSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
});

const CarOrder = mongoose.model("CarOrder", carsOrderSchema);

module.exports = CarOrder;
