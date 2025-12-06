const express = require('express');
const router = express.Router();

// various routes
const productRoutes = require('./product');
const orderRoutes = require('./order');
const contractRoutes = require('./contract');

router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
// router.use('/contract', contractRoutes);

module.exports = router;