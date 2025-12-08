import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  const images = await kv.lrange("images", 0, -1);
  res.status(200).json(images.reverse());
}
