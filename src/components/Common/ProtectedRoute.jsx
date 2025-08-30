// src/pages/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../../components/firebase"; // ✅ correct path
import { doc, getDoc } from "firebase/firestore";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log(user);

        try {
          const docRef = doc(db, "Users", user.uid);
          const docSnap = await getDoc(docRef);
          console.log(docSnap.exists());

          if (docSnap.exists()) {
            setIsAuthenticated(true);
            console.log(isAuthenticated);
          } else {
            setIsAuthenticated(false);
            console.log(isAuthenticated);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
        console.log(isAuthenticated);
      }
    });

    return () => unsubscribe(); // cleanup
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // spinner can be used
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
