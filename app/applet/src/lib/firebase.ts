import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "planar-studio-8w1xt",
  appId: "1:437670655435:web:bb7b3503337c9f0730724e",
  apiKey: "AIzaSyAFZnkIVEAiLY9T0tcbUaGrvRJPJpWotFw",
  authDomain: "planar-studio-8w1xt.firebaseapp.com",
  storageBucket: "planar-studio-8w1xt.firebasestorage.app",
  messagingSenderId: "437670655435",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-e3860c07-16bd-4e5d-8d4c-7dc0b735ad76");
export const auth = getAuth(app);
