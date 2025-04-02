import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import AdminDashboard from "./pages/AdminDashboard";
import UserProducts from "./pages/UserProducts";
//import DeliveryOrders from "./pages/DeliveryOrders";

const App = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                {token && role === "admin" && <Route path="/admin" element={<AdminDashboard />} />}
                {token && role === "user" && <Route path="/products" element={<UserProducts />} />}
                {/* {token && role === "delivery" && <Route path="/orders" element={<DeliveryOrders />} />} */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
};

export default App;
