import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCQWvrTtEtpFHzvadIn7fOzh1FdVJ7GU6c",
  authDomain: "skincare-f1dab.firebaseapp.com",
  projectId: "skincare-f1dab",
  storageBucket: "skincare-f1dab.firebasestorage.app",
  messagingSenderId: "187642976826",
  appId: "1:187642976826:web:7b087f050c6b17e8b37303",
  measurementId: "G-T2D7ZK4BVF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
export default app;