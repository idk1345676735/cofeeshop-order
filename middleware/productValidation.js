function validateProduct(req, res, next) {
  const {
    category_id,
    name,
    price
  } = req.body;

  if (!category_id) {
    return res.status(400).json({
      message: 'Category is required'
    });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: 'Product name is required'
    });
  }

  if (
    price === undefined ||
    price === null ||
    Number.isNaN(Number(price)) ||
    Number(price) <= 0
  ) {
    return res.status(400).json({
      message: 'Price must be greater than 0'
    });
  }

  next();
}

module.exports = validateProduct;