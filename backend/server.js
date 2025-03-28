require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Sample route
app.get("/", (req, res) => {
    res.send("Admin Backend Running!");
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
