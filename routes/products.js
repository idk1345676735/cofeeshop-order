const express = require('express');

const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productsController');

const validateProduct =
  require('../middleware/productValidation');

const {
  requireAdmin
} = require('../middleware/adminAuth');

const router = express.Router();

router.get(
  '/',
  getProducts
);

router.post(
  '/',
  requireAdmin,
  validateProduct,
  createProduct
);

router.put(
  '/:id',
  requireAdmin,
  validateProduct,
  updateProduct
);

router.delete(
  '/:id',
  requireAdmin,
  deleteProduct
);

module.exports = router;