const express = require('express');
const router = express.Router();
const { addProduct, getProducts, getProduct, updateProduct, deleteProduct, listCategories, listCategoriesWithDetails, searchProducts, getProductsByCategory, createCategory } = require('../controllers/product');
const { filterProductsByPriceRange } = require('../controllers/product');
const { restrict } = require('../middleware/auth');

router.post('/', addProduct);
router.get('/', restrict, getProducts);
// Put specific routes (search/categories) before the dynamic `/:id` route
router.get('/search', searchProducts);
router.get('/categories/list', listCategories);
// router.get('/categories', listCategoriesWithDetails);
router.get('/categories/details', listCategoriesWithDetails);
router.get('/category/:categoryName', getProductsByCategory);

// create category
router.post('/category/create', createCategory);

//filter products by price range
router.get('/filter/price-range', filterProductsByPriceRange);

router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;  
