import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD0OnI9xb_cQmlKYVjSSaBNK4hCPzClzrM",
  authDomain: "quiz-practice-55451.firebaseapp.com",
  projectId: "quiz-practice-55451",
  storageBucket: "quiz-practice-55451.appspot.com",
  messagingSenderId: "842699930343",
  appId: "1:842699930343:web:4d7779bc27d7274abd0042",
  measurementId: "G-B6E00Z79LT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore();
export default app;
