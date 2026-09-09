# Bruma Coffee Lab — Carta digital + panel admin

MVP: menú público de solo lectura + panel autogestionable para el dueño.
Sin comanda en vivo en esta versión (queda para una v2 si lo necesitan).

## 1. Crear el proyecto en Supabase

1. Andá a https://supabase.com y creá un proyecto nuevo.
2. En el SQL Editor, pegá y corré `supabase/schema.sql` (crea las tablas y las políticas RLS).
3. Después corré `supabase/seed.sql` (carga el menú real relevado de las fotos).
4. En Authentication → Users, creá **una sola cuenta** (email + contraseña) para la barra.
   Esa es la clave de acceso al panel `/admin` (RLS permite escribir solo a usuarios autenticados).
5. En Project Settings → API, copiá `Project URL` y `anon public key`.
6. Copiá en `.env` el email de esa cuenta en `PUBLIC_ADMIN_EMAIL` (el login del panel
   muestra solo el campo de contraseña; el email queda prefijado por configuración).

## 2. Configurar el proyecto local

```bash
cp .env.example .env
```

Completá `.env` con los dos valores del paso anterior:

```
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
PUBLIC_ADMIN_EMAIL=...
```

## 3. Instalar y correr

```bash
npm install
npm run dev
```

- Menú público: `http://localhost:4321/`
- Panel admin: `http://localhost:4321/admin` (redirige a login si no hay sesión)

## Pendiente de definir con el cliente antes de ir a producción

- Precio de "Old Parr 12 Años 750ml" (la foto de Whisky tenía columnas de precio ambiguas).
- Precio de "Miel Y Limón" y de "Martini" (no visibles en las fotos).
- Si quieren sumar categorías nuevas que estaban en el prototipo de diseño pero no en el
  menú real (Paninis, Cócteles de Autor, etc.) — hoy NO están cargadas en el seed.

## Panel admin

- URL: `http://localhost:4321/admin` (link discreto "Admin" en el footer de la carta).
- Login: solo contraseña (el email de la cuenta se toma de `PUBLIC_ADMIN_EMAIL`).
- Tabs: **Productos** (editar nombre/descripción/precio, TOP, Disponible, reordenar con ↑↓,
  agregar/eliminar productos y categorías, ocultar/mostrar categorías) y **Promos**
  (título/descripción/precio, activar/desactivar, reordenar, horario de happy hour).
- Guarda contra Supabase con feedback "Guardado ✓".

## Qué falta para producción

- Deploy del sitio (Vercel/Netlify) apuntando a este repo.
- Subida de imágenes de productos a Supabase Storage (campo `image_url` ya existe en el esquema).
- Mostrar los `promo_blocks` tipo `happy_hour`/`banner` en la carta pública (hoy solo se
  renderizan los `combo` dentro de una categoría filtrada).
