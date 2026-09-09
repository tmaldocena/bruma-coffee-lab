import { useState } from 'react';
import { supabase } from '../../lib/supabase.js';

const ADMIN_EMAIL = import.meta.env.PUBLIC_ADMIN_EMAIL;

/**
 * Login del panel con una sola cuenta: el email está prefijado por
 * configuración (PUBLIC_ADMIN_EMAIL), así que solo se pide la contraseña.
 */
export default function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Ingresá la contraseña del panel.');
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password
    });
    setLoading(false);

    if (authError) {
      setError('No pudimos iniciar sesión. Revisá la contraseña.');
      return;
    }

    window.location.href = '/admin';
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-muted-text">Contraseña del panel</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          autoFocus
          className="h-10 px-3 rounded bg-paper border border-paper-border text-sm focus:outline-none focus:border-caramel"
        />
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="h-10 rounded bg-espresso text-paper font-display font-bold text-sm mt-2 disabled:opacity-60"
      >
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
}