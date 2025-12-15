
// user routes
const express = require('express');
const router = express.Router();
const { getProductsByUser } = require('../controllers/user');
const { restrict } = require('../middleware/auth');

// Route to get purchased products for the authenticated user
router.get('/purchased-products', restrict, getProductsByUser);

module.exports = router;