/**
 * RentCNCmachine.com — Drizzle ORM Şeması
 *
 * 34 tablo + 24 ENUM + ilişkiler
 *
 * Kurulum:
 *   pnpm add drizzle-orm postgres
 *   pnpm add -D drizzle-kit
 *
 * Migration üretme:
 *   pnpm drizzle-kit generate
 *
 * drizzle.config.ts örneği:
 *   import { defineConfig } from 'drizzle-kit';
 *   export default defineConfig({
 *     schema: './code/drizzle/schema.ts',
 *     out: './code/drizzle/migrations',
 *     dialect: 'postgresql',
 *     dbCredentials: { url: process.env.DATABASE_URL! }
 *   });
 *
 * Kullanım:
 *   import { drizzle } from 'drizzle-orm/postgres-js';
 *   import postgres from 'postgres';
 *   import * as schema from './schema';
 *
 *   const client = postgres(process.env.DATABASE_URL!);
 *   export const db = drizzle(client, { schema });
 *
 *   const firmalar = await db.select().from(schema.firma).where(eq(schema.firma.durum, 'yayinda'));
 */

import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  smallint,
  bigserial,
  serial,
  smallserial,
  boolean,
  date,
  timestamp,
  numeric,
  jsonb,
  doublePrecision,
  inet,
  primaryKey,
  unique,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';

// =====================================================================
// ENUM TİPLERİ (24 adet)
// =====================================================================
export const firmaDurumEnum = pgEnum('firma_durum', [
  'taslak', 'onay_bekliyor', 'yayinda', 'pasif', 'reddedildi', 'askiya_alindi',
]);
export const firmaMevcutDurumEnum = pgEnum('firma_mevcut_durum', ['musait', 'mesgul', 'bakim']);
export const kullaniciRolEnum = pgEnum('kullanici_rol', ['admin', 'moderator', 'firma_admin', 'firma_user']);
export const tezgahDurumEnum = pgEnum('tezgah_durum', [
  'aktif_tam_kapasite', 'kismen_musait', 'bakimda', 'satildi_kapali',
]);
export const aliciAciliyetEnum = pgEnum('alici_aciliyet', ['acil', 'uc_ay', 'arastirma', 'surekli']);
export const rfqDurumEnum = pgEnum('rfq_durum', ['taslak', 'aktif', 'teklifler_geldi', 'tamamlandi', 'iptal']);
export const rfqFirmaSayisiEnum = pgEnum('rfq_firma_sayisi', ['sadece_hedef', 'uc_firma', 'bes_firma', 'on_firma']);
export const rfqFirmaDurumEnum = pgEnum('rfq_firma_durum', [
  'gonderildi', 'goruldu', 'teklif_verildi', 'reddedildi', 'sure_doldu',
]);
export const teklifDurumEnum = pgEnum('teklif_durum', ['verildi', 'kabul', 'red', 'sure_doldu', 'geri_cekildi']);
export const kullaniciTipEnum = pgEnum('kullanici_tip', ['firma', 'alici']);
export const konusmaDurumEnum = pgEnum('konusma_durum', [
  'yeni', 'muzakere', 'nda_bekliyor', 'anlasma_saglandi', 'kapali', 'reddedildi',
]);
export const ndaDurumEnum = pgEnum('nda_durum', [
  'taslak', 'alici_imzaladi', 'firma_imzaladi', 'iki_taraf_imzaladi', 'iptal',
]);
export const abonelikPlanEnum = pgEnum('abonelik_plan', ['ucretsiz', 'baslangic', 'profesyonel', 'kurumsal']);
export const abonelikFaturalandirmaEnum = pgEnum('abonelik_faturalandirma', ['aylik', 'yillik']);
export const odemeDurumEnum = pgEnum('odeme_durum', ['beklemede', 'basarili', 'basarisiz', 'iade', 'iptal']);
export const odemeYontemEnum = pgEnum('odeme_yontem', ['kart', 'havale', 'kapida_odeme']);
export const gorselTipEnum = pgEnum('gorsel_tip', ['foto', 'video', 'dokuman', 'referans']);
export const markaOnayDurumEnum = pgEnum('marka_onay_durum', ['bekliyor', 'onaylandi', 'reddedildi']);
export const bildirimTipEnum = pgEnum('bildirim_tip', [
  'rfq_yeni', 'rfq_teklif', 'mesaj_yeni', 'onay_sonucu', 'abonelik_uyari',
  'abonelik_iptal', 'odeme_basarili', 'odeme_basarisiz', 'degerlendirme',
  'nda_imza', 'sistem',
]);
export const auditOlayEnum = pgEnum('audit_olay', [
  'firma_onayi', 'firma_red', 'sertifika_onayi', 'sertifika_red',
  'marka_onayi', 'marka_red', 'kullanici_askiya_alma', 'firma_silme',
  'abonelik_iptal', 'odeme_iade', 'degerlendirme_kaldirma', 'mesaj_silme',
  'admin_giris',
]);
export const referansDurumEnum = pgEnum('referans_durum', [
  'gonderildi', 'kayit_oldu', 'abone_oldu', 'odul_verildi', 'iptal',
]);
export const referansOdulEnum = pgEnum('referans_odul', [
  'bir_ay_ucretsiz', 'yuzde_yirmi_indirim', 'uc_ay_indirim',
]);

