const express = require('express');
const router = express.Router();
const { createOrder, payForOrder } = require('../controllers/order');

router.post('/create', createOrder);
router.post('/pay', payForOrder);

module.exports = router;
