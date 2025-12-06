const express = require('express');
const router = express.Router();
const { addProduct, getProducts, getProduct, updateProduct, deleteProduct, listCategories, listCategoriesWithDetails} = require('../controllers/product');

router.post('/', addProduct);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/categories/list', listCategories);
// router.get('/categories', listCategoriesWithDetails);
router.get('/categories/details', listCategoriesWithDetails);


module.exports = router;

//just need a json body to create a product
// {
//   "id": "unique-product-id",
//   "name": "Product Name",
//   "description": "Product Description",
//   "price": 1000, // price in smallest currency unit (e.g., cents)
//   "category": "Category Name",
//   "imageUrl": "http://example.com/image.jpg"
// }    
