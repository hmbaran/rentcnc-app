-- ============================================================
-- Seans 17: Marka/Model DB Genişletme
-- Öncelikli markalar: DMG Mori, Mazak, Okuma, Haas + Türkiye
-- Boş tipler: Testere, Takım Bileme, CMM, Gantry
-- ============================================================

-- tip_id referansları:
-- 33 Dik İşleme Merkezi | 34 Yatay İşleme Merkezi | 35 Tornalar
-- 36 Otomatlar          | 37 Taşlama              | 38 Erozyon
-- 39 Portal             | 40 Gantry               | 41 Metal Şekil/Kesme
-- 42 Kaynak             | 44 Testereler           | 45 Dişli
-- 47 Additive           | 48 Tapping Centers      | 57 Takım Bileme
-- 59 CMM/Ölçüm

-- ============================================================
-- 1. DMG MORI (marka_id=1) — Dik İşleme, Yatay, Torna
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
-- Dik İşleme Merkezi
('CMX 600 V', 1, 33), ('CMX 800 V', 1, 33), ('CMX 1000 V', 1, 33),
('CMX 1100 V', 1, 33), ('CMX 1300 V', 1, 33),
('DMC 650 V', 1, 33), ('DMC 850 V', 1, 33), ('DMC 1035 V', 1, 33),
('NVX 5080', 1, 33), ('NVX 5100', 1, 33), ('NVX 5160', 1, 33),
('NVX 6000', 1, 33),
('DMU 50', 1, 33), ('DMU 65', 1, 33), ('DMU 75', 1, 33),
('DMU 85', 1, 33), ('DMU 95', 1, 33), ('DMU 125', 1, 33),
('DMU 50 3rd Generation', 1, 33), ('DMU 65 monoBLOCK', 1, 33),
('DMU 85 monoBLOCK', 1, 33), ('DMU 125 monoBLOCK', 1, 33),
('DMU 160 P duoBLOCK', 1, 33), ('DMU 210 P', 1, 33),
('DMC 80 H duoBLOCK', 1, 33), ('DMC 125 H duoBLOCK', 1, 33),
-- Yatay İşleme Merkezi
('NHX 4000', 1, 34), ('NHX 5000', 1, 34), ('NHX 5500', 1, 34),
('NHX 6300', 1, 34), ('NHX 8000', 1, 34),
('NH 4000 DCG', 1, 34), ('NH 5000 DCG', 1, 34),
('MAG 1000', 1, 34),
-- Tornalar
('CLX 350', 1, 35), ('CLX 450', 1, 35), ('CLX 550', 1, 35),
('NLX 2500', 1, 35), ('NLX 3000', 1, 35), ('NLX 4000', 1, 35),
('NLX 6000', 1, 35),
('CTX beta 800', 1, 35), ('CTX beta 1250', 1, 35),
('CTX gamma 1250', 1, 35), ('CTX gamma 2000', 1, 35),
('SPRINT 32', 1, 35), ('SPRINT 42', 1, 35), ('SPRINT 50', 1, 35)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. MAZAK (marka_id=2) — Dik, Yatay, Torna, 5 Eksen
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
-- Dik İşleme Merkezi
('VCN-430A', 2, 33), ('VCN-530C', 2, 33), ('VCN-700C', 2, 33),
('VCN-800A', 2, 33),
('VARIAXIS i-500', 2, 33), ('VARIAXIS i-700', 2, 33),
('VARIAXIS i-1050', 2, 33), ('VARIAXIS j-500', 2, 33),
('NEXUS 530C-II', 2, 33), ('NEXUS 630C-II', 2, 33),
-- Yatay İşleme Merkezi
('HCN-4000', 2, 34), ('HCN-5000', 2, 34), ('HCN-6000', 2, 34),
('HCN-8000', 2, 34), ('HCN-12500', 2, 34),
-- Tornalar
('QUICK TURN 100', 2, 35), ('QUICK TURN 200', 2, 35),
('QUICK TURN 350', 2, 35), ('QUICK TURN 450', 2, 35),
('NEXUS 250-II', 2, 35), ('NEXUS 350-II', 2, 35),
('NEXUS 450-II', 2, 35),
('INTEGREX i-200', 2, 35), ('INTEGREX i-400', 2, 35),
('INTEGREX i-630', 2, 35), ('INTEGREX i-800', 2, 35),
('INTEGREX e-500', 2, 35), ('INTEGREX e-650H', 2, 35),
('QT-COMPACT 300', 2, 35)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. OKUMA (marka_id=3)
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
-- Dik İşleme Merkezi
('MB-46V', 3, 33), ('MB-56V', 3, 33), ('MB-66V', 3, 33),
('MB-800H', 3, 33),
('GENOS M460-V', 3, 33), ('GENOS M560-V', 3, 33), ('GENOS M660-V', 3, 33),
('MU-4000V', 3, 33), ('MU-5000V', 3, 33), ('MU-6300V', 3, 33),
('MCR-B II', 3, 33),
-- Yatay İşleme Merkezi
('MA-600H', 3, 34), ('MA-800H', 3, 34), ('MA-1000H', 3, 34),
('HM 400', 3, 34), ('HM 500', 3, 34), ('HM 630', 3, 34),
-- Tornalar
('LB 3000 EX II', 3, 35), ('LB 4000 EX II', 3, 35),
('LB 5000 EX II', 3, 35),
('GENOS L300', 3, 35), ('GENOS L400', 3, 35), ('GENOS L250', 3, 35),
('LT 3000', 3, 35), ('LT 4000', 3, 35),
('2SP-V20', 3, 35), ('2SP-V25', 3, 35),
('MULTUS B300', 3, 35), ('MULTUS B400', 3, 35),
('MULTUS U3000', 3, 35), ('MULTUS U4000', 3, 35)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. HAAS (marka_id=5) — Dik, Yatay, Torna, Tapping
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
-- Dik İşleme Merkezi
('VF-1', 5, 33), ('VF-2', 5, 33), ('VF-2SS', 5, 33),
('VF-3', 5, 33), ('VF-3SS', 5, 33),
('VF-4', 5, 33), ('VF-4SS', 5, 33),
('VF-5', 5, 33), ('VF-5SS', 5, 33),
('VF-6', 5, 33), ('VF-7', 5, 33), ('VF-8', 5, 33),
('VF-9', 5, 33), ('VF-11', 5, 33), ('VF-12', 5, 33),
('UMC-500', 5, 33), ('UMC-500SS', 5, 33),
('UMC-750', 5, 33), ('UMC-750SS', 5, 33),
('UMC-1000', 5, 33), ('UMC-1000SS', 5, 33),
('UMC-1500', 5, 33),
('GR-510', 5, 33), ('GR-712', 5, 33),
-- Yatay İşleme Merkezi
('EC-400', 5, 34), ('EC-500', 5, 34), ('EC-630', 5, 34),
('EC-1600', 5, 34),
-- Tornalar
('ST-10', 5, 35), ('ST-10Y', 5, 35),
('ST-20', 5, 35), ('ST-20Y', 5, 35),
('ST-25', 5, 35), ('ST-25Y', 5, 35),
('ST-30', 5, 35), ('ST-30Y', 5, 35),
('ST-35', 5, 35),
('DS-30', 5, 35), ('DS-30Y', 5, 35), ('DS-30SSY', 5, 35),
('TL-1', 5, 35), ('TL-2', 5, 35),
-- Tapping Centers
('DT-1', 5, 48), ('DT-2', 5, 48)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. CHIRON (marka_id=8)
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
('FZ 08 S', 8, 33), ('FZ 08 MT', 8, 33),
('FZ 12 S', 8, 33), ('FZ 12 MT', 8, 33), ('FZ 12 W MT', 8, 33),
('FZ 15 S', 8, 33), ('FZ 15 MT', 8, 33), ('FZ 15 W MT', 8, 33),
('FZ 16 S', 8, 33), ('FZ 16 MT', 8, 33),
('FZ 18 W MT', 8, 33),
('Mill 2000', 8, 33), ('Mill 2000 MT', 8, 33)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. HELLER (marka_id=52)
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
('MCH 250', 52, 34), ('MCH 400', 52, 34), ('MCH 630', 52, 34),
('H 2000', 52, 34), ('H 4000', 52, 34), ('H 5000', 52, 34),
('HF 3500', 52, 34), ('HF 5500', 52, 34),
('F 2000', 52, 33), ('F 5000', 52, 33)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. EMAG (marka_id=63)
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
('VL 2', 63, 35), ('VL 4', 63, 35), ('VL 6', 63, 35), ('VL 8', 63, 35),
('VT 2', 63, 35), ('VT 4', 63, 35),
('VSC 400', 63, 35), ('VSC 500', 63, 35),
('VLC 200', 63, 35), ('VLC 400', 63, 35),
('VL 3 DUO', 63, 35), ('VL 5 DUO', 63, 35)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. ERMaksAN (marka_id=24) — Metal Şekillendirme
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
('HVR 3100x100', 24, 41), ('HVR 3100x135', 24, 41),
('HVR 3100x160', 24, 41), ('HVR 4100x160', 24, 41),
('HVR 4100x220', 24, 41), ('HVR 6100x260', 24, 41),
('SPEED-BEND 3100x100', 24, 41), ('SPEED-BEND 3100x160', 24, 41),
('SPEED-BEND 4100x220', 24, 41),
('ULTRA 3100x110', 24, 41), ('ULTRA 3100x135', 24, 41),
('ULTRA 4100x175', 24, 41),
('COBRA 3100x80', 24, 41), ('COBRA 3100x100', 24, 41),
('COBRA 4100x130', 24, 41),
('FBK 3100x100', 24, 41), ('FBK 4000x200', 24, 41),
('PLASMAplus 3000', 24, 41), ('PLASMAplus 4000', 24, 41)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 9. İNANLAR (marka_id=27)
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
('IBFN 3100x100', 27, 41), ('IBFN 3100x160', 27, 41),
('IBFN 4100x175', 27, 41), ('IBFN 6100x220', 27, 41),
('IHFN 4100x200', 27, 41), ('IHFN 6100x250', 27, 41),
('IBSY 3100x25', 27, 41), ('IBSY 4000x30', 27, 41)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 10. MVD (marka_id=151)
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
('MBH 3100x100', 151, 41), ('MBH 3100x160', 151, 41),
('MBH 4100x200', 151, 41), ('MBH 6100x250', 151, 41),
('MGS 3006x6', 151, 41), ('MGS 4006x6', 151, 41),
('MLP 3006', 151, 41), ('MLP 4006', 151, 41)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 11. BAYKAL MAKİNE (marka_id=26)
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
('APH 3100x100', 26, 41), ('APH 3100x160', 26, 41),
('APH 4100x200', 26, 41), ('APH 6100x250', 26, 41),
('BHS 3006', 26, 41), ('BHS 4006', 26, 41),
('Optiflex 3015', 26, 41), ('Optiflex 4020', 26, 41)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 12. BYSTRONIC (marka_id=48) — Lazer + Abkant
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
-- Lazer Kesme
('ByStar Fiber 3015', 48, 41), ('ByStar Fiber 4020', 48, 41),
('ByStar Fiber 6025', 48, 41), ('ByStar Fiber 8025', 48, 41),
('BYvention 3015', 48, 41), ('BYvention Fiber 3015', 48, 41),
('Xpert 40', 48, 41), ('Xpert 80', 48, 41),
('Xpert 100', 48, 41), ('Xpert 150', 48, 41),
('Xpert 200', 48, 41), ('Xpert 250', 48, 41),
('Xpert 320', 48, 41), ('Xpert 400', 48, 41),
('Xpert Pro 100', 48, 41), ('Xpert Pro 150', 48, 41),
('Xpert Pro 200', 48, 41), ('Xpert Pro 250', 48, 41),
('ByBend Smart 50', 48, 41), ('ByBend Smart 80', 48, 41)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 13. AMADA (marka_id=49)
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
-- Abkant Pres
('HFE-M2 100-3', 49, 41), ('HFE-M2 170-4', 49, 41),
('HFE-M2 220-4', 49, 41), ('HFE-M2 300-4', 49, 41),
('HRB 1003', 49, 41), ('HRB 2203', 49, 41),
('FBD 1025', 49, 41), ('FBD 3060', 49, 41),
-- Lazer Kesme
('FO-M2 3015', 49, 41), ('FO-M2 4020', 49, 41),
('ENSIS-3015 AJ', 49, 41), ('ENSIS-4020 AJ', 49, 41),
('VENTIS-3015 AJ', 49, 41),
-- Giyotin
('CNCM8-3060', 49, 41), ('CNCM8-4060', 49, 41),
-- Punch Pres
('EG-6013 AR', 49, 41), ('EM-2510 NT', 49, 41)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 14. LVD (marka_id=50)
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
('PPEC 80/25', 50, 41), ('PPEC 110/30', 50, 41),
('PPEC 150/40', 50, 41), ('PPEC 220/40', 50, 41),
('Easy-Form 80', 50, 41), ('Easy-Form 110', 50, 41),
('Easy-Form 150', 50, 41), ('Easy-Form 220', 50, 41),
('Dyna-Press 50', 50, 41), ('Dyna-Press 80', 50, 41),
('Orion 3015', 50, 41), ('Orion 4020', 50, 41),
('Phoenix 3015', 50, 41), ('Phoenix 4020', 50, 41),
('ToolCell 80/25', 50, 41), ('ToolCell 150/40', 50, 41)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 15. PRIMA POWER (marka_id=147)
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
('Platino Fiber 1530', 147, 41), ('Platino Fiber 2040', 147, 41),
('Platino Fiber 3060', 147, 41),
('Laser Next 1530', 147, 41), ('Laser Next 3060', 147, 41),
('Syncrono 1530', 147, 41), ('Syncrono 3060', 147, 41),
('eP 1030', 147, 41), ('eP 1060', 147, 41),
('Bend Genius 26', 147, 41), ('Bend Genius 51', 147, 41)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 16. BODOR LASER (marka_id=28)
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
('P3015', 28, 41), ('P4020', 28, 41), ('P6025', 28, 41),
('I5', 28, 41), ('I7', 28, 41),
('T220A', 28, 41), ('T260A', 28, 41), ('T360A', 28, 41),
('BCL1530', 28, 41), ('BCL2040', 28, 41)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 17. ACCURL (marka_id=156)
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
('EuroBend 40T', 156, 41), ('EuroBend 80T', 156, 41),
('EuroBend 110T', 156, 41), ('EuroBend 160T', 156, 41),
('EuroMaster 3015', 156, 41), ('EuroMaster 4020', 156, 41),
('CMT 3015', 156, 41), ('CMT 4020', 156, 41)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 18. TESTERELER — Behringer (123), Kasto (124), Cosen (127), DoALL (125), Marvel (126), MEP (128)
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
-- Behringer
('HBP 303 A', 123, 44), ('HBP 320 A', 123, 44), ('HBP 360 A', 123, 44),
('HBP 460 A', 123, 44), ('HBP 500 A', 123, 44),
('HBE Dynamic 320 A', 123, 44), ('HBE Dynamic 460 A', 123, 44),
('HBP 130/260', 123, 44), ('HBP 260/360', 123, 44),
('KASTOtec AC 4', 123, 44),
-- Kasto
('HBA 320 A', 124, 44), ('HBA 460 A', 124, 44),
('KASTOTEC AC 4', 124, 44), ('KASTOTEC SC 4', 124, 44),
('KASTOTEC EC 4', 124, 44),
('KASTOWIN A 4.6', 124, 44), ('KASTOWIN E 3.3', 124, 44),
('KASTOVARIOSPEED 5', 124, 44),
-- Cosen
('C-460 NC', 127, 44), ('C-560 NC', 127, 44),
('C-430 SA', 127, 44), ('C-540 SA', 127, 44),
('M-460 NC', 127, 44), ('S-360', 127, 44),
-- DoALL
('TF-1514', 125, 44), ('2013-V', 125, 44), ('1612-V', 125, 44),
('C-916', 125, 44), ('C-1016', 125, 44),
-- Marvel
('8-MARK IV', 126, 44), ('21-MARK II', 126, 44),
('81-A', 126, 44), ('81-M', 126, 44),
-- MEP
('TIGER 402 CNC', 128, 44), ('TIGER 462 CNC', 128, 44),
('SHARK 382 CNC', 128, 44), ('SHARK 462 CNC', 128, 44),
('COBRA 462', 128, 44)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 19. TAKIM BİLEME — Walter (89), Vollmer (247), Rollomatic (90), Ewag (246), Schütte (249)
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
-- Walter
('Helicheck Plus', 89, 57), ('Helicheck Pro', 89, 57),
('Helicheck Basic', 89, 57),
('Helitronic Mini', 89, 57), ('Helitronic Power', 89, 57),
('Helitronic Vision 400 L', 89, 57),
('PowerGrind', 89, 57), ('PowerGrind Pro', 89, 57),
-- Vollmer
('QX 200', 247, 57), ('QX 230', 247, 57), ('QX 260', 247, 57),
('QXD 250', 247, 57), ('QXD 300', 247, 57),
('QWD 750', 247, 57), ('QWD 750 H', 247, 57),
('VHybrid 260', 247, 57), ('VHybrid 360', 247, 57),
-- Rollomatic
('GrindSmart 628XS', 90, 57), ('GrindSmart 629XS', 90, 57),
('GrindSmart 630XW', 90, 57), ('GrindSmart 638', 90, 57),
('ShapeSmart NP50', 90, 57), ('ShapeSmart NP30', 90, 57),
-- Ewag
('RS 15', 246, 57), ('RS 600', 246, 57),
('WS 11', 246, 57), ('WS 15', 246, 57),
('COMPACT LINE', 246, 57), ('INSERT LINE', 246, 57),
-- Schütte
('WU305', 249, 57), ('WU305 linear', 249, 57),
('WU705', 249, 57), ('WU705 linear', 249, 57),
('CNC 300', 249, 57), ('CNC 600 linear', 249, 57)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 20. CMM / ÖLÇÜM — Zeiss (256), Hexagon (257), Mitutoyo (259), Wenzel (260), LK Metrology (261), Faro (263)
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
-- Zeiss
('CONTURA 7/10/6', 256, 59), ('CONTURA 10/16/6', 256, 59),
('PRISMO 5/8/5', 256, 59), ('PRISMO 7/9/6', 256, 59),
('ACCURA 9/12/8', 256, 59), ('ACCURA 15/21/10', 256, 59),
('XENOS 3/3/2', 256, 59), ('XENOS 5/5/3', 256, 59),
('DuraMax 5/5/5', 256, 59), ('O-INSPECT 543', 256, 59),
-- Hexagon
('Global S 07.07.05', 257, 59), ('Global S 09.12.08', 257, 59),
('Global S 12.22.10', 257, 59),
('Global Silver 05.05.05', 257, 59), ('Global Silver 07.10.07', 257, 59),
('GLOBAL Advantage 09.15.08', 257, 59),
('TIGO SF 5.5.4', 257, 59), ('TIGO SF 7.7.5', 257, 59),
('Leitz PMM-C', 257, 59), ('Leitz PMM-F', 257, 59),
-- Mitutoyo
('CRYSTA-Apex S 574', 259, 59), ('CRYSTA-Apex S 776', 259, 59),
('CRYSTA-Apex S 9106', 259, 59),
('CRYSTA-Apex C 574', 259, 59), ('CRYSTA-Apex C 776', 259, 59),
('STRATO-Apex 574', 259, 59), ('STRATO-Apex 776', 259, 59),
('MiStar 555', 259, 59), ('MiStar 655', 259, 59),
-- Wenzel
('LH 54', 260, 59), ('LH 65', 260, 59), ('LH 87', 260, 59),
('XO 87', 260, 59), ('XO 108', 260, 59),
('GEO 12.20.10', 260, 59),
-- LK Metrology
('Altera 7.7.5', 261, 59), ('Altera 10.7.6', 261, 59),
('Altera 15.10.8', 261, 59), ('Altera 20.10.8', 261, 59),
-- Faro
('Quantum ScanArm HD', 263, 59), ('Quantum X ScanArm', 263, 59),
('Gage', 263, 59), ('Gage Plus', 263, 59),
('Fusion', 263, 59), ('Fusion Plus', 263, 59)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 21. GANTRY — WaldrichCoburg (113), Droop+Rein (112), SNK (56), Schiess (114)
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
-- WaldrichCoburg
('FZ 40 P', 113, 40), ('FZ 63 P', 113, 40),
('HFC 125', 113, 40), ('HFC 160', 113, 40),
('Gemini 80', 113, 40), ('Gemini 100', 113, 40),
-- Droop+Rein
('FOGS 25', 112, 40), ('FOGS 40', 112, 40),
('FOGS 80', 112, 40), ('FOGS 120', 112, 40),
-- SNK
('RB-4VM', 56, 40), ('RB-5VM', 56, 40),
('FSP-80V', 56, 40), ('FSP-100V', 56, 40),
-- Schiess
('VCE 1000', 114, 40), ('VCE 2000', 114, 40),
('VH 4x12', 114, 40)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 22. TAŞLAMA — Blohm (42), Schaudt (83), Mikrosa (84), Jones & Shipman (86), Chevalier (100), Supertec (99)
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
-- Blohm
('Profimat MT 408', 42, 37), ('Profimat MT 412', 42, 37),
('Profimat MC 607', 42, 37), ('Profimat MC 608', 42, 37),
('Orbit 36', 42, 37), ('Orbit 46', 42, 37),
-- Schaudt
('CamGrind L', 83, 37), ('CamGrind S', 83, 37),
('CrankGrind', 83, 37), ('CrankGrind S', 83, 37),
('CombiGrind', 83, 37),
-- Mikrosa
('KRONOS S 250', 84, 37), ('KRONOS S 500', 84, 37),
('UNIVERSA 400', 84, 37), ('UNIVERSA 600', 84, 37),
-- Jones & Shipman
('1300E', 86, 37), ('1400E', 86, 37), ('1415E', 86, 37),
('EasySurface', 86, 37), ('EasyCylindrical', 86, 37),
-- Chevalier
('FSG-818AD', 100, 37), ('FSG-1224AD', 100, 37),
('FSG-1632AD', 100, 37), ('FSG-2048AD', 100, 37),
-- Supertec
('G25P-50NC', 99, 37), ('G32P-100NC', 99, 37),
('G38P-150NC', 99, 37), ('FA-20/100S', 99, 37)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 23. TORNA — Hardinge (61), Weiler (67), Takisawa (68), Dainichi (70)
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
-- Hardinge
('CONQUEST H51', 61, 35), ('CONQUEST GT 27', 61, 35),
('QUEST 8/51 GT', 61, 35), ('QUEST 10/65', 61, 35),
('ELITE 51', 61, 35), ('SUPER-PRECISION GT 27', 61, 35),
-- Weiler
('E 40', 67, 35), ('E 50', 67, 35), ('E 63', 67, 35),
('Praktikant', 67, 35), ('Matador', 67, 35),
-- Takisawa
('TS-4000Y', 68, 35), ('MAC-V3', 68, 35),
('NTC 300', 68, 35), ('NTC 500', 68, 35),
-- Dainichi
('DXCL-250', 70, 35), ('DXCL-350', 70, 35),
('DXCL-500', 70, 35), ('VTNC-200', 70, 35)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 24. KAYNAK — Kemppi (166), KUKA Robot (168), Fanuc Robot (167)
-- ============================================================
INSERT INTO tezgah_model (ad, marka_id, tip_id) VALUES
-- Kemppi
('FastMig M 420', 166, 42), ('FastMig M 520', 166, 42),
('FastMig Pulse 450', 166, 42), ('FastMig Pulse 550', 166, 42),
('MasterTig 3500', 166, 42), ('MasterTig 4000', 166, 42),
('X8 MIG Welder', 166, 42), ('X8 Power Source', 166, 42),
-- KUKA Robot
('KR 6 R700', 168, 42), ('KR 6 R900', 168, 42),
('KR 16 R1610', 168, 42), ('KR 16 R2010', 168, 42),
('KR AGILUS 10 R1100', 168, 42),
-- Fanuc Robot
('R-2000iC/165F', 167, 42), ('R-2000iC/210F', 167, 42),
('M-10iA', 167, 42), ('M-20iA', 167, 42),
('ARC Mate 100iD', 167, 42), ('ARC Mate 120iD', 167, 42)
ON CONFLICT DO NOTHING;

-- Kontrol
SELECT
  tt.ad AS tip_adi,
  COUNT(tm.model_id) AS model_sayisi
FROM tezgah_tip tt
LEFT JOIN tezgah_model tm ON tm.tip_id = tt.tip_id
GROUP BY tt.tip_id, tt.ad
ORDER BY model_sayisi DESC;
