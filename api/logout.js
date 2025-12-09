import { serialize } from "cookie";

export default function handler(req, res) {
  res.setHeader(
    "Set-Cookie",
    serialize("user_id", "", {
      path: "/",
      expires: new Date(0)
    })
  );

  res.json({ ok: true });
}
