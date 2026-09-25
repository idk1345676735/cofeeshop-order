const express = require('express');

const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productsController');

const validateProduct = require('../middleware/productValidation');

const router = express.Router();

router.get('/', getProducts);

router.post(
  '/',
  validateProduct,
  createProduct
);

router.put(
  '/:id',
  validateProduct,
  updateProduct
);

router.delete(
  '/:id',
  deleteProduct
);

module.exports = router;