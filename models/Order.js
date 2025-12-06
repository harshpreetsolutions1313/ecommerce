const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: Number, required: true, unique: true },
  buyer: { type: String, required: true },
  productId: { type: String, required: true },
  amount: { type: Number, required: true },
  paid: { type: Boolean, default: false },
  token: { type: String, required: true }, // "USDT" or "USDC"
});

module.exports = mongoose.model('Order', orderSchema);