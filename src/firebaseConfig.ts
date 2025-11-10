import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDNFPYf07bSfgt9PenvBnHsCtsGSVA2mZo",
  authDomain: "householdchoresshriya.firebaseapp.com",
  projectId: "householdchoresshriya",
  storageBucket: "householdchoresshriya.firebasestorage.app",
  messagingSenderId: "181031044653",
  appId: "1:181031044653:web:5385eb8a6a1b97bd32daa4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
