import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBT6mGHTtYIrg3ZPRrr8r5hrjzSJwOeqY0",
    authDomain: "jpc-loop.firebaseapp.com",
    projectId: "jpc-loop",
    storageBucket: "jpc-loop.firebasestorage.app",
    messagingSenderId: "197134374651",
    appId: "1:197134374651:web:984217a43b8fe1ad70c25e"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const signInLink = document.querySelector(".navbar .signin");
const guestMessage = document.querySelector("[data-guest-only]");
const signInHref = signInLink?.getAttribute("href");
let currentUser = null;

signInLink?.addEventListener("click", async (event) => {
    if (!currentUser) return;

    event.preventDefault();
    await signOut(auth);
});

onAuthStateChanged(auth, (user) => {
    currentUser = user;

    if (signInLink) {
        signInLink.textContent = user ? "Sign out" : "Sign in";
        signInLink.setAttribute("href", user ? "#" : signInHref);
    }

    if (guestMessage) {
        guestMessage.hidden = Boolean(user);
    }
});
