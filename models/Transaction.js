const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  type: { type: String, enum: ["earn", "redeem"], required: true },
  amount: { type: Number, default: 0 }, // purchase amount
  points: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", transactionSchema);
