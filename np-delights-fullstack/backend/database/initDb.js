const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const path = require("path");

const dbPath = path.join(__dirname, "np_delights.db");
const db = new sqlite3.Database(dbPath);

db.serialize(async () => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT DEFAULT '🍫',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'placed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `);

  const adminPassword = await bcrypt.hash("admin123", 10);

  db.run(
    "INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    ["Admin User", "admin@npdelights.com", adminPassword, "admin"]
  );

  const products = [
    ["Dark Chocolate", "dark", "Rich 70% cocoa dark chocolate.", 4.99, "🍫"],
    ["Milk Chocolate", "milk", "Smooth and creamy milk chocolate.", 3.99, "🍬"],
    ["White Chocolate", "white", "Sweet vanilla-flavored white chocolate.", 4.49, "🤍"],
    ["Hazelnut Chocolate", "nuts", "Chocolate with crunchy hazelnuts.", 5.49, "🌰"],
    ["Caramel Chocolate", "milk", "Soft caramel filled chocolate.", 5.99, "🍯"],
    ["Assorted Chocolate Box", "gift", "Mixed chocolates for gifting.", 12.99, "🎁"]
  ];

  const stmt = db.prepare("INSERT OR IGNORE INTO products (id, name, category, description, price, image) VALUES (?, ?, ?, ?, ?, ?)");
  products.forEach((p, index) => stmt.run(index + 1, ...p));
  stmt.finalize();

  console.log("Database initialized.");
  console.log("Admin login: admin@npdelights.com / admin123");
});

db.close();
