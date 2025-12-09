import Busboy from "busboy";
import { put } from "@vercel/blob";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: { bodyParser: false }
};

// Cliente para AUTH (anon key)
const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Cliente para operaciones seguras (service_role)
const supabaseDB = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // === VALIDAR TOKEN ===
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing token" });

  const { data: auth, error: authError } = await supabaseAuth.auth.getUser(token);
  if (authError || !auth?.user)
    return res.status(401).json({ error: "Unauthorized" });

  const userId = auth.user.id;

  const busboy = Busboy({ headers: req.headers });
  let fileData, title, description;

  busboy.on("file", (name, file) => {
    const chunks = [];
    file.on("data", chunk => chunks.push(chunk));
    file.on("end", () => (fileData = Buffer.concat(chunks)));
  });

  busboy.on("field", (name, value) => {
    if (name === "title") title = value;
    if (name === "description") description = value;
  });

  busboy.on("finish", async () => {
    if (!fileData)
      return res.status(400).json({ error: "No file uploaded" });

    const fileName = `img-${Date.now()}`;
    const blob = await put(fileName, fileData, { access: "public" });

    const { data, error } = await supabaseDB
      .from("gallery")
      .insert({
        url: blob.url,
        title,
        description,
        user_id: userId
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Database insert failed" });
    }

    res.status(200).json(data);
  });

  req.pipe(busboy);
}
