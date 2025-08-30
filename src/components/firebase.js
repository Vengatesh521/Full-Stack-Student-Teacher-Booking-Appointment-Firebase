// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHK4oWtBWt1JARaFxJQODdmqCyWm_CFaQ",
  authDomain: "teacher-student-booking-81252.firebaseapp.com",
  projectId: "teacher-student-booking-81252",
  storageBucket: "teacher-student-booking-81252.firebasestorage.app",
  messagingSenderId: "669865024608",
  appId: "1:669865024608:web:6f15c9346c1e8ebc73f705",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore(app);
export default app;
