document.querySelectorAll('.photo-gallery').forEach((gallery) => {
    const images = Array.from(
        gallery.querySelectorAll(".gallery-viewer > img")
    );
    const prevButton = gallery.querySelector(".gallery-arrow-prev");
    const nextButton = gallery.querySelector(".gallery-arrow-next");
    const thumbnailArea = gallery.querySelector(".gallery-thumbnails");
    let currentIndex = 0;

    if (images.length === 0) {
        return;
    }

    function showImage(index) {
        currentIndex = (index + images.length) % images.length;

        images.forEach((image, imageIndex) => {
            image.classList.toggle("is-active", imageIndex === currentIndex);
        });
    }

    const thumbnailButtons = images.map((image, index) => {
        const button = document.createElement("button");
        const preview = image.cloneNode();

        button.type = "button";
        button.className = "gallery-thumbnail";
        button.setAttribute("aria-label", `Show ${image.alt}`);
        preview.alt = "";

        button.appendChild(preview);
        button.addEventListener("click", () => showImage(index));
        thumbnailArea.appendChild(button);

        return button;
    });

    prevButton.addEventListener("click", () => {
        showImage(currentIndex - 1);
    });

    nextButton.addEventListener("click", () => {
        showImage(currentIndex + 1);
    });

    showImage(0);
});
