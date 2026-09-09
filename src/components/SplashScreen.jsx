import { useEffect, useState } from 'react';
import BlindReveal from './BlindReveal.jsx';

/**
 * Pantalla de carga inicial de Bruma: la ilustración del chef aparece
 * en la esquina superior derecha, la de la taza en la inferior
 * izquierda (igual que en la portada del menú original), ambas con
 * efecto de persiana, y el logo aparece al centro con un pequeño pop.
 *
 * Se muestra un mínimo de `minDurationMs` y además espera a que
 * `isReady` sea true (por ejemplo, cuando terminó de cargar el menú
 * real desde Supabase) antes de desvanecerse.
 */
export default function SplashScreen({ isReady = true, minDurationMs = 1400 }) {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), minDurationMs);
    return () => clearTimeout(t);
  }, [minDurationMs]);

  useEffect(() => {
    if (minTimeElapsed && isReady && !exiting) {
      setExiting(true);
      const t = setTimeout(() => setHidden(true), 450);
      return () => clearTimeout(t);
    }
  }, [minTimeElapsed, isReady, exiting]);

  if (hidden) return null;

  return (
    <div
      className={exiting ? 'splash-exit' : ''}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#F1E7D8',
        overflow: 'hidden'
      }}
      role="status"
      aria-label="Cargando la carta de Bruma"
    >
      <BlindReveal
        src="/illustrations/corner-chef-cake.png"
        alt=""
        width={240}
        height={265}
        slats={8}
        delayStart={80}
        style={{ position: 'absolute', top: 0, right: 0 }}
      />

      <BlindReveal
        src="/illustrations/corner-cup.png"
        alt=""
        width={260}
        height={244}
        slats={8}
        delayStart={200}
        style={{ position: 'absolute', bottom: 0, left: 0 }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img
          src="/illustrations/logo-bruma.png"
          alt="Bruma Coffee Lab"
          className="splash-logo"
          style={{
            width: '140px',
            height: '191px',
            animationDelay: '520ms'
          }}
        />
      </div>
    </div>
  );
}
