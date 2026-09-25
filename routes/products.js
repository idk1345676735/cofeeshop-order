const express = require('express');

const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productsController');

const validateProduct =
  require('../middleware/productValidation');

const productRouter =
  express.Router();


productRouter.get(
  '/',
  getProducts
);


productRouter.post(
  '/',
  validateProduct,
  createProduct
);


productRouter.put(
  '/:id',
  validateProduct,
  updateProduct
);


productRouter.delete(
  '/:id',
  deleteProduct
);


module.exports =
  productRouter;