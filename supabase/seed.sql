-- ============================================================
-- SEED — Contenido real relevado de las fotos del menú de Bruma
-- Excluye a propósito el contenido inventado del prototipo
-- (Paninis, Pizza Bruma, Cócteles de Autor, Bruno Club, etc.)
-- porque no estaba en las fotos originales.
-- ============================================================

insert into venues (id, slug, name, instagram, currency_format)
values ('00000000-0000-0000-0000-000000000001', 'bruma', 'Bruma Coffee Lab', '@brumacoffeelab', 'es-AR');

insert into venue_settings (venue_id, opening_hours)
values ('00000000-0000-0000-0000-000000000001', null);

-- ---------- CATEGORÍAS ----------
insert into categories (venue_id, name, slug, icon, sort_order) values
('00000000-0000-0000-0000-000000000001', 'Desayunos', 'desayunos', '🍳', 1),
('00000000-0000-0000-0000-000000000001', 'Entradas', 'entradas', '🥖', 2),
('00000000-0000-0000-0000-000000000001', 'Bebidas Calientes', 'bebidas-calientes', '☕', 3),
('00000000-0000-0000-0000-000000000001', 'Bebidas Frías', 'bebidas-frias', '🧊', 4),
('00000000-0000-0000-0000-000000000001', 'Smoothies', 'smoothies', '🥤', 5),
('00000000-0000-0000-0000-000000000001', 'Adicionales', 'adicionales', '➕', 6),
('00000000-0000-0000-0000-000000000001', 'Cócteles Clásicos', 'cocteles-clasicos', '🍹', 7),
('00000000-0000-0000-0000-000000000001', 'Licores (Botella)', 'licores-botella', '🥃', 8);

-- ---------- DESAYUNOS ----------
insert into products (venue_id, category_id, name, description, price, sort_order)
select '00000000-0000-0000-0000-000000000001', id, v.name, v.description, v.price, v.sort_order
from categories c, (values
  ('Huevos al gusto', 'Tipo omelette o revuelto con 3 toppings (champiñones, tomate y cebolla, espinaca, jamón de la casa, tocineta, maíz tierno, queso mozzarella o queso emmental)', 18000, 1),
  ('Shakshuka', 'Huevos escalfados. Base de salsa pomodoro, queso emmental gratinado, aguacate asado, acompañado de tostadas.', 22000, 2),
  ('Tostadas francesas', 'Pan brioche caramelizado, mantequilla, miel de maple, azúcar pulverizada y almendras fileteadas.', 26000, 3),
  ('French toast tiramisú', 'Pan brioche caramelizado, crema de mascarpone, café espresso, cacao pulverizado.', 28000, 4),
  ('Huevos estrellados', 'Papitas fritas, salsa de tomate de la casa con vinagre de Jerez, prosciutto y huevos fritos.', 38900, 5)
) as v(name, description, price, sort_order)
where c.slug = 'desayunos';

-- ---------- ENTRADAS ----------
insert into products (venue_id, category_id, name, description, price, sort_order)
select '00000000-0000-0000-0000-000000000001', id, v.name, v.description, v.price, v.sort_order
from categories c, (values
  ('Carpaccio de res', 'Lomo fino sellado en costra de pimienta negra sobre cama de caviar de berenjena aromatizado con tomate y alioli de ajo', 43000, 1),
  ('Caponata con Pesto y Burrata', 'Encurtidos de vegetales frescos elaborados en cocción lenta', 35000, 2),
  ('Porcheta', 'Finas lonjas de cerdo elaborada en cocción lenta', 24000, 3),
  ('Papas trufadas', 'Papa francesa con alioli trufado y nieve de parmesano', 24000, 4)
) as v(name, description, price, sort_order)
where c.slug = 'entradas';

-- ---------- BEBIDAS CALIENTES ----------
insert into products (venue_id, category_id, name, description, price, sort_order)
select '00000000-0000-0000-0000-000000000001', id, v.name, null, v.price, v.sort_order
from categories c, (values
  ('Americano', 7000, 1),
  ('Latte', 9800, 2),
  ('Capuccino', 12600, 3),
  ('Capuccino De Pistacho', 18000, 4),
  ('Capuccino Italiano', 13000, 5),
  ('Moccachino', 12000, 6),
  ('Chocolate Caliente', 12000, 7),
  ('Milo Caliente', 13200, 8),
  ('Expresso', 7000, 9),
  ('Te Chai', 11600, 10),
  ('Matcha Latte', 14700, 11),
  ('Bombom', 18000, 12),
  ('Macciato', 12000, 13),
  ('Infusión Frutos Rojos', 7200, 14),
  ('Infusión Hierbabuena', 6200, 15),
  ('Infusión Jengibre', 7200, 16)
) as v(name, price, sort_order)
where c.slug = 'bebidas-calientes';

-- Nota: "Miel Y Limón" y "Martini" aparecían en la foto sin precio visible.
-- No se cargan hasta confirmar el precio con el cliente.

-- Métodos de filtrado (V60/Chemex/Aeropress) como promo_block, no producto suelto
insert into promo_blocks (venue_id, type, title, description, price, sort_order)
values ('00000000-0000-0000-0000-000000000001', 'combo', 'Métodos', 'V60, Chemex, Aeropress', 25000, 1);

