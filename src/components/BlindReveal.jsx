/**
 * Revela una imagen en franjas horizontales que se abren como una
 * persiana, en cascada. Cada franja es un recorte de la misma imagen
 * (desplazada verticalmente) para que al abrirse todas juntas se vea
 * la imagen completa sin costuras. Usa píxeles exactos (no %) para
 * evitar líneas de redondeo entre franjas.
 */
export default function BlindReveal({
  src,
  alt,
  slats = 9,
  width,
  height,
  delayStart = 0,
  staggerMs = 45,
  durationMs = 480,
  style = {}
}) {
  const slatHeight = height / slats;

  return (
    <div
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        overflow: 'hidden',
        ...style
      }}
      aria-hidden="true"
    >
      {Array.from({ length: slats }).map((_, i) => (
        <div
          key={i}
          className="blind-slat"
          style={{
            position: 'absolute',
            left: 0,
            width: `${width}px`,
            height: `${Math.ceil(slatHeight)}px`,
            top: `${Math.floor(i * slatHeight)}px`,
            overflow: 'hidden',
            transformOrigin: 'center',
            animationDelay: `${delayStart + i * staggerMs}ms`,
            animationDuration: `${durationMs}ms`
          }}
        >
          <img
            src={src}
            alt={alt}
            style={{
              position: 'absolute',
              left: 0,
              top: `-${Math.floor(i * slatHeight)}px`,
              width: `${width}px`,
              height: `${height}px`,
              maxWidth: 'none',
              display: 'block'
            }}
          />
        </div>
      ))}
    </div>
  );
}
