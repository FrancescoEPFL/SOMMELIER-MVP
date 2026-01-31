import { kv } from '@vercel/kv';
import { notFound } from 'next/navigation';
import ChatCliente from './ChatCliente';

// Forza il rendering dinamico per riflettere i cambiamenti istantanei del database
export const dynamic = 'force-dynamic';

export default async function RestaurantPage({ params }) {
  // Nota: In Next.js 14+ params va gestito con attenzione se asincrono, 
  // ma per ora lo leggiamo direttamente per semplicità.
  const { restaurantId } = params;

  // Recupero dati menu da Vercel KV usando la chiave vista su Upstash
  const menuData = await kv.get(`menu:${restaurantId}`);

  // Se il ristorante non esiste nel database, mostriamo la pagina 404
  if (!menuData) {
    notFound();
  }

  // Estraiamo i piatti assicurandoci che la struttura JSON sia corretta
  const piatti = menuData.piatti || [];

  return (
    <main className="min-h-screen bg-[#0a0a0a]"> 
      {/* Abbiamo aggiunto lo sfondo scuro per coerenza con il design Luxury */}
      <ChatCliente 
        menu={piatti} 
        restaurantId={restaurantId} 
      />
    </main>
  );
}