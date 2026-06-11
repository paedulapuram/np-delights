const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const path = require("path");

const dbPath = path.join(__dirname, "np_delights.db");
const db = new sqlite3.Database(dbPath);

async function initDb() {
  const adminPassword = await bcrypt.hash("admin123", 10);

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT DEFAULT '🍫',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'placed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL
    )`);

    db.run(
      "INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      ["Admin User", "admin@npdelights.com", adminPassword, "admin"]
    );

    const products = [
      [1, "Dark Chocolate", "dark", "Rich 70% cocoa dark chocolate.", 4.99, "🍫"],
      [2, "Milk Chocolate", "milk", "Smooth and creamy milk chocolate.", 3.99, "🍬"],
      [3, "White Chocolate", "white", "Sweet vanilla-flavored white chocolate.", 4.49, "🤍"],
      [4, "Hazelnut Chocolate", "nuts", "Chocolate with crunchy hazelnuts.", 5.49, "🌰"],
      [5, "Caramel Chocolate", "milk", "Soft caramel filled chocolate.", 5.99, "🍯"],
      [6, "Assorted Chocolate Box", "gift", "Mixed chocolates for gifting.", 12.99, "🎁"]
    ];

    const stmt = db.prepare(
      "INSERT OR IGNORE INTO products (id, name, category, description, price, image) VALUES (?, ?, ?, ?, ?, ?)"
    );

    products.forEach(product => stmt.run(product));

    stmt.finalize(() => {
      console.log("Database initialized.");
      console.log("Admin login: admin@npdelights.com / admin123");

      db.close(err => {
        if (err) {
          console.error(err.message);
          process.exit(1);
        }
        process.exit(0);
      });
    });
  });
}

initDb();
