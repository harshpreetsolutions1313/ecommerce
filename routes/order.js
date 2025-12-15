const express = require('express');
const router = express.Router();
const { restrict } = require('../middleware/auth');
const { createOrder, payForOrder } = require('../controllers/order');

router.post('/create', restrict, createOrder);

router.post('/pay', payForOrder);

module.exports = router;
