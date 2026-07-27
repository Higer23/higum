import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBCymaJvnsJpAVta8JrHAGIN-VOq5oRGug",
  authDomain: "hig-um.firebaseapp.com",
  databaseURL: "https://hig-um-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "hig-um",
  storageBucket: "hig-um.firebasestorage.app",
  messagingSenderId: "806579726040",
  appId: "1:806579726040:web:2bd2ae173d3bfd3f9999ad",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const firestore = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const database = getDatabase(app);

export { firestore, auth, storage, database };
