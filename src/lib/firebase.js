// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCohKVwJMMiMd4HMj9KCobhLkNR0_GUbIw",
  authDomain: "green-route-58b67.firebaseapp.com",
  projectId: "green-route-58b67",
  storageBucket: "green-route-58b67.firebasestorage.app",
  messagingSenderId: "155676635789",
  appId: "1:155676635789:web:72cf28e4eb3caf96e6e8c4",
  measurementId: "G-NSQGN03C6N"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
export const GoogleProvider = new GoogleAuthProvider();
export { app, auth, db };

// Authentication helper functions
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
export const signinwithgoogle = async () => {
  try{
    const result = await signInWithPopup(auth, GoogleProvider);
    return { user: result.user, error: null };
  } catch (err){
    console.log(err);
    return { user: null, error: err.message };
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
}; 