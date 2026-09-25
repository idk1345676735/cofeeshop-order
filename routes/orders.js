const express = require('express');

const {
  createOrder,
  getOrders
} = require('../controllers/ordersController');

const {
  requireAdmin
} = require('../middleware/adminAuth');

const router = express.Router();

router.get(
  '/',
  requireAdmin,
  getOrders
);

router.post(
  '/',
  createOrder
);

module.exports = router;