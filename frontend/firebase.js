// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "vingo-food-delivery-e6e22.firebaseapp.com",
  projectId: "vingo-food-delivery-e6e22",
  storageBucket: "vingo-food-delivery-e6e22.firebasestorage.app",
  messagingSenderId: "262286883015",
  appId: "1:262286883015:web:c0d6a06cb48ecb5ba326e2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth=getAuth(app)

export {app,auth}