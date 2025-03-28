const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// Admin login route
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ? AND role = 'admin'", [email], (err, results) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (results.length === 0) return res.status(401).json({ message: "Admin not found" });

        const admin = results[0];
        bcrypt.compare(password, admin.password, (err, isMatch) => {
            if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

            const token = jwt.sign(
                { id: admin.id, role: admin.role },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            res.json({ message: "Login successful", token });
        });
    });
});

module.exports = router;
