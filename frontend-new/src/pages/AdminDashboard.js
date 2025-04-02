import { useState, useEffect } from "react";

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");

    useEffect(() => {
        fetch("http://localhost:5000/products")
            .then((res) => res.json())
            .then((data) => setProducts(data));
    }, []);

    const addProduct = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:5000/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token,
            },
            body: JSON.stringify({ name, description, price, stock }),
        });

        if (response.ok) {
            alert("Product added successfully!");
            window.location.reload();
        }
    };

    return (
        <div>
            <h2>Admin Dashboard</h2>
            <form onSubmit={addProduct}>
                <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
                <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} required />
                <button type="submit">Add Product</button>
            </form>

            <h3>Product List</h3>
            <ul>
                {products.map((p) => (
                    <li key={p.id}>{p.name} - ${p.price}</li>
                ))}
            </ul>
        </div>
    );
};

export default AdminDashboard;
