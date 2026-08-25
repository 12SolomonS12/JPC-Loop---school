import {initializeApp} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js"

import {
    collection,
    getFirestore,
    limit,
    onSnapshot,
    orderBy,
    query
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js"

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
const db = getFirestore(app);

function createPostPreview(postDocument, destinationPage) {
    const post = postDocument.data();
    const link = document.createElement("a");
    const title = document.createElement("h3");
    const description = document.createElement("p");
    const details = document.createElement("small");

    link.className = "home-post-preview";
    link.href = `${destinationPage}#post-${postDocument.id}`;

    title.textContent = post.title;
    description.textContent = post.description;

    const date = post.createdAt ? post.createdAt.toDate().toLocaleString(): "Just now";

    details.textContent = `${post.author || "Unknown User"} - ${date}`;

    link.append(title, description, details);
    return link;
}

function loadLatestPosts(pageName, destinationPage, containerId) {
    const container = document.getElementById(containerId);

    const latestPostsQuery = query(
        collection(db, "pages", pageName, "posts"),
        orderBy("createdAt", "desc"),
        limit(3)
    );

    onSnapshot(latestPostsQuery, (snapshot) => {
        container.innerHTML = "";

        if (snapshot.empty) {
            const message = document.createElement("p");
            message.className = "empty-message";
            message.textContent = `There are currently no ${pageName} posts.`;
            container.appendChild(message);
            return;
        }

        snapshot.forEach((postDocument) => {
            container.appendChild(createPostPreview(postDocument, destinationPage));
        });
    });
}

loadLatestPosts("news", "news.html", "home-news-posts");
loadLatestPosts("feed", "feed.html", "home-feed-posts");