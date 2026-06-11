const express = require("express");
const db = require("../db");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(verifyToken);
router.use(requireRole("admin"));

router.get("/users", (req, res) => {
  db.all("SELECT id, name, email, role, created_at FROM users ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(rows);
  });
});

router.post("/products", (req, res) => {
  const { name, category, description, price, image } = req.body;

  db.run(
    "INSERT INTO products (name, category, description, price, image) VALUES (?, ?, ?, ?, ?)",
    [name, category, description, price, image || "🍫"],
    function (err) {
      if (err) return res.status(500).json({ message: "Could not add product" });
      res.status(201).json({ message: "Product added successfully", productId: this.lastID });
    }
  );
});

router.get("/orders", (req, res) => {
  db.all("SELECT * FROM orders ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(rows);
  });
});

router.patch("/orders/:id/status", (req, res) => {
  const { status } = req.body;

  db.run("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ message: "Could not update order" });
    res.json({ message: "Order status updated" });
  });
});

module.exports = router;
