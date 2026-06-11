# NP Delights Full-Stack Website

This is a beginner-friendly full-stack version of NP Delights.

## Features

- Chocolate product listing
- Search and category dropdown
- Customer signup
- Customer signin
- JWT login token
- Password hashing using bcrypt
- Customer profile
- Customer order placement
- Customer order history
- Admin role
- Admin can add products
- Admin can view all orders
- SQLite database

## Project Structure

```text
np-delights-fullstack/
  frontend/
    index.html
    style.css
    script.js

  backend/
    server.js
    db.js
    package.json
    .env.example
    routes/
      auth.js
      products.js
      orders.js
      admin.js
    middleware/
      authMiddleware.js
    database/
      initDb.js
      schema.sql
```

## How to Run

### 1. Start backend

```bash
cd backend
npm install
cp .env.example .env
npm run init-db
npm start
```

Backend runs at:

```text
http://localhost:5001
```

### 2. Open frontend

Open this file in browser:

```text
frontend/index.html
```

## Admin Login

```text
Email: admin@npdelights.com
Password: admin123
```

Change this password before using in real production.

## Customer Login

Use the Sign Up form on the website.

## Notes

This is a starter project for learning. Before production, add:

- Strong validation
- Better error handling
- HTTPS
- Real payment gateway
- Better admin dashboard
- Email/OTP verification
- Deployment setup
