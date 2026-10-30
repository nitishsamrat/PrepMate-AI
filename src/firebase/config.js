import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAn4BLUA6HRB6TzVCA5U2G1W7V8kOHVwNk",
  authDomain: "prepmate-ai-16197.firebaseapp.com",
  projectId: "prepmate-ai-16197",
  storageBucket: "prepmate-ai-16197.firebasestorage.app",
  messagingSenderId: "147352187761",
  appId: "1:147352187761:web:bd2487efcababe5d2cbcd0",
  measurementId: "G-G5F8CW80MB"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;