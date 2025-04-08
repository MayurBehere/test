import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth(); // from AuthContext

  // Send token to backend
  const sendTokenToBackend = async (token) => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/auth/verify-token", {
        idToken: token,
      });

      setCurrentUser(response.data.uid); // Save UID in context
      navigate("/main"); // Redirect to main page
    } catch (err) {
      console.error("❌ Error sending token to backend:", err);
      setError(err.response?.data?.error || "Failed to authenticate");
    }
  };

  // Login with Email/Password
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(null); // clear old error
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      await sendTokenToBackend(token);
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password");
    }
  };

  // Login with Google
  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const token = await userCredential.user.getIdToken();
      await sendTokenToBackend(token);
    } catch (err) {
      console.error("Google login failed:", err);
      setError("Google login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      <form onSubmit={handleEmailLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>

      <button onClick={handleGoogleLogin}>Login with Google</button>

      <p>
        Don't have an account? <a href="/register">Register</a>
      </p>
      <p>
        Forgot Password? <a href="/forgot-password">Reset here</a>
      </p>
    </div>
  );
};

export default Login;