-- ---------- BEBIDAS FRÍAS ----------
insert into products (venue_id, category_id, name, description, price, sort_order)
select '00000000-0000-0000-0000-000000000001', id, v.name, null, v.price, v.sort_order
from categories c, (values
  ('Cold Brew', 9800, 1),
  ('Orange Coffee', 12600, 2),
  ('Frapuccino de Arequipe', 14200, 3),
  ('Frapuccino de pistacho', 18000, 4),
  ('Frapuccino De Chocolate', 15600, 5),
  ('Frapuccino', 10900, 6),
  ('Milo Frio', 14200, 7),
  ('Afogatto', 14200, 8)
) as v(name, price, sort_order)
where c.slug = 'bebidas-frias';

-- ---------- SMOOTHIES ----------
insert into products (venue_id, category_id, name, description, price, sort_order)
select '00000000-0000-0000-0000-000000000001', id, v.name, v.description, v.price, v.sort_order
from categories c, (values
  ('Smothie Frutos Amarillos', 'Banana, Piña, Coco.', 14500, 1),
  ('Smothie Frutos Rojos', 'Fresa, Arándanos, Crema De Coco, Cordial De Agua De Jamaica.', 14500, 2),
  ('Smothie Fresa', 'Fresa, Helado De Vainilla', 14500, 3),
  ('Smothie Frutos Verdes', 'Manzana Verde, Kiwi, Piña, Espinaca, Miel Jengibre, Limón.', 14500, 4)
) as v(name, description, price, sort_order)
where c.slug = 'smoothies';

-- ---------- ADICIONALES ----------
insert into products (venue_id, category_id, name, description, price, sort_order)
select '00000000-0000-0000-0000-000000000001', id, v.name, null, v.price, v.sort_order
from categories c, (values
  ('Leche de almendras', 2000, 1),
  ('Leche de Avena', 2000, 2),
  ('Scoop de proteína', 10200, 3)
) as v(name, price, sort_order)
where c.slug = 'adicionales';

-- ---------- CÓCTELES CLÁSICOS ----------
insert into products (venue_id, category_id, name, description, price, sort_order)
select '00000000-0000-0000-0000-000000000001', id, v.name, null, v.price, v.sort_order
from categories c, (values
  ('Aperol Spritz', 30000, 1),
  ('Gin Tonic', 40000, 2),
  ('Margarita', 35000, 3),
  ('Margarita De Café', 40000, 4),
  ('Moscow Mule', 28000, 5),
  ('Mojito', 28000, 6),
  ('Negroni', 40000, 7),
  ('Amareto', 30000, 8),
  ('Spritz Limoncello', 30000, 9),
  ('Mimosa', 25000, 10),
  ('Sangria', 35000, 11),
  ('Carajillo', 45000, 12),
  ('Expreso', 30000, 13)
) as v(name, price, sort_order)
where c.slug = 'cocteles-clasicos';

-- Trilogía Bruma como promo_block (3 variantes + precio único)
insert into promo_blocks (venue_id, type, title, description, price, sort_order)
values (
  '00000000-0000-0000-0000-000000000001', 'combo', 'Trilogía Bruma',
  'Tradicional: Licor 43, espresso y licor de café. Vainilla: Ron, espresso, licor de café y vainilla chocoana. Cítrico: Amaretto, espresso, licor de café y bitter de naranja.',
  95000, 2
);

-- Happy Hour como promo_block con horario
insert into promo_blocks (venue_id, type, title, description, schedule, sort_order)
values (
  '00000000-0000-0000-0000-000000000001', 'happy_hour', 'Happy Hour Bruma',
  '30% en coctelería clásica',
  '{"days":["mon","tue","wed","thu","fri"],"from":"15:00","to":"18:00"}',
  3
);

-- Nota: "Martini" en Cócteles Clásicos aparecía sin precio visible en la foto.
-- No se carga hasta confirmar con el cliente.

-- ---------- LICORES (BOTELLA) ----------
insert into products (venue_id, category_id, name, description, price, sort_order)
select '00000000-0000-0000-0000-000000000001', id, v.name, v.description, v.price, v.sort_order
from categories c, (values
  ('Tequila Patrón Silver 700', 'Botella', 520000, 1),
  ('Vodka Skyy 750', 'Botella', 240000, 2),
  ('Buchanans Deluxe 12 Años 375ml', 'Botella', 230000, 3),
  ('Buchanans Deluxe 12 Años 750ml', 'Botella', 450000, 4),
  ('Buchanans Master 750ml', 'Botella', 350000, 5),
  ('Monkey Shoulder', 'Botella', 250000, 6),
  ('Old Parr 12 Años 500ml', 'Botella', 340000, 7),
  ('Old Parr 12 Años 750ml', 'Botella', null, 8)
) as v(name, description, price, sort_order)
where c.slug = 'licores-botella';

-- Nota: la foto de "Whisky" tiene una columna de precios ambigua
-- (dos números por línea, sin etiqueta de qué es cada uno — ¿botella
-- vs. copa?). Se cargaron los precios de botella más claros y se
-- dejó "Old Parr 12 Años 750ml" sin precio hasta aclarar con el cliente.
