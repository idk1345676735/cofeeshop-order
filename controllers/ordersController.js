const db = require('../database/database');


exports.createOrder = (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      items
    } = req.body;

    if (!customer_name || !customer_phone) {
      return res.status(400).json({
        message: 'Customer name and phone are required'
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Order must contain at least one item'
      });
    }

    let totalPrice = 0;

    const preparedItems = [];

    for (const item of items) {
      if (
        !item.product_id ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) <= 0
      ) {
        return res.status(400).json({
          message: 'Invalid order item'
        });
      }

      const product = db.prepare(`
        SELECT id, name, price
        FROM products
        WHERE id = ?
      `).get(item.product_id);

      if (!product) {
        return res.status(404).json({
          message: `Product with id ${item.product_id} not found`
        });
      }

      const quantity = Number(item.quantity);

      totalPrice += product.price * quantity;

      preparedItems.push({
        product_id: product.id,
        quantity,
        price: product.price
      });
    }

    const createOrderTransaction = db.transaction(() => {
      const orderResult = db.prepare(`
        INSERT INTO orders (
          customer_name,
          customer_phone,
          total_price
        )
        VALUES (?, ?, ?)
      `).run(
        customer_name.trim(),
        customer_phone.trim(),
        totalPrice
      );

      const orderId = orderResult.lastInsertRowid;

      const insertItem = db.prepare(`
        INSERT INTO order_items (
          order_id,
          product_id,
          quantity,
          price
        )
        VALUES (?, ?, ?, ?)
      `);

      for (const item of preparedItems) {
        insertItem.run(
          orderId,
          item.product_id,
          item.quantity,
          item.price
        );
      }

      return orderId;
    });

    const orderId = createOrderTransaction();

    res.status(201).json({
      message: 'Order created successfully',
      order_id: orderId,
      total_price: totalPrice
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to create order'
    });
  }
};


exports.getOrders = (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT *
      FROM orders
      ORDER BY created_at DESC
    `).all();

    const getItems = db.prepare(`
      SELECT
        order_items.id,
        order_items.product_id,
        products.name AS product_name,
        order_items.quantity,
        order_items.price
      FROM order_items
      JOIN products
        ON order_items.product_id = products.id
      WHERE order_items.order_id = ?
    `);

    const result = orders.map(order => ({
      ...order,
      items: getItems.all(order.id)
    }));

    res.json(result);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to get orders'
    });
  }
};