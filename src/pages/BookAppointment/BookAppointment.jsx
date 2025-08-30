import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../../components/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import "./BookAppointment.css";

const BookAppointment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { studentId, teacherId } = state || {};
  const [form, setForm] = useState({ purpose: "" });
  const [message, setMessage] = useState("");
  const [student, setStudent] = useState(null);
  const [teacher, setTeacher] = useState(null);

  // ✅ Fetch full student + teacher info
  useEffect(() => {
    const fetchUsers = async () => {
      if (!studentId || !teacherId) return;

      const studentSnap = await getDoc(doc(db, "Users", studentId));
      const teacherSnap = await getDoc(doc(db, "Users", teacherId));

      if (studentSnap.exists())
        setStudent({ id: studentSnap.id, ...studentSnap.data() });
      if (teacherSnap.exists())
        setTeacher({ id: teacherSnap.id, ...teacherSnap.data() });
    };

    fetchUsers();
  }, [studentId, teacherId]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!student || !teacher) {
      setMessage("❌ Missing user information.");
      return;
    }

    try {
      // ✅ Save complete info for easier querying
      await addDoc(collection(db, "appointments"), {
        student: {
          id: student.id,
          username: student.username || "",
          email: student.email || "",
        },
        teacher: {
          id: teacher.id,
          username: teacher.username || "",
          email: teacher.email || "",
          subject: teacher.subject || "",
        },
        purpose: form.purpose,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setMessage("✅ Appointment booked successfully!");
      setForm({ purpose: "" });

      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("Error booking appointment:", error);
      setMessage("❌ Booking failed. Try again.");
    }
  };

  if (!studentId || !teacherId) return <p>Missing student or teacher info.</p>;

  return (
    <div className="booking-container">
      <h2 className="booking-title">📅 Book Appointment</h2>

      {student && teacher && (
        <div className="info-box">
          <p>
            <strong>Student:</strong> {student.username} ({student.email})
          </p>
          <p>
            <strong>Teacher:</strong> {teacher.username} ({teacher.email})
          </p>
        </div>
      )}

      <form className="booking-form" onSubmit={handleSubmit}>
        <label>Purpose</label>
        <input
          type="text"
          name="purpose"
          placeholder="Why are you booking?"
          value={form.purpose}
          onChange={handleChange}
          required
        />

        <button type="submit">Submit Appointment</button>
      </form>

      {message && <p className="booking-message">{message}</p>}
    </div>
  );
};

export default BookAppointment;
