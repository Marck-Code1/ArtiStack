import { del } from "@vercel/blob";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // VALIDAR TOKEN
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing token" });

  const { data: auth, error: authError } = await supabase.auth.getUser(token);
  if (authError || !auth?.user)
    return res.status(401).json({ error: "Unauthorized" });

  const userId = auth.user.id;

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing url" });

  // Verificar que la imagen pertenece al usuario
  const { data: img } = await supabase
    .from("gallery")
    .select("*")
    .eq("url", url)
    .single();

  if (!img) return res.status(404).json({ error: "Image not found" });

  if (img.user_id !== userId)
    return res.status(403).json({ error: "Not your image" });

  // Eliminar del blob
  await del(url);

  // Eliminar de BD
  await supabase
    .from("gallery")
    .delete()
    .eq("url", url);

  res.status(200).json({ ok: true });
}
