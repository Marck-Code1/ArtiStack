import { put } from "@vercel/blob";
import Busboy from "busboy";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const bb = Busboy({ headers: req.headers });

  let fileBuffer = Buffer.from([]);
  let fileName = "";
  let title = "";
  let description = "";

  bb.on("file", (name, file, info) => {
    fileName = info.filename;

    file.on("data", (data) => {
      fileBuffer = Buffer.concat([fileBuffer, data]);
    });
  });

  bb.on("field", (name, value) => {
    if (name === "title") title = value;
    if (name === "description") description = value;
  });

  bb.on("finish", async () => {
    const blob = await put(`art-${Date.now()}-${fileName}`, fileBuffer, {
      access: "public",
    });

    return res.status(200).json({
      url: blob.url,
      title,
      description,
    });
  });

  req.pipe(bb);
}
