// René - AI Sommelier Frontend Script - VERSIONE PULITA
const state = {
    selectedDishes: [],
    dishes: [],
    wines: [],
    currentAvatar: 'idle'
};

const avatarStates = {
    idle: 'avatar-idle',
    thinking: 'avatar-thinking',
    suggesting: 'avatar-suggesting',
    happy: 'avatar-happy'
};

const elements = {
    menuGrid: document.getElementById('menu-grid'),
    btnConsiglia: document.getElementById('btn-consiglia'),
    reneMessage: document.getElementById('rene-message'),
    selectedDishesDisplay: document.getElementById('selected-dishes-display'),
    selectedDishesList: document.getElementById('selected-dishes-list'),
    loadingState: document.getElementById('loading-state'),
    recommendationsSection: document.getElementById('recommendations-section'),
    recommendationsContent: document.getElementById('recommendations-content')
};

async function init() {
    try {
        showMessage('Sto preparando il menu per voi...', 'thinking');
        await loadDatabase();
        renderMenu();
        setupEventListeners();
        setAvatarState('idle');
        showMessage('Selezionate i vostri piatti preferiti e permettetemi di guidarvi attraverso un\'esperienza enologica indimenticabile.');
    } catch (error) {
        console.error('Errore di inizializzazione:', error);
        showMessage('Si è verificato un errore. Ricaricate la pagina.', 'idle');
    }
}

async function loadDatabase() {
    try {
        const response = await fetch('/database.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        state.dishes = data.piatti || [];
        state.wines = data.vini || [];
    } catch (error) {
        throw new Error('Impossibile caricare il database.');
    }
}

function renderMenu() {
    if (!elements.menuGrid || state.dishes.length === 0) return;
    
    elements.menuGrid.innerHTML = state.dishes.map(dish => `
        <div class="card-dish bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700" 
             data-dish-id="${dish.id}" role="button" tabindex="0">
            <div class="mb-4">
                <span class="badge bg-amber-600 text-white">${dish.categoria}</span>
                <span class="badge bg-gray-700 text-gray-300 ml-2">${dish.intensita}</span>
            </div>
            <h3 class="text-2xl font-bold text-amber-400 mb-3">${dish.nome}</h3>
            <p class="text-gray-300 mb-4">${dish.descrizione}</p>
            <div class="flex flex-wrap gap-2">
                ${dish.note_aromatiche.map(nota => 
                    `<span class="text-xs bg-gray-800 text-amber-300 px-3 py-1 rounded-full">${nota}</span>`
                ).join('')}
            </div>
        </div>
    `).join('');
}

function setupEventListeners() {
    elements.menuGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.card-dish');
        if (card) toggleDishSelection(parseInt(card.dataset.dishId));
    });
    
    elements.btnConsiglia.addEventListener('click', handleConsiglio);
}

function toggleDishSelection(dishId) {
    const index = state.selectedDishes.indexOf(dishId);
    const card = document.querySelector(`[data-dish-id="${dishId}"]`);
    
    if (index === -1) {
        if (state.selectedDishes.length >= 5) return;
        state.selectedDishes.push(dishId);
        card.classList.add('selected');
    } else {
        state.selectedDishes.splice(index, 1);
        card.classList.remove('selected');
    }
    
    updateUI();
}

function updateUI() {
    const count = state.selectedDishes.length;
    
    // Mostra/Nascondi lista piatti selezionati
    if (count === 0) {
        elements.selectedDishesDisplay.classList.add('hidden');
        elements.btnConsiglia.disabled = true;
        elements.btnConsiglia.textContent = 'Consigliatemi i Vini Perfetti';
        showMessage('Selezionate i piatti per iniziare.');
    } else {
        elements.selectedDishesDisplay.classList.remove('hidden');
        elements.btnConsiglia.disabled = false;
        elements.btnConsiglia.textContent = `Consigliatemi (${count} ${count === 1 ? 'piatto' : 'piatti'})`;
        elements.selectedDishesList.innerHTML = state.selectedDishes.map(dishId => {
            const dish = state.dishes.find(d => d.id === dishId);
            return `<span class="badge bg-amber-700 text-white">${dish.nome}</span>`;
        }).join('');
        showMessage(count === 1 ? 'Ottima scelta! Altro o procediamo?' : `Magnifico, ${count} piatti selezionati.`);
    }
}

async function handleConsiglio() {
    if (state.selectedDishes.length === 0) return;
    
    setLoadingState(true);
    setAvatarState('thinking');
    showMessage('Consulto la cantina per voi...');
    elements.recommendationsSection.classList.add('hidden');
    
    try {
        const selectedDishesData = state.selectedDishes.map(id => state.dishes.find(d => d.id === id));
        
        const response = await fetch('/api/consiglio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ piatti: selectedDishesData })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Errore server');

        displayRecommendations(data.consiglio);
        setAvatarState('happy');
        showMessage('Ecco il mio consiglio personalizzato!');
        
        setTimeout(() => {
            elements.recommendationsSection.scrollIntoView({ behavior: 'smooth' });
        }, 300);
        
    } catch (error) {
        showMessage('Scusate, ho avuto un problema tecnico. Riprovare?', 'idle');
    } finally {
        setLoadingState(false);
    }
}

// FUNZIONE CRITICA: Formattazione pulita senza tag "sporchi"
function formatConsiglio(text) {
    if (!text) return "";
    
    // 1. Rimuove eventuali tag HTML che l'AI potrebbe aver inserito per errore
    const cleanText = text.replace(/<\/?[^>]+(>|$)/g, "");
    
    // 2. Divide in paragrafi e pulisce spazi
    return cleanText
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => `<p class="mb-4 text-gray-200 leading-relaxed">${p}</p>`)
        .join('');
}

function displayRecommendations(consiglio) {
    elements.recommendationsContent.innerHTML = `
        <div class="wine-recommendation bg-black bg-opacity-60 rounded-2xl p-8 border border-amber-700 shadow-2xl">
            <div class="text-lg italic">
                ${formatConsiglio(consiglio)}
            </div>
            <div class="mt-8 pt-6 border-t border-gray-800 text-center">
                <button onclick="resetSelection()" 
                        class="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-8 rounded-full transition-all">
                    Nuova Selezione
                </button>
            </div>
        </div>
    `;
    elements.recommendationsSection.classList.remove('hidden');
}

function resetSelection() {
    state.selectedDishes = [];
    document.querySelectorAll('.card-dish.selected').forEach(c => c.classList.remove('selected'));
    elements.recommendationsSection.classList.add('hidden');
    updateUI();
    setAvatarState('idle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setAvatarState(stateName) {
    Object.values(avatarStates).forEach(id => document.getElementById(id)?.classList.remove('active'));
    document.getElementById(avatarStates[stateName])?.classList.add('active');
}

function showMessage(message, avatarState = null) {
    if (elements.reneMessage) elements.reneMessage.textContent = message;
    if (avatarState) setAvatarState(avatarState);
}

function setLoadingState(isLoading) {
    elements.btnConsiglia.disabled = isLoading;
    elements.loadingState.classList.toggle('hidden', !isLoading);
}

document.addEventListener('DOMContentLoaded', init);
window.resetSelection = resetSelection;
