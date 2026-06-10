-- ============================================================
-- Seans 17: Tezgah Parametreleri JSONB mimarisi
-- tezgah tablosuna kategoriye özgü dinamik parametre kolonu
-- ============================================================

-- 1. JSONB kolonu ekle
ALTER TABLE tezgah
  ADD COLUMN IF NOT EXISTS parametreler JSONB DEFAULT '{}'::jsonb;

-- 2. GIN index — JSONB sorgularını hızlandırır
CREATE INDEX IF NOT EXISTS tezgah_parametreler_gin
  ON tezgah USING GIN (parametreler);

-- 3. Açıklama
COMMENT ON COLUMN tezgah.parametreler IS
  'Kategoriye özgü dinamik teknik parametreler. '
  'Örnek: {"spindle_taper":"BT40","sogutma":"İç Soğutma","tabla_yuklenme_kg":500}';

-- Kontrol: mevcut kolonlar
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tezgah' AND table_schema = 'public'
ORDER BY ordinal_position;
