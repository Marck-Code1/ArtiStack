// ------------------------------
// Upload to server (Blob + KV)
// ------------------------------
async function uploadToServer(file, title, description) {
  const form = new FormData();
  form.append("file", file);
  form.append("title", title);
  form.append("description", description);

  const res = await fetch("/api/upload", { method: "POST", body: form });
  return await res.json(); // {url, title, description}
}

// ------------------------------
// Add to gallery
// ------------------------------
function addImageToGallery(url, title, description) {
  const gallery = document.getElementById("gallery");

  const figure = document.createElement("figure");

  const img = document.createElement("img");
  img.src = url;

  const caption = document.createElement("figcaption");

  const titleRow = document.createElement("div");
  titleRow.className = "caption-row";

  const titleSpan = document.createElement("span");
  titleSpan.textContent = title;

  const delBtn = document.createElement("button");
  delBtn.textContent = "✕";
  delBtn.className = "delete-btn";

  delBtn.addEventListener("click", async () => {
    await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    figure.remove();
  });

  titleRow.appendChild(titleSpan);
  titleRow.appendChild(delBtn);

  const descP = document.createElement("p");
  descP.textContent = description;

  caption.appendChild(titleRow);
  caption.appendChild(descP);

  figure.appendChild(img);
  figure.appendChild(caption);

  gallery.appendChild(figure);
}

// ------------------------------
// File input → open modal preview
// ------------------------------
let selectedFile = null;

document.getElementById("imageInput").addEventListener("change", event => {
  selectedFile = event.target.files[0];
  if (!selectedFile) return;

  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById("modalPreview").src = reader.result;
  };
  reader.readAsDataURL(selectedFile);

  document.getElementById("titleModal").style.display = "flex";
});

// ------------------------------
// Submit modal → upload
// ------------------------------
document.getElementById("submitTitle").addEventListener("click", async () => {
  if (!selectedFile) return;

  const title = document.getElementById("artTitle").value || "Untitled";
  const description = document.getElementById("artDescription").value || "";

  // Upload to Vercel server
  const saved = await uploadToServer(selectedFile, title, description);

  // Add to gallery
  addImageToGallery(saved.url, saved.title, saved.description);

  // Reset modal
  selectedFile = null;
  document.getElementById("titleModal").style.display = "none";
  document.getElementById("artTitle").value = "";
  document.getElementById("artDescription").value = "";
});

// ------------------------------
// Load stored images on page load
// ------------------------------
async function loadImages() {
  const res = await fetch("/api/list");
  const images = await res.json();

  images.forEach(img => {
    addImageToGallery(img.url, img.title, img.description);
  });
}

window.addEventListener("DOMContentLoaded", loadImages);
