-- Migración: permitir precio null en products (ítems "a confirmar" con el cliente)
alter table products alter column price drop not null;
