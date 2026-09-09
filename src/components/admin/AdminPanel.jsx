import { useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import useAdminData from './useAdminData.js';
import ProductManager from './ProductManager.jsx';
import PromoManager from './PromoManager.jsx';

export default function AdminPanel({ venueId }) {
  const [tab, setTab] = useState('productos');
  const admin = useAdminData(venueId);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display font-extrabold text-2xl text-espresso">Panel Bruma</h1>
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="text-xs font-bold text-muted-text border border-paper-border rounded-full px-3 py-1.5 hover:text-espresso hover:border-caramel transition-colors"
          >
            ← Ver carta
          </a>
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-muted-text border border-paper-border rounded-full px-3 py-1.5 hover:text-espresso hover:border-caramel transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {[
          ['productos', 'Productos'],
          ['promos', 'Promos']
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`shrink-0 px-4 py-1.5 rounded-full font-display font-bold text-xs border transition-colors ${
              tab === key
                ? 'bg-espresso text-paper border-espresso'
                : 'bg-paper-card text-espresso border-paper-border hover:border-caramel'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {admin.notice && (
        <div
          className={`rounded-xl border px-4 py-2.5 text-sm font-bold ${
            admin.notice.type === 'ok'
              ? 'bg-green-100 border-green-300 text-green-800'
              : 'bg-red-100 border-red-300 text-red-800'
          }`}
        >
          {admin.notice.message}
        </div>
      )}

      {!admin.ready ? (
        <p className="text-sm text-muted-text">Cargando carta...</p>
      ) : tab === 'productos' ? (
        <ProductManager admin={admin} />
      ) : (
        <PromoManager admin={admin} />
      )}
    </div>
  );
}