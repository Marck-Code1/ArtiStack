import { kv } from "@vercel/kv";
import { del } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { url } = await req.json();

  await del(url);              // Delete from Blob
  await kv.lrem("images", 0, url); // Remove from KV list

  return res.status(200).json({ ok: true });
}
