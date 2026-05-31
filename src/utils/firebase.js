// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "ai-interviwer-56e30.firebaseapp.com",
  projectId: "ai-interviwer-56e30",
  storageBucket: "ai-interviwer-56e30.firebasestorage.app",
  messagingSenderId: "801344903887",
  appId: "1:801344903887:web:54ee11d1a633dff8fb75ba",
  measurementId: "G-7DGKPJ4430"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account"
});
export { app, auth, analytics, provider };