// =====================================================================
// BÖLÜM F: LOOKUP TABLOLARI (önce — diğerleri FK ile bağlı)
// =====================================================================
export const tezgahTip = pgTable('tezgah_tip', {
  tipId: smallserial('tip_id').primaryKey(),
  kod: varchar('kod', { length: 32 }).notNull().unique(),
  ad: varchar('ad', { length: 80 }).notNull(),
  adEn: varchar('ad_en', { length: 80 }),
  aciklama: text('aciklama'),
  ikon: varchar('ikon', { length: 32 }),
  sira: smallint('sira').notNull().default(0),
  aktif: boolean('aktif').notNull().default(true),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
});

export const tezgahAltKategori = pgTable('tezgah_alt_kategori', {
  altKategoriId: serial('alt_kategori_id').primaryKey(),
  tipId: smallint('tip_id').notNull().references(() => tezgahTip.tipId, { onDelete: 'cascade' }),
  kod: varchar('kod', { length: 48 }).notNull(),
  ad: varchar('ad', { length: 120 }).notNull(),
  adEn: varchar('ad_en', { length: 120 }),
  aciklama: text('aciklama'),
  sira: smallint('sira').notNull().default(0),
  aktif: boolean('aktif').notNull().default(true),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
}, (t) => ({
  uniqTipKod: unique().on(t.tipId, t.kod),
}));

export const tezgahEksenSecenek = pgTable('tezgah_eksen_secenek', {
  eksenId: serial('eksen_id').primaryKey(),
  altKategoriId: integer('alt_kategori_id').notNull().references(() => tezgahAltKategori.altKategoriId, { onDelete: 'cascade' }),
  ad: varchar('ad', { length: 80 }).notNull(),
  adEn: varchar('ad_en', { length: 80 }),
  eksenSayisi: smallint('eksen_sayisi'),
  sira: smallint('sira').notNull().default(0),
  aktif: boolean('aktif').notNull().default(true),
});

export const tezgahMarka = pgTable('tezgah_marka', {
  markaId: serial('marka_id').primaryKey(),
  ad: varchar('ad', { length: 80 }).notNull().unique(),
  ulke: varchar('ulke', { length: 8 }),
  premium: boolean('premium').notNull().default(false),
  manuelEklenmis: boolean('manuel_eklenmis').notNull().default(false),
  aktif: boolean('aktif').notNull().default(true),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
});

export const tezgahMarkaTip = pgTable('tezgah_marka_tip', {
  markaTipId: serial('marka_tip_id').primaryKey(),
  markaId: integer('marka_id').notNull().references(() => tezgahMarka.markaId, { onDelete: 'cascade' }),
  tipId: smallint('tip_id').notNull().references(() => tezgahTip.tipId, { onDelete: 'cascade' }),
}, (t) => ({
  uniqMarkaTip: unique().on(t.markaId, t.tipId),
}));

export const kontrolSistemi = pgTable('kontrol_sistemi', {
  kontrolSistemiId: serial('kontrol_sistemi_id').primaryKey(),
  ad: varchar('ad', { length: 80 }).notNull().unique(),
  uretici: varchar('uretici', { length: 40 }),
  aciklama: text('aciklama'),
  aktif: boolean('aktif').notNull().default(true),
});

// =====================================================================
// BÖLÜM A: FASONCU PROFİL
// =====================================================================
export const firma = pgTable('firma', {
  firmaId: uuid('firma_id').primaryKey().defaultRandom(),
  vergiNo: varchar('vergi_no', { length: 10 }).notNull().unique(),
  ticariUnvan: text('ticari_unvan').notNull(),
  il: varchar('il', { length: 40 }),
  ilce: varchar('ilce', { length: 60 }),
  adres: text('adres'),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  telefon: varchar('telefon', { length: 24 }),
  email: varchar('email', { length: 255 }),
  website: varchar('website', { length: 255 }),
  kurulusYili: smallint('kurulus_yili'),
  calisanAralik: varchar('calisan_aralik', { length: 20 }),
  durum: firmaDurumEnum('durum').notNull().default('taslak'),
  profilDoluluk: smallint('profil_doluluk').default(0),
  hakkinda: text('hakkinda'),
  oneCikanProjeler: text('one_cikan_projeler'),
  sonAktif: timestamp('son_aktif', { withTimezone: true }),
  ortYanitSuresiSaat: numeric('ort_yanit_suresi_saat', { precision: 6, scale: 2 }),
  dogrulanmisRozet: boolean('dogrulanmis_rozet').notNull().default(false),
  mevcutDurum: firmaMevcutDurumEnum('mevcut_durum').default('musait'),
  referansKodu: varchar('referans_kodu', { length: 16 }).unique(),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
  guncellemeTarihi: timestamp('guncelleme_tarihi', { withTimezone: true }).defaultNow(),
});

