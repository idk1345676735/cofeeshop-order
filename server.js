const express = require('express');
const cors = require('cors');

const categoriesRouter =
  require('./routes/categories');

const productsRouter =
  require('./routes/products');

const ordersRouter =
  require('./routes/orders');

const adminRouter =
  require('./routes/admin');

require('./database/database');

const app = express();
const PORT = 3000;

app.use(cors());

app.use(
  express.json()
);

app.use(
  express.static('public')
);

app.use(
  '/api/categories',
  categoriesRouter
);

app.use(
  '/api/products',
  productsRouter
);

app.use(
  '/api/orders',
  ordersRouter
);

app.use(
  '/api/admin',
  adminRouter
);


app.get('/', (req, res) => {

  res.json({
    message:
      'Coffee ordering API is working'
  });

});


app.listen(PORT, () => {

  console.log(
    `Server is running on http://localhost:${PORT}`
  );

});