import { put } from "@vercel/blob";
import { kv } from "@vercel/kv";

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const file = await req.body; // Vercel automatically streams form-data

  const blob = await put(`image-${Date.now()}`, file, {
    access: "public"
  });

  await kv.lpush("images", blob.url);

  res.status(200).json({ url: blob.url });
}
