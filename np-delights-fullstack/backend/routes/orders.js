const express = require("express");
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, (req, res) => {
  const { customerName, phone, address, items } = req.body;

  if (!customerName || !phone || !address || !items || !items.length) {
    return res.status(400).json({ message: "Missing order details" });
  }

  const productIds = items.map(i => i.productId);
  const placeholders = productIds.map(() => "?").join(",");

  db.all(`SELECT * FROM products WHERE id IN (${placeholders})`, productIds, (err, products) => {
    if (err) return res.status(500).json({ message: "Database error" });

    let total = 0;
    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return null;

      const quantity = Number(item.quantity);
      total += product.price * quantity;

      return {
        productId: product.id,
        quantity,
        price: product.price
      };
    }).filter(Boolean);

    db.run(
      "INSERT INTO orders (user_id, customer_name, phone, address, total_amount, status) VALUES (?, ?, ?, ?, ?, ?)",
      [req.user.id, customerName, phone, address, total.toFixed(2), "placed"],
      function (err) {
        if (err) return res.status(500).json({ message: "Could not create order" });

        const orderId = this.lastID;
        const stmt = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");

        orderItems.forEach(i => stmt.run(orderId, i.productId, i.quantity, i.price));
        stmt.finalize();

        res.status(201).json({ message: "Order placed successfully", orderId, total: total.toFixed(2) });
      }
    );
  });
});

router.get("/my", verifyToken, (req, res) => {
  db.all("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC", [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(rows);
  });
});

module.exports = router;
