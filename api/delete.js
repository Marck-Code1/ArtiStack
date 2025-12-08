import { del, get, put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { url } = req.body;

  await del(url);

  let gallery = [];
  try {
    const file = await get("gallery.json");
    const text = await file.text();
    gallery = JSON.parse(text);
  } catch {}

  gallery = gallery.filter(item => item.url !== url);

  await put("gallery.json", JSON.stringify(gallery), {
    access: "public",
    contentType: "application/json"
  });

  res.status(200).json({ ok: true });
}
