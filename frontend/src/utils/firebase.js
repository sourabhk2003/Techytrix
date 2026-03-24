// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "studio-5706931924-3d492.firebaseapp.com",
  projectId: "studio-5706931924-3d492",
  storageBucket: "studio-5706931924-3d492.firebasestorage.app",
  messagingSenderId: "564408630437",
  appId: "1:564408630437:web:3704d04134b1c63da5614c",
  measurementId: "G-XGLPFPW4CP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider= new GoogleAuthProvider();

export {auth,provider};

