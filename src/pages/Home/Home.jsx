import React, { useEffect, useState } from "react";
import { auth, db } from "../../components/firebase";
import { doc, getDoc } from "firebase/firestore";
import Admin from "../../components/Common/AdminDashbord/AdminDashbord";
import Teacher from "../../components/Common/TeacherDashbord/TeacherDashbord";
import Student from "../../components/Common/StudentDashbord/StudentDashbord";
import Navbar from "../../components/Navbar/Navbar";
import "./Home.css";

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "Users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            // ✅ Merge UID with Firestore data
            const mergedUser = { uid: currentUser.uid, ...docSnap.data() };
            setUser(mergedUser);
            console.log("User data fetched:", mergedUser);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="home">Loading profile...</div>;

  if (!user) return <div className="home">No user data found.</div>;

  return (
    <div className="home">
      <Navbar user={user} />

      {user.role === "admin" && <Admin user={user} />}
      {user.role === "teacher" && <Teacher user={user} />}
      {user.role === "student" && <Student user={user} />}
    </div>
  );
};

export default Home;
