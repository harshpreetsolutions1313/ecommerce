//import Order
const Order = require('../models/Order');

// Get a list of purchased products for the authenticated user
exports.getProductsByUser = async (req, res) => {
    try {
        const authenticatedUser = req.user;
        // console.log('Authenticated User:', authenticatedUser);

        if (!authenticatedUser) {
            return res.status(401).json({ message: 'Access denied. No authenticated user.' });
        }

        const userId = authenticatedUser.id;

        // Find all orders for the user where paid is true
        const purchasedOrders = await Order.find({ 
            user_id: userId,
            paid: true 
        })
        .select('productId amount token orderId trackedAt -_id') // Select relevant fields and exclude MongoDB's default _id
        .lean(); // Use .lean() for faster execution if you are only reading data

        // console.log(`Purchased Orders for User ID ${userId}:`, purchasedOrders);

        if (purchasedOrders.length === 0) {
            return res.status(404).json({ message: 'No purchased products found for this user.' });
        }

        // Return the list of orders/products
        res.json({
            user: userId,
            count: purchasedOrders.length,
            products: purchasedOrders
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }

};