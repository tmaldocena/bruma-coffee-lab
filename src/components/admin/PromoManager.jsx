import { useState } from 'react';

const inputClass =
  'bg-paper/60 border border-paper-border rounded text-sm text-espresso focus:outline-none focus:border-caramel px-2 h-8';

const DAYS = [
  ['mon', 'Lun'],
  ['tue', 'Mar'],
  ['wed', 'Mié'],
  ['thu', 'Jue'],
  ['fri', 'Vie'],
  ['sat', 'Sáb'],
  ['sun', 'Dom']
];

const TYPE_LABEL = {
  combo: 'Combo',
  happy_hour: 'Happy hour',
  banner: 'Banner'
};

function ArrowButton({ onClick, disabled, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-8 w-8 rounded border border-paper-border bg-paper/60 text-espresso text-sm font-bold transition-colors disabled:opacity-30 hover:border-caramel shrink-0"
    >
      {title === 'Mover arriba' ? '↑' : '↓'}
    </button>
  );
}

function ScheduleEditor({ promo, update }) {
  const schedule = promo.schedule || {};
  const [days, setDays] = useState(Array.isArray(schedule.days) ? schedule.days : []);
  const [from, setFrom] = useState(schedule.from || '');
  const [to, setTo] = useState(schedule.to || '');

  function save(nextDays, nextFrom, nextTo) {
    update({ schedule: { days: nextDays, from: nextFrom, to: nextTo } });
  }

  function toggleDay(day) {
    const next = days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
    setDays(next);
    save(next, from, to);
  }

  return (
    <div className="flex flex-col gap-2 border border-paper-border rounded-lg bg-paper/40 p-3">
      <div className="flex flex-wrap gap-1.5">
        {DAYS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => toggleDay(value)}
            className={`h-7 px-2 rounded text-[11px] font-bold border transition-colors ${
              days.includes(value)
                ? 'bg-espresso text-paper border-espresso'
                : 'bg-paper border-paper-border text-muted-text'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-text">
        <span>Desde</span>
        <input
          type="time"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            save(days, e.target.value, to);
          }}
          className={`${inputClass} w-28`}
        />
        <span>Hasta</span>
        <input
          type="time"
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            save(days, from, e.target.value);
          }}
          className={`${inputClass} w-28`}
        />
      </div>
    </div>
  );
}

function PromoRow({ promo, admin, index, count }) {
  const update = (patch) => admin.updatePromo(promo.id, patch);

  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-center gap-2">
        <span className="shrink-0 rounded bg-espresso text-paper text-[10px] font-extrabold uppercase tracking-wide px-2 py-1">
          {TYPE_LABEL[promo.type] || promo.type}
        </span>
        <input
          key={promo.id}
          defaultValue={promo.title}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v && v !== promo.title) update({ title: v });
          }}
          className={`${inputClass} flex-1 min-w-0 font-semibold`}
          placeholder="Título"
        />
        <input
          key={`${promo.id}-price`}
          type="number"
          defaultValue={promo.price ?? ''}
          placeholder="Precio"
          onBlur={(e) => {
            const v = e.target.value;
            const next = v.trim() === '' ? null : Number(v);
            if (next !== promo.price) update({ price: next });
          }}
          className={`${inputClass} w-24 text-right`}
        />
      </div>
      <input
        key={`${promo.id}-desc`}
        defaultValue={promo.description ?? ''}
        onBlur={(e) => update({ description: e.target.value.trim() || null })}
        className={`${inputClass} w-full text-muted-text`}
        placeholder="Descripción"
      />
      {promo.type === 'happy_hour' && <ScheduleEditor promo={promo} update={update} />}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => update({ is_active: !promo.is_active })}
          title="Activa en la carta"
          className={`h-8 px-2 rounded text-xs font-bold border transition-colors shrink-0 ${
            promo.is_active
              ? 'bg-green-100 text-green-800 border-green-300'
              : 'bg-paper border-paper-border text-muted-text'
          }`}
        >
          {promo.is_active ? 'Activa' : 'Inactiva'}
        </button>
        <div className="flex items-center gap-1 ml-auto">
          <ArrowButton
            onClick={() => admin.movePromo(promo.id, 'up')}
            disabled={index === 0}
            title="Mover arriba"
          />
          <ArrowButton
            onClick={() => admin.movePromo(promo.id, 'down')}
            disabled={index === count - 1}
            title="Mover abajo"
          />
          <button
            onClick={() => {
              if (window.confirm(`¿Eliminar la promo "${promo.title}"?`)) admin.removePromo(promo.id);
            }}
            title="Eliminar"
            className="h-8 w-8 rounded border border-red-200 bg-red-50 text-red-700 text-sm font-bold transition-colors hover:bg-red-100 shrink-0"
          >
            ✕
          </button>
        </div>
        {admin.savingId === promo.id && (
          <span className="text-[10px] text-muted-text">Guardando...</span>
        )}
      </div>
    </div>
  );
}

function AddPromoForm({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [type, setType] = useState('combo');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [days, setDays] = useState([]);
  const [from, setFrom] = useState('15:00');
  const [to, setTo] = useState('18:00');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    const ok = await onAdd({
      type,
      title: title.trim(),
      description: description.trim() || null,
      price: price.trim() === '' ? null : Number(price),
      schedule:
        type === 'happy_hour' ? { days, from, to } : null
    });
    setBusy(false);
    if (ok) {
      setOpen(false);
      setTitle('');
      setDescription('');
      setPrice('');
      setType('combo');
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="self-start px-3.5 py-1.5 rounded-full font-display font-bold text-xs border border-paper-border text-espresso transition-colors hover:border-caramel"
      >
        + Nueva promo
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 bg-paper-card border border-paper-border rounded-xl p-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={`${inputClass} w-36`}
        >
          <option value="combo">Combo</option>
          <option value="happy_hour">Happy hour</option>
          <option value="banner">Banner</option>
        </select>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          className={`${inputClass} flex-1 min-w-40`}
          autoFocus
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          placeholder="Precio (opcional)"
          className={`${inputClass} w-32`}
        />
      </div>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción"
        className={`${inputClass} w-full`}
      />
      {type === 'happy_hour' && (
        <div className="flex flex-col gap-2 border border-paper-border rounded-lg bg-paper/40 p-3">
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setDays((prev) =>
                    prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
                  )
                }
                className={`h-7 px-2 rounded text-[11px] font-bold border transition-colors ${
                  days.includes(value)
                    ? 'bg-espresso text-paper border-espresso'
                    : 'bg-paper border-paper-border text-muted-text'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-text">
            <span>Desde</span>
            <input
              type="time"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className={`${inputClass} w-28`}
            />
            <span>Hasta</span>
            <input
              type="time"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={`${inputClass} w-28`}
            />
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={busy || !title.trim()}
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

export default function PromoManager({ admin }) {
  const ordered = [...admin.promos].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="flex flex-col gap-4">
      <AddPromoForm onAdd={admin.addPromo} />
      <section className="bg-paper-card border border-paper-border rounded-xl divide-y divide-paper-border/60">
        {ordered.map((promo, i) => (
          <PromoRow key={promo.id} promo={promo} admin={admin} index={i} count={ordered.length} />
        ))}
        {ordered.length === 0 && (
          <p className="px-3 py-3 text-xs text-muted-text">No hay promos todavía.</p>
        )}
      </section>
    </div>
  );
}