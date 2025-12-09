import { createClient } from "@supabase/supabase-js";
import { serialize } from "cookie";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  const { username } = JSON.parse(req.body);

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Guardar cookie
  res.setHeader(
    "Set-Cookie",
    serialize("user_id", user.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax"
    })
  );

  res.json({ ok: true, user });
}
