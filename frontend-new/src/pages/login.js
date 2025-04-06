import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);

                if (data.role === "admin") navigate("/AdminDashboard");
                else if (data.role === "user") navigate("/products");
                else if (data.role === "delivery") navigate("/orders");
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError("Something went wrong.");
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Login</h2>
            {error && <p style={styles.error}>{error}</p>}
            <form onSubmit={handleLogin} style={styles.form}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Login</button>
            </form>
        </div>
    );
};

// Styles object for inline styling
const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f0f0f0",
        padding: "20px",
    },
    header: {
        color: "#333",
        marginBottom: "20px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        width: "300px",
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    },
    input: {
        padding: "10px",
        marginBottom: "15px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        fontSize: "16px",
    },
    button: {
        padding: "10px",
        backgroundColor: "#4CAF50",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "16px",
    },
    error: {
        color: "red",
        marginBottom: "10px",
    },
};

export default Login;
