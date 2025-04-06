require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// User Login Route with JWT Authentication
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ message: 'User not found' });

        const user = results[0];
        const isMatch = password === user.password;

        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, role: user.role });
    });
});

// Middleware to Protect Routes (Require JWT)
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) return res.status(403).json({ message: 'Access Denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });
        req.user = decoded;
        next();
    });
};

// Protected Dashboard Route
app.get('/dashboard', authenticateToken, (req, res) => {
    res.json({ message: 'Welcome to the dashboard', user: req.user });
});

// 🛒 **Product Management API Routes (Admin)**
app.post('/products', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });

    const { name, description, price, stock, image_url } = req.body;
    const query = 'INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)';
    
    db.query(query, [name, description, price, stock, image_url], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product added successfully', productId: result.insertId });
    });
});

app.get('/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.put('/products/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });

    const { name, description, price, stock, image_url } = req.body;
    const query = 'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image_url = ? WHERE id = ?';
    
    db.query(query, [name, description, price, stock, image_url, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product updated successfully' });
    });
});

app.delete('/products/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });

    db.query('DELETE FROM products WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product deleted successfully' });
    });
});

// 📦 **Order System API Routes (User & Delivery Person)**
app.post('/orders', authenticateToken, (req, res) => {
    if (req.user.role !== 'user') return res.status(403).json({ message: 'Unauthorized' });

    const { product_id, quantity, address } = req.body;
    const query = 'INSERT INTO orders (user_id, product_id, quantity, address, status) VALUES (?, ?, ?, ?, "Pending")';
    
    db.query(query, [req.user.userId, product_id, quantity, address], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Order placed successfully', orderId: result.insertId });
    });
});

app.get('/orders', authenticateToken, (req, res) => {
    let query = 'SELECT * FROM orders';

    if (req.user.role === 'user') {
        query = 'SELECT * FROM orders WHERE user_id = ?';
    } else if (req.user.role === 'delivery') {
        query = 'SELECT id, user_id, product_id, quantity, address, status FROM orders WHERE status != "Delivered"';
    }

    db.query(query, req.user.role === 'user' ? [req.user.userId] : [], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.put('/orders/:id/status', authenticateToken, (req, res) => {
    if (req.user.role !== 'delivery') return res.status(403).json({ message: 'Unauthorized' });

    const { status } = req.body;
    const query = 'UPDATE orders SET status = ? WHERE id = ?';
    
    db.query(query, [status, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Order status updated successfully' });
    });
});

app.delete('/orders/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'user') return res.status(403).json({ message: 'Unauthorized' });

    db.query('DELETE FROM orders WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Order canceled successfully' });
    });
});

// **Start the Server**
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
