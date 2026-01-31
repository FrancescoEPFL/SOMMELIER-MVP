'use client';

import { useState, useTransition } from 'react';
import { handleConsiglioAction } from '../actions/chat';

export default function ChatCliente({ menu, restaurantId }) {
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null); // Stato per errori eleganti
  const [isPending, startTransition] = useTransition();
  const [avatarState, setAvatarState] = useState('idle');

  // Controllo preliminare: il menu ha dei vini associati?
  // Nota: assumiamo che 'menu' sia l'oggetto completo o che i vini siano passati
  const hasWines = menu?.vini && menu.vini.length > 0;

  const askRene = async () => {
    if (!hasWines) {
      setAvatarState('idle');
      setErrorMsg("“Mille scuse, ma la mia cantina privata è attualmente in fase di riordino. Vi prego di consultare i miei colleghi in sala per la scelta dei calici.”");
      return;
    }

    setAvatarState('thinking');
    setErrorMsg(null);
    setRecommendation(null);
    
    startTransition(async () => {
      try {
        const result = await handleConsiglioAction(selectedDishes, restaurantId);
        
        if (result.error) {
          throw new Error(result.error);
        }

        setRecommendation(result.consiglio);
        setAvatarState('suggesting');
      } catch (err) {
        console.error("Errore René:", err);
        setAvatarState('idle');
        setErrorMsg("“Messieur, un piccolo imprevisto tecnico mi impedisce di accedere ai miei registri. La mia cantina è momentaneamente inaccessibile, vi porgo le mie più sincere scuse.”");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      {/* ... (Header e background rimangono invariati dal Task 1/3) */}

      <section className="relative z-10 container mx-auto px-4 max-w-4xl pt-10">
        <div className="glass-card p-10 text-center mb-16 shadow-[0_0_50px_rgba(74,4,4,0.2)]">
          
          {/* Avatar con pulsazione soft durante l'attesa */}
          <div className={`w-32 h-32 mx-auto mb-8 relative rounded-full p-1 border border-[#fbbf24]/20 ${isPending ? 'animate-pulse' : ''}`}>
             <img 
                src={`/assets/${avatarState}.png`} 
                alt="René" 
                className="w-full h-full rounded-full object-cover"
              />
          </div>

          {/* Area Messaggi René */}
          <div className="min-h-[120px] flex flex-col justify-center">
            {errorMsg ? (
              <p className="text-[#fbbf24] italic font-light text-xl animate-fade-in">
                {errorMsg}
              </p>
            ) : (
              <p className="text-gray-300 italic font-light text-xl leading-relaxed">
                {isPending 
                  ? "“Sto consultando le annate migliori per trovare l'accordo perfetto...”" 
                  : recommendation 
                    ? "“Un abbinamento d'eccezione per il vostro palato.”"
                    : "“Selezionate i piatti che desiderate gustare; troverò il compagno ideale in cantina.”"}
              </p>
            )}
          </div>

          {/* Area Risposta AI (se presente) */}
          {recommendation && !errorMsg && (
            <div className="mt-10 pt-10 border-t border-white/10 text-left animate-slide-up">
               <div 
                  className="prose prose-invert max-w-none prose-strong:text-[#fbbf24] prose-p:text-gray-200"
                  dangerouslySetInnerHTML={{ __html: formatConsiglio(recommendation) }}
               />
            </div>
          )}

          {/* Bottone d'Azione */}
          <div className="mt-12">
            <button
              onClick={askRene}
              disabled={selectedDishes.length === 0 || isPending}
              className="btn-gold-luxury" // Definita in globals.css per coerenza
            >
              {isPending ? 'In Consultazione...' : 'Chiedi a René'}
            </button>
          </div>
        </div>
      </section>

      {/* ... (Visualizzazione Menu per categorie dal Task 3) */}
    </div>
  );
}

// Helper per formattare la risposta (richiama la logica del tuo vecchio script.js)
function formatConsiglio(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#fbbf24] font-serif">$1</strong>')
    .replace(/Curiosità:/i, '<div class="nota-sommelier"><span class="block text-[10px] uppercase tracking-widest text-[#fbbf24] mb-2 not-italic">La Nota del Sommelier</span>')
    .concat(text.toLowerCase().includes('curiosità:') ? '</div>' : '');
}
