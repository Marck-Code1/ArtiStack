export default function handler(req, res) {
  res.json({
    url: process.env.SUPABASE_URL ? "OK" : "MISSING",
    anon: process.env.SUPABASE_ANON_KEY ? "OK" : "MISSING",
    service: process.env.SUPABASE_SERVICE_ROLE ? "OK" : "MISSING",
    blob: process.env.BLOB_READ_WRITE_TOKEN ? "OK" : "MISSING",
  });
}