import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const maxOrder = (items) => items.reduce((m, it) => Math.max(m, it.sort_order || 0), 0);

/**
 * Estado central del panel: carga categorías + productos y promo_blocks,
 * y expone operaciones CRUD/orden que guardan en Supabase y actualizan
 * el estado local con feedback ("Guardado ✓" / error).
 */
export default function useAdminData(venueId) {
  const [categories, setCategories] = useState([]);
  const [promos, setPromos] = useState([]);
  const [ready, setReady] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 2600);
    return () => clearTimeout(t);
  }, [notice]);

  async function load() {
    setReady(false);
    const [{ data: cats, error: catErr }, { data: prom, error: promoErr }] = await Promise.all([
      supabase
        .from('categories')
        .select('*, products(*)')
        .eq('venue_id', venueId)
        .order('sort_order', { ascending: true }),
      supabase
        .from('promo_blocks')
        .select('*')
        .eq('venue_id', venueId)
        .order('sort_order', { ascending: true })
    ]);

    if (catErr || promoErr) {
      setNotice({ type: 'error', message: 'No pudimos cargar la carta.' });
    } else {
      cats.forEach((cat) => cat.products.sort((a, b) => a.sort_order - b.sort_order));
      setCategories(cats);
      setPromos(prom);
    }
    setReady(true);
  }

  const flash = (message) => setNotice({ type: 'ok', message });
  const fail = (message) => setNotice({ type: 'error', message });

  async function updateProduct(id, patch) {
    setSavingId(id);
    const { error } = await supabase.from('products').update(patch).eq('id', id);
    if (!error) {
      setCategories((prev) =>
        prev.map((c) => ({
          ...c,
          products: c.products.map((p) => (p.id === id ? { ...p, ...patch } : p))
        }))
      );
      flash('Guardado ✓');
    } else {
      fail('No pudimos guardar.');
    }
    setSavingId(null);
  }

  async function updateCategory(id, patch) {
    setSavingId(id);
    const { error } = await supabase.from('categories').update(patch).eq('id', id);
    if (!error) {
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
      flash('Guardado ✓');
    } else {
      fail('No pudimos guardar.');
    }
    setSavingId(null);
  }

  async function updatePromo(id, patch) {
    setSavingId(id);
    const { error } = await supabase.from('promo_blocks').update(patch).eq('id', id);
    if (!error) {
      setPromos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      flash('Guardado ✓');
    } else {
      fail('No pudimos guardar.');
    }
    setSavingId(null);
  }

  async function addProduct(categoryId, { name, description, price }) {
    const cat = categories.find((c) => c.id === categoryId);
    const { data, error } = await supabase
      .from('products')
      .insert({
        venue_id: venueId,
        category_id: categoryId,
        name,
        description: description || null,
        price: price == null ? null : Number(price),
        sort_order: maxOrder(cat?.products || []) + 1
      })
      .select()
      .single();

    if (error) {
      fail('No pudimos agregar el producto.');
      return false;
    }
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, products: [...c.products, data] } : c))
    );
    flash('Producto agregado ✓');
    return true;
  }

  async function addCategory({ name, icon }) {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        venue_id: venueId,
        name,
        slug: slugify(name),
        icon: icon || null,
        sort_order: maxOrder(categories) + 1
      })
      .select()
      .single();

    if (error) {
      fail(error.code === '23505' ? 'Ya existe una categoría con ese nombre.' : 'No pudimos crear la categoría.');
      return false;
    }
    setCategories((prev) => [...prev, { ...data, products: [] }]);
    flash('Categoría creada ✓');
    return true;
  }

  async function addPromo({ type, title, description, price, schedule }) {
    const { data, error } = await supabase
      .from('promo_blocks')
      .insert({
        venue_id: venueId,
        type,
        title,
        description: description || null,
        price: price == null ? null : Number(price),
        schedule: schedule || null,
        sort_order: maxOrder(promos) + 1
      })
      .select()
      .single();

    if (error) {
      fail('No pudimos crear la promo.');
      return false;
    }
    setPromos((prev) => [...prev, data]);
    flash('Promo creada ✓');
    return true;
  }

  async function removeProduct(id) {
    setSavingId(id);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setCategories((prev) =>
        prev.map((c) => ({ ...c, products: c.products.filter((p) => p.id !== id) }))
      );
      flash('Producto eliminado');
    } else {
      fail('No pudimos eliminar.');
    }
    setSavingId(null);
  }

  async function removeCategory(id) {
    setSavingId(id);
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      flash('Categoría eliminada');
    } else {
      fail('No pudimos eliminar.');
    }
    setSavingId(null);
  }

  async function removePromo(id) {
    setSavingId(id);
    const { error } = await supabase.from('promo_blocks').delete().eq('id', id);
    if (!error) {
      setPromos((prev) => prev.filter((p) => p.id !== id));
      flash('Promo eliminada');
    } else {
      fail('No pudimos eliminar.');
    }
    setSavingId(null);
  }

  async function moveProduct(categoryId, productId, dir) {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return;
    const list = [...cat.products].sort((a, b) => a.sort_order - b.sort_order);
    const i = list.findIndex((p) => p.id === productId);
    const j = dir === 'up' ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= list.length) return;

    const a = list[i];
    const b = list[j];
    setSavingId(productId);
    const r1 = await supabase.from('products').update({ sort_order: b.sort_order }).eq('id', a.id);
    const r2 = await supabase.from('products').update({ sort_order: a.sort_order }).eq('id', b.id);

    if (!r1.error && !r2.error) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                products: c.products.map((p) =>
                  p.id === a.id
                    ? { ...p, sort_order: b.sort_order }
                    : p.id === b.id
                    ? { ...p, sort_order: a.sort_order }
                    : p
                )
              }
            : c
        )
      );
      flash('Orden actualizado');
    } else {
      fail('No pudimos reordenar.');
    }
    setSavingId(null);
  }

  async function moveCategory(id, dir) {
    const list = [...categories].sort((a, b) => a.sort_order - b.sort_order);
    const i = list.findIndex((c) => c.id === id);
    const j = dir === 'up' ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= list.length) return;

    const a = list[i];
    const b = list[j];
    setSavingId(id);
    const r1 = await supabase.from('categories').update({ sort_order: b.sort_order }).eq('id', a.id);
    const r2 = await supabase.from('categories').update({ sort_order: a.sort_order }).eq('id', b.id);

    if (!r1.error && !r2.error) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === a.id
            ? { ...c, sort_order: b.sort_order }
            : c.id === b.id
            ? { ...c, sort_order: a.sort_order }
            : c
        )
      );
      flash('Orden actualizado');
    } else {
      fail('No pudimos reordenar.');
    }
    setSavingId(null);
  }

  async function movePromo(id, dir) {
    const list = [...promos].sort((a, b) => a.sort_order - b.sort_order);
    const i = list.findIndex((p) => p.id === id);
    const j = dir === 'up' ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= list.length) return;

    const a = list[i];
    const b = list[j];
    setSavingId(id);
    const r1 = await supabase.from('promo_blocks').update({ sort_order: b.sort_order }).eq('id', a.id);
    const r2 = await supabase.from('promo_blocks').update({ sort_order: a.sort_order }).eq('id', b.id);

    if (!r1.error && !r2.error) {
      setPromos((prev) =>
        prev.map((p) =>
          p.id === a.id
            ? { ...p, sort_order: b.sort_order }
            : p.id === b.id
            ? { ...p, sort_order: a.sort_order }
            : p
        )
      );
      flash('Orden actualizado');
    } else {
      fail('No pudimos reordenar.');
    }
    setSavingId(null);
  }

  return {
    categories,
    promos,
    ready,
    savingId,
    notice,
    updateProduct,
    updateCategory,
    updatePromo,
    addProduct,
    addCategory,
    addPromo,
    removeProduct,
    removeCategory,
    removePromo,
    moveProduct,
    moveCategory,
    movePromo
  };
}