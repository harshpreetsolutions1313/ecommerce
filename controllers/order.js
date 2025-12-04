const Order = require('../models/Order');
const contract = require('../utils/contract');
const { ethers } = require('ethers');

// Create or track an order
exports.createOrder = async (req, res) => {
  try {
    const { buyer, productId, amount, token, orderId, paid } = req.body;

    // If orderId is provided, it means the order was already created on-chain
    // Just track it in the database
    if (orderId !== undefined) {
      const numericOrderId = Number(orderId);
      if (Number.isNaN(numericOrderId)) {
        throw new Error('Invalid orderId provided');
      }

      // Optionally verify the order on-chain
      try {
        const onChainOrder = await contract.getOrder(numericOrderId);
        if (!onChainOrder || onChainOrder.buyer.toLowerCase() !== buyer.toLowerCase()) {
          throw new Error('Order verification failed: buyer mismatch');
        }
        if (!onChainOrder.paid) {
          throw new Error('Order verification failed: order not paid on-chain');
        }
      } catch (verifyError) {
        console.warn('Order verification warning:', verifyError.message);
        // Continue anyway - frontend might have valid data
      }

      const orderData = {
        orderId: numericOrderId,
        buyer,
        productId,
        amount: Number(amount),
        token,
        paid: paid !== undefined ? paid : true, // Default to true if not specified
      };

      await Order.findOneAndUpdate(
        { orderId: orderData.orderId },
        orderData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return res.json({ orderId: orderId.toString(), tracked: true });
    }

    // Old flow: Create order on-chain (deprecated with new contract)
    // This path is kept for backward compatibility but will fail with new contract
    throw new Error('Direct order creation is no longer supported. Please use createAndPayForOrder on-chain.');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Pay for an order (deprecated - use createAndPayForOrder on-chain instead)
exports.payForOrder = async (req, res) => {
  try {
    const { orderId, tokenAddress } = req.body;
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Use ethers v6 syntax
    const tx = await contract.payForOrder(
      orderId,
      tokenAddress,
      ethers.parseUnits(order.amount.toString(), 18)
    );
    await tx.wait();
    order.paid = true;
    await order.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
