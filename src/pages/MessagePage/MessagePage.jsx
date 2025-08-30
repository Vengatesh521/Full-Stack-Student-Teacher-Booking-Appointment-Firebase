import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { auth, db } from "../../components/firebase";

import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import Navbar from "../../components/Navbar/Navbar";
import "./MessagePage.css";

const MessagePage = () => {
  const { state } = useLocation();
  const { teacherId, teacherName } = state || {};

  const [messages, setMessages] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);

  // ✅ Get current logged-in user + Firestore profile
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "Users", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              ...docSnap.data(), // merge Firestore fields (role, department, subject, etc.)
            });
          } else {
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Load messages between student & teacher
  useEffect(() => {
    if (!user?.uid || !teacherId) return;

    const q = query(
      collection(db, "messages"),
      where("participants", "array-contains", user.uid),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (msg) =>
            (msg.sender === user.uid && msg.receiver === teacherId) ||
            (msg.sender === teacherId && msg.receiver === user.uid)
        );
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [user, teacherId]);

  // ✅ Load appointments with teacher
  useEffect(() => {
    if (!user?.uid || !teacherId) return;

    const q = query(
      collection(db, "appointments"),
      where("studentId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appts = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((appt) => appt.teacherId === teacherId);

      setAppointments(appts);
    });

    return () => unsubscribe();
  }, [user, teacherId]);

  // ✅ Send new message
  const handleSend = async () => {
    if (!newMessage.trim() || !user?.uid || !teacherId) return;

    try {
      await addDoc(collection(db, "messages"), {
        sender: user.uid,
        receiver: teacherId,
        participants: [user.uid, teacherId], // useful for querying
        content: newMessage,
        createdAt: new Date(),
      });
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="message-page">
      {/* ✅ Full user object (uid + Firestore details) passed to Navbar */}
      <Navbar user={user} />

      <h2>💬 Messages with {teacherName}</h2>

      <div className="messages-list">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`msg ${msg.sender === user.uid ? "sent" : "received"}`}
          >
            <p>{msg.content}</p>
            <small>
              {msg.createdAt?.toDate
                ? msg.createdAt.toDate().toLocaleString()
                : "Just now"}
            </small>
          </div>
        ))}
      </div>

      <div className="message-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={handleSend} disabled={!newMessage.trim()}>
          Send
        </button>
      </div>

      <h3>📋 Appointments with {teacherName}</h3>
      <div className="appointment-container">
        {appointments.map((appt) => (
          <div key={appt.id} className={`appt-item ${appt.status}`}>
            <p>
              <strong>Date:</strong>{" "}
              {appt.dateTime
                ? new Date(appt.dateTime).toLocaleString()
                : "Not scheduled"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`status-text ${appt.status}`}>
                {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
              </span>
            </p>
            <p>
              <strong>Purpose:</strong> {appt.purpose || "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessagePage;
