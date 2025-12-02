const Order = require('../models/Order');
const contract = require('../utils/contract');
const { ethers } = require('ethers');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { buyer, productId, amount, token } = req.body;
    
    const tx = await contract.createOrder(buyer, productId, ethers.parseUnits(amount.toString(), 18));

    await tx.wait();

    const order = new Order({ orderId: tx.events[0].args.orderId.toNumber(), buyer, productId, amount, token });

    await order.save();

    res.json({ orderId: tx.events[0].args.orderId.toNumber() });

  } catch (error) {

    res.status(500).json({ error: error.message });
    
  } 
};

// Pay for an order
exports.payForOrder = async (req, res) => {
  try {
    const { orderId, tokenAddress } = req.body;
    const order = await Order.findOne({ orderId });
    const tx = await contract.payForOrder(
      orderId,
      tokenAddress,
      ethers.utils.parseUnits(order.amount.toString(), 18)
    );
    await tx.wait();
    order.paid = true;
    await order.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
