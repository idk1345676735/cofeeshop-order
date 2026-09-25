const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDirectory = path.join(__dirname, '../data');

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory);
}

const databasePath = path.join(dataDirectory, 'coffee.db');

const db = new Database(databasePath);

db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    image TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    total_price REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

console.log('Database initialized');

const categoryCount = db
  .prepare('SELECT COUNT(*) AS count FROM categories')
  .get().count;

if (categoryCount === 0) {
  const insertCategory = db.prepare(
    'INSERT INTO categories (name) VALUES (?)'
  );

  const coffeeId = insertCategory.run('Кава').lastInsertRowid;
  const teaId = insertCategory.run('Чай').lastInsertRowid;
  const dessertId = insertCategory.run('Десерти').lastInsertRowid;

  const insertProduct = db.prepare(`
    INSERT INTO products (
      category_id,
      name,
      description,
      price,
      image
    )
    VALUES (?, ?, ?, ?, ?)
  `);

  insertProduct.run(
    coffeeId,
    'Капучино',
    'Кава з молоком та молочною піною',
    75,
    'images/cappuccino.jpg'
  );

  insertProduct.run(
    coffeeId,
    'Американо',
    'Класична чорна кава',
    55,
    'images/americano.jpg'
  );

  insertProduct.run(
    teaId,
    'Зелений чай',
    'Класичний зелений чай',
    50,
    'images/green-tea.jpg'
  );

  insertProduct.run(
    dessertId,
    'Чизкейк',
    'Класичний вершковий чизкейк',
    95,
    'images/cheesecake.jpg'
  );

  console.log('Test data added');
}

module.exports = db;


