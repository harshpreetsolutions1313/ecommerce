const Order = require('../models/Order');

// Create or upsert an order record in DB (order already created on-chain from frontend)
exports.createOrder = async (req, res) => {
  try {
    const { orderId, buyer, productId, amount, token } = req.body;

    if (orderId === undefined || orderId === null) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    const numericOrderId = Number(orderId);
    if (Number.isNaN(numericOrderId)) {
      return res.status(400).json({ error: 'orderId must be a number' });
    }

    const orderData = {
      orderId: numericOrderId,
      buyer,
      productId,
      amount: Number(amount),
      token,
      paid: false,
    };

    await Order.findOneAndUpdate(
      { orderId: numericOrderId },
      orderData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ orderId: numericOrderId.toString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Mark an order as paid in DB (payment happens on-chain via frontend)
exports.payForOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.paid = true;
    await order.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
