import { useState } from 'react';

const inputClass =
  'bg-paper/60 border border-paper-border rounded text-sm text-espresso focus:outline-none focus:border-caramel px-2 h-8';

function ToggleButton({ active, activeClass, inactiveClass, onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`h-8 px-2 rounded text-xs font-bold border transition-colors shrink-0 ${
        active ? activeClass : inactiveClass
      }`}
    >
      {children}
    </button>
  );
}

function ArrowButton({ onClick, disabled, title, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-8 w-8 rounded border border-paper-border bg-paper/60 text-espresso text-sm font-bold transition-colors disabled:opacity-30 hover:border-caramel shrink-0"
    >
      {children}
    </button>
  );
}

function AddCategoryForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    const ok = await onAdd({ name: name.trim(), icon: icon.trim() });
    setBusy(false);
    if (ok) {
      setName('');
      setIcon('');
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="self-start px-3.5 py-1.5 rounded-full font-display font-bold text-xs border border-paper-border text-espresso transition-colors hover:border-caramel"
      >
        + Nueva categoría
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-2 bg-paper-card border border-paper-border rounded-xl p-3"
    >
      <label className="flex flex-col gap-1 text-[11px] font-bold text-muted-text">
        Nombre
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${inputClass} w-44`}
          autoFocus
        />
      </label>
      <label className="flex flex-col gap-1 text-[11px] font-bold text-muted-text">
        Emoji
        <input
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className={`${inputClass} w-14 text-center`}
          maxLength={4}
        />
      </label>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="h-8 rounded bg-espresso text-paper font-display font-bold text-xs px-3 disabled:opacity-50"
        >
          {busy ? 'Creando...' : 'Crear'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-8 rounded border border-paper-border px-3 text-xs font-bold text-muted-text"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function AddProductForm({ onAdd, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    const ok = await onAdd({
      name: name.trim(),
      description: description.trim() || null,
      price: price.trim() === '' ? null : Number(price)
    });
    setBusy(false);
    if (ok) {
      setName('');
      setDescription('');
      setPrice('');
      onCancel();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 bg-paper border border-paper-border rounded-lg p-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del producto"
          className={`${inputClass} flex-1 min-w-40`}
          autoFocus
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          placeholder="Precio (vacío = Consultar)"
          className={`${inputClass} w-36`}
        />
      </div>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción (opcional)"
        className={`${inputClass} w-full`}
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="h-8 rounded bg-espresso text-paper font-display font-bold text-xs px-3 disabled:opacity-50"
        >
          {busy ? 'Agregando...' : 'Agregar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-8 rounded border border-paper-border px-3 text-xs font-bold text-muted-text"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function ProductRow({ product, admin, categoryId, index, count }) {
  const update = (patch) => admin.updateProduct(product.id, patch);

  return (
    <div className="flex flex-col gap-1.5 px-3 py-3">
      <div className="flex items-center gap-2">
        <input
          key={product.id}
          defaultValue={product.name}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v && v !== product.name) update({ name: v });
          }}
          className={`${inputClass} flex-1 min-w-0 font-semibold`}
          placeholder="Nombre"
        />
        <input
          key={`${product.id}-price`}
          type="number"
          defaultValue={product.price ?? ''}
          placeholder="Consultar"
          onBlur={(e) => {
            const v = e.target.value;
            const next = v.trim() === '' ? null : Number(v);
            if (next !== product.price) update({ price: next });
          }}
          className={`${inputClass} w-24 text-right`}
        />
      </div>
      <input
        key={`${product.id}-desc`}
        defaultValue={product.description ?? ''}
        onBlur={(e) => update({ description: e.target.value.trim() || null })}
        className={`${inputClass} w-full text-muted-text`}
        placeholder="Descripción"
      />
      <div className="flex flex-wrap items-center gap-1.5">
        <ToggleButton
          active={product.is_featured}
          activeClass="bg-caramel text-white border-caramel"
          inactiveClass="bg-paper border-paper-border text-muted-text"
          onClick={() => update({ is_featured: !product.is_featured })}
          title="Destacado (TOP)"
        >
          TOP
        </ToggleButton>
        <ToggleButton
          active={product.is_available}
          activeClass="bg-green-100 text-green-800 border-green-300"
          inactiveClass="bg-red-100 text-red-800 border-red-300"
          onClick={() => update({ is_available: !product.is_available })}
          title="Disponible hoy"
        >
          {product.is_available ? 'Disponible' : 'Agotado'}
        </ToggleButton>
        <div className="flex items-center gap-1 ml-auto">
          <ArrowButton
            onClick={() => admin.moveProduct(categoryId, product.id, 'up')}
            disabled={index === 0}
            title="Mover arriba"
          >
            ↑
          </ArrowButton>
          <ArrowButton
            onClick={() => admin.moveProduct(categoryId, product.id, 'down')}
            disabled={index === count - 1}
            title="Mover abajo"
          >
            ↓
          </ArrowButton>
          <button
            onClick={() => {
              if (window.confirm(`¿Eliminar "${product.name}"?`)) admin.removeProduct(product.id);
            }}
            title="Eliminar"
            className="h-8 w-8 rounded border border-red-200 bg-red-50 text-red-700 text-sm font-bold transition-colors hover:bg-red-100 shrink-0"
          >
            ✕
          </button>
        </div>
        {admin.savingId === product.id && (
          <span className="text-[10px] text-muted-text">Guardando...</span>
        )}
      </div>
    </div>
  );
}

function CategorySection({ cat, admin }) {
  const ordered = [...cat.products].sort((a, b) => a.sort_order - b.sort_order);
  const [adding, setAdding] = useState(false);
  const index = admin.categories.findIndex((c) => c.id === cat.id);
  const count = admin.categories.length;

  return (
    <section className="bg-paper-card border border-paper-border rounded-xl overflow-hidden">
      <div className="px-3 py-2.5 flex flex-wrap items-center gap-2 border-b border-paper-border/60">
        <input
          key={`${cat.id}-icon`}
          defaultValue={cat.icon ?? ''}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v !== (cat.icon ?? '')) admin.updateCategory(cat.id, { icon: v || null });
          }}
          maxLength={4}
          className="w-10 h-8 text-center rounded bg-paper/60 border border-paper-border text-sm"
          title="Ícono (emoji)"
        />
        <input
          key={`${cat.id}-name`}
          defaultValue={cat.name}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v && v !== cat.name) admin.updateCategory(cat.id, { name: v });
          }}
          className="font-display font-extrabold text-base text-espresso bg-transparent flex-1 min-w-40 px-1 h-9 focus:outline-none rounded border border-transparent focus:border-caramel"
        />
        <div className="flex items-center gap-1.5">
          <ToggleButton
            active={cat.is_visible}
            activeClass="bg-green-100 text-green-800 border-green-300"
            inactiveClass="bg-paper border-paper-border text-muted-text"
            onClick={() => admin.updateCategory(cat.id, { is_visible: !cat.is_visible })}
            title="Visible en la carta pública"
          >
            {cat.is_visible ? 'Visible' : 'Oculto'}
          </ToggleButton>
          <ArrowButton
            onClick={() => admin.moveCategory(cat.id, 'up')}
            disabled={index === 0}
            title="Mover categoría arriba"
          >
            ↑
          </ArrowButton>
          <ArrowButton
            onClick={() => admin.moveCategory(cat.id, 'down')}
            disabled={index === count - 1}
            title="Mover categoría abajo"
          >
            ↓
          </ArrowButton>
          <button
            onClick={() => {
              if (
                window.confirm(
                  `¿Eliminar la categoría "${cat.name}"? Se borran sus ${cat.products.length} producto(s).`
                )
              )
                admin.removeCategory(cat.id);
            }}
            title="Eliminar categoría"
            className="h-8 w-8 rounded border border-red-200 bg-red-50 text-red-700 text-sm font-bold transition-colors hover:bg-red-100 shrink-0"
          >
            ✕
          </button>
          {admin.savingId === cat.id && (
            <span className="text-[10px] text-muted-text">Guardando...</span>
          )}
        </div>
      </div>

      <div className="divide-y divide-paper-border/60 bg-paper/50">
        {ordered.map((product, i) => (
          <ProductRow
            key={product.id}
            product={product}
            admin={admin}
            categoryId={cat.id}
            index={i}
            count={ordered.length}
          />
        ))}
        {ordered.length === 0 && (
          <p className="px-3 py-3 text-xs text-muted-text">Sin productos todavía.</p>
        )}
      </div>

      <div className="p-2 border-t border-paper-border/60">
        {adding ? (
          <AddProductForm
            onAdd={(data) => admin.addProduct(cat.id, data)}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full h-9 rounded-lg border border-dashed border-paper-border text-xs font-bold text-muted-text transition-colors hover:border-caramel hover:text-caramel"
          >
            + Agregar producto
          </button>
        )}
      </div>
    </section>
  );
}

export default function ProductManager({ admin }) {
  const ordered = [...admin.categories].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="flex flex-col gap-4">
      <AddCategoryForm onAdd={admin.addCategory} />
      {ordered.map((cat) => (
        <CategorySection key={cat.id} cat={cat} admin={admin} />
      ))}
    </div>
  );
}