const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [name, email, passwordHash, "customer"],
    function (err) {
      if (err) {
        return res.status(400).json({ message: "Email already exists or invalid data" });
      }

      res.status(201).json({ message: "Account created successfully" });
    }
  );
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Signin successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  });
});

router.get("/profile", verifyToken, (req, res) => {
  db.get("SELECT id, name, email, role, created_at FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  });
});

module.exports = router;
