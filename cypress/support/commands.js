// Custom Cypress commands
// These are reusable helpers you can call as cy.commandName() in tests.

// Example: Login via API (bypasses UI for speed)
// Cypress.Commands.add('loginByApi', (email, password) => {
//   cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, { email, password })
//     .then((res) => {
//       window.localStorage.setItem('token', res.body.token);
//       window.localStorage.setItem('user', JSON.stringify(res.body.user));
//     });
// });

// Example: Add product to cart via API
// Cypress.Commands.add('addToCart', (productId, quantity = 1) => {
//   const token = window.localStorage.getItem('token');
//   cy.request({
//     method: 'POST',
//     url: `${Cypress.env('apiUrl')}/cart`,
//     headers: { Authorization: `Bearer ${token}` },
//     body: { product_id: productId, quantity },
//   });
// });
