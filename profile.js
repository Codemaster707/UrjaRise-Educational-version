import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase Configuration
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

document.addEventListener('DOMContentLoaded', () => {

    let currentUser = null;
    let userPhotoURL = "";

    // --- 1. AUTHENTICATION & PRE-FILLING EXISTING PROFILE DATA ---
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = "auth.html";
        } else {
            currentUser = user;
            
            // If profile already exists, pre-fill the form so they can view/edit it seamlessly
            try {
                const profileDocRef = doc(db, "profiles", user.uid);
                const profileSnap = await getDoc(profileDocRef);
                if (profileSnap.exists()) {
                    const data = profileSnap.data();
                    if (document.getElementById('fullName')) document.getElementById('fullName').value = data.fullName || '';
                    if (document.getElementById('username')) document.getElementById('username').value = data.username || '';
                    if (document.getElementById('classGrade')) document.getElementById('classGrade').value = data.classGrade || '';
                    if (document.getElementById('strongestSubject')) document.getElementById('strongestSubject').value = data.strongestSubject || '';
                    if (document.getElementById('favouriteSubject')) document.getElementById('favouriteSubject').value = data.favouriteSubject || '';
                    if (document.getElementById('improvementSubject')) document.getElementById('improvementSubject').value = data.improvementSubject || '';
                }
            } catch (error) {
                console.error("Error fetching existing profile data:", error);
            }
            
            // Sync Google Account Profile Picture if available
            if (user.photoURL) {
                userPhotoURL = user.photoURL;
                const profileImg = document.getElementById('profileImage');
                const defaultIcon = document.getElementById('defaultUserIcon');
                
                if (profileImg && defaultIcon) {
                    profileImg.src = userPhotoURL;
                    profileImg.style.display = "block";
                    defaultIcon.style.display = "none";
                }
            }
        }
    });

    // --- 2. Background Particle Generator ---
    const particlesContainer = document.getElementById('particlesContainer');
    if (particlesContainer) {
        const particleCount = 200; 
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            const size = Math.random() * 5 + 2; 
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            
            const duration = Math.random() * 15 + 10; 
            const delay = Math.random() * 15;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;
            
            particlesContainer.appendChild(particle);
        }
    }

    // --- 3. Learning Style Pills Interaction (Max 3) ---
    const stylePills = document.querySelectorAll('.style-pill');
    const selectedCountSpan = document.getElementById('selectedCount');
    let selectedStyles = [];

    stylePills.forEach(pill => {
        pill.addEventListener('click', () => {
            const styleName = pill.getAttribute('data-style');

            if (pill.classList.contains('active')) {
                pill.classList.remove('active');
                selectedStyles = selectedStyles.filter(s => s !== styleName);
            } else {
                if (selectedStyles.length < 3) {
                    pill.classList.add('active');
                    selectedStyles.push(styleName);
                } else {
                    alert('You can select up to 3 learning styles.');
                }
            }
            if (selectedCountSpan) {
                selectedCountSpan.textContent = selectedStyles.length;
            }
        });
    });

    // --- 4. Secure Firestore Submission ---
    const profileForm = document.getElementById('profileForm');
    const submitBtn = document.getElementById('submitBtn');

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert("No authenticated user found. Please sign in again.");
            window.location.href = "auth.html";
            return;
        }

        const profileData = {
            uid: currentUser.uid,
            email: currentUser.email,
            photoURL: userPhotoURL || "",
            fullName: document.getElementById('fullName').value,
            username: document.getElementById('username').value,
            classGrade: document.getElementById('classGrade').value || "Not specified",
            strongestSubject: document.getElementById('strongestSubject').value,
            favouriteSubject: document.getElementById('favouriteSubject').value,
            improvementSubject: document.getElementById('improvementSubject').value,
            learningStyles: selectedStyles,
            updatedAt: new Date()
        };

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Saving...';

            // Save or update profile in Firestore
            await setDoc(doc(db, "profiles", currentUser.uid), profileData);
            
            alert('Profile successfully saved!');
            window.location.href = "feed.html";
            
        } catch (error) {
            console.error("Error saving profile: ", error);
            alert('Failed to save profile. Check console for details.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Continue <i class="fa-solid fa-arrow-right"></i>`;
        }
    });

    // Save Draft functionality
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', () => {
            alert('Draft saved locally!');
        });
    }
});