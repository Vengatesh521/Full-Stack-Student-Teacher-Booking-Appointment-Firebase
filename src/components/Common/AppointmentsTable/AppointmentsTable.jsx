import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import "./AppointmentsTable.css";

const AppointmentsTable = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "appointments"),
      async (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAppointments(data);
      }
    );

    return () => unsub();
  }, []);

  if (appointments.length === 0) {
    return <p>No appointments found.</p>;
  }

  return (
    <div className="appointments-table-container">
      <table className="appointments-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Student</th>
            <th>Teacher</th>
            <th>Subject</th>
            <th>Date & Time</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt, index) => {
            const dateObj = new Date(appt.dateTime);
            const isValidDate = !isNaN(dateObj.getTime());

            return (
              <tr key={appt.id}>
                <td>{index + 1}</td>
                <td>
                  {appt.student?.username || appt.student?.email || "N/A"}
                </td>
                <td>
                  {appt.teacher?.username || appt.teacher?.email || "N/A"}
                </td>
                <td>{appt.teacher?.subject || "-"}</td>
                <td>
                  {isValidDate ? dateObj.toLocaleString() : "[not scheduled]"}
                </td>
                <td>{appt.purpose || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentsTable;
