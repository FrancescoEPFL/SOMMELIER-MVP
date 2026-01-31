'use client';

import { useState, useTransition } from 'react';
import { handleConsiglioAction } from '../actions/chat.js';

export default function ChatCliente({ menu, restaurantId }) {
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isPending, startTransition] = useTransition();

  const toggleDish = (nomePiatto) => {
    setSelectedDishes(prev => 
      prev.includes(nomePiatto) 
        ? prev.filter(d => d !== nomePiatto) 
        : [...prev, nomePiatto]
    );
  };

  const askRene = async () => {
    if (selectedDishes.length === 0) return;

    setErrorMsg(null);
    setRecommendation(null);
    
    startTransition(async () => {
      try {
        // PASSIAMO L'ARRAYselectedDishes ALL'AZIONE
        const result = await handleConsiglioAction(selectedDishes, restaurantId);
        
        if (result.error) throw new Error(result.error);

        setRecommendation(result.consiglio);
      } catch (err) {
        console.error("Errore René:", err);
        setErrorMsg("“Messieur, la mia cantina è momentaneamente inaccessibile.”");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans pb-20">
      {/* Header Sommelier */}
      <section className="container mx-auto px-4 max-w-4xl pt-10">
        <div className="glass-card p-10 text-center mb-16 shadow-[0_0_50px_rgba(74,4,4,0.2)]">
          <div className="w-32 h-32 mx-auto mb-8 relative rounded-full p-1 border border-[#fbbf24]/20">
             <img src="/assets/rene_landing.png" alt="René" className="w-full h-full rounded-full object-cover" />
          </div>

          <div className="min-h-[100px] flex flex-col justify-center mb-8">
            <p className="text-gray-300 italic font-light text-xl leading-relaxed">
              {isPending 
                ? "“Sto consultando le annate migliori per trovare l'accordo perfetto...”" 
                : recommendation 
                  ? "“Un abbinamento d'eccezione per il vostro palato.”"
                  : "“Selezionate i piatti che desiderate gustare; troverò il compagno ideale.”"}
            </p>
          </div>

          {recommendation && (
            <div className="mt-10 pt-10 border-t border-white/10 text-left animate-in fade-in slide-in-from-bottom-4">
               <div 
                  className="prose prose-invert max-w-none text-gray-200"
                  dangerouslySetInnerHTML={{ __html: formatConsiglio(recommendation) }}
               />
            </div>
          )}

          <div className="mt-10">
            <button
              onClick={askRene}
              disabled={selectedDishes.length === 0 || isPending}
              className={`px-12 py-4 rounded-full font-bold uppercase tracking-widest transition-all duration-500 
                ${selectedDishes.length > 0 && !isPending ? 'bg-[#fbbf24] text-black shadow-[0_0_30px_rgba(251,191,36,0.4)]' : 'bg-white/5 text-white/20'}`}
            >
              {isPending ? 'In Consultazione...' : 'Chiedi a René'}
            </button>
          </div>
        </div>
      </section>

      {/* Menù del Giorno */}
      <section className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-[#fbbf24] font-serif text-2xl mb-8 tracking-widest uppercase text-center opacity-70">Il Menù del Giorno</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menu?.map((piatto) => (
            <div 
              key={piatto.id}
              onClick={() => toggleDish(piatto.nome)}
              className={`glass-card p-6 cursor-pointer transition-all duration-300 border ${
                selectedDishes.includes(piatto.nome) ? 'border-[#fbbf24] bg-[#fbbf24]/10' : 'border-white/5 bg-white/5'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif text-[#fbbf24]">{piatto.nome}</h3>
                <div className={`w-3 h-3 rounded-full ${selectedDishes.includes(piatto.nome) ? 'bg-[#fbbf24] shadow-[0_0_10px_#fbbf24]' : 'bg-white/10'}`}></div>
              </div>
              <p className="text-gray-400 text-sm italic mt-2">{piatto.descrizione}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function formatConsiglio(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#fbbf24] font-serif">$1</strong>')
    .replace(/Curiosità:/i, '<br/><br/><span class="text-[10px] uppercase tracking-widest text-[#fbbf24]">La Nota del Sommelier</span><br/>');
}