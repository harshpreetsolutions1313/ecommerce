const express = require('express');
const router = express.Router();
const { addProduct, getProducts, getProduct } = require('../controllers/product');

router.post('/', addProduct);
router.get('/', getProducts);
router.get('/:id', getProduct);

module.exports = router;
