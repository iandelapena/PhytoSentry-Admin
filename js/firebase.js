import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDgQdoYYqWX43mTguUV7vsuTOTlMrwps9M",
    authDomain: "pythosentry.firebaseapp.com",
    projectId: "pythosentry",
    storageBucket: "pythosentry.firebasestorage.app",
    messagingSenderId: "91563751030",
    appId: "1:91563751030:web:152d7d9105c9b8f5315157"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);