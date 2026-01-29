# 🚀 Guida Rapida al Deploy - René AI Sommelier

## ⚡ Deploy in 5 Minuti

### Passo 1: Ottieni la Groq API Key (2 min)

1. Vai su **[console.groq.com](https://console.groq.com)**
2. Clicca su "Sign Up" (puoi usare Google/GitHub)
3. Una volta dentro, vai su **"API Keys"** nel menu
4. Clicca **"Create API Key"**
5. Copia la chiave e salvala (la userai dopo)

> 💡 **Nota**: Il piano gratuito offre 30 richieste/minuto, più che sufficiente!

---

### Passo 2: Prepara i File (1 min)

Assicurati di avere questa struttura:

```
rene-ai-sommelier/
├── index.html
├── script.js
├── database.json
├── vercel.json
├── package.json
├── .gitignore
├── .env.example
├── README.md
├── assets/
│   ├── happy.png
│   ├── idle.png
│   ├── suggesting.png
│   └── thinking.png
└── api/
    └── consiglio.js
```

✅ **Tutti i file sono già pronti!**

---

### Passo 3: Deploy su Vercel (2 min)

#### Opzione A: Deploy Automatico (Più Facile) 🎯

1. Vai su **[vercel.com](https://vercel.com)** e fai login (puoi usare GitHub)

2. Clicca **"Add New..."** → **"Project"**

3. Se i file sono su GitHub:
   - Clicca **"Import Git Repository"**
   - Seleziona il tuo repository
   
   Se i file sono locali:
   - Usa il **Vercel CLI** (vedi Opzione B sotto)

4. Configurazione progetto:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (lascia vuoto)
   - **Build Command**: (lascia vuoto)
   - **Output Directory**: (lascia vuoto)

5. **Aggiungi la variabile d'ambiente**:
   - Clicca su **"Environment Variables"**
   - Nome: `GROQ_API_KEY`
   - Valore: [Incolla la tua API key di Groq]
   - Ambiente: **Production**

6. Clicca **"Deploy"** 🚀

7. Aspetta 30-60 secondi... e il tuo sito è LIVE! 🎉

#### Opzione B: Deploy da Terminale (Per Sviluppatori)

```bash
# 1. Installa Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
cd /path/to/rene-ai-sommelier
vercel

# 4. Segui il wizard:
#    - Set up and deploy? Y
#    - Link to existing project? N
#    - Project name? rene-ai-sommelier
#    - Directory? ./
#    - Override settings? N

# 5. Configura la variabile d'ambiente
vercel env add GROQ_API_KEY
# Seleziona "Production"
# Incolla la tua API key

# 6. Deploy finale in produzione
vercel --prod
```

---

### Passo 4: Testa l'Applicazione (30 sec)

1. Apri l'URL che Vercel ti ha fornito (es: `https://rene-ai-sommelier.vercel.app`)

2. Verifica che:
   - ✅ Il menu dei piatti si carica
   - ✅ Puoi selezionare i piatti
   - ✅ René risponde con consigli di vino

3. **Se funziona tutto**: COMPLIMENTI! 🎉🍷

---

## ⚠️ Problemi Comuni e Soluzioni

### Errore: "Difficoltà a raggiungere la cantina"

**Soluzione:**
1. Vai su Vercel Dashboard → Tuo progetto → Settings → Environment Variables
2. Verifica che `GROQ_API_KEY` sia configurata
3. Se mancante, aggiungila
4. Vai su **Deployments** → Clicca sui 3 puntini → **Redeploy**

### Avatar non si vedono

**Soluzione:**
1. Verifica che la cartella `assets/` contenga tutte e 4 le immagini
2. Fai un nuovo commit e redeploy:
```bash
git add assets/
git commit -m "Fix avatar images"
git push
```

### Menu vuoto

**Soluzione:**
1. Verifica che `database.json` sia nella root del progetto
2. Controlla la console del browser (F12) per errori
3. Redeploy il progetto

---

## 🔄 Come Aggiornare l'App

### Metodo GitHub (Automatico)

1. Modifica i file localmente
2. Fai commit e push:
```bash
git add .
git commit -m "Update description"
git push
```
3. Vercel fa automaticamente il redeploy! ✨

### Metodo CLI

```bash
# Modifica i file, poi:
vercel --prod
```

---

## 📊 Monitoraggio

### Visualizza i Log

1. Vai su Vercel Dashboard
2. Seleziona il tuo progetto
3. Clicca su **"Deployments"**
4. Clicca sull'ultimo deployment
5. Clicca su **"Functions"** → **"consiglio"** per vedere i log

### Visualizza le Metriche

1. Dashboard → Tuo progetto → **"Analytics"**
2. Vedi: visite, performance, errori

---

## 💡 Tips & Tricks

### Aumentare il Limite di Groq

Il piano gratuito ha 30 req/min. Se serve di più:
1. Vai su [console.groq.com](https://console.groq.com)
2. Clicca su **"Billing"** → **"Upgrade"**
3. Scegli un piano a pagamento (molto conveniente)

### Personalizza il Database

Modifica `database.json` per:
- Aggiungere nuovi piatti
- Aggiungere nuovi vini
- Modificare descrizioni e prezzi

Esempio:
```json
{
  "piatti": [
    {
      "id": 7,
      "nome": "Carbonara Classica",
      "descrizione": "Pasta con guanciale, uova e pecorino",
      "categoria": "primi",
      "note_aromatiche": ["salato", "cremoso", "affumicato"],
      "intensita": "media"
    }
  ]
}
```

### Cambia i Colori

In `index.html`, modifica le classi Tailwind:
- `amber-*` → `blue-*` (per un tema blu)
- `amber-*` → `red-*` (per un tema rosso)
- `amber-*` → `green-*` (per un tema verde)

---

## 🎯 Checklist Finale

Prima del deploy, assicurati:

- [ ] Hai ottenuto la Groq API Key
- [ ] Tutti i file sono nella cartella corretta
- [ ] Le 4 immagini dell'avatar sono in `assets/`
- [ ] `database.json` è nella root
- [ ] Hai configurato `GROQ_API_KEY` su Vercel

---

## 🎉 Congratulazioni!

Hai deployato con successo **René - AI Sommelier**!

Ora i tuoi utenti possono ricevere consigli di vino personalizzati powered by AI.

### Prossimi Passi (Opzionali)

1. **Dominio Custom**: Vercel → Settings → Domains → Aggiungi il tuo dominio
2. **Analytics**: Abilita Vercel Analytics per tracciare le visite
3. **Miglioramenti**: Aggiungi più piatti e vini al database
4. **Personalizzazione**: Cambia i colori, font, e stile di René

---

**Hai bisogno di aiuto?**
- 📖 Leggi il README.md completo
- 🐛 Controlla la sezione Troubleshooting
- 💬 Consulta i log su Vercel Dashboard

**Buon servizio! 🍷**
