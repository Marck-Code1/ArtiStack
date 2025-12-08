import Busboy from "busboy";
import { put, get } from "@vercel/blob";

export const config = {
  api: { bodyParser: false }
};

// helper: read gallery.json from blob
async function readGallery() {
  try {
    const file = await get("gallery.json");
    const text = await file.text();
    return JSON.parse(text || "[]");
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
      fileName = `image-${Date.now()}-${info.filename.replace(/\s+/g, "-").slice(0, 60)}`;
    });
  });

  busboy.on("field", (name, val) => {
    if (name === "title") title = val || title;
    if (name === "description") description = val || "";
  });

  busboy.on("finish", async () => {
    if (!fileData) return res.status(400).json({ error: "No file uploaded" });

    try {
      const uploaded = await put(fileName, fileData, { access: "public" });

      const gallery = await readGallery();
      const entry = { url: uploaded.url, title, description };
      gallery.push(entry);

      await put("gallery.json", JSON.stringify(gallery), {
        access: "public",
        contentType: "application/json"
      });

      return res.status(200).json(entry);
    } catch (err) {
      console.error("upload error:", err);
      return res.status(500).json({ error: "Upload failed" });
    }
  });

  req.pipe(busboy);
}
