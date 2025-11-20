// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2D9a-FVpJ5gfT-0-T6ZCglfNvsfh4JQo",
  authDomain: "allinone-db566.firebaseapp.com",
  projectId: "allinone-db566",
  storageBucket: "allinone-db566.firebasestorage.app",
  messagingSenderId: "688879571211",
  appId: "1:688879571211:web:a108252bd1d4a3a51b520e",
  measurementId: "G-SHHYW7W69K",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
