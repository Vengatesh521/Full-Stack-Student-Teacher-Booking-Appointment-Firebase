import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../components/firebase";
import "./StudentDashbord.css";

const StudentDashboard = ({ user }) => {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch appointments for logged-in student
  useEffect(() => {
    if (!user?.uid) return;

    // 🔥 Fix: use nested field student.id
    const q = query(
      collection(db, "appointments"),
      where("student.id", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const appts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAppointments(appts);
      },
      (err) => console.error("Error fetching appointments", err)
    );

    return () => unsubscribe();
  }, [user]);

  // ✅ Fetch all teachers
  useEffect(() => {
    const q = query(collection(db, "Users"), where("role", "==", "teacher"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const teachersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTeachers(teachersList);
        setFiltered(teachersList);
      },
      (err) => console.error("Failed to fetch teachers", err)
    );

    return () => unsubscribe();
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value.toLowerCase();
    setSearch(val);
    const filtered = teachers.filter((t) =>
      (t.username || t.email || "").toLowerCase().includes(val)
    );
    setFiltered(filtered);
  };

  const handleBook = (teacher) => {
    navigate("/book-appointment", {
      state: {
        studentId: user.uid,
        studentName: user.username,
        studentEmail: user.email,
        teacherId: teacher.id,
        teacherName: teacher.username || teacher.email,
        teacherEmail: teacher.email,
        teacherSubject: teacher.subject || "-",
      },
    });
  };

  // ✅ Calculate appointment stats
  const appointmentStats = {
    total: appointments.length,
    approved: appointments.filter((a) => a.status === "approved").length,
    pending: appointments.filter((a) => a.status === "pending").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  return (
    <div className="dashboard-container">
      {/* Student Details Section */}
      <div className="student-details">
        <h2 className="dashboard-title">🎓 Student Dashboard</h2>
        <div className="student-info">
          <p>
            <strong>Name:</strong> {user?.username || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {user?.email || "N/A"}
          </p>
        </div>
        <div className="appointment-stats">
          <h3 className="stats-title">📊 Appointment Overview</h3>
          <p>
            <strong>Total Appointments:</strong> {appointmentStats.total}
          </p>
          <p>
            <strong>Approved:</strong> {appointmentStats.approved}
          </p>
          <p>
            <strong>Pending:</strong> {appointmentStats.pending}
          </p>
          <p>
            <strong>Cancelled:</strong> {appointmentStats.cancelled}
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search teachers..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      {/* Teachers Table */}
      <div className="table-container">
        <table className="teacher-table">
          <thead>
            <tr>
              <th>Teacher Name</th>
              <th>Subject</th>
              <th>Department</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((teacher) => (
              <tr key={teacher.id}>
                <td>{teacher.username || teacher.email}</td>
                <td>{teacher.subject || "-"}</td>
                <td>{teacher.department || "-"}</td>
                <td>
                  <button
                    className="msg-btn"
                    onClick={() =>
                      navigate("/message", {
                        state: {
                          studentId: user.uid,
                          studentName: user.username,
                          teacherId: teacher.id,
                          teacherName: teacher.username || teacher.email,
                        },
                      })
                    }
                  >
                    💬 Message
                  </button>
                  <button
                    className="book-btn"
                    onClick={() => handleBook(teacher)}
                  >
                    Book
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="4" className="no-data">
                  No teachers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Appointments Section */}
      <div className="appointments-section">
        <h3 className="appt-title">📋 Your Appointments</h3>
        <div className="appiontment-container">
          {appointments.length === 0 ? (
            <p className="no-data">No appointments found.</p>
          ) : (
            appointments.map((appt) => {
              const dateObj = new Date(appt.dateTime);
              const isValidDate = !isNaN(dateObj.getTime());
              const status = appt.status;

              let message = "⏳ Processing...";
              if (!isValidDate) message = "📅 Not yet scheduled.";
              else if (status === "cancelled")
                message = "❌ Your booking is cancelled.";
              else if (status === "approved")
                message = "✅ Your booking is approved.";
              else if (status === "pending") message = "🔄 Processing...";

              return (
                <div key={appt.id} className={`appt-box ${status}`}>
                  <p>
                    <strong>Teacher:</strong>{" "}
                    {appt.teacher?.username || appt.teacher?.email || "N/A"}
                  </p>
                  <p>
                    <strong>Date & Time:</strong>{" "}
                    {isValidDate ? dateObj.toLocaleString() : "Not scheduled"}
                  </p>
                  <p>
                    <strong>Purpose:</strong> {appt.purpose || "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className="status-message">{message}</span>
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
