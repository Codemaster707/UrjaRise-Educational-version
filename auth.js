import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    initializeFirestore,
    persistentLocalCache,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================
// FIREBASE CONFIG
// ======================
const firebaseConfig = {
    apiKey: "AIzaSyAtwvpnY1s1TykfB2hgYFlmD9JMj56EeI0",
    authDomain: "urjarise-x-pylearn.firebaseapp.com",
    projectId: "urjarise-x-pylearn",
    storageBucket: "urjarise-x-pylearn.firebasestorage.app",
    messagingSenderId: "179521402640",
    appId: "1:179521402640:web:0814154bf3f3fb64a99795",
    measurementId: "G-V2ZJ7FSPNH"
};

// Initialize Firebase with persistent local caching enabled
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
    localCache: persistentLocalCache()
});

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".tab");
    const togglePassword = document.querySelector(".toggle-password");
    const passwordInput = document.querySelector("#password");
    const emailInput = document.querySelector("#email");
    const submitText = document.querySelector("#submit-text");
    const form = document.querySelector("#auth-form");
    const googleBtn = document.querySelector(".google-btn");

    let isSignup = false;
    let isRedirecting = false;

    // Robust Redirect Evaluation Function checking the 'profiles' collection safely
    const handleRedirect = async (user) => {
        if (!user || isRedirecting) return;
        isRedirecting = true;

        const userDocRef = doc(db, "profiles", user.uid);

        try {
            // Directly check Firestore server/cache safely using standard getDoc
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
                // Profile exists -> Go to feed
                window.location.href = "feed.html";
            } else {
                // Profile does NOT exist yet -> Go to profile setup
                window.location.href = "profile.html";
            }
        } catch (error) {
            console.error("Redirect query error:", error);
            // Fallback safe behavior: if they are signing up or error occurs, go to feed or profile accordingly
            window.location.href = "feed.html"; 
        }
    };

    // Tab Switching Logic
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            isSignup = tab.id === "tab-signup";
            submitText.innerText = isSignup ? "Sign Up" : "Sign In";
        });
    });

    // Toggle Password Visibility
    if (togglePassword) {
        togglePassword.addEventListener("click", () => {
            const isPassword = passwordInput.type === "password";
            passwordInput.type = isPassword ? "text" : "password";
            togglePassword.classList.toggle("fa-eye", !isPassword);
            togglePassword.classList.toggle("fa-eye-slash", isPassword);
        });
    }

    // Email/Password Form Action
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) return;

        try {
            if (isSignup) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // New signups check profile existence (will be false, leading to profile.html)
                await handleRedirect(userCredential.user);
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                await handleRedirect(userCredential.user);
            }
        } catch (error) {
            console.error("Auth error:", error);
            alert(error.message);
            isRedirecting = false;
        }
    });

    // Instant Google Popup Handler
    googleBtn.addEventListener("click", async () => {
        try {
            googleBtn.disabled = true;
            googleBtn.innerHTML = `<span>Connecting...</span>`;

            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if profile exists in database for this Google account
            await handleRedirect(user);

        } catch (error) {
            console.error("Google Sign-In Error:", error);
            alert(error.message || "Google sign in failed");
            googleBtn.disabled = false;
            isRedirecting = false;
            googleBtn.innerHTML = `
                <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google" width="20" height="20">
                <span>Continue with Google</span>
            `;
        }
    });

    // Fallback Auth Listener for Auto-Login on Page Load
    onAuthStateChanged(auth, (user) => {
        // Only trigger auto-redirect if we are currently sitting on the auth page (`auth.html`)
        // This prevents interference when visiting other pages like streak.html or feed.html
        if (user && !isRedirecting && window.location.pathname.includes("auth.html")) {
            handleRedirect(user);
        }
    });
});