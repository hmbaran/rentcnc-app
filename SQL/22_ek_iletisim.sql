-- ============================================================
-- 22 — Firma tablosuna ek iletişim alanları
-- ============================================================

ALTER TABLE firma
  ADD COLUMN IF NOT EXISTS telefon_gsm   varchar(30),   -- cep (kayıt telefonu buraya kopyalanır)
  ADD COLUMN IF NOT EXISTS irtibat_2_ad  varchar(120),  -- 2. yetkili kişi adı
  ADD COLUMN IF NOT EXISTS irtibat_2_email varchar(200); -- 2. yetkili kişi e-posta
