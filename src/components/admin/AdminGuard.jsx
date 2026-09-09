import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import AdminPanel from './AdminPanel.jsx';

export default function AdminGuard({ venueId }) {
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        setChecking(false);
      })
      .catch(() => {
        if (!mounted) return;
        setError('No pudimos verificar tu sesión. Probá de nuevo.');
        setChecking(false);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (checking || session) return;
    const t = setTimeout(() => {
      window.location.href = '/admin/login';
    }, 400);
    return () => clearTimeout(t);
  }, [checking, session]);

  if (checking) return <p className="text-sm text-muted-text">Verificando sesión...</p>;
  if (session) return <AdminPanel venueId={venueId} />;

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3 text-sm">
        <p className="text-red-700">{error}</p>
        <a
          href="/admin/login"
          className="px-3.5 py-1.5 rounded-full font-display font-bold text-xs border border-paper-border text-espresso transition-colors hover:border-caramel"
        >
          Ir al login
        </a>
      </div>
    );
  }

  return null;
}