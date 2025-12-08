import Busboy from "busboy";
import { put, list } from "@vercel/blob";

export const config = {
  api: { bodyParser: false }
};

async function readGallery() {
  try {
    const { blobs } = await list({ prefix: "gallery.json" });
    if (!blobs || blobs.length === 0) return [];
    const blob = blobs[0];
    const r = await fetch(blob.url);
    if (!r.ok) return [];
    const txt = await r.text();
    return JSON.parse(txt || "[]");
  } catch (e) {
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const busboy = Busboy({ headers: req.headers });

  let fileData = null;
  let fileName = null;
  let title = "Untitled";
  let description = "";

  busboy.on("file", (fieldname, file, info) => {
    const chunks = [];
    file.on("data", (c) => chunks.push(c));
    file.on("end", () => {
      fileData = Buffer.concat(chunks);
      const safe = info.filename ? info.filename.replace(/\s+/g, "-").slice(0, 60) : "file";
      fileName = `image-${Date.now()}-${safe}`;
    });
  });

  busboy.on("field", (name, val) => {
    if (name === "title") title = val || title;
    if (name === "description") description = val || "";
  });

  busboy.on("finish", async () => {
    try {
      if (!fileData) return res.status(400).json({ error: "No file uploaded" });

      const uploaded = await put(fileName, fileData, {
        access: "public",
        addRandomSuffix: true
      });

      const gallery = await readGallery();
      const entry = { url: uploaded.url, title, description, uploadedAt: new Date().toISOString() };
      gallery.push(entry);

      await put("gallery.json", JSON.stringify(gallery), {
        access: "public",
        contentType: "application/json",
        allowOverwrite: true
      });

      return res.status(200).json(entry);
    } catch (err) {
      console.error("upload error:", err);
      return res.status(500).json({ error: "Upload failed" });
    }
  });

  req.pipe(busboy);
}
