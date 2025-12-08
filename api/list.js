import { list } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    const { blobs } = await list({ prefix: "gallery.json" });
    if (!blobs || blobs.length === 0) return res.status(200).json([]);

    const blob = blobs[0];
    const r = await fetch(blob.url);
    if (!r.ok) return res.status(200).json([]);
    const text = await r.text();
    const data = JSON.parse(text || "[]");

    res.status(200).json(data.reverse());
  } catch (err) {
    console.warn("list read failed", err);
    res.status(200).json([]);
  }
}
