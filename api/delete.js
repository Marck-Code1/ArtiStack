import { del, get, put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing url" });

  try {
    await del(url);
    let gallery = [];
    try {
      const file = await get("gallery.json");
      const text = await file.text();
      gallery = JSON.parse(text || "[]");
    } catch (e) {
      gallery = [];
    }

    gallery = gallery.filter(item => item.url !== url);

    await put("gallery.json", JSON.stringify(gallery), {
      access: "public",
      contentType: "application/json"
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("delete failed", err);
    res.status(500).json({ error: "Delete failed" });
  }
}
