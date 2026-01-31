import { kv } from '@vercel/kv';
import { notFound } from 'next/navigation';
import ChatCliente from './ChatCliente';

// Forza il rendering dinamico per avere sempre l'ultimo menu caricato
export const dynamic = 'force-dynamic';

export default async function RestaurantPage({ params }) {
  const { restaurantId } = params;

  // Recupero dati menu da Vercel KV
  // Chiave strutturata come menu:restaurantId
  const menuData = await kv.get(`menu:${restaurantId}`);

  // Se il ristorante non esiste o il menu è vuoto, 404
  if (!menuData) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <ChatCliente 
        menu={menuData.piatti} 
        restaurantId={restaurantId} 
      />
    </main>
  );
}
