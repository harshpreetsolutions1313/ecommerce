const Order = require('../models/Order');
const { readContract } = require('../utils/contract');
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

        const onChainOrder = await readContract.getOrder(numericOrderId);

        if (!onChainOrder || onChainOrder.buyer.toLowerCase() !== buyer.toLowerCase()) {
          throw new Error('Order verification failed: buyer mismatch');
        }

        if (!onChainOrder.paid) {
          throw new Error('Order verification failed: order not paid on-chain');
        }

      } catch (verifyError) {
        console.warn('Order verification warning:', verifyError.message);
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
    
    throw new Error('Direct order creation is no longer supported. Please use createAndPayForOrder on-chain.');

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

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.status(403).json({
      error: 'Server does not sign on-chain payments. Please perform the payment from the connected wallet (frontend) using the contract method createAndPayForOrder or payForOrder.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
