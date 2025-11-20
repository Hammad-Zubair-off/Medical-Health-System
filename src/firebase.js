
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // import Firestore
import { getAuth } from "firebase/auth"; // import Firebase Auth

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYjwxLmKAdDz2HDeLN6VaNgTD2bjt9pgs",
  authDomain: "nike-shoes-store-d8afd.firebaseapp.com",
  projectId: "nike-shoes-store-d8afd",
  storageBucket: "nike-shoes-store-d8afd.firebasestorage.app",
  messagingSenderId: "589205815084",
  appId: "1:589205815084:web:2a9c85e55891b17f8cb689"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and export it
export const db = getFirestore(app);

// Initialize Firebase Auth and export it
export const auth = getAuth(app);