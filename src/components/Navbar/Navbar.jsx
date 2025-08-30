import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { auth } from "../firebase";

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const [menuActive, setMenuActive] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.clear();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <>
      <div className="mob">
        <div className={`off-screen-menu ${menuActive ? "active" : ""}`}>
          <div className="mob-center">
            {user?.role === "admin" && (
              <span className="role-center">🛡️ Admin</span>
            )}
            {user?.role === "teacher" && (
              <span className="role-center">👨‍🏫 Teacher</span>
            )}
            {user?.role === "student" && (
              <span className="role-center">🎓 Student</span>
            )}
          </div>

          <div className="mob-right">
            <span className="username">👤 {user?.username || user?.name}</span>
            <button className="logout-button-mob" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      <nav className="navbar">
        <div className="navbar-left" onClick={() => navigate("/")}>
          🎓 College Portal
        </div>

        <div className="navbar-center">
          {user?.role === "admin" && (
            <span className="role-center">🛡️ Admin</span>
          )}
          {user?.role === "teacher" && (
            <span className="role-center">👨‍🏫 Teacher</span>
          )}
          {user?.role === "student" && (
            <span className="role-center">🎓 Student</span>
          )}
        </div>

        <div className="navbar-right">
          <span className="username">👤 {user?.username || user?.name}</span>
          <button className="logout-button" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
        <div
          className={`ham-menu ${menuActive ? "active" : ""}`}
          onClick={() => setMenuActive(!menuActive)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
