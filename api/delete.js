import { del } from "@vercel/blob";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { url } = req.body;

  await del(url);

  await supabase
    .from("gallery")
    .delete()
    .eq("url", url);

  res.status(200).json({ ok: true });
}
