import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDTM8KHiPJmKyXumoKOfWdIsYfFOCt4lrQ",
    authDomain: "prepwise-af9cb.firebaseapp.com",
    projectId: "prepwise-af9cb",
    storageBucket: "prepwise-af9cb.firebasestorage.app",
    messagingSenderId: "428611903030",
    appId: "1:428611903030:web:73f50cc3e242a639474297",
    measurementId: "G-8CZ7M9QB7W"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) :getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);