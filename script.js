async function uploadToServer(file, title, description) {
  const form = new FormData();
  form.append("file", file);
  form.append("title", title);
  form.append("description", description);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: form
  });

  return await res.json();
}

function addImageToGallery(url, title, description) {
  const gallery = document.getElementById("gallery");

  const figure = document.createElement("figure");

  const img = document.createElement("img");
  img.src = url;

  const caption = document.createElement("figcaption");

  // Title + delete button in same row
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

  // Description
  const descP = document.createElement("p");
  descP.textContent = description;

  caption.appendChild(titleRow);
  caption.appendChild(descP);

  figure.appendChild(img);
  figure.appendChild(caption);

  gallery.appendChild(figure);
}

let selectedFile = null;


document.getElementById("imageInput").addEventListener("change", function (event) {
  selectedFile = event.target.files[0];
  if (!selectedFile) return;

  const reader = new FileReader();
  reader.onload = () => {
    const modalImg = document.getElementById("modalPreview");
    modalImg.src = reader.result;
    modalImg.style.display = "block";
  };
  reader.readAsDataURL(selectedFile);

  document.getElementById("titleModal").style.display = "flex";
});

document.getElementById("submitTitle").addEventListener("click", async function () {
  if (!selectedFile) return;

  const title = document.getElementById("artTitle").value || "Untitled";
  const description = document.getElementById("artDescription").value || "";

  const uploaded = await uploadToServer(selectedFile, title, description);

  addImageToGallery(uploaded.url, uploaded.title, uploaded.description);

  closeModal();
});


async function loadImages() {
  const res = await fetch("/api/list");
  const images = await res.json();
  images.forEach(img => addImageToGallery(img.url, img.title, img.description));
}

window.addEventListener("DOMContentLoaded", loadImages);


function closeModal() {
  const modal = document.getElementById("titleModal");
  modal.style.display = "none";

  document.getElementById("modalPreview").src = "";
  document.getElementById("artTitle").value = "";
  document.getElementById("artDescription").value = "";

  const fileInput = document.getElementById("imageInput");
  fileInput.value = "";

  selectedFile = null;
}

document.getElementById("closeModalBtn").addEventListener("click", closeModal);
