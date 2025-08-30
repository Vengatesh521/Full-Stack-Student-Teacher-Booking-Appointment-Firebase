import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase";
import "./TeacherDashbord.css";
import {
  FaUserGraduate,
  FaCalendarAlt,
  FaBullseye,
  FaInfoCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = ({ user }) => {
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [scheduleInputs, setScheduleInputs] = useState({});
  const navigate = useNavigate();

  // ✅ Fetch appointments where teacher.id == user.uid
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "appointments"),
      where("teacher.id", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAppointments(data);
    });

    return () => unsub();
  }, [user]);

  // ✅ Fetch messages involving this teacher
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "messages"),
      where("receiverId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsub();
  }, [user]);

  // ✅ Schedule appointment
  const handleSchedule = async (id) => {
    const dateTime = scheduleInputs[id];
    if (!dateTime) return alert("Please select a date and time.");

    try {
      await updateDoc(doc(db, "appointments", id), { dateTime });
      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? { ...app, dateTime } : app))
      );
    } catch (err) {
      console.error("Failed to schedule appointment:", err);
      alert("Failed to schedule appointment");
    }
  };

  // ✅ Update appointment status
  const handleUpdateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "appointments", id), { status });
      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status");
    }
  };

  const handleMessageClick = (studentId, studentName) => {
    navigate("/message", {
      state: {
        studentId,
        teacherId: user.uid,
        teacherName: user.username,
      },
    });
  };

  return (
    <div className="teacher-dashboard">
      <h2 className="teacher-title">🧑‍🏫 Teacher Dashboard</h2>

      {/* 🔔 Appointments */}
      <div className="card-container">
        {appointments.length === 0 ? (
          <p className="no-data-message">No appointment requests yet.</p>
        ) : (
          appointments.map((appt) => {
            const dateObj = new Date(appt.dateTime);
            const dateContent = isNaN(dateObj.getTime())
              ? "[not scheduled]"
              : dateObj.toLocaleString();

            return (
              <div key={appt.id} className="appointment-card">
                <p className="card-text">
                  <FaUserGraduate /> <strong>Student:</strong>{" "}
                  {appt.student?.username || appt.student?.email || "N/A"}
                </p>
                <p className="card-text">
                  <FaCalendarAlt /> <strong>Date:</strong> {dateContent}
                </p>
                <p className="card-text">
                  <FaBullseye /> <strong>Purpose:</strong> {appt.purpose}
                </p>
                <p className="card-text">
                  <FaInfoCircle /> <strong>Status:</strong>{" "}
                  <span
                    className={`status-badge ${
                      appt.status === "approved"
                        ? "status-approved"
                        : appt.status === "cancelled"
                        ? "status-cancelled"
                        : "status-pending"
                    }`}
                  >
                    {appt.status}
                  </span>
                </p>

                <div className="card-buttons">
                  {isNaN(dateObj.getTime()) && (
                    <>
                      <input
                        type="datetime-local"
                        value={scheduleInputs[appt.id] || ""}
                        onChange={(e) =>
                          setScheduleInputs((prev) => ({
                            ...prev,
                            [appt.id]: e.target.value,
                          }))
                        }
                        className="datetime-input"
                      />
                      <button
                        className="btn btn-schedule"
                        onClick={() => handleSchedule(appt.id)}
                      >
                        Schedule
                      </button>
                    </>
                  )}

                  {appt.status !== "approved" && (
                    <button
                      className="btn btn-approve"
                      onClick={() => handleUpdateStatus(appt.id, "approved")}
                    >
                      Approve
                    </button>
                  )}

                  {appt.status !== "pending" && appt.status !== "cancelled" && (
                    <button
                      className="btn btn-cancel"
                      onClick={() => handleUpdateStatus(appt.id, "cancelled")}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 💬 Recent Messages */}
      <h3 className="msg-section-title">💬 Messages</h3>
      <div className="messages-preview">
        {messages.length === 0 ? (
          <p>No messages found.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="msg-preview-card">
              <p>
                <strong>From:</strong>{" "}
                {msg.senderId === user.uid
                  ? "You"
                  : msg.senderName || "Unknown"}
              </p>
              <p>
                <strong>To:</strong>{" "}
                {msg.receiverId === user.uid
                  ? "You"
                  : msg.receiverName || "Unknown"}
              </p>
              <p>
                <strong>Message:</strong> {msg.content}
              </p>
              <small>
                {msg.createdAt?.toDate
                  ? msg.createdAt.toDate().toLocaleString()
                  : ""}
              </small>
              {msg.senderId !== user.uid && (
                <button
                  className="msg-btn"
                  onClick={() =>
                    handleMessageClick(msg.senderId, msg.senderName)
                  }
                >
                  💬 Reply
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
