import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import "./AdminDashbord.css";
import AppointmentsTable from "../AppointmentsTable/AppointmentsTable";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  // ✅ fetch teachers & students in realtime
  useEffect(() => {
    // Teachers
    const teachersQuery = query(
      collection(db, "Users"),
      where("role", "==", "teacher")
    );
    const unsubTeachers = onSnapshot(teachersQuery, (snapshot) => {
      setTeachers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // Students waiting for approval
    const studentsQuery = query(
      collection(db, "Users"),
      where("role", "==", "student"),
      where("approved", "==", false)
    );
    const unsubStudents = onSnapshot(studentsQuery, (snapshot) => {
      setStudents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubTeachers();
      unsubStudents();
    };
  }, []);

  // ✅ delete teacher
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?"))
      return;
    try {
      await deleteDoc(doc(db, "Users", id));
    } catch (err) {
      alert("Failed to delete teacher: " + err.message);
    }
  };

  // ✅ edit teacher
  const handleEdit = async (teacher) => {
    const newName = prompt("Enter new name", teacher.username);
    const newEmail = prompt("Enter new email", teacher.email);
    if (!newName || !newEmail) return;

    try {
      await updateDoc(doc(db, "Users", teacher.id), {
        username: newName,
        email: newEmail,
      });
    } catch (err) {
      alert("Failed to update teacher: " + err.message);
    }
  };

  // ✅ approve student
  const handleApprove = async (id) => {
    try {
      await updateDoc(doc(db, "Users", id), {
        approved: true,
      });
    } catch (err) {
      alert("Approval failed: " + err.message);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "teachers":
        return (
          <div className="admin-section">
            <h3>🧑‍🏫 All Teachers</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Department</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id}>
                    <td>{t.username}</td>
                    <td>{t.email}</td>
                    <td>{t.subject}</td>
                    <td>{t.department}</td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(t)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(t.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "approve":
        return (
          <div className="admin-section">
            <h3>✅ Approve Students</h3>
            {students.length === 0 ? (
              <p className="no-data-message">No students to approve.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td>{s.username}</td>
                      <td>{s.email}</td>
                      <td>{s.department}</td>
                      <td>
                        <button
                          className="btn-approve"
                          onClick={() => handleApprove(s.id)}
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );

      case "appointments":
        return <AppointmentsTable />;

      case "settings":
        return (
          <p className="coming-soon">⚙️ Manage System Settings - Coming Soon</p>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <h2 className="admin-title">👩‍💼 Admin Dashboard</h2>

      <div className="tab-buttons">
        <button
          className={`tab-btn ${activeTab === "teachers" ? "active" : ""}`}
          onClick={() => setActiveTab("teachers")}
        >
          Teachers
        </button>
        <button
          className={`tab-btn ${activeTab === "approve" ? "active" : ""}`}
          onClick={() => setActiveTab("approve")}
        >
          Approve Students
        </button>
        <button
          className={`tab-btn ${activeTab === "appointments" ? "active" : ""}`}
          onClick={() => setActiveTab("appointments")}
        >
          View Appointments
        </button>
        <button
          className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>

      <div className="tab-content">{renderTabContent()}</div>
    </div>
  );
};

export default AdminDashboard;
