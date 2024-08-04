const mongoose = require("mongoose");

const RentOrderSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
});

const RentOrder = mongoose.model("RentOrder", RentOrderSchema);

module.exports = RentOrder;
