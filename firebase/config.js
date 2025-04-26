import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXwnAEaHYgmD6i4_DbkWEk-a6g2a3jo28",
  authDomain: "vedgarden-fca43.firebaseapp.com",
  projectId: "vedgarden-fca43",
  storageBucket: "vedgarden-fca43.firebasestorage.app",
  messagingSenderId: "11742832849",
  appId: "1:11742832849:web:5ca3b345457d9a59a9bdf0",
  measurementId: "G-VQ9LENEBRF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, storage, db, googleProvider };