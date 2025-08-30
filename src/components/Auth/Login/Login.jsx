import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

const Login = () => {
  const [values, setValues] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    const { email, password } = values;
    if (!email || !password) return "All fields are required.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setMessage("❌ " + error);
      setMessageType("error");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      navigate("/");
      console.log("User logged in successfully.");
    } catch (err) {
      setMessage("❌ " + (err.message || "Login failed."));
      setMessageType("error");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h3>Welcome Back</h3>
          <p>Login to your account</p>
        </div>
        <div className="login-body">
          {message && (
            <div className={`login-alert ${messageType}`}>{message}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="loginEmail">Email</label>
              <input
                type="email"
                id="loginEmail"
                value={values.email}
                onChange={(e) =>
                  setValues({ ...values, email: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="loginPassword">Password</label>
              <input
                type="password"
                id="loginPassword"
                value={values.password}
                onChange={(e) =>
                  setValues({ ...values, password: e.target.value })
                }
                required
              />
            </div>

            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        </div>
        <div className="login-footer">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