export const kullanici = pgTable('kullanici', {
  kullaniciId: uuid('kullanici_id').primaryKey().defaultRandom(),
  firmaId: uuid('firma_id').references(() => firma.firmaId, { onDelete: 'cascade' }),
  adSoyad: varchar('ad_soyad', { length: 120 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  sifreHash: text('sifre_hash'),
  rol: kullaniciRolEnum('rol').notNull().default('firma_user'),
  emailDogrulandi: boolean('email_dogrulandi').notNull().default(false),
  dogrulamaTarihi: timestamp('dogrulama_tarihi', { withTimezone: true }),
  dilTercihi: varchar('dil_tercihi', { length: 2 }).default('tr'),
  telefon: varchar('telefon', { length: 24 }),
  sonGiris: timestamp('son_giris', { withTimezone: true }),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
}, (t) => ({
  idxFirma: index('idx_kullanici_firma').on(t.firmaId),
}));

export const tezgah = pgTable('tezgah', {
  tezgahId: uuid('tezgah_id').primaryKey().defaultRandom(),
  firmaId: uuid('firma_id').notNull().references(() => firma.firmaId, { onDelete: 'cascade' }),
  tipId: smallint('tip_id').references(() => tezgahTip.tipId),
  altKategoriId: integer('alt_kategori_id').references(() => tezgahAltKategori.altKategoriId),
  eksenOzellik: varchar('eksen_ozellik', { length: 80 }),
  markaId: integer('marka_id').references(() => tezgahMarka.markaId),
  model: varchar('model', { length: 120 }),
  kontrolSistemiId: integer('kontrol_sistemi_id').references(() => kontrolSistemi.kontrolSistemiId),
  bagXMm: integer('bag_x_mm'),
  bagYMm: integer('bag_y_mm'),
  bagZMm: integer('bag_z_mm'),
  maxRpm: integer('max_rpm'),
  yapimYili: smallint('yapim_yili'),
  durum: tezgahDurumEnum('durum').default('aktif_tam_kapasite'),
  notlar: text('notlar'),
  eklemeTarihi: timestamp('ekleme_tarihi', { withTimezone: true }).defaultNow(),
}, (t) => ({
  idxFirma: index('idx_tezgah_firma').on(t.firmaId),
  idxTip: index('idx_tezgah_tip').on(t.tipId, t.altKategoriId),
}));

export const sertifika = pgTable('sertifika', {
  sertifikaId: uuid('sertifika_id').primaryKey().defaultRandom(),
  firmaId: uuid('firma_id').notNull().references(() => firma.firmaId, { onDelete: 'cascade' }),
  sertifikaAdi: varchar('sertifika_adi', { length: 80 }).notNull(),
  belgeUrl: text('belge_url'),
  gecerlilikBitis: date('gecerlilik_bitis'),
  dogrulandi: boolean('dogrulandi').notNull().default(false),
  dogrulayanAdminId: uuid('dogrulayan_admin_id').references(() => kullanici.kullaniciId),
  dogrulamaTarihi: timestamp('dogrulama_tarihi', { withTimezone: true }),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
});

export const yetenek = pgTable('yetenek', {
  yetenekId: uuid('yetenek_id').primaryKey().defaultRandom(),
  firmaId: uuid('firma_id').notNull().references(() => firma.firmaId, { onDelete: 'cascade' }),
  kategori: varchar('kategori', { length: 60 }),
  deger: varchar('deger', { length: 120 }).notNull(),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
});

export const malzeme = pgTable('malzeme', {
  malzemeId: uuid('malzeme_id').primaryKey().defaultRandom(),
  firmaId: uuid('firma_id').notNull().references(() => firma.firmaId, { onDelete: 'cascade' }),
  malzemeAdi: varchar('malzeme_adi', { length: 100 }).notNull(),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
});

export const olcumSistemi = pgTable('olcum_sistemi', {
  olcumId: uuid('olcum_id').primaryKey().defaultRandom(),
  firmaId: uuid('firma_id').notNull().references(() => firma.firmaId, { onDelete: 'cascade' }),
  ekipmanAdi: varchar('ekipman_adi', { length: 120 }).notNull(),
  marka: varchar('marka', { length: 60 }),
  model: varchar('model', { length: 80 }),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
});

export const kapasite = pgTable('kapasite', {
  kapasiteId: uuid('kapasite_id').primaryKey().defaultRandom(),
  firmaId: uuid('firma_id').notNull().unique().references(() => firma.firmaId, { onDelete: 'cascade' }),
  minSiparisAdedi: integer('min_siparis_adedi').default(1),
  vardiya: varchar('vardiya', { length: 20 }),
  teslimatSuresi: varchar('teslimat_suresi', { length: 40 }),
  acilIs: boolean('acil_is').default(true),
  ihracatDeneyimi: boolean('ihracat_deneyimi').default(false),
  ihracatUlkeleri: text('ihracat_ulkeleri'),
  fiyatYontemi: varchar('fiyat_yontemi', { length: 40 }),
  odemeKosulu: varchar('odeme_kosulu', { length: 80 }),
  aylikKapasite: integer('aylik_kapasite'),
  dolulukOrani: smallint('doluluk_orani'),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
});

export const gorsel = pgTable('gorsel', {
  gorselId: uuid('gorsel_id').primaryKey().defaultRandom(),
  firmaId: uuid('firma_id').notNull().references(() => firma.firmaId, { onDelete: 'cascade' }),
  tip: gorselTipEnum('tip').default('foto'),
  url: text('url').notNull(),
  baslik: varchar('baslik', { length: 120 }),
  aciklama: text('aciklama'),
  sira: smallint('sira').default(0),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
});

// =====================================================================
// BÖLÜM B: ALICI
// =====================================================================
export const alici = pgTable('alici', {
  aliciId: uuid('alici_id').primaryKey().defaultRandom(),
  firmaAdi: varchar('firma_adi', { length: 200 }).notNull(),
  sektor: varchar('sektor', { length: 60 }),
  ulke: varchar('ulke', { length: 60 }),
  vatNo: varchar('vat_no', { length: 32 }),
  website: varchar('website', { length: 255 }),
  calisanSayisi: varchar('calisan_sayisi', { length: 20 }),
  ad: varchar('ad', { length: 60 }).notNull(),
  soyad: varchar('soyad', { length: 60 }).notNull(),
  pozisyon: varchar('pozisyon', { length: 120 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  telefon: varchar('telefon', { length: 24 }),
  sifreHash: text('sifre_hash'),
  dilTercihi: varchar('dil_tercihi', { length: 2 }).default('en'),
  aciliyet: aliciAciliyetEnum('aciliyet'),
  yillikHacim: varchar('yillik_hacim', { length: 40 }),
  arananTezgahTipleri: jsonb('aranan_tezgah_tipleri'),
  arananMalzemeler: jsonb('aranan_malzemeler'),
  arananSertifikalar: jsonb('aranan_sertifikalar'),
  notlar: text('notlar'),
  kvkkOnay: boolean('kvkk_onay').notNull().default(false),
  bultenOnay: boolean('bulten_onay').notNull().default(false),
  emailDogrulandi: boolean('email_dogrulandi').notNull().default(false),
  dogrulamaTarihi: timestamp('dogrulama_tarihi', { withTimezone: true }),
  sonGiris: timestamp('son_giris', { withTimezone: true }),
  referansKodu: varchar('referans_kodu', { length: 16 }),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
  guncellemeTarihi: timestamp('guncelleme_tarihi', { withTimezone: true }).defaultNow(),
});

// =====================================================================
// BÖLÜM C: RFQ & TEKLİF
// =====================================================================
export const rfq = pgTable('rfq', {
  rfqId: varchar('rfq_id', { length: 20 }).primaryKey(),
  aliciId: uuid('alici_id').notNull().references(() => alici.aliciId, { onDelete: 'cascade' }),
  hedefFirmaId: uuid('hedef_firma_id').references(() => firma.firmaId, { onDelete: 'set null' }),
  baslik: varchar('baslik', { length: 120 }).notNull(),
  aciklama: text('aciklama').notNull(),
  tezgahTipleri: jsonb('tezgah_tipleri'),
  malzemeler: jsonb('malzemeler'),
  tolerans: varchar('tolerans', { length: 40 }),
  yuzeyPuruzlulugu: varchar('yuzey_puruzlulugu', { length: 40 }),
  sertifikaGereksinimleri: jsonb('sertifika_gereksinimleri'),
  adet: integer('adet').notNull(),
  termin: date('termin'),
  butceAraligi: varchar('butce_araligi', { length: 40 }),
  sehirBolge: varchar('sehir_bolge', { length: 60 }),
  firmaSayisi: rfqFirmaSayisiEnum('firma_sayisi').notNull().default('bes_firma'),
  cevapSonTarihi: date('cevap_son_tarihi'),
  iletisimTercihi: jsonb('iletisim_tercihi'),
  ndaRequest: boolean('nda_request').notNull().default(false),
  durum: rfqDurumEnum('durum').notNull().default('aktif'),
  sonDurumAciklama: text('son_durum_aciklama'),
  iptalNedeni: text('iptal_nedeni'),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
  guncellemeTarihi: timestamp('guncelleme_tarihi', { withTimezone: true }).defaultNow(),
}, (t) => ({
  idxAlici: index('idx_rfq_alici').on(t.aliciId),
  idxHedefFirma: index('idx_rfq_hedef_firma').on(t.hedefFirmaId),
  idxDurum: index('idx_rfq_durum').on(t.durum),
}));

export const rfqDosya = pgTable('rfq_dosya', {
  dosyaId: uuid('dosya_id').primaryKey().defaultRandom(),
  rfqId: varchar('rfq_id', { length: 20 }).notNull().references(() => rfq.rfqId, { onDelete: 'cascade' }),
  dosyaAdi: varchar('dosya_adi', { length: 255 }).notNull(),
  dosyaUrl: text('dosya_url').notNull(),
  boyutMb: numeric('boyut_mb', { precision: 8, scale: 2 }),
  dosyaTipi: varchar('dosya_tipi', { length: 8 }),
  ndaKorumali: boolean('nda_korumali').notNull().default(false),
  yuklenmeTarihi: timestamp('yuklenme_tarihi', { withTimezone: true }).defaultNow(),
});

export const rfqFirma = pgTable('rfq_firma', {
  rfqFirmaId: uuid('rfq_firma_id').primaryKey().defaultRandom(),
  rfqId: varchar('rfq_id', { length: 20 }).notNull().references(() => rfq.rfqId, { onDelete: 'cascade' }),
  firmaId: uuid('firma_id').notNull().references(() => firma.firmaId, { onDelete: 'cascade' }),
  durum: rfqFirmaDurumEnum('durum').notNull().default('gonderildi'),
  gonderilmeTarihi: timestamp('gonderilme_tarihi', { withTimezone: true }).defaultNow(),
  okunmaTarihi: timestamp('okunma_tarihi', { withTimezone: true }),
  teklifTarihi: timestamp('teklif_tarihi', { withTimezone: true }),
}, (t) => ({
  uniqRfqFirma: unique().on(t.rfqId, t.firmaId),
}));

export const teklif = pgTable('teklif', {
  teklifId: uuid('teklif_id').primaryKey().defaultRandom(),
  rfqFirmaId: uuid('rfq_firma_id').notNull().unique().references(() => rfqFirma.rfqFirmaId, { onDelete: 'cascade' }),
  birimFiyat: numeric('birim_fiyat', { precision: 14, scale: 2 }).notNull(),
  paraBirimi: varchar('para_birimi', { length: 3 }).notNull().default('TRY'),
  toplamFiyat: numeric('toplam_fiyat', { precision: 16, scale: 2 }),
  terminHaftalari: smallint('termin_haftalari'),
  notlar: text('notlar'),
  durum: teklifDurumEnum('durum').notNull().default('verildi'),
  gecerlilikBitis: date('gecerlilik_bitis'),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
});

// =====================================================================
// BÖLÜM D: MESAJLAŞMA & NDA
// =====================================================================
export const konusma = pgTable('konusma', {
  konusmaId: uuid('konusma_id').primaryKey().defaultRandom(),
  rfqId: varchar('rfq_id', { length: 20 }).references(() => rfq.rfqId, { onDelete: 'set null' }),
  aliciId: uuid('alici_id').notNull().references(() => alici.aliciId, { onDelete: 'cascade' }),
  firmaId: uuid('firma_id').notNull().references(() => firma.firmaId, { onDelete: 'cascade' }),
  durum: konusmaDurumEnum('durum').notNull().default('yeni'),
  kimlikGizli: boolean('kimlik_gizli').notNull().default(true),
  anlasmaTarihi: timestamp('anlasma_tarihi', { withTimezone: true }),
  iletisimAcildi: boolean('iletisim_acildi').notNull().default(false),
  sonMesajTarihi: timestamp('son_mesaj_tarihi', { withTimezone: true }).defaultNow(),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
});

export const mesaj = pgTable('mesaj', {
  mesajId: uuid('mesaj_id').primaryKey().defaultRandom(),
  konusmaId: uuid('konusma_id').notNull().references(() => konusma.konusmaId, { onDelete: 'cascade' }),
  gonderenTip: kullaniciTipEnum('gonderen_tip').notNull(),
  gonderenId: uuid('gonderen_id').notNull(),
  icerik: text('icerik').notNull(),
  dosyaUrl: text('dosya_url'),
  dosyaAdi: varchar('dosya_adi', { length: 255 }),
  dosyaBoyutMb: numeric('dosya_boyut_mb', { precision: 8, scale: 2 }),
  okundu: boolean('okundu').notNull().default(false),
  okunmaTarihi: timestamp('okunma_tarihi', { withTimezone: true }),
  orijinalDil: varchar('orijinal_dil', { length: 2 }).default('tr'),
  ceviriler: jsonb('ceviriler'),
  gonderilmeTarihi: timestamp('gonderilme_tarihi', { withTimezone: true }).defaultNow(),
}, (t) => ({
  idxKonusma: index('idx_mesaj_konusma').on(t.konusmaId, t.gonderilmeTarihi),
}));

export const nda = pgTable('nda', {
  ndaId: uuid('nda_id').primaryKey().defaultRandom(),
  konusmaId: uuid('konusma_id').notNull().unique().references(() => konusma.konusmaId, { onDelete: 'cascade' }),
  aliciImzaTarihi: timestamp('alici_imza_tarihi', { withTimezone: true }),
  firmaImzaTarihi: timestamp('firma_imza_tarihi', { withTimezone: true }),
  belgeUrl: text('belge_url'),
  durum: ndaDurumEnum('durum').notNull().default('taslak'),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
});

// =====================================================================
// BÖLÜM E: TİCARİ
// =====================================================================
export const abonelik = pgTable('abonelik', {
  abonelikId: uuid('abonelik_id').primaryKey().defaultRandom(),
  firmaId: uuid('firma_id').notNull().references(() => firma.firmaId, { onDelete: 'cascade' }),
  planTipi: abonelikPlanEnum('plan_tipi').notNull(),
  baslangicTarihi: date('baslangic_tarihi').notNull().default(sql`current_date`),
  bitisTarihi: date('bitis_tarihi'),
  aylikUcret: numeric('aylik_ucret', { precision: 10, scale: 2 }),
  faturalandirma: abonelikFaturalandirmaEnum('faturalandirma').default('aylik'),
  aktif: boolean('aktif').notNull().default(true),
  denemeMi: boolean('deneme_mi').notNull().default(false),
  denemeBitis: date('deneme_bitis'),
  maxTezgah: integer('max_tezgah'),
  maxMesajAy: integer('max_mesaj_ay'),
  maxKullanici: integer('max_kullanici'),
  apiErisim: boolean('api_erisim').default(false),
  dogrulanmisRozet: boolean('dogrulanmis_rozet').default(false),
  oncelikliSiralama: boolean('oncelikli_siralama').default(false),
  oneCikanRozet: boolean('one_cikan_rozet').default(false),
  cokSube: boolean('cok_sube').default(false),
  iptalTarihi: timestamp('iptal_tarihi', { withTimezone: true }),
  iptalNedeni: text('iptal_nedeni'),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
});

export const odeme = pgTable('odeme', {
  odemeId: uuid('odeme_id').primaryKey().defaultRandom(),
  abonelikId: uuid('abonelik_id').notNull().references(() => abonelik.abonelikId, { onDelete: 'cascade' }),
  tutar: numeric('tutar', { precision: 12, scale: 2 }).notNull(),
  paraBirimi: varchar('para_birimi', { length: 3 }).default('TRY'),
  odemeTarihi: timestamp('odeme_tarihi', { withTimezone: true }).defaultNow(),
  yontem: odemeYontemEnum('yontem'),
  durum: odemeDurumEnum('durum').notNull().default('beklemede'),
  faturaNo: varchar('fatura_no', { length: 40 }),
  saglayiciRef: varchar('saglayici_ref', { length: 100 }),
  saglayiciResponse: jsonb('saglayici_response'),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
});

export const degerlendirme = pgTable('degerlendirme', {
  degerlendirmeId: uuid('degerlendirme_id').primaryKey().defaultRandom(),
  rfqId: varchar('rfq_id', { length: 20 }).references(() => rfq.rfqId, { onDelete: 'set null' }),
  aliciId: uuid('alici_id').notNull().references(() => alici.aliciId, { onDelete: 'cascade' }),
  firmaId: uuid('firma_id').notNull().references(() => firma.firmaId, { onDelete: 'cascade' }),
  puan: smallint('puan').notNull(),
  yorum: text('yorum'),
  cevap: text('cevap'),
  cevapTarihi: timestamp('cevap_tarihi', { withTimezone: true }),
  dogrulanmisIs: boolean('dogrulanmis_is').notNull().default(false),
  yayinda: boolean('yayinda').notNull().default(true),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
}, (t) => ({
  uniqRfqAlici: unique().on(t.rfqId, t.aliciId),
}));

export const markaOnayKuyrugu = pgTable('marka_onay_kuyrugu', {
  onayId: uuid('onay_id').primaryKey().defaultRandom(),
  teklifEdilenAd: varchar('teklif_edilen_ad', { length: 80 }).notNull(),
  tipId: smallint('tip_id').references(() => tezgahTip.tipId),
  teklifEdenFirmaId: uuid('teklif_eden_firma_id').references(() => firma.firmaId, { onDelete: 'set null' }),
  durum: markaOnayDurumEnum('durum').notNull().default('bekliyor'),
  kararVerenAdminId: uuid('karar_veren_admin_id').references(() => kullanici.kullaniciId),
  kararTarihi: timestamp('karar_tarihi', { withTimezone: true }),
  redNedeni: text('red_nedeni'),
  yeniMarkaId: integer('yeni_marka_id').references(() => tezgahMarka.markaId),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
});

// =====================================================================
// BÖLÜM G: AUTH & GÜVENLİK
// =====================================================================
export const sifreSifirlamaToken = pgTable('sifre_sifirlama_token', {
  tokenId: uuid('token_id').primaryKey().defaultRandom(),
  tokenHash: varchar('token_hash', { length: 128 }).notNull().unique(),
  kullaniciTip: kullaniciTipEnum('kullanici_tip').notNull(),
  kullaniciId: uuid('kullanici_id').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  ipAdresi: inet('ip_adresi'),
  userAgent: text('user_agent'),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
  bitisTarihi: timestamp('bitis_tarihi', { withTimezone: true }).notNull(),
  kullanildi: boolean('kullanildi').notNull().default(false),
  kullanilmaTarihi: timestamp('kullanilma_tarihi', { withTimezone: true }),
});

export const emailDogrulamaToken = pgTable('email_dogrulama_token', {
  tokenId: uuid('token_id').primaryKey().defaultRandom(),
  tokenHash: varchar('token_hash', { length: 128 }).notNull().unique(),
  kullaniciTip: kullaniciTipEnum('kullanici_tip').notNull(),
  kullaniciId: uuid('kullanici_id').notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
  bitisTarihi: timestamp('bitis_tarihi', { withTimezone: true }).notNull(),
  dogrulandi: boolean('dogrulandi').notNull().default(false),
  dogrulanmaTarihi: timestamp('dogrulanma_tarihi', { withTimezone: true }),
});

export const oturum = pgTable('oturum', {
  oturumId: uuid('oturum_id').primaryKey().defaultRandom(),
  kullaniciTip: kullaniciTipEnum('kullanici_tip').notNull(),
  kullaniciId: uuid('kullanici_id').notNull(),
  refreshTokenHash: varchar('refresh_token_hash', { length: 128 }).unique(),
  cihazBilgisi: jsonb('cihaz_bilgisi'),
  ipAdresi: inet('ip_adresi'),
  konum: varchar('konum', { length: 120 }),
  beniHatirla: boolean('beni_hatirla').default(false),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
  sonKullanma: timestamp('son_kullanma', { withTimezone: true }).defaultNow(),
  bitisTarihi: timestamp('bitis_tarihi', { withTimezone: true }).notNull(),
  iptalTarihi: timestamp('iptal_tarihi', { withTimezone: true }),
});

// =====================================================================
// BÖLÜM H: UX
// =====================================================================
export const favori = pgTable('favori', {
  favoriId: uuid('favori_id').primaryKey().defaultRandom(),
  aliciId: uuid('alici_id').notNull().references(() => alici.aliciId, { onDelete: 'cascade' }),
  firmaId: uuid('firma_id').notNull().references(() => firma.firmaId, { onDelete: 'cascade' }),
  notlar: text('notlar'),
  eklenmeTarihi: timestamp('eklenme_tarihi', { withTimezone: true }).defaultNow(),
}, (t) => ({
  uniqAliciFirma: unique().on(t.aliciId, t.firmaId),
}));

export const bildirim = pgTable('bildirim', {
  bildirimId: uuid('bildirim_id').primaryKey().defaultRandom(),
  aliciTip: kullaniciTipEnum('alici_tip').notNull(),
  aliciId: uuid('alici_id').notNull(),
  tip: bildirimTipEnum('tip').notNull(),
  baslik: varchar('baslik', { length: 160 }).notNull(),
  icerik: text('icerik'),
  link: varchar('link', { length: 255 }),
  refTablo: varchar('ref_tablo', { length: 40 }),
  refId: text('ref_id'),
  okundu: boolean('okundu').notNull().default(false),
  okunmaTarihi: timestamp('okunma_tarihi', { withTimezone: true }),
  emailGonderildi: boolean('email_gonderildi').notNull().default(false),
  emailGonderilmeTarihi: timestamp('email_gonderilme_tarihi', { withTimezone: true }),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
}, (t) => ({
  idxKullanici: index('idx_bildirim_kullanici').on(t.aliciTip, t.aliciId, t.olusturulmaTarihi),
}));

export const auditLog = pgTable('audit_log', {
  logId: bigserial('log_id', { mode: 'bigint' }).primaryKey(),
  adminId: uuid('admin_id').references(() => kullanici.kullaniciId, { onDelete: 'set null' }),
  olayTipi: auditOlayEnum('olay_tipi').notNull(),
  hedefTablo: varchar('hedef_tablo', { length: 40 }).notNull(),
  hedefId: text('hedef_id').notNull(),
  eskiDeger: jsonb('eski_deger'),
  yeniDeger: jsonb('yeni_deger'),
  aciklama: text('aciklama'),
  ipAdresi: inet('ip_adresi'),
  userAgent: text('user_agent'),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
});

export const referansProgrami = pgTable('referans_programi', {
  referansId: uuid('referans_id').primaryKey().defaultRandom(),
  davetEdenFirmaId: uuid('davet_eden_firma_id').notNull().references(() => firma.firmaId, { onDelete: 'cascade' }),
  davetEdilenFirmaId: uuid('davet_edilen_firma_id').references(() => firma.firmaId, { onDelete: 'set null' }),
  referansKodu: varchar('referans_kodu', { length: 16 }).notNull().unique(),
  davetEmail: varchar('davet_email', { length: 255 }),
  durum: referansDurumEnum('durum').notNull().default('gonderildi'),
  odulTipi: referansOdulEnum('odul_tipi').default('bir_ay_ucretsiz'),
  odulVerildiMi: boolean('odul_verildi_mi').notNull().default(false),
  odulTarihi: timestamp('odul_tarihi', { withTimezone: true }),
  kayitTarihi: timestamp('kayit_tarihi', { withTimezone: true }),
  aboneOlmaTarihi: timestamp('abone_olma_tarihi', { withTimezone: true }),
  olusturulmaTarihi: timestamp('olusturulma_tarihi', { withTimezone: true }).defaultNow(),
});

// =====================================================================
// İLİŞKİLER (relations) — Drizzle Query API için
// =====================================================================
export const firmaRelations = relations(firma, ({ many, one }) => ({
  kullanicilar: many(kullanici),
  tezgahlar: many(tezgah),
  sertifikalar: many(sertifika),
  yetenekler: many(yetenek),
  malzemeler: many(malzeme),
  olcumSistemleri: many(olcumSistemi),
  kapasite: one(kapasite, { fields: [firma.firmaId], references: [kapasite.firmaId] }),
  gorseller: many(gorsel),
  rfqEslesmeleri: many(rfqFirma),
  konusmalar: many(konusma),
  abonelikler: many(abonelik),
  alinanDegerlendirmeler: many(degerlendirme, { relationName: 'firma_degerlendirmeleri' }),
  favoriEdilen: many(favori),
  davetler: many(referansProgrami, { relationName: 'davet_eden' }),
}));

export const aliciRelations = relations(alici, ({ many }) => ({
  rfqlar: many(rfq),
  konusmalar: many(konusma),
  favoriler: many(favori),
  degerlendirmeler: many(degerlendirme),
}));

export const kullaniciRelations = relations(kullanici, ({ one }) => ({
  firma: one(firma, { fields: [kullanici.firmaId], references: [firma.firmaId] }),
}));

export const tezgahRelations = relations(tezgah, ({ one }) => ({
  firma: one(firma, { fields: [tezgah.firmaId], references: [firma.firmaId] }),
  tip: one(tezgahTip, { fields: [tezgah.tipId], references: [tezgahTip.tipId] }),
  altKategori: one(tezgahAltKategori, { fields: [tezgah.altKategoriId], references: [tezgahAltKategori.altKategoriId] }),
  marka: one(tezgahMarka, { fields: [tezgah.markaId], references: [tezgahMarka.markaId] }),
  kontrolSistemi: one(kontrolSistemi, { fields: [tezgah.kontrolSistemiId], references: [kontrolSistemi.kontrolSistemiId] }),
}));

export const tezgahTipRelations = relations(tezgahTip, ({ many }) => ({
  altKategoriler: many(tezgahAltKategori),
  markaEslesmeleri: many(tezgahMarkaTip),
  tezgahlar: many(tezgah),
}));

export const tezgahAltKategoriRelations = relations(tezgahAltKategori, ({ one, many }) => ({
  tip: one(tezgahTip, { fields: [tezgahAltKategori.tipId], references: [tezgahTip.tipId] }),
  eksenSecenekleri: many(tezgahEksenSecenek),
}));

export const tezgahMarkaRelations = relations(tezgahMarka, ({ many }) => ({
  tipEslesmeleri: many(tezgahMarkaTip),
  tezgahlar: many(tezgah),
}));

export const rfqRelations = relations(rfq, ({ one, many }) => ({
  alici: one(alici, { fields: [rfq.aliciId], references: [alici.aliciId] }),
  hedefFirma: one(firma, { fields: [rfq.hedefFirmaId], references: [firma.firmaId] }),
  dosyalar: many(rfqDosya),
  firmaEslesmeleri: many(rfqFirma),
  konusmalar: many(konusma),
}));

export const rfqFirmaRelations = relations(rfqFirma, ({ one }) => ({
  rfq: one(rfq, { fields: [rfqFirma.rfqId], references: [rfq.rfqId] }),
  firma: one(firma, { fields: [rfqFirma.firmaId], references: [firma.firmaId] }),
  teklif: one(teklif, { fields: [rfqFirma.rfqFirmaId], references: [teklif.rfqFirmaId] }),
}));

export const konusmaRelations = relations(konusma, ({ one, many }) => ({
  rfq: one(rfq, { fields: [konusma.rfqId], references: [rfq.rfqId] }),
  alici: one(alici, { fields: [konusma.aliciId], references: [alici.aliciId] }),
  firma: one(firma, { fields: [konusma.firmaId], references: [firma.firmaId] }),
  mesajlar: many(mesaj),
  nda: one(nda, { fields: [konusma.konusmaId], references: [nda.konusmaId] }),
}));

export const mesajRelations = relations(mesaj, ({ one }) => ({
  konusma: one(konusma, { fields: [mesaj.konusmaId], references: [konusma.konusmaId] }),
}));

export const abonelikRelations = relations(abonelik, ({ one, many }) => ({
  firma: one(firma, { fields: [abonelik.firmaId], references: [firma.firmaId] }),
  odemeler: many(odeme),
}));

export const odemeRelations = relations(odeme, ({ one }) => ({
  abonelik: one(abonelik, { fields: [odeme.abonelikId], references: [abonelik.abonelikId] }),
}));

export const degerlendirmeRelations = relations(degerlendirme, ({ one }) => ({
  alici: one(alici, { fields: [degerlendirme.aliciId], references: [alici.aliciId] }),
  firma: one(firma, { fields: [degerlendirme.firmaId], references: [firma.firmaId], relationName: 'firma_degerlendirmeleri' }),
  rfq: one(rfq, { fields: [degerlendirme.rfqId], references: [rfq.rfqId] }),
}));

export const favoriRelations = relations(favori, ({ one }) => ({
  alici: one(alici, { fields: [favori.aliciId], references: [alici.aliciId] }),
  firma: one(firma, { fields: [favori.firmaId], references: [firma.firmaId] }),
}));

// =====================================================================
// TIP YARDIMCILARI — InferSelectModel / InferInsertModel
// =====================================================================
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type Firma          = InferSelectModel<typeof firma>;
export type FirmaInsert    = InferInsertModel<typeof firma>;
export type Kullanici      = InferSelectModel<typeof kullanici>;
export type Tezgah         = InferSelectModel<typeof tezgah>;
export type Alici          = InferSelectModel<typeof alici>;
export type Rfq            = InferSelectModel<typeof rfq>;
export type Konusma        = InferSelectModel<typeof konusma>;
export type Mesaj          = InferSelectModel<typeof mesaj>;
export type Abonelik       = InferSelectModel<typeof abonelik>;
export type Degerlendirme  = InferSelectModel<typeof degerlendirme>;

// =====================================================================
// END schema.ts
// =====================================================================
