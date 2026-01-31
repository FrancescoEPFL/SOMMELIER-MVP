import Link from 'next/link';
import Image from 'next/image'; // Per ottimizzare le immagini in Next.js

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-gray-100 overflow-hidden">
      {/* Sfondo Immagine di René (a tutto schermo) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/rene_landing.png" // Assicurati di avere un'immagine di René per la landing qui
          alt="René Sommelier in ambiente Dark Luxury"
          layout="fill"
          objectFit="cover"
          quality={80}
          className="opacity-20" // Leggermente opaca per far risaltare il testo
        />
        {/* Sovrapposizione Gradiente per l'atmosfera Dark Luxury */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/50"></div>
      </div>

      <div className="relative z-10 text-center p-8 max-w-2xl mx-auto">
        {/* Logo/Titolo René */}
        <h1 className="text-7xl md:text-8xl font-serif font-bold text-[#fbbf24] tracking-tighter mb-4 drop-shadow-lg animate-fade-in-up">
          René
        </h1>
        <p className="text-lg md:text-xl uppercase tracking-[0.5em] text-[#fbbf24]/60 font-light mb-12 animate-fade-in-up delay-100">
          Il Vostro Sommelier Virtuale
        </p>

        {/* Testo di Benvenuto Elegante */}
        <p className="text-xl md:text-2xl font-light italic text-gray-300 mb-16 leading-relaxed animate-fade-in-up delay-200">
          "Accedete alla raffinata guida di René, l'intelligenza artificiale dedicata all'arte dell'abbinamento. Un'esperienza di sommelierie d'élite, ora a portata di calice."
        </p>

        {/* Form di Accesso per Ristoratori */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl animate-fade-in-up delay-300">
          <h2 className="text-2xl font-serif text-[#fbbf24] mb-6">Accesso Ristoratore</h2>
          <form className="space-y-6">
            <input
              type="text"
              placeholder="Inserisci il tuo Restaurant ID"
              className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#fbbf24] transition-all duration-300"
            />
            <button
              type="submit"
              className="w-full group relative overflow-hidden bg-gradient-to-r from-[#b45309] via-[#fbbf24] to-[#b45309] bg-[length:200%_auto] hover:bg-right px-8 py-4 text-black font-bold uppercase tracking-[0.2em] transition-all duration-500 disabled:opacity-50"
            >
              Accedi alla Tua Cantina
            </button>
          </form>

          <div className="mt-8 border-t border-white/10 pt-8">
            <p className="text-gray-400 mb-4">Non hai ancora un menu configurato?</p>
            <Link href="/admin" legacyBehavior>
              <a className="inline-block px-8 py-3 bg-[#4a0404]/50 border border-[#4a0404] text-[#fbbf24] font-semibold uppercase tracking-wider rounded-lg hover:bg-[#4a0404]/80 transition-colors duration-300">
                Configura un Nuovo Menu
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
