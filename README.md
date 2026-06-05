# Melvis

A full-stack e-commerce demo application built for academic testing purposes. Demonstrates unit, integration, system, and acceptance testing techniques with Cypress E2E automation.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS      |
| Backend   | Node.js + Express.js                |
| Database  | MySQL + Sequelize ORM               |
| Payment   | Midtrans Snap (sandbox)             |
| E2E Tests | Cypress 13                          |

---

## Project Structure

```
Melvis/
├── backend/                  # Express API
│   ├── src/
│   │   ├── config/           # Database config
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Auth, error handling
│   │   ├── models/           # Sequelize models
│   │   ├── routes/           # Express routers
│   │   └── seeders/          # DB seed data
│   ├── server.js
│   └── .env.example
├── frontend/                 # React + Vite app
│   ├── src/
│   │   ├── api/              # Axios instance
│   │   ├── components/       # Navbar, ProductCard, ProtectedRoute
│   │   ├── context/          # AuthContext
│   │   └── pages/            # All page components
│   └── .env.example
├── cypress/                  # E2E test scaffold
│   ├── e2e/                  # Test specs go here
│   ├── fixtures/             # Test data (JSON)
│   └── support/              # Custom commands & hooks
├── cypress.config.js
└── README.md
```

---

## Prerequisites

- Node.js ≥ 18
- MySQL 8 (running locally)
- npm or yarn

---

## Setup

### 1. Create the MySQL database

```sql
CREATE DATABASE Melvis_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=Melvis_db
JWT_SECRET=change_this_to_a_long_random_string
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxxxxxx
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

> Get sandbox keys from [https://dashboard.sandbox.midtrans.com](https://dashboard.sandbox.midtrans.com) → Settings → Access Keys.  
> The app works without Midtrans keys — orders are still created but the payment popup is skipped.

```bash
npm install
```

### 3. Configure the frontend

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxxxxxx
```

```bash
npm install
```

### 4. Seed the database

```bash
cd backend
npm run seed
```

This inserts 10 sample products across three categories (electronics, fashion, food).

---

## Running the App

Open two terminals:

**Terminal 1 — Backend**

```bash
cd backend
npm run dev        # uses nodemon for hot-reload
# or
npm start          # production mode
```

Server starts at `http://localhost:5000`

**Terminal 2 — Frontend**

```bash
cd frontend
npm run dev
```

App opens at `http://localhost:5173`

---

## API Reference

### Health

| Method | Endpoint     | Auth | Description         |
|--------|--------------|------|---------------------|
| GET    | /api/health  | —    | Returns `{status:"ok"}` |

### Auth

| Method | Endpoint            | Auth | Body fields                  |
|--------|---------------------|------|------------------------------|
| POST   | /api/auth/register  | —    | name, email, password        |
| POST   | /api/auth/login     | —    | email, password              |
| GET    | /api/auth/me        | JWT  | —                            |

### Products

| Method | Endpoint            | Auth | Query params         |
|--------|---------------------|------|----------------------|
| GET    | /api/products       | —    | search, category     |
| GET    | /api/products/:id   | —    | —                    |

### Cart

| Method | Endpoint        | Auth | Body fields              |
|--------|-----------------|------|--------------------------|
| GET    | /api/cart       | JWT  | —                        |
| POST   | /api/cart       | JWT  | product_id, quantity     |
| PUT    | /api/cart/:id   | JWT  | quantity                 |
| DELETE | /api/cart/:id   | JWT  | —                        |

### Orders

| Method | Endpoint               | Auth | Description                       |
|--------|------------------------|------|-----------------------------------|
| POST   | /api/orders            | JWT  | Create order, returns snap_token  |
| GET    | /api/orders            | JWT  | List user's orders                |
| GET    | /api/orders/:id        | JWT  | Single order detail               |
| POST   | /api/orders/notification | — | Midtrans webhook handler          |

---

## Database Schema

```
users         (id, name, email, password, createdAt, updatedAt)
products      (id, name, description, price, stock, image_url, category, ...)
cart_items    (id, user_id, product_id, quantity, ...)
orders        (id, user_id, total_amount, status, snap_token, midtrans_order_id, ...)
order_items   (id, order_id, product_id, quantity, price, product_name, ...)
```

Status values: `pending` | `paid` | `cancelled` | `shipped` | `delivered`

---

## Payment Flow (Midtrans Sandbox)

1. User clicks **Pay** on the Checkout page
2. Backend creates an order record and calls the Midtrans Snap API
3. Backend returns `snap_token` to the frontend
4. Frontend opens the Midtrans Snap popup: `window.snap.pay(snapToken, ...)`
5. User completes payment in the popup (use sandbox test cards)
6. Midtrans calls `POST /api/orders/notification` to update order status
7. User is redirected to the Order Detail page

### Midtrans sandbox test cards

| Card number          | Result  |
|----------------------|---------|
| 4811 1111 1111 1114  | Success |
| 4911 1111 1111 1113  | Failure |

---

## Running Cypress Tests

```bash
# Install Cypress (from project root)
npm install

# Open Cypress interactive runner
npm run cy:open

# Run headless
npm run cy:run
```

Test specs belong in `cypress/e2e/`. Custom reusable commands go in `cypress/support/commands.js`. Fixture data (users, product IDs) is in `cypress/fixtures/example.json`.

---

## Feature Checklist

- [x] User registration & login (JWT, bcrypt)
- [x] Product listing with search + category filter
- [x] Product detail page
- [x] Cart (add, update quantity, remove)
- [x] Checkout with Midtrans Snap popup
- [x] Order history & order detail
- [x] Midtrans webhook handler
- [x] Protected routes (frontend)
- [x] Responsive mobile layout
- [x] `data-testid` attributes for Cypress selectors
- [x] `/api/health` endpoint
- [x] Input validation (express-validator)
- [x] Error handling middleware
- [x] CORS configured for localhost
- [x] 10 seeded products (electronics, fashion, food)
- [ ] Admin panel (not in scope)
- [ ] Cypress test specs (scaffold only — write your own)
