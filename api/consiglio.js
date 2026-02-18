// Vercel Serverless Function - René AI Sommelier
// Ottimizzato con gestione errori robusta e retry logic

import { promises as fs } from 'fs';
import path from 'path';

// Configurazione
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';
const MAX_RETRIES = 2;
const TIMEOUT_MS = 25000;

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Metodo non consentito. Utilizzare POST.' 
        });
    }

    try {
        // Validate API key
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error('GROQ_API_KEY non configurata');
            return res.status(500).json({ 
                error: 'Configurazione del server non valida. Contattare l\'amministratore.' 
            });
        }

        // Parse and validate request body
        const { piatti } = req.body;
        
        if (!piatti || !Array.isArray(piatti) || piatti.length === 0) {
            return res.status(400).json({ 
                error: 'Nessun piatto selezionato. Selezionare almeno un piatto.' 
            });
        }

        if (piatti.length > 5) {
            return res.status(400).json({ 
                error: 'Troppi piatti selezionati. Massimo 5 piatti.' 
            });
        }

        // Load wine database
        const database = await loadDatabase();
        
        if (!database || !database.vini || database.vini.length === 0) {
            return res.status(500).json({ 
                error: 'Database dei vini non disponibile.' 
            });
        }

        // Build prompt
        const prompt = buildPrompt(piatti, database.vini);

        // Call Groq API with retry logic
        const consiglio = await callGroqWithRetry(apiKey, prompt, MAX_RETRIES);

        // Return recommendation
        return res.status(200).json({ 
            consiglio,
            piatti: piatti.map(p => p.nome),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Errore nel handler:', error);
        
        // Determine appropriate error message
        let errorMessage = 'Si è verificato un errore imprevisto.';
        let statusCode = 500;

        if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
            errorMessage = 'Timeout: il servizio AI sta impiegando troppo tempo. Riprovare.';
            statusCode = 504;
        } else if (error.message.includes('API key')) {
            errorMessage = 'Errore di autenticazione con il servizio AI.';
            statusCode = 401;
        } else if (error.message.includes('rate limit')) {
            errorMessage = 'Troppe richieste. Attendere un momento e riprovare.';
            statusCode = 429;
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Errore di connessione al servizio AI. Verificare la connessione.';
            statusCode = 503;
        }

        return res.status(statusCode).json({ 
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Load database from file system
async function loadDatabase() {
    try {
        // Try multiple possible paths
        const possiblePaths = [
            path.join(process.cwd(), 'database.json'),
            path.join(process.cwd(), 'public', 'database.json'),
            './database.json',
            '../database.json'
        ];

        let databaseContent = null;
        let successPath = null;

        for (const dbPath of possiblePaths) {
            try {
                databaseContent = await fs.readFile(dbPath, 'utf-8');
                successPath = dbPath;
                break;
            } catch (err) {
                // Continue to next path
                continue;
            }
        }

        if (!databaseContent) {
            throw new Error('Database file not found in any expected location');
        }

        console.log(`Database loaded successfully from: ${successPath}`);
        return JSON.parse(databaseContent);

    } catch (error) {
        console.error('Errore nel caricamento del database:', error);
        throw new Error('Impossibile caricare il database dei vini');
    }
}

// Build prompt for Groq
function buildPrompt(piatti, vini) {
    const piattiDescrizione = piatti.map(p => 
        `- **${p.nome}** (${p.categoria}, intensità: ${p.intensita}): ${p.descrizione}. Note aromatiche: ${p.note_aromatiche.join(', ')}.`
    ).join('\n');

    const viniDisponibili = vini.map(v => 
        `- **${v.nome}** (${v.tipo}, ${v.regione}): ${v.vitigno}. Note: ${v.note_aromatiche.join(', ')}. Corpo: ${v.corpo}. ${v.prezzo}. Ideale per: ${v.abbinamenti_ideali.join(', ')}.`
    ).join('\n');

    return {
        systemMessage: `Sei René, un sommelier francese di altissimo livello con oltre 30 anni di esperienza nelle migliori cantine d'Europa. Sei raffinato, elegante, e parli con passione dei vini, usando un linguaggio ricercato ma accessibile. Occasionalmente usi termini francesi per sottolineare la tua expertise.

Il tuo compito è suggerire abbinamenti vino-cibo ESCLUSIVAMENTE dai vini presenti nella cantina fornita. Non puoi mai inventare o suggerire vini che non sono nella lista.

Linee guida per gli abbinamenti:
1. SELEZIONA SOLO dai vini forniti nella lista della cantina
2. Considera le note aromatiche, il corpo, l'intensità e le caratteristiche di ciascun piatto
3. Proponi 1-3 vini in ordine di preferenza
4. Per ogni vino, spiega PERCHÉ è l'abbinamento ideale (armonie aromatiche, contrasti bilanciati, etc.)
5. Usa un tono elegante e appassionato, condividendo anche piccole curiosità
6. Menziona il prezzo per permettere al cliente di fare scelte informate

Struttura della risposta:
- Inizia con un saluto caloroso e un commento sulla selezione di piatti
- Presenta i vini consigliati con entusiasmo
- Spiega gli abbinamenti in modo dettagliato ma scorrevole
- Concludi con un invito a godersi l'esperienza

Ricorda: MAI inventare vini. Solo quelli nella cantina.`,
        userMessage: `Buonasera René! Ho selezionato questi piatti per la mia cena:

${piattiDescrizione}

Ecco i vini disponibili nella vostra cantina:

${viniDisponibili}

Per favore, consigliatemi i migliori abbinamenti scegliendo SOLO tra i vini elencati sopra. Grazie!`
    };
}

// Call Groq API with retry logic
async function callGroqWithRetry(apiKey, prompt, maxRetries) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                console.log(`Tentativo ${attempt + 1} di ${maxRetries + 1}...`);
                // Exponential backoff: wait 1s, 2s, 4s...
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }

            const response = await callGroqAPI(apiKey, prompt);
            return response;

        } catch (error) {
            lastError = error;
            console.error(`Tentativo ${attempt + 1} fallito:`, error.message);

            // Don't retry on certain errors
            if (error.message.includes('API key') || 
                error.message.includes('400') ||
                error.message.includes('401')) {
                throw error;
            }

            // If this was the last attempt, throw the error
            if (attempt === maxRetries) {
                throw new Error(`Falliti tutti i tentativi: ${error.message}`);
            }
        }
    }

    throw lastError;
}

// Call Groq API
async function callGroqAPI(apiKey, prompt) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: prompt.systemMessage
                    },
                    {
                        role: 'user',
                        content: prompt.userMessage
                    }
                ],
                temperature: 0.8,
                max_tokens: 1500,
                top_p: 1,
                stream: false
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            if (response.status === 401) {
                throw new Error('API key non valida o scaduta');
            } else if (response.status === 429) {
                throw new Error('Limite di rate raggiunto. Riprovare tra poco.');
            } else if (response.status === 503) {
                throw new Error('Servizio AI temporaneamente non disponibile');
            }
            
            throw new Error(errorData.error?.message || `Errore API: ${response.status}`);
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Risposta API non valida');
        }

        const consiglio = data.choices[0].message.content;

        if (!consiglio || consiglio.trim().length === 0) {
            throw new Error('Risposta vuota dall\'AI');
        }

        return consiglio;

    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new Error('Timeout: richiesta interrotta dopo ' + (TIMEOUT_MS / 1000) + ' secondi');
        }

        throw error;
    }
}
