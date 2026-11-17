-- =====================================================================
-- COMPUTECH - repair mojibake text
--
-- Run this ONLY if you applied an older version of all_in_one.sql whose
-- UTF-8 characters were corrupted: you would see text like "â€”" instead
-- of an em dash, or "Ã—" instead of a multiplication sign, in product
-- image alt text, short descriptions or technical specifications.
--
-- The script walks every text column in the public schema and repairs
-- the three broken sequences. Correct data is left untouched.
-- =====================================================================

begin;

do $$
declare
  target record;
  broken_em_dash constant text := U&'\00E2\20AC\201D'; -- corrupted em dash
  broken_en_dash constant text := U&'\00E2\20AC\201C'; -- corrupted en dash
  broken_times   constant text := U&'\00C3\2014';      -- corrupted x sign
begin
  for target in
    select c.table_name, c.column_name
    from information_schema.columns c
    join information_schema.tables t
      on t.table_schema = c.table_schema and t.table_name = c.table_name
    where c.table_schema = 'public'
      and t.table_type = 'BASE TABLE'
      and c.data_type in ('text', 'character varying')
  loop
    execute format(
      'update public.%I set %I = replace(replace(replace(%I, %L, %L), %L, %L), %L, %L) '
      'where position(%L in %I) > 0 or position(%L in %I) > 0 or position(%L in %I) > 0',
      target.table_name, target.column_name, target.column_name,
      broken_em_dash, U&'\2014',
      broken_en_dash, U&'\2013',
      broken_times, U&'\00D7',
      broken_em_dash, target.column_name,
      broken_en_dash, target.column_name,
      broken_times, target.column_name
    );
  end loop;
end $$;

commit;

-- Verification: all four counts must be 0.
-- select count(*) from public.product_images
--   where position(U&'\00E2\20AC\201D' in alt) > 0;
-- select count(*) from public.product_specifications
--   where position(U&'\00C3\2014' in value) > 0;
-- select count(*) from public.products
--   where position(U&'\00C3\2014' in short_description) > 0;
-- select count(*) from public.product_specifications
--   where position(U&'\00E2\20AC\201C' in value) > 0;
