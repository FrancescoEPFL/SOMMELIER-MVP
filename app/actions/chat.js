'use server';

import { kv } from '@vercel/kv';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function handleConsiglioAction(selectedDishes, restaurantId) {
  try {
    // 1. Recupero dati menu
    const menuData = await kv.get(`menu:${restaurantId}`);
    if (!menuData) throw new Error("Menu non trovato");

    const piattiSceltiString = selectedDishes.join(", ");
    const viniDisponibili = JSON.stringify(menuData.vini || []);

    // 2. Prompt per René
    const prompt = `
      Sei René, un sommelier d'élite. 
      Il cliente ha scelto: ${piattiSceltiString}.
      La tua cantina attuale: ${viniDisponibili}.

      ISTRUZIONI:
      - Suggerisci il miglior vino presente in cantina per questi piatti.
      - Spiega l'abbinamento in modo elegante.
      - Se non ci sono vini adatti, suggerisci quello che più si avvicina spiegandone il motivo.
      - Usa il **grassetto** per i nomi dei vini.
      - Concludi sempre con "Curiosità:" seguita da un aneddoto.
    `;

    // 3. Chiamata a Groq con modello AGGIORNATO
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      // Utilizziamo Llama 3.3 70B che è il modello attuale più affidabile su Groq
      model: "llama-3.3-70b-versatile", 
      temperature: 0.7,
      max_tokens: 1024,
    });

    return { consiglio: chatCompletion.choices[0].message.content };

  } catch (error) {
    console.error("Errore Action:", error);
    // Ritorna l'errore specifico per il debug
    return { error: `Errore René: ${error.message}` };
  }
}