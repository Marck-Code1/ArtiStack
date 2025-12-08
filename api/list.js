import { list, get } from "@vercel/blob";

export default async function handler(req, res) {
  const { blobs } = await list({ prefix: "meta-" });

  const items = [];

  for (const blob of blobs) {
    const json = await fetch(blob.url).then(r => r.json());
    items.push(json);
  }

  items.sort((a, b) => b.url.localeCompare(a.url));

  res.status(200).json(items);
}
