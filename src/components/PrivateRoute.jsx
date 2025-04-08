import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Replace with your actual auth context

const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Get the authenticated user from context

  useEffect(() => {
    if (!currentUser) {
      navigate("/login"); // Redirect to login if not authenticated
    }
  }, [currentUser, navigate]);

  return currentUser ? children : null; // Render children if authenticated
};

export default PrivateRoute;