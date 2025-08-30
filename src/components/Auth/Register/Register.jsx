import React from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase";
import { setDoc, doc } from "firebase/firestore";

const Register = () => {
  const [values, setValues] = React.useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    name: "",
    department: "",
    subject: "",
  });

  const [message, setMessage] = React.useState("");
  const [messageType, setMessageType] = React.useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    const {
      username,
      email,
      password,
      confirmPassword,
      role,
      name,
      department,
      subject,
    } = values;

    if (
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !role ||
      !name ||
      !department ||
      !subject
    )
      return "All fields are required.";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Invalid email address.";

    if (password.length < 6) return "Password must be at least 6 characters.";

    if (password !== confirmPassword) return "Passwords do not match.";

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
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = auth.currentUser;
      console.log(user);
      console.log("User registered successfully.");
      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          username: values.username,
          email: values.email,
          role: values.role,
          name: values.name,
          department: values.department,
          subject: values.subject,
        });
        setTimeout(() => navigate("/login"), 1000);
        setMessage("✅ Registration successful! Redirecting to login...");
      }
    } catch (err) {
      setMessage("❌ " + (err.message || "Registration failed."));
      setMessageType("error");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h3>Create Account</h3>
        </div>
        <div className="register-body">
          {message && (
            <div className={`register-alert ${messageType}`}>{message}</div>
          )}
          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={values.username}
                onChange={(e) =>
                  setValues({ ...values, username: e.target.value })
                }
              />
            </div>

            {/* Name */}
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={values.name}
                onChange={(e) => setValues({ ...values, name: e.target.value })}
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={values.email}
                onChange={(e) =>
                  setValues({ ...values, email: e.target.value })
                }
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={values.password}
                onChange={(e) =>
                  setValues({ ...values, password: e.target.value })
                }
              />
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={values.confirmPassword}
                onChange={(e) =>
                  setValues({ ...values, confirmPassword: e.target.value })
                }
              />
            </div>

            {/* Role */}
            <div className="form-group">
              <label>Role</label>
              <select
                value={values.role}
                onChange={(e) => setValues({ ...values, role: e.target.value })}
              >
                <option value="">Select Role</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Department */}
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                value={values.department}
                onChange={(e) =>
                  setValues({ ...values, department: e.target.value })
                }
              />
            </div>

            {/* Subject */}
            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                value={values.subject}
                onChange={(e) =>
                  setValues({ ...values, subject: e.target.value })
                }
              />
            </div>

            <button type="submit" className="register-button">
              Register
            </button>
          </form>
        </div>
        <div className="register-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
