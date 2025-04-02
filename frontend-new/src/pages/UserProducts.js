import { useState, useEffect } from "react";

const UserProducts = () => {
    const [products, setProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [address, setAddress] = useState("");

    useEffect(() => {
        fetch("http://localhost:5000/products")
            .then((res) => res.json())
            .then((data) => setProducts(data));
    }, []);

    const placeOrder = async (productId) => {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:5000/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token,
            },
            body: JSON.stringify({ product_id: productId, quantity, address }),
        });

        if (response.ok) {
            alert("Order placed successfully!");
        }
    };

    return (
        <div>
            <h2>Products</h2>
            <input type="text" placeholder="Your Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            {products.map((p) => (
                <div key={p.id}>
                    <h3>{p.name}</h3>
                    <p>{p.description}</p>
                    <p>${p.price}</p>
                    <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                    <button onClick={() => placeOrder(p.id)}>Order</button>
                </div>
            ))}
        </div>
    );
};

export default UserProducts;
