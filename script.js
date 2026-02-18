let selezionati = [];
let typewriterInterval;
let timerRicerca;

async function caricaMenu() {
    try {
        const response = await fetch('database.json');
        const data = await response.json();
        const grid = document.getElementById('menu-grid');
        grid.innerHTML = ""; // Pulisce prima di caricare

        data.menu_cibo.forEach(p => {
            const card = document.createElement('div');
            card.className = "bg-white p-6 rounded-xl shadow-sm border border-stone-100 cursor-pointer hover:border-red-800 transition-all active:scale-95";
            card.id = `card-${p.id}`;
            card.onclick = () => togglePiatto(p.id, p.nome);
            card.innerHTML = `<h3 class="font-bold text-xl">${p.nome}</h3><p class="text-stone-500 text-sm">${p.descrizione}</p>`;
            grid.appendChild(card);
        });
    } catch (e) {
        console.error("Errore:", e);
    }
}

function togglePiatto(id, nome) {
    const index = selezionati.indexOf(nome);
    const card = document.getElementById(`card-${id}`);

    if (index > -1) {
        selezionati.splice(index, 1);
        card.classList.remove('border-red-800', 'bg-red-50');
    } else {
        selezionati.push(nome);
        card.classList.add('border-red-800', 'bg-red-50');
    }
    
    document.getElementById('selected-list').innerText = selezionati.length > 0 
        ? "Piatti scelti: " + selezionati.join(", ") 
        : "Nessun piatto selezionato";

    clearTimeout(timerRicerca);
    timerRicerca = setTimeout(() => {
        if (selezionati.length > 0) chiediConsiglioAllAI();
    }, 1500);
}

async function chiediConsiglioAllAI() {
    const bubble = document.getElementById('ai-bubble');
    const img = document.getElementById('avatar-img');

    img.src = "assets/thinking.png";
    bubble.innerText = "Analizzando la cantina per lei...";
    bubble.classList.add('thinking-blink');

    try {
        const response = await fetch('/api/consiglio', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ piatti: selezionati.join(", ") })
        });

        const data = await response.json();
        bubble.classList.remove('thinking-blink');
        img.src = "assets/happy.png";
        
        typeWriterEffect(data.consiglio || "Ecco il mio consiglio...", "ai-bubble");
    } catch (error) {
        img.src = "assets/idle.png";
        bubble.innerText = "Perdonatemi, ho difficoltà a raggiungere la cantina.";
    }
}

function typeWriterEffect(text, elementId) {
    let i = 0;
    const element = document.getElementById(elementId);
    clearInterval(typewriterInterval);
    element.innerHTML = ""; 
    typewriterInterval = setInterval(() => {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
        } else { clearInterval(typewriterInterval); }
    }, 30);
}
