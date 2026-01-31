'use server';

import { kv } from '@vercel/kv';
import { revalidatePath } from 'next/cache';

export async function uploadMenuAction(formData) {
  const restaurantId = formData.get('restaurantId');
  const rawMenuText = formData.get('menuText');

  if (!restaurantId || !rawMenuText) {
    return { error: "ID Ristorante e testo del menu sono obbligatori." };
  }

  try {
    // 1. Prompt di Estrazione Avanzata per Llama 3.3
    const systemPrompt = `
      Sei un analista gastronomico esperto. Il tuo compito è convertire un testo grezzo di un menu in un oggetto JSON strutturato.
      
      REGOLE DI ESTRAZIONE:
      - Per ogni piatto, crea un oggetto con: id, nome, descrizione, categoria (antipasti, primi, secondi, dolci), intensità (leggera, media, alta) e note_aromatiche (array di 3-4 termini come "terroso", "agrumato", "persistente").
      - Se il menu non specifica l'intensità o le note, DEVI inferirle in base agli ingredienti descritti.
      - Restituisci esclusivamente un oggetto JSON con questa struttura:
        {
          "piatti": [ { "id": 1, "nome": "...", "descrizione": "...", "categoria": "...", "note_aromatiche": [...], "intensita": "..." } ],
          "vini": [] 
        }
      - Nota: Se nel testo sono presenti vini, estraili seguendo lo schema del database.json (vitigno, regione, corpo, curiosita_territorio).
    `;

    // 2. Chiamata a Groq per la digitalizzazione
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Digitalizza questo menu: ${rawMenuText}` }
        ],
        response_format: { type: "json_object" }, // Forza l'output JSON
        temperature: 0.2, // Bassa per massima precisione strutturale
      }),
    });

    if (!response.ok) throw new Error("Errore durante la digitalizzazione AI.");

    const completion = await response.json();
    const menuJson = JSON.parse(completion.choices[0].message.content);

    // 3. Salvataggio su Vercel KV con la chiave attesa da René
    // Chiave: menu:restaurantId
    await kv.set(`menu:${restaurantId}`, menuJson);

    // 4. Revalidazione della cache per rendere il menu subito disponibile
    revalidatePath(`/${restaurantId}`);

    return { 
      success: true, 
      message: `Menu per "${restaurantId}" digitalizzato e salvato con successo. René è pronto a servire.` 
    };

  } catch (error) {
    console.error("Upload Error:", error);
    return { 
      error: "Errore nel parsing del menu. Assicurati che il formato sia leggibile." 
    };
  }
}
