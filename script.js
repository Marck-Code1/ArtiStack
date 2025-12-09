import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  "https://cgyrgazknzagkykvtzod.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNneXJnYXprbnphZ2t5a3Z0em9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNDYxMjIsImV4cCI6MjA4MDgyMjEyMn0.zt5eAY9_7pwvEe6i64vYOVM83_Jkoi2g5kTfAMM01wQ"
);

/* ============================
   ESTADO DE SESIÓN
============================ */

async function updateUI() {
  const { data: { session } } = await supabase.auth.getSession();

  const loginBtn = document.getElementById("openLoginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  if (session) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
}

/* ============================
   MODAL LOGIN
============================ */

const loginModal = document.getElementById("loginModal");
const openLogin = document.getElementById("openLoginBtn");
const closeLogin = document.getElementById("closeLoginBtn");
const loginBtn = document.getElementById("loginBtn");

openLogin.addEventListener("click", () => {
  loginModal.style.display = "flex";
});

closeLogin.addEventListener("click", () => {
  loginModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === loginModal) loginModal.style.display = "none";
});

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return alert(error.message);

  loginModal.style.display = "none";
  updateUI();
});

/* ============================
   LOGOUT
============================ */

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    updateUI();
  });
}

/* ============================
   MODAL SUBIR IMAGEN
============================ */

const imageInput = document.getElementById("imageInput");
const titleModal = document.getElementById("titleModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const submitTitle = document.getElementById("submitTitle");
const modalPreview = document.getElementById("modalPreview");

let selectedFile = null;

imageInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  selectedFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    modalPreview.src = e.target.result;
    modalPreview.style.display = "block";
  };
  reader.readAsDataURL(file);

  titleModal.style.display = "flex";
});

closeModalBtn.addEventListener("click", () => {
  titleModal.style.display = "none";
  imageInput.value = "";
});

window.addEventListener("click", (event) => {
  if (event.target === titleModal) {
    titleModal.style.display = "none";
    imageInput.value = "";
  }
});

/* ============================
   SUBIR IMAGEN
============================ */

submitTitle.addEventListener("click", async () => {
  const title = document.getElementById("artTitle").value;
  const description = document.getElementById("artDescription").value;

  const { data: { session } } = await supabase.auth.getSession();

  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("title", title);
  formData.append("description", description);
  formData.append("userId", session?.user?.id || "anon");

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData
  });

  if (!res.ok) return alert("Error subiendo");

  titleModal.style.display = "none";
  imageInput.value = "";
  loadImages();
});

/* ============================
   GALERÍA
============================ */

async function loadImages() {
  const res = await fetch("/api/list");
  const images = await res.json();

  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  images.forEach(img => {
    const fig = document.createElement("figure");

    fig.innerHTML = `
      <img src="${img.url}">
      <figcaption>
        <strong>${img.title}</strong> — ${img.description}<br>
        <small>Subido por: ${img.user_id}</small>
        <button class="delete-btn">Eliminar</button>
      </figcaption>
    `;

    fig.querySelector(".delete-btn").onclick = async () => {
      await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: img.url })
      });
      loadImages();
    };

    gallery.appendChild(fig);
  });
}

/* ============================
   INIT
============================ */

window.addEventListener("DOMContentLoaded", () => {
  updateUI();
  loadImages();
});
