let adminProducts = [];
let adminCategories = [];
let orders = [];


const productsContainer =
  document.getElementById('adminProducts');

const productsLoading =
  document.getElementById(
    'adminProductsLoading'
  );

const ordersContainer =
  document.getElementById('orders');

const ordersLoading =
  document.getElementById(
    'ordersLoading'
  );

const productModal =
  document.getElementById(
    'productModal'
  );

const productForm =
  document.getElementById(
    'productForm'
  );

const productMessage =
  document.getElementById(
    'productMessage'
  );


async function loadAdminData() {

  try {

    const [
      productsResponse,
      categoriesResponse
    ] = await Promise.all([
      fetch('/api/products'),
      fetch('/api/categories')
    ]);


    adminProducts =
      await productsResponse.json();

    adminCategories =
      await categoriesResponse.json();


    renderAdminProducts();
    renderCategoryOptions();

  } catch (error) {

    productsContainer.innerHTML = `
      <div class="state-message error">
        Не вдалося завантажити товари.
      </div>
    `;

  } finally {

    productsLoading.classList.add(
      'hidden'
    );
  }
}


function renderAdminProducts() {

  productsContainer.innerHTML = '';


  adminProducts.forEach(product => {

    const element =
      document.createElement('div');

    element.className =
      'admin-product-row';


    element.innerHTML = `

      <div>

        <strong>
          ${product.name}
        </strong>

        <span>
          ${product.category_name || ''}
        </span>

      </div>


      <strong>
        ${formatPrice(product.price)} грн
      </strong>


      <div class="admin-actions">

        <button
          class="secondary-button edit-button"
        >
          Редагувати
        </button>

        <button
          class="danger-button delete-button"
        >
          Видалити
        </button>

      </div>
    `;


    element
      .querySelector('.edit-button')
      .addEventListener(
        'click',
        () => openProductModal(product)
      );


    element
      .querySelector('.delete-button')
      .addEventListener(
        'click',
        () => deleteProduct(product)
      );


    productsContainer.appendChild(
      element
    );
  });
}


function renderCategoryOptions() {

  const select =
    document.getElementById(
      'productCategory'
    );

  select.innerHTML = '';


  adminCategories.forEach(category => {

    const option =
      document.createElement('option');

    option.value = category.id;
    option.textContent = category.name;

    select.appendChild(option);
  });
}


function openProductModal(
  product = null
) {

  productMessage.textContent = '';

  productForm.reset();


  if (product) {

    document.getElementById(
      'productModalTitle'
    ).textContent = 'Редагування товару';


    document.getElementById(
      'productId'
    ).value = product.id;


    document.getElementById(
      'productName'
    ).value = product.name;


    document.getElementById(
      'productCategory'
    ).value = product.category_id;


    document.getElementById(
      'productDescription'
    ).value =
      product.description || '';


    document.getElementById(
      'productPrice'
    ).value = product.price;


    document.getElementById(
      'productImage'
    ).value =
      product.image || '';

  } else {

    document.getElementById(
      'productModalTitle'
    ).textContent = 'Новий товар';


    document.getElementById(
      'productId'
    ).value = '';
  }


  productModal.classList.remove(
    'hidden'
  );
}


function closeProductModal() {

  productModal.classList.add(
    'hidden'
  );
}


document
  .getElementById('newProductButton')
  .addEventListener(
    'click',
    () => openProductModal()
  );


document
  .getElementById('closeProductModal')
  .addEventListener(
    'click',
    closeProductModal
  );


productForm.addEventListener(
  'submit',
  async event => {

    event.preventDefault();


    const id =
      document.getElementById(
        'productId'
      ).value;


    const product = {

      category_id:
        Number(
          document.getElementById(
            'productCategory'
          ).value
        ),

      name:
        document.getElementById(
          'productName'
        ).value.trim(),

      description:
        document.getElementById(
          'productDescription'
        ).value.trim(),

      price:
        Number(
          document.getElementById(
            'productPrice'
          ).value
        ),

      image:
        document.getElementById(
          'productImage'
        ).value.trim()

    };


    try {

      const response =
        await fetch(
          id
            ? `/api/products/${id}`
            : '/api/products',
          {
            method:
              id ? 'PUT' : 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body:
              JSON.stringify(product)
          }
        );


      const result =
        await response.json();


      if (!response.ok) {

        throw new Error(
          result.message
        );
      }


      closeProductModal();

      await loadAdminData();


    } catch (error) {

      productMessage.textContent =
        error.message ||
        'Не вдалося зберегти товар.';

      productMessage.className =
        'state-message error';
    }

  }
);


async function deleteProduct(product) {

  const confirmed =
    window.confirm(
      `Видалити "${product.name}"?`
    );

  if (!confirmed) return;


  try {

    const response =
      await fetch(
        `/api/products/${product.id}`,
        {
          method: 'DELETE'
        }
      );


    const result =
      await response.json();


    if (!response.ok) {
      throw new Error(
        result.message
      );
    }


    await loadAdminData();


  } catch (error) {

    alert(
      error.message ||
      'Не вдалося видалити товар.'
    );
  }
}


async function loadOrders() {

  ordersLoading.classList.remove(
    'hidden'
  );

  try {

    const response =
      await fetch('/api/orders');


    if (!response.ok) {
      throw new Error();
    }


    orders =
      await response.json();


    renderOrders();


  } catch (error) {

    ordersContainer.innerHTML = `
      <div class="state-message error">
        Не вдалося завантажити замовлення.
      </div>
    `;

  } finally {

    ordersLoading.classList.add(
      'hidden'
    );
  }
}


function renderOrders() {

  ordersContainer.innerHTML = '';


  if (orders.length === 0) {

    ordersContainer.innerHTML = `
      <div class="empty-state">
        Замовлень поки немає.
      </div>
    `;

    return;
  }


  orders.forEach(order => {

    const card =
      document.createElement('article');

    card.className = 'order-card';


    const itemsMarkup =
      order.items
        .map(item => `
          <li>
            <span>
              ${item.product_name}
              × ${item.quantity}
            </span>

            <strong>
              ${formatPrice(
                item.price *
                item.quantity
              )} грн
            </strong>
          </li>
        `)
        .join('');


    card.innerHTML = `

      <div class="order-header">

        <div>
          <span class="eyebrow">
            Замовлення
          </span>

          <h3>
            №${order.id}
          </h3>
        </div>

        <strong class="order-total">
          ${formatPrice(
            order.total_price
          )} грн
        </strong>

      </div>


      <div class="customer-info">

        <span>
          ${order.customer_name}
        </span>

        <span>
          ${order.customer_phone}
        </span>

      </div>


      <ul class="order-items">
        ${itemsMarkup}
      </ul>


      <small>
        ${order.created_at}
      </small>
    `;


    ordersContainer.appendChild(card);
  });
}


document
  .querySelectorAll('.admin-tab')
  .forEach(button => {

    button.addEventListener(
      'click',
      () => {

        document
          .querySelectorAll(
            '.admin-tab'
          )
          .forEach(tab =>
            tab.classList.remove(
              'active'
            )
          );


        button.classList.add(
          'active'
        );


        const tab =
          button.dataset.tab;


        document
          .getElementById(
            'productsTab'
          )
          .classList.toggle(
            'hidden',
            tab !== 'products'
          );


        document
          .getElementById(
            'ordersTab'
          )
          .classList.toggle(
            'hidden',
            tab !== 'orders'
          );


        if (tab === 'orders') {
          loadOrders();
        }

      }
    );

  });


function formatPrice(value) {

  return Number(value)
    .toFixed(2)
    .replace('.00', '');
}


loadAdminData();