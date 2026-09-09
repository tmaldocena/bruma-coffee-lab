import { Fragment, useEffect, useMemo, useState } from 'react';

/* Ilustraciones que se reparten al azar entre los huecos de la carta. */
const SCATTER_IMAGES = [
  '/illustrations/img41.png',
  '/illustrations/img43.png',
  '/illustrations/img51.png',
  '/illustrations/img113.png',
  '/illustrations/img192.png',
  '/illustrations/img238.png'
];

/* Huecos disponibles: cada entrada define alineación, tamaño y rotación. */
const SCATTER_SPOTS = [
  { wrap: 'justify-start pl-6 sm:pl-10', img: 'w-48 sm:w-64 -rotate-6' },
  { wrap: 'justify-end pr-8 sm:pr-14', img: 'w-44 sm:w-60 rotate-6' },
  { wrap: 'justify-start pl-12 sm:pl-20', img: 'w-48 sm:w-64 -rotate-3' },
  { wrap: 'justify-end pr-2 sm:pr-6', img: 'w-52 sm:w-72 -rotate-8' },
  { wrap: 'justify-start pl-4 sm:pl-8', img: 'w-48 sm:w-64 rotate-3' },
  { wrap: 'justify-center', img: 'w-48 sm:w-72 rotate-4' }
];

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Island interactivo: recibe todo el menú ya resuelto desde el server
 * (categorías + productos + promo_blocks) y hace el filtrado/búsqueda
 * en el cliente, sin pegarle de nuevo a Supabase.
 */
export default function MenuExplorer({ categories, promoBlocks, currencyFormat }) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('todos');
  const [scattered, setScattered] = useState(() => shuffle(SCATTER_IMAGES));

  useEffect(() => {
    setScattered(shuffle(SCATTER_IMAGES));
  }, [query, activeCategory]);

  const formatPrice = (price) =>
    price == null ? 'Consultar' : `$${Number(price).toLocaleString(currencyFormat || 'es-AR')}`;

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .filter((cat) => activeCategory === 'todos' || cat.slug === activeCategory)
      .map((cat) => ({
        ...cat,
        products: cat.products.filter((p) => {
          if (!p.is_available) return false;
          if (!q) return true;
          return (
            p.name.toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q)
          );
        })
      }))
      .filter((cat) => cat.products.length > 0);
  }, [categories, query, activeCategory]);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative w-full">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar en la carta (Capuccino, Shakshuka...)"
          className="w-full h-10 px-4 rounded-full bg-paper-card border border-paper-border text-espresso placeholder:text-muted-text text-sm focus:outline-none focus:border-caramel"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory('todos')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full font-display font-bold text-xs border transition-colors ${
            activeCategory === 'todos'
              ? 'bg-espresso text-paper border-espresso'
              : 'bg-paper-card text-espresso border-paper-border hover:border-caramel'
          }`}
        >
          ★ Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.slug)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full font-display font-bold text-xs border transition-colors ${
              activeCategory === cat.slug
                ? 'bg-espresso text-paper border-espresso'
                : 'bg-paper-card text-espresso border-paper-border hover:border-caramel'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12 text-muted-text text-sm">
          No encontramos ese plato o bebida. Consultá con el barista.
        </div>
      )}

      <div className="flex flex-col gap-8">
        {filteredCategories.map((cat, index) => {
          const spot = SCATTER_SPOTS[index];
          const src = scattered[index];
          return (
            <Fragment key={cat.id}>
              {spot && src && (
                <div className={`flex ${spot.wrap}`}>
                  <img
                    src={src}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className={`${spot.img} h-auto pointer-events-none select-none drop-shadow-[0_6px_10px_rgba(60,35,20,0.3)]`}
                  />
                </div>
              )}
              <section className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <img src="/star.png" alt="" aria-hidden="true" className="w-6 h-6 shrink-0" />
                  <h2 className="font-display font-extrabold text-xl text-caramel whitespace-nowrap">{cat.name}</h2>
                  <div className="flex-1 h-px bg-paper-border" />
                </div>

                {activeCategory !== 'todos' &&
                  promoBlocks
                    .filter((p) => p.type === 'combo')
                    .map((promo) => (
                      <div
                        key={promo.id}
                        className="rounded-xl bg-paper/80 border border-paper-border p-4 flex items-center justify-between gap-3"
                      >
                        <div>
                          <h3 className="font-display font-bold text-base text-espresso">{promo.title}</h3>
                          <p className="text-xs text-muted-text mt-0.5">{promo.description}</p>
                        </div>
                        <span className="font-display font-black text-lg text-caramel-dark shrink-0">
                          {formatPrice(promo.price)}
                        </span>
                      </div>
                    ))}

                <div className="divide-y divide-paper-border/60 bg-paper/75 rounded-xl border border-paper-border/80 px-4">
                  {cat.products.map((product) => (
                    <div key={product.id} className="py-3 flex items-start justify-between gap-3">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-display font-bold text-[15px] text-espresso">
                            {product.name}
                          </span>
                          {product.is_featured && (
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-caramel/20 text-caramel-dark">
                              TOP
                            </span>
                          )}
                        </div>
                        {product.description && (
                          <span className="text-xs text-muted-text">{product.description}</span>
                        )}
                      </div>
                      <span className="font-display font-black text-[15px] text-espresso shrink-0">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
