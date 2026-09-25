const db = require('../database/database');

exports.getProducts = (req, res) => {
  try {
    const products = db.prepare(`
      SELECT
        products.id,
        products.category_id,
        categories.name AS category_name,
        products.name,
        products.description,
        products.price,
        products.image
      FROM products
      JOIN categories
        ON products.category_id = categories.id
      ORDER BY products.id
    `).all();

    res.json(products);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to get products'
    });
  }
};


exports.createProduct = (req, res) => {
  try {
    const {
      category_id,
      name,
      description,
      price,
      image
    } = req.body;

    const category = db
      .prepare('SELECT id FROM categories WHERE id = ?')
      .get(category_id);

    if (!category) {
      return res.status(400).json({
        message: 'Category does not exist'
      });
    }

    const result = db.prepare(`
      INSERT INTO products (
        category_id,
        name,
        description,
        price,
        image
      )
      VALUES (?, ?, ?, ?, ?)
    `).run(
      category_id,
      name.trim(),
      description || '',
      Number(price),
      image || ''
    );

    const product = db
      .prepare('SELECT * FROM products WHERE id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json(product);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to create product'
    });
  }
};


exports.updateProduct = (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      category_id,
      name,
      description,
      price,
      image
    } = req.body;

    const existingProduct = db
      .prepare('SELECT * FROM products WHERE id = ?')
      .get(id);

    if (!existingProduct) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    const category = db
      .prepare('SELECT id FROM categories WHERE id = ?')
      .get(category_id);

    if (!category) {
      return res.status(400).json({
        message: 'Category does not exist'
      });
    }

    db.prepare(`
      UPDATE products
      SET
        category_id = ?,
        name = ?,
        description = ?,
        price = ?,
        image = ?
      WHERE id = ?
    `).run(
      category_id,
      name.trim(),
      description || '',
      Number(price),
      image || '',
      id
    );

    const updatedProduct = db
      .prepare('SELECT * FROM products WHERE id = ?')
      .get(id);

    res.json(updatedProduct);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to update product'
    });
  }
};


exports.deleteProduct = (req, res) => {
  try {
    const id = Number(req.params.id);

    const product = db
      .prepare('SELECT * FROM products WHERE id = ?')
      .get(id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    const usedInOrders = db.prepare(`
      SELECT COUNT(*) AS count
      FROM order_items
      WHERE product_id = ?
    `).get(id);

    if (usedInOrders.count > 0) {
      return res.status(409).json({
        message: 'Product cannot be deleted because it is used in an order'
      });
    }

    db.prepare(`
      DELETE FROM products
      WHERE id = ?
    `).run(id);

    res.json({
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to delete product'
    });
  }
};