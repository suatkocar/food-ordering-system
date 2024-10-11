import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import PrivateRoute from "./components/adminDashboard/PrivateRoute";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "./redux/slices/cartSlice";

function App() {
  const [mode, setMode] = useState("light");
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);

  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", newMode);
      return newMode;
    });
  };

  useEffect(() => {
    if (token) {
      dispatch(fetchCart());
    }
  }, [token, dispatch]);

  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode");
    if (savedMode === "light" || savedMode === "dark") {
      setMode(savedMode);
    } else {
      setMode("light");
      localStorage.setItem("themeMode", "light");
    }
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage mode={mode} toggleColorMode={toggleColorMode} />}
      />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route
        path="/admin-dashboard"
        element={
          <PrivateRoute role="admin">
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/customer-dashboard"
        element={
          <PrivateRoute role={null}>
            <CustomerDashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
