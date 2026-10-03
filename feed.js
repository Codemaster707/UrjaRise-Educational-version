// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy, 
    where, 
    serverTimestamp, 
    increment, 
    arrayUnion, 
    arrayRemove, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAtwvpnY1s1TykfB2hgYFlmD9JMj56EeI0",
    authDomain: "urjarise-x-pylearn.firebaseapp.com",
    projectId: "urjarise-x-pylearn",
    storageBucket: "urjarise-x-pylearn.firebasestorage.app",
    messagingSenderId: "179521402640",
    appId: "1:179521402640:web:0814154bf3f3fb64a99795",
    measurementId: "G-V2ZJ7FSPNH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const greetingText = document.getElementById("greetingText");
const headerUsername = document.getElementById("headerUsername");
const headerProfilePhoto = document.getElementById("headerProfilePhoto");
const headerFriendsCount = document.getElementById("headerFriendsCount");
const headerUrjaPoints = document.getElementById("headerUrjaPoints");
const logoutBtn = document.getElementById("logoutBtn");
const feedPostsContainer = document.getElementById("feedPostsContainer");
const filterPills = document.querySelectorAll(".filter-pill");

// Modals & Drawers
const openPostModalBtn = document.getElementById("openPostModalBtn");
const postModal = document.getElementById("postModal");
const closePostModal = document.getElementById("closePostModal");
const submitPostBtn = document.getElementById("submitPost");
const postDescription = document.getElementById("postDescription");
const postCategory = document.getElementById("postCategory");

const viewFriendsTrigger = document.getElementById("viewFriendsTrigger");
const friendsDrawerOverlay = document.getElementById("friendsDrawerOverlay");
const closeFriendsDrawerBtn = document.getElementById("closeFriendsDrawerBtn");
const activeFriendsContainerList = document.getElementById("activeFriendsContainerList");

const notificationBtn = document.getElementById("notificationBtn");
const notificationPopup = document.getElementById("notificationPopup");
const notificationBadge = document.getElementById("notificationBadge");
const popupContainer = document.getElementById("popupContainer");

let currentCategory = "all";
let activeUser = null;
let unsubscribePosts = null;
let renderToken = 0;
const POST_POINTS = 8; // earned per post, deducted when a post is deleted

// Signed-in user's display info (filled by fetchUserData)
let myProfile = { fullName: "", username: "", photoURL: "" };
// uid -> { name, username, photo } so every post shows its author's real identity
const userCache = new Map();

const DEFAULT_AVATAR = "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#e9ecef"/><circle cx="20" cy="15" r="7" fill="#adb5bd"/><path d="M6 40c0-9 6-15 14-15s14 6 14 15z" fill="#adb5bd"/></svg>'
);
if (headerProfilePhoto) headerProfilePhoto.src = DEFAULT_AVATAR;

// Looks up a user's public identity. The profile form saves to "profiles"
// (fullName, username, photoURL); older data may live in "users".
async function getAuthorInfo(uid) {
    if (!uid) return {};
    if (userCache.has(uid)) return userCache.get(uid);
    let info = {};
    try {
        const [pSnap, uSnap] = await Promise.all([
            getDoc(doc(db, "profiles", uid)).catch(() => null),
            getDoc(doc(db, "users", uid)).catch(() => null)
        ]);
        const p = pSnap && pSnap.exists() ? pSnap.data() : {};
        const u = uSnap && uSnap.exists() ? uSnap.data() : {};
        info = {
            name: p.fullName || u.name || "",
            username: p.username || u.username || "",
            photo: p.photoURL || u.photoURL || ""
        };
    } catch (e) {
        console.error("Author lookup failed:", e);
    }
    userCache.set(uid, info);
    return info;
}

// Track Auth State properly using the auth instance
onAuthStateChanged(auth, (appAuthUser) => {
    if (appAuthUser) {
        activeUser = appAuthUser;
        fetchUserData(appAuthUser.uid);
        setupFeedListeners();
        loadDirectMessagesBadgeAndList(appAuthUser.uid);
        loadFriendsList(appAuthUser.uid);
    } else {
        window.location.href = "login.html";
    }
});

