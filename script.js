
async function uploadToServer(file, title, description) {
  const form = new FormData();
  form.append("file", file);
  form.append("title", title);
  form.append("description", description);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: form
  });

  if (!res.ok) throw new Error("Error al subir la imagen");
  return await res.json();
}
function addImageToGallery(url, title, description) {
  const gallery = document.getElementById("gallery");

  const figure = document.createElement("figure");

  const img = document.createElement("img");
  img.src = url;
  img.alt = title || "Artwork";

  const caption = document.createElement("figcaption");
  const titleRow = document.createElement("div");
  titleRow.className = "caption-row";

  const titleSpan = document.createElement("span");
  titleSpan.textContent = title || "Untitled";

  const delBtn = document.createElement("button");
  delBtn.textContent = "✕";
  delBtn.className = "delete-btn";

  delBtn.addEventListener("click", async () => {
    try {
      await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      figure.remove();
    } catch (e) {
      console.error("Delete failed", e);
      alert("No se pudo eliminar");
    }
  });

  titleRow.appendChild(titleSpan);
  titleRow.appendChild(delBtn);

  const descP = document.createElement("p");
  descP.textContent = description || "";

  caption.appendChild(titleRow);
  caption.appendChild(descP);

  figure.appendChild(img);
  figure.appendChild(caption);

  gallery.prepend(figure); 
}

let selectedFile = null;

const imageInput = document.getElementById("imageInput");
const titleModal = document.getElementById("titleModal");
const modalPreview = document.getElementById("modalPreview");
const submitBtn = document.getElementById("submitTitle");
const closeBtn = document.getElementById("closeModalBtn");

imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  selectedFile = file;

  const reader = new FileReader();
  reader.onload = () => {
    modalPreview.src = reader.result;
    modalPreview.style.display = "block";
  };
  reader.readAsDataURL(file);

  titleModal.style.display = "flex";
});

closeBtn.addEventListener("click", closeModal);

function closeModal() {
  titleModal.style.display = "none";
  modalPreview.src = "";
  modalPreview.style.display = "none";
  document.getElementById("artTitle").value = "";
  document.getElementById("artDescription").value = "";
  imageInput.value = "";
  selectedFile = null;
}

submitBtn.addEventListener("click", async () => {
  if (!selectedFile) return alert("Selecciona una imagen primero");

  const title = document.getElementById("artTitle").value || "Untitled";
  const description = document.getElementById("artDescription").value || "";

  try {
    const uploaded = await uploadToServer(selectedFile, title, description);
    addImageToGallery(uploaded.url, uploaded.title, uploaded.description);
    closeModal();
  } catch (err) {
    console.error(err);
    alert("Error al subir la imagen");
  }
});

async function loadImages() {
  try {
    const res = await fetch("/api/list");
    if (!res.ok) throw new Error("list failed");
    const images = await res.json();
    images.forEach(img => addImageToGallery(img.url, img.title, img.description));
  } catch (err) {
    console.warn("No gallery yet or failed to load", err);
  }
}
window.addEventListener("DOMContentLoaded", loadImages);
