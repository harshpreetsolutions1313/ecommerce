// const app = require('../server');
const express = require('express');
const router = express.Router();
const productRoutes = require('./product');
const orderRoutes = require('./order');
const contractRoutes = require('./contract');

router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/contract', contractRoutes);

// Debug route
router.get('/', (req, res) => {
  res.json({ 
    message: 'API is working',
    routes: ['/products', '/orders', '/contract']
  });
});


module.exports = router;
// module.exports = app;