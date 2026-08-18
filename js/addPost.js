const toggleButton = document.getElementById('toggle-post-form');
const postFormPanel = document.getElementById('post-form-pannel');

toggleButton.addEventListener("click", () => {
    postFormPanel.classList.toggle("is-open");
});

const postForm = document.getElementById('post-form');
const titleInput = document.getElementById('post-title');
const descriptionInput = document.getElementById('post-description');
const postList = document.getElementById('post-list');

const pageName = document.body.dataset.postUsage;
const postClass = document.body.dataset.postsClass;
const storageKey = `jpc-loop-${pageName}-posts`;

const savedPosts = localStorage.getItem(storageKey);
let posts = savedPosts ? JSON.parse(savedPosts) : [];

function savePosts() {
    localStorage.setItem(storageKey, JSON.stringify(posts));
}

function createPostCard(post) {
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

    return article;
}

function renderPosts() {
    postList.innerHTML = '';

    posts.forEach(post => {
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

