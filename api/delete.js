import { del } from "@vercel/blob";
import { list } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { url } = req.body;

  await del(url);
  const { blobs } = await list({ prefix: "meta-" });

  for (const blob of blobs) {
    const metaUrl = blob.url;
    const json = await fetch(metaUrl).then(r => r.json());

    if (json.url === url) {
      await del(metaUrl);
      break;
    }
  }

  res.status(200).json({ ok: true });
}
