-- ============================================================
-- Seans 17: SQL 23 hata düzeltmesi
-- tip_id=35 (Tornalar) olarak yanlış eklenen Mazak INTEGREX/NEXUS/QT modelleri
-- Bunlar zaten tip_id=46 (Hibrit) altında doğru kayıtlı
-- ============================================================

-- SQL 23'te eklenen, tip_id=35 olarak yanlış kategorilenen Mazak modelleri sil
-- (Doğruları tip_id=46 altında zaten mevcut)
DELETE FROM tezgah_model
WHERE marka_id = 2
  AND tip_id = 35
  AND ad IN (
    'QUICK TURN 200', 'QUICK TURN 350', 'QUICK TURN 450',
    'NEXUS 250-II', 'NEXUS 350-II', 'NEXUS 450-II',
    'INTEGREX i-200', 'INTEGREX i-400', 'INTEGREX i-630', 'INTEGREX i-800',
    'INTEGREX e-500', 'INTEGREX e-650H',
    'QT-COMPACT 300'
  );

-- SQL 23'te eklenen Mazak tip_id=35 modellerin doğru listesi
-- (Sadece gerçek yatay tornalar — QTN serisi zaten vardı, bunlar yeniler)
-- Var olanları kontrol et, zaten ON CONFLICT DO NOTHING ile eklenmiş olabilir
-- Güvenli: tekrar ekle, varsa atla

-- Kontrol: tip_id=35 Mazak modelleri
SELECT ad, tip_id FROM tezgah_model
WHERE marka_id = 2 AND tip_id = 35
ORDER BY ad;
