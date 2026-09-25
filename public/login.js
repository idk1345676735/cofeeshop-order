const form =
  document.getElementById('loginForm');

const message =
  document.getElementById('loginMessage');

form.addEventListener(
  'submit',
  async event => {

    event.preventDefault();

    message.textContent = '';

    const login =
      document
        .getElementById('login')
        .value
        .trim();

    const password =
      document
        .getElementById('password')
        .value;

    try {

      const response =
        await fetch(
          '/api/admin/login',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({
              login,
              password
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

      localStorage.setItem(
        'adminToken',
        result.token
      );

      window.location.href =
        '/admin.html';

    } catch (error) {

      message.textContent =
        'Невірний логін або пароль.';

      message.className =
        'state-message error';
    }

  }
);