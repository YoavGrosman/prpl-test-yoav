import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyB86bJFyT8idiF4_IbedZ0ucpZJs6yHaUg",
    authDomain: "prpl-test-73bec.firebaseapp.com",
    projectId: "prpl-test-73bec",
    storageBucket: "prpl-test-73bec.appspot.com",
    messagingSenderId: "502104075194",
    appId: "1:502104075194:web:898cddef1a1807405a4b83"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore();