let products = [];
let categories = [];
let cart = [];
let selectedCategory = null;


const productsContainer =
  document.getElementById('products');

const categoriesContainer =
  document.getElementById('categories');

const loading =
  document.getElementById('loading');

const errorContainer =
  document.getElementById('error');

const cartElement =
  document.getElementById('cart');

const overlay =
  document.getElementById('overlay');

const cartItemsContainer =
  document.getElementById('cartItems');

const emptyCart =
  document.getElementById('emptyCart');

const cartCount =
  document.getElementById('cartCount');

const cartTotal =
  document.getElementById('cartTotal');

const orderMessage =
  document.getElementById('orderMessage');

const submitOrder =
  document.getElementById('submitOrder');


async function loadData() {

  loading.classList.remove('hidden');
  errorContainer.classList.add('hidden');

  try {

    const [
      productsResponse,
      categoriesResponse
    ] = await Promise.all([
      fetch('/api/products'),
      fetch('/api/categories')
    ]);

    if (
      !productsResponse.ok ||
      !categoriesResponse.ok
    ) {
      throw new Error();
    }

    products = await productsResponse.json();
    categories = await categoriesResponse.json();

    renderCategories();
    renderProducts();

  } catch (error) {

    errorContainer.textContent =
      'Не вдалося завантажити меню. Спробуйте оновити сторінку.';

    errorContainer.classList.remove('hidden');

  } finally {

    loading.classList.add('hidden');

  }
}


function renderCategories() {

  categoriesContainer.innerHTML = '';

  createCategoryButton(
    'Усі',
    null,
    true
  );

  categories.forEach(category => {
    createCategoryButton(
      category.name,
      category.id,
      false
    );
  });
}


function createCategoryButton(
  name,
  id,
  active
) {

  const button =
    document.createElement('button');

  button.type = 'button';

  button.className =
    `category-button ${active ? 'active' : ''}`;

  button.textContent = name;

  button.addEventListener('click', () => {

    selectedCategory = id;

    document
      .querySelectorAll('.category-button')
      .forEach(button => {
        button.classList.remove('active');
      });

    button.classList.add('active');

    renderProducts();
  });

  categoriesContainer.appendChild(button);
}


function renderProducts() {

  productsContainer.innerHTML = '';

  const visibleProducts =
    selectedCategory === null
      ? products
      : products.filter(
          product =>
            product.category_id === selectedCategory
        );


  if (visibleProducts.length === 0) {

    productsContainer.innerHTML = `
      <div class="empty-state">
        У цій категорії поки немає товарів.
      </div>
    `;

    return;
  }


  visibleProducts.forEach(product => {

    const card =
      document.createElement('article');

    card.className = 'product-card';

    const imageMarkup =
      product.image
        ? `
          <div class="product-image">
            <img
              src="${product.image}"
              alt="${product.name}"
              onerror="this.parentElement.classList.add('image-placeholder'); this.remove();"
            >
          </div>
        `
        : `
          <div class="product-image image-placeholder">
            ☕
          </div>
        `;


    card.innerHTML = `
      ${imageMarkup}

      <div class="product-content">

        <span class="product-category">
          ${product.category_name || ''}
        </span>

        <h3>${product.name}</h3>

        <p>
          ${product.description || 'Без опису'}
        </p>

        <div class="product-footer">

          <strong>
            ${formatPrice(product.price)} грн
          </strong>

          <button
            class="add-button"
            type="button"
          >
            Додати
          </button>

        </div>

      </div>
    `;


   const addButton =
    card.querySelector('.add-button');

    addButton.addEventListener(
    'click',
    () =>
        addToCart(
        product.id,
        addButton
        )
    );


    productsContainer.appendChild(card);
  });
}


function addToCart(productId, button) {

  const product =
    products.find(
      product =>
        product.id === productId
    );

  const item =
    cart.find(
      item =>
        item.product.id === productId
    );

  if (item) {
    item.quantity += 1;
  } else {
    cart.push({
      product,
      quantity: 1
    });
  }

  renderCart();

  showAddedState(button);

  showToast(
    `${product.name} додано до кошика`
  );

  animateCartButton();
}


function changeQuantity(
  productId,
  difference
) {

  const item =
    cart.find(
      item =>
        item.product.id === productId
    );

  if (!item) return;

  item.quantity += difference;

  if (item.quantity <= 0) {

    cart = cart.filter(
      item =>
        item.product.id !== productId
    );
  }

  renderCart();
}