// Fetch User Profile Data (profiles -> users -> Google account fallback)
async function fetchUserData(uid) {
    const authUser = auth.currentUser;
    try {
        const [profileSnap, userSnap] = await Promise.all([
            getDoc(doc(db, "profiles", uid)),
            getDoc(doc(db, "users", uid))
        ]);
        const p = profileSnap.exists() ? profileSnap.data() : {};
        const u = userSnap.exists() ? userSnap.data() : {};

        const fullName = p.fullName || u.name || (authUser && authUser.displayName) || "";
        const username = p.username || u.username ||
            (authUser && authUser.email ? authUser.email.split("@")[0] : "");
        const photo = p.photoURL || u.photoURL || (authUser && authUser.photoURL) || "";

        myProfile = { fullName, username, photoURL: photo };
        userCache.set(uid, { name: fullName, username, photo });

        const firstName = fullName.split(" ")[0];
        greetingText.textContent = `Welcome back, ${firstName || "Achiever"} 👋`;
        headerUsername.textContent = username ? `@${username}` : "@student";
        if (photo) headerProfilePhoto.src = photo;
        headerUrjaPoints.textContent = u.urjaPoints || 0;
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

// Log Out Handler
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            window.location.href = "login.html";
        }).catch((error) => {
            console.error("Sign out error:", error);
        });
    });
}

// Modal Toggle Controls
if (openPostModalBtn) {
    openPostModalBtn.addEventListener("click", () => {
        postModal.style.display = "flex";
    });
}
if (closePostModal) {
    closePostModal.addEventListener("click", () => {
        postModal.style.display = "none";
    });
}

// Category Filters
filterPills.forEach(pill => {
    pill.addEventListener("click", () => {
        filterPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        currentCategory = pill.getAttribute("data-category");
        setupFeedListeners();
    });
});

// Submit New Progress Post
if (submitPostBtn) {
    submitPostBtn.addEventListener("click", async () => {
        const desc = postDescription.value.trim();
        const category = postCategory.value;

        if (!desc) {
            alert("Please enter a progress description.");
            return;
        }

        submitPostBtn.disabled = true;
        submitPostBtn.textContent = "Posting...";

        let posted = false;
        try {
            await addDoc(collection(db, "posts"), {
                uid: activeUser.uid,
                authorName: myProfile.fullName || "Student",
                authorUsername: myProfile.username || "",
                authorPhoto: myProfile.photoURL || "",
                category: category,
                content: desc,
                respectsCount: 0,
                respectsUsers: [],
                createdAt: serverTimestamp()
            });
            posted = true;
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to post progress. Check your connection and try again.");
        }

        if (posted) {
            postDescription.value = "";
            postModal.style.display = "none";

            // Points are a bonus: a failure here must NOT report the post as failed.
            // setDoc+merge also works when the users/{uid} document doesn't exist yet.
            try {
                await setDoc(doc(db, "users", activeUser.uid), { urjaPoints: increment(POST_POINTS) }, { merge: true });
                headerUrjaPoints.textContent = (parseInt(headerUrjaPoints.textContent, 10) || 0) + POST_POINTS;
                alert(`Progress logged successfully! +${POST_POINTS} Urja Points ⚡`);
            } catch (pointsError) {
                console.error("Post saved, but awarding points failed:", pointsError);
                alert("Progress logged successfully!");
            }
        }

        submitPostBtn.disabled = false;
        submitPostBtn.textContent = "Post Progress";
    });
}

// Real-time Feed Listener
function setupFeedListeners() {
    if (unsubscribePosts) unsubscribePosts();

    let q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    if (currentCategory !== "all") {
        q = query(collection(db, "posts"), where("category", "==", currentCategory), orderBy("createdAt", "desc"));
    }

    const token = ++renderToken;
    unsubscribePosts = onSnapshot(q, async (snapshot) => {
        if (snapshot.empty) {
            feedPostsContainer.innerHTML = `<div class="popup-empty-msg">No progress posts found in this category yet. Be the first!</div>`;
            return;
        }

        // Resolve every author's real username/photo before drawing the cards
        const uids = [...new Set(snapshot.docs.map(d => d.data().uid).filter(Boolean))];
        await Promise.all(uids.map(getAuthorInfo));
        if (token !== renderToken) return; // a newer filter/snapshot took over

        feedPostsContainer.innerHTML = "";
        snapshot.forEach((docSnap) => {
            renderPostCard(docSnap.id, docSnap.data());
        });
    }, (error) => {
        console.error("Error listening to feed:", error);
        feedPostsContainer.innerHTML = `<div class="popup-empty-msg">Failed to load feed stream.</div>`;
    });
}

