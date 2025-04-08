import React, { useState } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("A reset link has been sent to your email.");
      setTimeout(() => navigate("/login"), 5000); // Redirect to login after 5 sec
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      <p>Enter your email address to receive a password reset link.</p>

      <form onSubmit={handleResetPassword}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Link</button>
      </form>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <p>
        Remembered your password? <a href="/login">Login</a>
      </p>
      <p>
        Don't have an account? <a href="/register">Register</a>
      </p>
      <p>
        Back to <a href="/">Home</a>
      </p>
    </div>
  );
};

export default ForgotPassword;
