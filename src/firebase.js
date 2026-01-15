import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your app's Firebase project configuration
// We will move these to helper function or env vars later
const firebaseConfig = {
  apiKey: "AIzaSyCkYnLrNvxrZTwkDuFHodOXsgkfsidhySA",
  authDomain: "dprintshare-31rs6.firebaseapp.com",
  projectId: "dprintshare-31rs6",
  storageBucket: "dprintshare-31rs6.firebasestorage.app",
  messagingSenderId: "306284169624",
  appId: "1:306284169624:web:df2d98a07a98a3bc6b03ed"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
