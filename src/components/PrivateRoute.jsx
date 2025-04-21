import React from "react";
import { useAuth } from "../context/AuthContext"; // Replace with your actual auth context

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth(); // Get the authenticated user from context

  // --- AUTH CHECK DISABLED FOR DEVELOPMENT ---
  // const navigate = useNavigate();
  // useEffect(() => {
  //   if (!currentUser) {
  //     navigate("/login"); // Redirect to login if not authenticated
  //   }
  // }, [currentUser, navigate]);

  // return currentUser ? children : null; // Render children if authenticated
  return children; // Allow access without authentication
};

export default PrivateRoute;
