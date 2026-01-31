'use client'
import { useState } from 'react';
import { uploadMenuAction } from '../actions/upload';

export default function AdminPage() {
  const [restaurantId, setRestaurantId] = useState('');
  const [menuText, setMenuText] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ loading: false, message: '', error: false });

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validazione base
    if (!restaurantId || (!menuText && !file)) {
      return alert("Inserisci l'ID e almeno un file o il testo del menu!");
    }

    setStatus({ loading: true, message: 'René sta elaborando...', error: false });

    const formData = new FormData();
    formData.append('restaurantId', restaurantId);
    formData.append('menuText', menuText);
    if (file) formData.append('file', file);

    try {
      const result = await uploadMenuAction(formData);
      
      // PROTEZIONE: Usiamo l'optional chaining ?.result per evitare crash
      if (result?.success) {
        setStatus({ loading: false, message: '✅ Menu digitalizzato!', error: false });
        setMenuText('');
        setFile(null);
        // Puliamo anche l'input file visivamente
        e.target.reset(); 
      } else {
        // Se result è undefined o success è false, mostriamo l'errore specifico o uno generico
        const errorMessage = result?.error || "L'AI non ha risposto correttamente. Controlla i log.";
        setStatus({ loading: false, message: `❌ ${errorMessage}`, error: true });
      }
    } catch (err) {
      console.error("Errore Front-end:", err);
      setStatus({ loading: false, message: '❌ Errore critico di comunicazione con il server', error: true });
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff', padding: '40px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#111', padding: '30px', borderRadius: '12px', border: '1px solid #333' }}>
        <h1 style={{ color: '#fbbf24', textAlign: 'center', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Admin Ristoratore
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ color: '#666', fontSize: '11px', fontWeight: 'bold' }}>ID RISTORANTE (slug)</label>
            <input 
              type="text" 
              value={restaurantId} 
              onChange={(e) => setRestaurantId(e.target.value)}
              placeholder="es. osteria-da-francesco"
              style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
            />
          </div>

          <div style={{ border: '1px dashed #333', padding: '15px', borderRadius: '4px' }}>
            <label style={{ color: '#666', fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>OPZIONE 1: CARICA PDF</label>
            <input 
              type="file" 
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ fontSize: '12px' }}
            />
          </div>

          <div>
            <label style={{ color: '#666', fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>OPZIONE 2: INCOLLA TESTO (PIÙ VELOCE)</label>
            <textarea 
              rows="8" 
              value={menuText} 
              onChange={(e) => setMenuText(e.target.value)}
              placeholder="Incolla qui il testo estratto dal menu..."
              style={{ width: '100%', padding: '12px', backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px', fontSize: '14px' }}
            />
          </div>

          <button 
            disabled={status.loading} 
            style={{ 
              padding: '18px', 
              backgroundColor: status.loading ? '#444' : '#fbbf24', 
              color: '#000', 
              fontWeight: 'bold', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: status.loading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase'
            }}
          >
            {status.loading ? 'Analisi in corso...' : 'Digitalizza con René'}
          </button>

          {status.message && (
            <p style={{ 
              color: status.error ? '#ff4444' : '#10b981', 
              textAlign: 'center', 
              fontSize: '14px',
              padding: '10px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '4px'
            }}>
              {status.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
