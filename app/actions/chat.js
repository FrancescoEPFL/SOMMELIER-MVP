'use server';

import { kv } from '@vercel/kv';

export async function handleConsiglioAction(selectedDishes, restaurantId) {
  try {
    // 1. Recupero della "Cave" (Cantina) dal database per lo specifico ristorante
    // Utilizziamo la chiave strutturata menu:restaurantId come da specifica
    const menuData = await kv.get(`menu:${restaurantId}`);
    
    if (!menuData || !menuData.vini) {
      throw new Error("Impossibile accedere alla cantina del ristorante.");
    }

    const viniDisponibili = menuData.vini;
    const piattiScelti = selectedDishes.map(d => d.nome).join(", ");

    // 2. Definizione del Prompt di Sistema: La "Psiche" di René
    const systemPrompt = `
      Sei René, un Sommelier AI d'élite. Il tuo linguaggio è colto, tecnico, ma estremamente evocativo. 
      Ti trovi in un ristorante "Dark Luxury" e il tuo compito è guidare l'ospite verso l'abbinamento perfetto.

      CONTESTO TECNICO:
      - Piatti selezionati dall'ospite: ${piattiScelti}.
      - La tua cantina disponibile (JSON): ${JSON.stringify(viniDisponibili)}.

      ISTRUZIONI RIGOROSE:
      1. Scegli UN SOLO VINO dalla lista fornita che meglio si sposa con il complesso dei piatti scelti.
      2. La risposta DEVE essere divisa in due sezioni:
         a) Un'analisi tecnica ed elegante del perché quel vino è l'abbinamento ideale, parlando di acidità, tannini, corpo e armonia aromatica.
         b) Una sezione finale che inizi ESPLICITAMENTE con la parola "Curiosità:", dove rielabori le informazioni sul territorio o sul vitigno presenti nel database per affascinare l'ospite.
      3. Usa il grassetto **Nome del Vino** alla sua prima citazione.
      4. Non inventare vini non presenti in lista. Se i piatti sono molto diversi tra loro, trova il "trait d'union" più sofisticato.
      5. Mantieni un tono da "Maison René": aristocratico, asciutto, esperto.
    `;

    // 3. Chiamata alla Groq API con fetch nativa
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
          { 
            role: "user", 
            content: `René, ho scelto di gustare: ${piattiScelti}. Quale tesoro custodito nella tua cantina dovremmo versare nei calici stasera?` 
          }
        ],
        temperature: 0.6, // Leggermente più basso per mantenere precisione tecnica
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorDetail = await response.json();
      console.error("Groq API Error:", errorDetail);
      throw new Error("Errore di comunicazione con il motore AI.");
    }

    const data = await response.json();
    const consiglioRaw = data.choices[0].message.content;

    // Restituiamo il contenuto che verrà poi processato dal frontend (script.js/ChatCliente.js)
    return { consiglio: consiglioRaw };

  } catch (error) {
    console.error("René Action Error:", error);
    return { 
      error: "Mille scuse, pare che la chiave della mia cantina si sia smarrita. Riprovi a breve.",
      consiglio: null 
    };
  }
}