// Render Individual Post Card
function renderPostCard(postId, post) {
    const isOwner = post.uid === activeUser.uid;
    const hasRespected = post.respectsUsers && post.respectsUsers.includes(activeUser.uid);

    const author = userCache.get(post.uid) || {};
    const legacyName = post.authorName && !post.authorName.startsWith("@") ? post.authorName : "";
    const displayName = author.name || legacyName || "Student";
    const displayUsername = author.username || post.authorUsername || "";
    const displayPhoto = author.photo || post.authorPhoto || DEFAULT_AVATAR;
    const respectCount = post.respectsCount || 0;
    const safeCategory = escapeHtml(post.category || "others");

    const card = document.createElement("div");
    card.className = "post-card";
    card.innerHTML = `
        <div class="post-header">
            <img src="${escapeHtml(displayPhoto)}" alt="${escapeHtml(displayName)}" onerror="this.onerror=null;this.src='${DEFAULT_AVATAR}'">
            <div class="post-author-info">
                <h5>${escapeHtml(displayName)}</h5>
                <div class="post-author-sub">
                    ${displayUsername ? `<span class="post-username">@${escapeHtml(displayUsername)}</span><span class="post-dot">•</span>` : ""}
                    <span>${timeAgo(post.createdAt?.toDate())}</span>
                </div>
            </div>
        </div>
        <div class="post-body">
            <span class="post-category-tag tag-${safeCategory}">${safeCategory}</span>
            <p>${escapeHtml(post.content)}</p>
        </div>
        <div class="engagement-bar">
            <div class="respect-btn-container">
                <button class="respect-hold-btn ${hasRespected ? 'has-respected' : ''}" data-id="${postId}" title="${hasRespected ? 'You respected this' : 'Hold for 2 seconds to give respect'}" aria-label="Give respect">
                    <i class="fa-solid fa-hands-clapping"></i>
                    <svg viewBox="0 0 36 36">
                        <path class="bg-track" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path class="progress-track" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                </button>
                <span class="respect-count-text" id="respectCount-${postId}">${respectCount} ${respectCount === 1 ? "Respect" : "Respects"}</span>
            </div>
            <button class="comment-trigger-btn" data-id="${postId}">
                <i class="fa-regular fa-comment"></i> Comments
            </button>
        </div>
        <div id="commentsWrapper-${postId}" class="comments-section-wrapper hidden">
            <div class="comments-feed-list" id="commentsList-${postId}">
                <div class="popup-loading">Loading comments...</div>
            </div>
            <div class="comment-compose-box">
                <input type="text" id="commentInput-${postId}" placeholder="Write an encouraging reply...">
                <button class="comment-dispatch-btn" data-id="${postId}"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
        ${isOwner ? `
            <div class="post-actions">
                <button class="action-btn delete-btn" data-id="${postId}">Delete Post</button>
            </div>
        ` : ''}
    `;

    // Attach Event Handlers for Post Interactions
    const respectBtn = card.querySelector(".respect-hold-btn");
    setupHoldToRespect(respectBtn, postId, post.respectsUsers || []);

    const commentToggle = card.querySelector(".comment-trigger-btn");
    const commentsWrapper = card.querySelector(`#commentsWrapper-${postId}`);
    commentToggle.addEventListener("click", () => {
        commentsWrapper.classList.toggle("hidden");
        if (!commentsWrapper.classList.contains("hidden")) {
            loadComments(postId);
        }
    });

    const commentDispatch = card.querySelector(`.comment-dispatch-btn`);
    commentDispatch.addEventListener("click", () => {
        submitComment(postId);
    });

    if (isOwner) {
        const deleteBtn = card.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", async () => {
            if (!confirm(`Are you sure you want to delete this progress post? You'll lose the ${POST_POINTS} Urja Points it earned.`)) return;

            deleteBtn.disabled = true;
            try {
                await deleteDoc(doc(db, "posts", postId));
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post. Try again.");
                deleteBtn.disabled = false;
                return;
            }

            // Take back the points the post earned (never below 0)
            try {
                const userRef = doc(db, "users", activeUser.uid);
                const snap = await getDoc(userRef);
                const current = snap.exists() ? (snap.data().urjaPoints || 0) : 0;
                const updated = Math.max(0, current - POST_POINTS);
                await setDoc(userRef, { urjaPoints: updated }, { merge: true });
                headerUrjaPoints.textContent = updated;
            } catch (pointsError) {
                console.error("Post deleted, but deducting points failed:", pointsError);
            }
        });
    }

    feedPostsContainer.appendChild(card);
}

