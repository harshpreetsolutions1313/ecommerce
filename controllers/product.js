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

// Update a product
exports.updateProduct = async (req, res) => {
  try {

    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );

    res.json(product)

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};

// Delete a product
exports.deleteProduct = async (req, res) => {

  try {
    await Product.deleteOne({ id: req.params.id });

    res.status(204).send();

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};

// List all product categories
exports.listCategories = async (req, res) => {
  
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};

// List all product categories with image and count
// i can proovide the response of get products so that you can extract the categories with image and count
exports.listCategoriesWithDetails = async (req, res) => {
  try {
    const products = await Product.find({});
    const categoryMap = {};
    products.forEach(product => {
      if (!categoryMap[product.category]) {
        categoryMap[product.category] = {
          category: product.category,
          imageUrl: product.images[0] || null,
          count: 0
        };
      }
      categoryMap[product.category].count += 1;
    });
    const categories = Object.values(categoryMap);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } 
};

exports.searchProducts = async (req, res) => {
  try {
    console.log("Inside searchProducts controller");

    const query = req.query.q;

    console.log("Search query:", query);

    if (!query) {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }

    //case insensitive search in name field
    const products = await Product.find({

      // mongo db query operator for or condition

      $or : [
        {name : { $regex: query, $options: 'i'}}    
      ]
    })

    res.json(products);

  }catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server Error during search" } );
  }

};









