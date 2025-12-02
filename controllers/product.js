const Product = require('../models/Product');

// Add a new product
exports.addProduct = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.id) {
      data.id = `prod_${Date.now()}`;
    }
    const product = new Product(data);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
