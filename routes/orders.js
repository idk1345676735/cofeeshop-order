const express = require('express');

const {
  createOrder,
  getOrders
} = require('../controllers/ordersController');

const router = express.Router();

router.get('/', getOrders);
router.post('/', createOrder);

module.exports = router;