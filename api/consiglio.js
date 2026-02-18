import { readFileSync } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const API_KEY = process.env.GROQ_API_KEY;

  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito' });

  try {
    const { piatti } = req.body;
    const dbPath = path.join(process.cwd(), 'database.json');
    const database = JSON.parse(readFileSync(dbPath, 'utf8'));

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "Sei René, un sommelier raffinato. Usa questa cantina: " + JSON.stringify(database.cantina_vini) + ". Consiglia l'abbinamento perfetto in poche parole." },
          { role: "user", content: "Piatti scelti: " + piatti }
        ]
      })
    });

    const data = await response.json();
    res.status(200).json({ consiglio: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
