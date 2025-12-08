import Busboy from "busboy";
import { put, get } from "@vercel/blob";

export const config = {
  api: { bodyParser: false }
};

async function readGallery() {
  try {
    const file = await get("gallery.json");
    const text = await file.text();
    return JSON.parse(text);
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const busboy = Busboy({ headers: req.headers });
  let fileData, fileName, title, description;

  busboy.on("file", (name, file, info) => {
    fileName = `image-${Date.now()}`;
    const chunks = [];

    file.on("data", (chunk) => chunks.push(chunk));
    file.on("end", () => {
      fileData = Buffer.concat(chunks);
    });
  });

  busboy.on("field", (name, value) => {
    if (name === "title") title = value;
    if (name === "description") description = value;
  });

  busboy.on("finish", async () => {
    const uploaded = await put(fileName, fileData, { access: "public" });

    const gallery = await readGallery();
    const entry = {
      url: uploaded.url,
      title,
      description
    };

    gallery.push(entry);

    await put("gallery.json", JSON.stringify(gallery), {
      access: "public",
      contentType: "application/json"
    });

    res.status(200).json(entry);
  });

  req.pipe(busboy);
}
