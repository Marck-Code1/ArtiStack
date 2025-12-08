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

document.getElementById("submitTitle").addEventListener("click", function () {
  if (!selectedFile) return;

  const title = document.getElementById("artTitle").value || "Untitled";
  const year = document.getElementById("artYear").value || new Date().getFullYear();

  const gallery = document.getElementById("gallery");
  const reader = new FileReader();

  reader.onload = () => {
  const figure = document.createElement("figure");

  const img = document.createElement("img");
  img.src = reader.result;

  const caption = document.createElement("figcaption");
  caption.textContent = `${title} — ${year}`;

  const delBtn = document.createElement("button");
  delBtn.textContent = "Eliminar";
  delBtn.className = "delete-btn";

  delBtn.addEventListener("click", () => {
    figure.remove();
  });

  figure.appendChild(img);
  figure.appendChild(caption);
  figure.appendChild(delBtn);

  gallery.appendChild(figure);
  };

  reader.readAsDataURL(selectedFile);

  // close modal + reset inputs
  document.getElementById("titleModal").style.display = "none";
  document.getElementById("artTitle").value = "";
  document.getElementById("artYear").value = "";

  selectedFile = null;
});
