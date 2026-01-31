'use client'; // Necessario per usare bottoni e input interattivi

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [restaurantId, setRestaurantId] = useState('');
  const router = useRouter();

  const handleAccess = (e) => {
    e.preventDefault(); // Blocca il refresh della pagina
    if (restaurantId.trim()) {
      // Naviga verso l'ID inserito (es: /osteria)
      router.push(`/${restaurantId.trim().toLowerCase()}`);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-gray-100 overflow-hidden">
      {/* Sfondo Immagine di René */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/rene_landing.png"
          alt="René Sommelier"
          fill 
          style={{ objectFit: 'cover' }}
          quality={80}
          className="opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/50"></div>
      </div>

      <div className="relative z-10 text-center p-8 max-w-2xl mx-auto">
        <h1 className="text-7xl md:text-8xl font-serif font-bold text-[#fbbf24] tracking-tighter mb-4 drop-shadow-lg">
          René
        </h1>
        <p className="text-lg md:text-xl uppercase tracking-[0.5em] text-[#fbbf24]/60 font-light mb-12">
          Il Vostro Sommelier Virtuale
        </p>

        <p className="text-xl md:text-2xl font-light italic text-gray-300 mb-16 leading-relaxed">
          "Accedete alla raffinata guida di René, l'intelligenza artificiale dedicata all'arte dell'abbinamento."
        </p>

        {/* Form di Accesso */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-serif text-[#fbbf24] mb-6">Accesso Ristoratore</h2>
          
          <form onSubmit={handleAccess} className="space-y-6">
            <input
              type="text"
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              placeholder="Inserisci il tuo Restaurant ID (es: osteria)"
              className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#fbbf24]"
              required
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#b45309] via-[#fbbf24] to-[#b45309] bg-[length:200%_auto] hover:bg-right px-8 py-4 text-black font-bold uppercase tracking-[0.2em] transition-all duration-500"
            >
              Accedi alla Tua Cantina
            </button>
          </form>

          <div className="mt-8 border-t border-white/10 pt-8">
            <p className="text-gray-400 mb-4">Non hai ancora un menu configurato?</p>
            <Link href="/admin" className="inline-block px-8 py-3 bg-[#4a0404]/50 border border-[#4a0404] text-[#fbbf24] font-semibold uppercase tracking-wider rounded-lg hover:bg-[#4a0404]/80 transition-colors duration-300">
              Configura un Nuovo Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}