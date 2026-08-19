import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
    doc,
    getDoc,
    getFirestore,
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
        renderPosts();
    } catch (error) {
        console.error("Error fetching user role:", error);
    }
});
const pageName = document.body.dataset.postUsage;
const postClass = document.body.dataset.postsClass;
const storageKey = `jpc-loop-${pageName}-posts`;

const savedPosts = localStorage.getItem(storageKey);
let posts = savedPosts ? JSON.parse(savedPosts) : [];

function savePosts() {
    localStorage.setItem(storageKey, JSON.stringify(posts));
}

function createPostCard(post, index) {
    const article = document.createElement('article');
    const heading = document.createElement('h2');
    const description = document.createElement('p');
    const date = document.createElement('small');
    const author = document.createElement('span');
    const postDetails = document.createElement('div');

    article.className = postClass;
    heading.textContent = post.title;
    description.textContent = post.description;
    date.className = 'post-date';
    date.textContent = new Date(post.createdAt).toLocaleString();

    article.append(heading, description, postDetails);

    author.className = "post-author";
    author.textContent = post.author || "Unknown User";

    postDetails.className = "post-details";
    postDetails.append(date, author);

    if (currentRole === "admin") {
        const deleteButton = document.createElement('button');

        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-post-button';
        deleteButton.type = 'button';

        deleteButton.addEventListener('click', () => {
            const confirmDelete = confirm("Are you sure you want to delete this post?");

            if (!confirmDelete) {
                return;
            }

            posts.splice(index, 1);
            savePosts();
            renderPosts();
        });

        postDetails.append(deleteButton);
    }
    return article;
}

function renderPosts() {
    postList.innerHTML = '';

    posts.forEach((post, index) => {
        const postCard = createPostCard(post);
        postList.appendChild(postCard);
    });
}

postForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!title || !description) {
        return;
    }

    const author = localStorage.getItem("jpc-loop-user-name");

    if (!author) {
        alert("You must be signed in to create a post.");
        return;
    }

    const newPost = {
        title: title,
        description: description,
        author: author,
        createdAt: new Date().toISOString()
    };

    posts.unshift(newPost);
    savePosts();
    renderPosts();

    postForm.reset();
    postFormPanel.classList.remove("is-open");
});

renderPosts();

