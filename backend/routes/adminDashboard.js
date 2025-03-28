const express = require("express");
const db = require("../db");
const { verifyAdmin } = require("../authMiddleware");

const router = express.Router();

// 🟢 View all users (except admins)
router.get("/users", verifyAdmin, (req, res) => {
    db.query("SELECT id, username, email, role FROM users WHERE role != 'admin'", (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching users" });
        res.json(results);
    });
});

// 🟢 Delete a user
router.delete("/users/:id", verifyAdmin, (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Error deleting user" });
        res.json({ message: "User deleted successfully" });
    });
});

// 🟢 View all products
router.get("/products", verifyAdmin, (req, res) => {
    db.query("SELECT * FROM products", (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching products" });
        res.json(results);
    });
});

// 🟢 Add a product
router.post("/products", verifyAdmin, (req, res) => {
    const { name, description, image, category_id, price, stock } = req.body;
    db.query(
        "INSERT INTO products (name, description, image, category_id, price, stock) VALUES (?, ?, ?, ?, ?, ?)",
        [name, description, image, category_id, price, stock],
        (err, result) => {
            if (err) return res.status(500).json({ message: "Error adding product" });
            res.json({ message: "Product added successfully", id: result.insertId });
        }
    );
});

// 🟢 Update order status
router.put("/orders/:id", verifyAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.query(
        "UPDATE orders SET status = ? WHERE id = ?",
        [status, id],
        (err, result) => {
            if (err) return res.status(500).json({ message: "Error updating order status" });
            res.json({ message: "Order updated successfully" });
        }
    );
});

module.exports = router;
