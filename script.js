async function uploadImage() {
    const file = document.getElementById("fileInput").files[0];
    if (!file) return alert("Choose a file!");

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", {
        method: "POST",
        body: form
    });

    alert("Uploaded!");
    loadImages();
}

async function loadImages() {
    const res = await fetch("/api/list");
    const images = await res.json();

    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    images.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        gallery.appendChild(img);
    });
}

loadImages();
