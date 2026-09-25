const db = require('../database/database');

exports.getCategories = (req, res) => {
  try {
    const categories = db
      .prepare('SELECT * FROM categories ORDER BY id')
      .all();

    res.json(categories);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to get categories'
    });
  }
};