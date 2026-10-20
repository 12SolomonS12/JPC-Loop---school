import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getFirestore,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBT6mGHTtYIrg3ZPRrr8r5hrjzSJwOeqY0",
    authDomain: "jpc-loop.firebaseapp.com",
    projectId: "jpc-loop",
    storageBucket: "jpc-loop.firebasestorage.app",
    messagingSenderId: "197134374651",
    appId: "1:197134374651:web:984217a43b8fe1ad70c25e",
    measurementId: "G-0P5XQ3B5GE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let currentRole = "guest";

const blockedWords = [
    "fuck",
    "ass",
    "shit",
    "bitch",
    "asshole",
    "cunt",
    "nigger",
    "nigga",
    "hell",
    "bullshit",
    "chink",
    "niger",
    "crap",
    "jerk",
    "penis",
    "vagina",
    "cock",
    "pussy",
    "prick",
    "schlong"
]

function containsBlockedWords(text) {
    const cleanedText = ` ${text
        .normalize("NFKD")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .trim()} `;

    return blockedWords.some((blockedWord) => {
        return cleanedText.includes(blockedWord);
    });
}

const toggleButton = document.getElementById('toggle-post-form');
const postFormPanel = document.getElementById('post-form-pannel');

toggleButton.addEventListener("click", () => {
    postFormPanel.classList.toggle("is-open");
});

const postForm = document.getElementById('post-form');
const titleInput = document.getElementById('post-title');
const descriptionInput = document.getElementById('post-description');
const postList = document.getElementById('post-list');

onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    currentRole = "guest";

    toggleButton.hidden = true;
    postFormPanel.classList.remove("is-open");

    if (!user) {
        console.log("User is not signed in.");
        return;
    }

    try {
        const userReference = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userReference);

        console.log("Signed-in UID:", user.uid);
        console.log("User document:", userSnapshot.data());

        if (userSnapshot.exists()) {
            currentRole = userSnapshot.data().role || "user";
        } else {
            currentRole = "user";
        }

        console.log("Current role:", currentRole);

        if (adminOnlyPage) {
            toggleButton.hidden = currentRole !== "admin";
        } else {
            toggleButton.hidden = false;
        }

        hasScrolledToLinkedPost = false;

        renderPosts();
    } catch (error) {
        console.error("Error fetching user role:", error);
    }
});
const pageName = document.body.dataset.postUsage;
const postClass = document.body.dataset.postsClass;
const adminOnlyPage = document.body.dataset.adminOnly === "true";

const postsReference = collection(db, "pages", pageName, "posts");
const postsQuery = query(postsReference, orderBy("createdAt", "desc"));

let posts = [];

let hasScrolledToLinkedPost = false;

function createPostCard(post) {
    const article = document.createElement('article');
    const heading = document.createElement('h2');
    const description = document.createElement('p');
    const date = document.createElement('small');
    const author = document.createElement('span');
    const postDetails = document.createElement('div');


    article.className = postClass;
    article.id = `post-${post.id}`;
    heading.className = 'post-title-text';
    heading.textContent = post.title;
    description.className = 'post-description-text';
    description.textContent = post.description;
    date.className = 'post-date';
    if (post.createdAt) {
        date.textContent = post.createdAt.toDate().toLocaleString();
    } else {
        date.textContent = "Just now";
    }

    article.append(heading, description, postDetails);

    author.className = "post-author";
    author.textContent = post.author || "Unknown User";

    postDetails.className = "post-details";
    postDetails.append(date, author);

    const ownsPost = currentUser !== null && post.authorId === currentUser.uid;

    if (currentRole === "admin" || ownsPost) {
        const deleteButton = document.createElement('button');

        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-post-button';
        deleteButton.type = 'button';

        deleteButton.addEventListener('click', async () => {
            const confirmed = confirm("Are you sure you want to delete this post?");

            if (!confirmed) {
                return;
            }

            try {
                await deleteDoc(doc(db, "pages", pageName, "posts", post.id));
            } catch (error) {
                console.error("Could not delete the post:", error);
                alert("The post could not be deleted.");
            }
        });

        postDetails.append(deleteButton);
    }

    article.addEventListener('click', (event) => {
        if (event.target.closest("button")) {
            return;
        }

        article.getAnimations().forEach((animation) => {
            animation.cancel();
        });

        const startingHeight = article.offsetHeight;
        article.classList.toggle("is-expanded");
        const endingHeight = article.offsetHeight;
        article.style.overflow = "hidden";
        const animation = article.animate(
            [
                { height: `${startingHeight}px` },
                { height: `${endingHeight}px` }
        ],
        {
            duration: 300,
            easing: "ease-in-out"
        }
            );
        
        animation.addEventListener("finish", () => {
            article.style.overflow = "";
        });
    });
    return article;
}

function scrollToLinkedPost() {
    if (hasScrolledToLinkedPost || !window.location.hash) {
        return;
    }

    const targetId = window.location.hash.slice(1);
    const targetPost = document.getElementById(targetId);

    if (!targetPost) {
        return;
    }

    hasScrolledToLinkedPost = true;

    requestAnimationFrame(() => {
        targetPost.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
}

function renderPosts() {
    postList.innerHTML = '';

    posts.forEach((post) => {
        const postCard = createPostCard(post);
        postList.appendChild(postCard);
    });

    scrollToLinkedPost();
}

onSnapshot(
    postsQuery,
    (snapshot) => {
        posts = snapshot.docs.map((postDocument) => {
            return {
                id: postDocument.id,
                ...postDocument.data()
            };
        });

        renderPosts();
    },
    (error) => {
        console.error("Could not load posts:", error)
    }
);

postForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!currentUser) {
        alert("You must be signed in to create a post.");
        return;
    }

    if (adminOnlyPage && currentRole !== "admin") {
        alert("Only administrators can create news posts.");
        return;
    }

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!title || !description) {
        return;
    }

    if (containsBlockedWords(title) || containsBlockedWords(description)) {
        alert("Your post contains inappropriate language. Please remove any offensive words and try again.");
        return;
    }

    const author = currentUser.displayName || currentUser.email.split("@")[0];

    try {
        await addDoc(postsReference, {
            title: title,
            description: description,
            author: author,
            authorId: currentUser.uid,
            createdAt: serverTimestamp()
        });

        postForm.reset();
        postFormPanel.classList.remove("is-open");
    } catch (error) {
        console.error("Could not create the post:", error)
        alert("The post could not be created.");
    }
});