// Hold-to-Respect Mechanic Logic
function setupHoldToRespect(btn, postId, respectsUsers) {
    let holdTimer = null;
    const hasRespected = respectsUsers.includes(activeUser.uid);

    if (hasRespected) return;

    const startHolding = (e) => {
        e.preventDefault();
        btn.classList.add("holding");
        holdTimer = setTimeout(async () => {
            btn.classList.remove("holding");
            await triggerRespectAction(postId);
        }, 2000);
    };

    const cancelHolding = () => {
        if (holdTimer) clearTimeout(holdTimer);
        btn.classList.remove("holding");
    };

    btn.addEventListener("mousedown", startHolding);
    btn.addEventListener("touchstart", startHolding);

    btn.addEventListener("contextmenu", (e) => e.preventDefault());
    btn.addEventListener("mouseup", cancelHolding);
    btn.addEventListener("mouseleave", cancelHolding);
    btn.addEventListener("touchend", cancelHolding);
}

async function triggerRespectAction(postId) {
    try {
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, {
            respectsCount: increment(1),
            respectsUsers: arrayUnion(activeUser.uid)
        });
    } catch (error) {
        console.error("Error giving respect:", error);
    }
}

// Comments Logic
async function loadComments(postId) {
    const commentsList = document.getElementById(`commentsList-${postId}`);
    try {
        const q = query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);
        
        commentsList.innerHTML = "";
        if (snapshot.empty) {
            commentsList.innerHTML = `<div class="popup-empty-msg" style="padding:10px;">No comments yet. Be supportive!</div>`;
            return;
        }

        snapshot.forEach(docSnap => {
            const comment = docSnap.data();
            const commentDiv = document.createElement("div");
            commentDiv.className = "comment-item";
            commentDiv.innerHTML = `
                <img src="${escapeHtml(comment.userPhoto || DEFAULT_AVATAR)}" alt="User" onerror="this.onerror=null;this.src='${DEFAULT_AVATAR}'">
                <div class="comment-item-content">
                    <h6>${escapeHtml(comment.userName || 'Peer')}</h6>
                    <p>${escapeHtml(comment.text)}</p>
                </div>
            `;
            commentsList.appendChild(commentDiv);
        });
    } catch (error) {
        console.error("Error loading comments:", error);
        commentsList.innerHTML = `<div class="popup-empty-msg">Could not load comments.</div>`;
    }
}

async function submitComment(postId) {
    const input = document.getElementById(`commentInput-${postId}`);
    const text = input.value.trim();
    if (!text) return;

    try {
        await addDoc(collection(db, "posts", postId, "comments"), {
            uid: activeUser.uid,
            userName: myProfile.username ? `@${myProfile.username}` : (myProfile.fullName || "Peer"),
            userPhoto: myProfile.photoURL || "",
            text: text,
            createdAt: serverTimestamp()
        });

        input.value = "";
        loadComments(postId);
    } catch (error) {
        console.error("Error submitting comment:", error);
    }
}

// Friends Drawer Controls
if (viewFriendsTrigger) {
    viewFriendsTrigger.addEventListener("click", () => {
        friendsDrawerOverlay.style.display = "flex";
    });
}
if (closeFriendsDrawerBtn) {
    closeFriendsDrawerBtn.addEventListener("click", () => {
        friendsDrawerOverlay.style.display = "none";
    });
}

async function loadFriendsList(uid) {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        const friends = userDoc.exists() ? (userDoc.data().friends || []) : [];
        headerFriendsCount.textContent = friends.length;

        activeFriendsContainerList.innerHTML = "";
        if (friends.length === 0) {
            activeFriendsContainerList.innerHTML = `<div class="popup-empty-msg">No connections added yet. Use search to add friends!</div>`;
            return;
        }

        for (const friendUid of friends) {
            const fData = await getAuthorInfo(friendUid);
            if (fData.name || fData.username) {
                const row = document.createElement("div");
                row.className = "drawer-friend-item-row";
                row.innerHTML = `
                    <img src="${escapeHtml(fData.photo || DEFAULT_AVATAR)}" alt="Friend">
                    <div>
                        <h6>${escapeHtml(fData.name || 'Student')}</h6>
                        <p>@${escapeHtml(fData.username || 'peer')}</p>
                    </div>
                `;
                activeFriendsContainerList.appendChild(row);
            }
        }
    } catch (error) {
        console.error("Error loading friends list:", error);
    }
}

// Notifications Popup
if (notificationBtn) {
    notificationBtn.addEventListener("click", () => {
        notificationPopup.classList.toggle("hidden");
    });
}

function loadDirectMessagesBadgeAndList(uid) {
    setTimeout(() => {
        popupContainer.innerHTML = `<div class="popup-empty-msg">No new notifications.</div>`;
    }, 500);
}

// Utility Helpers
function timeAgo(date) {
    if (!date) return "Just now";
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
}

function escapeHtml(string) {
    return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}