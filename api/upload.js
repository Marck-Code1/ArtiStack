import { put } from "@vercel/blob";

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const form = await req.formData();
  const file = form.get("file");
  const title = form.get("title");
  const description = form.get("description");

  const id = Date.now();

  const blob = await put(`art-${id}`, file, { access: "public" });

  const meta = { url: blob.url, title, description };
  await put(`meta-${id}.json`, JSON.stringify(meta), {
    access: "public",
    contentType: "application/json"
  });

  return res.status(200).json(meta);
}