function renderCart() {

  cartItemsContainer.innerHTML = '';

  let total = 0;
  let count = 0;


  emptyCart.classList.toggle(
    'hidden',
    cart.length > 0
  );


  cart.forEach(item => {

    const itemTotal =
      item.product.price * item.quantity;

    total += itemTotal;
    count += item.quantity;


    const element =
      document.createElement('div');

    element.className = 'cart-item';

    element.innerHTML = `

      <div class="cart-item-info">

        <strong>
          ${item.product.name}
        </strong>

        <span>
          ${formatPrice(item.product.price)} грн
        </span>

      </div>


      <div class="quantity-control">

        <button
          type="button"
          class="minus"
        >
          −
        </button>

        <span>
          ${item.quantity}
        </span>

        <button
          type="button"
          class="plus"
        >
          +
        </button>

      </div>
    `;


    element
      .querySelector('.minus')
      .addEventListener(
        'click',
        () =>
          changeQuantity(
            item.product.id,
            -1
          )
      );


    element
      .querySelector('.plus')
      .addEventListener(
        'click',
        () =>
          changeQuantity(
            item.product.id,
            1
          )
      );


    cartItemsContainer.appendChild(element);
  });


  cartCount.textContent = count;

  cartTotal.textContent =
    formatPrice(total);
}


function openCart() {

  cartElement.classList.remove('hidden');
  overlay.classList.remove('hidden');

  document.body.classList.add('no-scroll');
}


function closeCart() {

  cartElement.classList.add('hidden');
  overlay.classList.add('hidden');

  document.body.classList.remove('no-scroll');
}


document
  .getElementById('cartButton')
  .addEventListener(
    'click',
    openCart
  );


document
  .getElementById('closeCart')
  .addEventListener(
    'click',
    closeCart
  );


overlay.addEventListener(
  'click',
  closeCart
);


document
  .getElementById('orderForm')
  .addEventListener(
    'submit',
    async event => {

      event.preventDefault();

      orderMessage.textContent = '';
      orderMessage.className =
        'state-message';


      if (cart.length === 0) {

        orderMessage.textContent =
          'Додайте хоча б один товар до кошика.';

        orderMessage.classList.add('error');

        return;
      }


      const customerName =
        document
          .getElementById('customerName')
          .value
          .trim();


      const customerPhone =
        document
          .getElementById('customerPhone')
          .value
          .trim();


      submitOrder.disabled = true;

      submitOrder.textContent =
        'Оформлення...';


      try {

        const response =
          await fetch(
            '/api/orders',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json'
              },

              body: JSON.stringify({

                customer_name:
                  customerName,

                customer_phone:
                  customerPhone,

                items:
                  cart.map(item => ({
                    product_id:
                      item.product.id,

                    quantity:
                      item.quantity
                  }))

              })
            }
          );


        const result =
          await response.json();


        if (!response.ok) {
          throw new Error(
            result.message
          );
        }


        orderMessage.textContent =
          `Замовлення №${result.order_id} успішно оформлено!`;

        orderMessage.classList.add(
          'success'
        );


        cart = [];

        renderCart();

        document
          .getElementById('orderForm')
          .reset();


      } catch (error) {

        orderMessage.textContent =
          'Не вдалося оформити замовлення. Спробуйте ще раз.';

        orderMessage.classList.add(
          'error'
        );

      } finally {

        submitOrder.disabled = false;

        submitOrder.textContent =
          'Оформити замовлення';

      }

    }
  );


function formatPrice(value) {

  return Number(value)
    .toFixed(2)
    .replace('.00', '');
}


loadData();
renderCart();


function showAddedState(button) {

  const originalText =
    button.textContent;

  button.textContent =
    '✓ Додано';

  button.classList.add(
    'added'
  );

  button.disabled = true;

  setTimeout(() => {

    button.textContent =
      originalText;

    button.classList.remove(
      'added'
    );

    button.disabled = false;

  }, 900);
}


function showToast(message) {

  const toast =
    document.getElementById(
      'toast'
    );

  toast.textContent = message;

  toast.classList.remove(
    'hidden'
  );

  toast.classList.add(
    'show'
  );

  clearTimeout(
    window.toastTimeout
  );

  window.toastTimeout =
    setTimeout(() => {

      toast.classList.remove(
        'show'
      );

      setTimeout(() => {
        toast.classList.add(
          'hidden'
        );
      }, 250);

    }, 1800);
}


function animateCartButton() {

  const button =
    document.getElementById(
      'cartButton'
    );

  button.classList.remove(
    'cart-bump'
  );

  void button.offsetWidth;

  button.classList.add(
    'cart-bump'
  );
}