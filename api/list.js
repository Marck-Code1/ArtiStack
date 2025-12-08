import { list, get } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    const file = await get("gallery.json");

    if (!file) {
      return res.status(200).json([]); 
    }

    const text = await file.text();
    const data = JSON.parse(text);

    res.status(200).json(data);
  } 
  catch (err) {
    res.status(200).json([]); 
  }
}
