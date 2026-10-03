import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAtwvpnY1s1TykfB2hgYFlmD9JMj56EeI0",
    authDomain: "urjarise-x-pylearn.firebaseapp.com",
    projectId: "urjarise-x-pylearn",
    storageBucket: "urjarise-x-pylearn.firebasestorage.app",
    messagingSenderId: "179521402640",
    appId: "1:179521402640:web:0814154bf3f3fb64a99795",
    measurementId: "G-V2ZJ7FSPNH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let activeListeners = {};

function getLocalDateString() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

async function verifyAndEnforceStreakMaturity(userRef, userData) {
    const todayStr = getLocalDateString();
    const lastActiveStr = userData.lastActiveDate || "";

    let currentStreak = userData.currentStreak !== undefined ? userData.currentStreak : 0;
    let bestStreak = userData.bestStreak !== undefined ? userData.bestStreak : 0;
    let totalLogs = userData.totalLogs !== undefined ? userData.totalLogs : 0;

    if (lastActiveStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = [
            yesterday.getFullYear(),
            String(yesterday.getMonth() + 1).padStart(2, '0'),
            String(yesterday.getDate()).padStart(2, '0')
        ].join('-');

        if (lastActiveStr !== todayStr && lastActiveStr !== yesterdayStr) {
            currentStreak = 0;
        }
    } else {
        currentStreak = 0;
    }

    await setDoc(userRef, {
        isOnline: true,
        currentStreak: currentStreak,
        bestStreak: bestStreak,
        totalLogs: totalLogs
    }, { merge: true });

    return { currentStreak, bestStreak, totalLogs };
}

function listenToGlobalStreaks(container) {
    if (!container) return;

    const globalStreaksQuery = query(
        collection(db, "profiles"),
        orderBy("currentStreak", "desc"),
        limit(25)
    );

    activeListeners["global_streaks"] = onSnapshot(globalStreaksQuery, (snapshot) => {
        container.innerHTML = "";
        if (snapshot.empty) {
            container.innerHTML = `<div style="text-align:center; padding:30px; color:#cc5500; font-size:0.85rem;">No active scholar streaks found.</div>`;
            return;
        }

        snapshot.forEach((userDoc) => {
            const userData = userDoc.data();
            const rawStreak = userData.currentStreak || 0;
            const lastActive = userData.lastActiveDate || "";
            const istNow = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
            const yesterday = new Date(istNow);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = [
                yesterday.getUTCFullYear(),
                String(yesterday.getUTCMonth() + 1).padStart(2, '0'),
                String(yesterday.getUTCDate()).padStart(2, '0')
            ].join('-');
            
            const effectiveStreak = (lastActive >= yesterdayStr) ? rawStreak : 0;
            if (effectiveStreak === 0) return;

            const card = document.createElement("div");
            card.className = "streak-row-card";
            card.innerHTML = `
                <img src="${userData.photoURL || 'https://via.placeholder.com/40'}" alt="Scholar">
                <div class="streak-row-info">
                    <h5>${userData.name || userData.username || 'Campus Scholar'}</h5>
                    <p>@${userData.username || 'scholar'}</p>
                </div>
                <div class="streak-row-badge">
                    <span>${effectiveStreak}</span>
                    <i class="fas fa-book-open"></i>
                </div>
            `;
            container.appendChild(card);
        });
    }, (error) => {
        console.error("Global streak connection error: ", error);
    });
}

// --- URJA BACKGROUND ANIMATION GENERATOR ---
function initUrjaBackground() {
    const appContainer = document.querySelector('.app-container');
    if (!appContainer) return;

    // Prevent duplicate particle layers if re-initialized
    if (appContainer.querySelector('.urja-bg-particles')) return;

    const particleContainer = document.createElement('div');
    particleContainer.className = 'urja-bg-particles';
    appContainer.appendChild(particleContainer);

    // Create floating energy sparks
    const particleCount = 14;
    for (let i = 0; i < particleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        
        // Random sizing and positioning
        const size = Math.random() * 6 + 3; // 3px to 9px
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.bottom = `-20px`;
        
        // Randomize animation duration and delays for organic movement
        const duration = Math.random() * 4 + 4; // 4s to 8s
        const delay = Math.random() * 5; // 0s to 5s
        sparkle.style.animationDuration = `${duration}s`;
        sparkle.style.animationDelay = `${delay}s`;

        particleContainer.appendChild(sparkle);
    }
}

// Initialize background elements and authentication state handling
document.addEventListener("DOMContentLoaded", () => {
    initUrjaBackground();
});

onAuthStateChanged(auth, async (user) => {
    if (user) { 
        try {
            const userRef = doc(db, "profiles", user.uid);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) { 
                window.location.href = "profile.html"; 
                return; 
            }

            const initialUserData = userSnap.data();
            const updatedData = await verifyAndEnforceStreakMaturity(userRef, initialUserData);

            const profilePhotoEl = document.getElementById("headerProfilePhoto");
            const usernameEl = document.getElementById("headerUsername");
            const currentStreakEl = document.getElementById("userCurrentStreak");
            const bestStreakEl = document.getElementById("userBestStreak");
            const totalLogsEl = document.getElementById("userTotalLogs");

            if (profilePhotoEl) profilePhotoEl.src = user.photoURL || initialUserData.photoURL || "https://via.placeholder.com/40";
            if (usernameEl) usernameEl.textContent = "@" + (initialUserData.username || initialUserData.name || "scholar");
            if (currentStreakEl) currentStreakEl.textContent = updatedData.currentStreak;
            if (bestStreakEl) bestStreakEl.textContent = updatedData.bestStreak;
            if (totalLogsEl) totalLogsEl.textContent = updatedData.totalLogs;

            const globalContainer = document.getElementById("global-streaks-container");
            listenToGlobalStreaks(globalContainer);

        } catch (error) {
            console.error("Streak initialization error:", error);
        }
    } else {
        window.location.href = "auth.html"; 
    }
});