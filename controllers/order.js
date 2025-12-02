const Order = require('../models/Order');
const contract = require('../utils/contract');
const { ethers } = require('ethers');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { buyer, productId, amount, token } = req.body;
    const tx = await contract.createOrder(
      buyer,
      productId,
      ethers.parseEther(amount.toString()) // Use parseEther for Ethers.js v6
    );
    const receipt = await tx.wait(); // Wait for the transaction to be mined

    // console.log("Transaction Receipt:", receipt);

    // Find the OrderCreated event in the receipt
    const orderCreatedEvent = receipt.logs.find(log =>
      log.fragment && log.fragment.name === 'OrderCreated'
    );

    if (!orderCreatedEvent) {
      throw new Error("OrderCreated event not found in transaction receipt");
    }

    const orderId = orderCreatedEvent.args.orderId;
    const order = new Order({
      orderId: orderId.toString(),
      buyer,
      productId,
      amount,
      token
    });
    await order.save();
    res.json({ orderId: orderId.toString() });
  } catch (error) {
    console.error(error);
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
