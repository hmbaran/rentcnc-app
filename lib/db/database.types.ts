/**
 * RentCNCmachine.com — database.types.ts
 *
 * Supabase / PostgreSQL şemasının TypeScript tip tanımları.
 * `createClient<Database>('url','key')` ile birlikte kullanılır.
 *
 * Üretim için: `supabase gen types typescript --project-id <ref> > database.types.ts`
 * Bu dosya şemadan (02_Veritabani_Semasi.html) elle üretildi — 2026-05-20.
 *
 * Kullanım örneği:
 *
 *   import { createClient } from '@supabase/supabase-js';
 *   import type { Database, Tables, Enums } from './database.types';
 *
 *   const supabase = createClient<Database>(URL, KEY);
 *
 *   type Firma = Tables<'firma'>;            // satır tipi
 *   type FirmaInsert = TablesInsert<'firma'>; // ekleme tipi
 *   type FirmaUpdate = TablesUpdate<'firma'>; // güncelleme tipi
 *   type Durum = Enums<'firma_durum'>;        // 'taslak' | 'onay_bekliyor' | ...
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// =====================================================================
// ENUM tipleri (24 adet)
// =====================================================================
export type FirmaDurum = 'taslak' | 'onay_bekliyor' | 'yayinda' | 'pasif' | 'reddedildi' | 'askiya_alindi';
export type FirmaMevcutDurum = 'musait' | 'mesgul' | 'bakim';
export type KullaniciRol = 'admin' | 'moderator' | 'firma_admin' | 'firma_user';
export type TezgahDurum = 'aktif_tam_kapasite' | 'kismen_musait' | 'bakimda' | 'satildi_kapali';
export type AliciAciliyet = 'acil' | 'uc_ay' | 'arastirma' | 'surekli';
export type RfqDurum = 'taslak' | 'aktif' | 'teklifler_geldi' | 'tamamlandi' | 'iptal';
export type RfqFirmaSayisi = 'sadece_hedef' | 'uc_firma' | 'bes_firma' | 'on_firma';
export type RfqFirmaDurum = 'gonderildi' | 'goruldu' | 'teklif_verildi' | 'reddedildi' | 'sure_doldu';
export type TeklifDurum = 'verildi' | 'kabul' | 'red' | 'sure_doldu' | 'geri_cekildi';
export type KullaniciTip = 'firma' | 'alici';
export type KonusmaDurum = 'yeni' | 'muzakere' | 'nda_bekliyor' | 'anlasma_saglandi' | 'kapali' | 'reddedildi';
export type NdaDurum = 'taslak' | 'alici_imzaladi' | 'firma_imzaladi' | 'iki_taraf_imzaladi' | 'iptal';
export type AbonelikPlan = 'ucretsiz' | 'baslangic' | 'profesyonel' | 'kurumsal';
export type AbonelikFaturalandirma = 'aylik' | 'yillik';
export type OdemeDurum = 'beklemede' | 'basarili' | 'basarisiz' | 'iade' | 'iptal';
export type OdemeYontem = 'kart' | 'havale' | 'kapida_odeme';
export type GorselTip = 'foto' | 'video' | 'dokuman' | 'referans';
export type MarkaOnayDurum = 'bekliyor' | 'onaylandi' | 'reddedildi';
export type BildirimTip =
  | 'rfq_yeni' | 'rfq_teklif' | 'mesaj_yeni' | 'onay_sonucu'
  | 'abonelik_uyari' | 'abonelik_iptal' | 'odeme_basarili' | 'odeme_basarisiz'
  | 'degerlendirme' | 'nda_imza' | 'sistem';
export type AuditOlay =
  | 'firma_onayi' | 'firma_red' | 'sertifika_onayi' | 'sertifika_red'
  | 'marka_onayi' | 'marka_red' | 'kullanici_askiya_alma' | 'firma_silme'
  | 'abonelik_iptal' | 'odeme_iade' | 'degerlendirme_kaldirma' | 'mesaj_silme'
  | 'admin_giris';
export type ReferansDurum = 'gonderildi' | 'kayit_oldu' | 'abone_oldu' | 'odul_verildi' | 'iptal';
export type ReferansOdul = 'bir_ay_ucretsiz' | 'yuzde_yirmi_indirim' | 'uc_ay_indirim';

// =====================================================================
// Database tip tanımı — Supabase pattern
// =====================================================================
export interface Database {
  public: {
    Tables: {
      // ─── BÖLÜM A: FASONCU PROFİL ─────────────────────────────
      firma: {
        Row: {
          firma_id: string;
          vergi_no: string;
          ticari_unvan: string;
          il: string | null;
          ilce: string | null;
          adres: string | null;
          lat: number | null;
          lng: number | null;
          telefon: string | null;
          email: string | null;
          website: string | null;
          kurulus_yili: number | null;
          calisan_aralik: string | null;
          durum: FirmaDurum;
          profil_doluluk: number;
          hakkinda: string | null;
          one_cikan_projeler: string | null;
          son_aktif: string | null;
          ort_yanit_suresi_saat: number | null;
          dogrulanmis_rozet: boolean;
          mevcut_durum: FirmaMevcutDurum | null;
          referans_kodu: string | null;
          olusturulma_tarihi: string;
          guncelleme_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['firma']['Row']> & {
          vergi_no: string;
          ticari_unvan: string;
        };
        Update: Partial<Database['public']['Tables']['firma']['Row']>;
      };

      kullanici: {
        Row: {
          kullanici_id: string;
          firma_id: string | null;
          ad_soyad: string;
          email: string;
          sifre_hash: string | null;
          rol: KullaniciRol;
          email_dogrulandi: boolean;
          dogrulama_tarihi: string | null;
          dil_tercihi: string;
          telefon: string | null;
          son_giris: string | null;
          olusturulma_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['kullanici']['Row']> & {
          ad_soyad: string;
          email: string;
        };
        Update: Partial<Database['public']['Tables']['kullanici']['Row']>;
      };

      tezgah: {
        Row: {
          tezgah_id: string;
          firma_id: string;
          tip_id: number | null;
          alt_kategori_id: number | null;
          eksen_ozellik: string | null;
          marka_id: number | null;
          model: string | null;
          kontrol_sistemi_id: number | null;
          bag_x_mm: number | null;
          bag_y_mm: number | null;
          bag_z_mm: number | null;
          max_rpm: number | null;
          yapim_yili: number | null;
          durum: TezgahDurum;
          notlar: string | null;
          ekleme_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['tezgah']['Row']> & { firma_id: string };
        Update: Partial<Database['public']['Tables']['tezgah']['Row']>;
      };

      sertifika: {
        Row: {
          sertifika_id: string;
          firma_id: string;
          sertifika_adi: string;
          belge_url: string | null;
          gecerlilik_bitis: string | null;
          dogrulandi: boolean;
          dogrulayan_admin_id: string | null;
          dogrulama_tarihi: string | null;
          olusturulma_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['sertifika']['Row']> & { firma_id: string; sertifika_adi: string };
        Update: Partial<Database['public']['Tables']['sertifika']['Row']>;
      };

      yetenek: {
        Row: {
          yetenek_id: string;
          firma_id: string;
          kategori: string | null;
          deger: string;
          olusturulma_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['yetenek']['Row']> & { firma_id: string; deger: string };
        Update: Partial<Database['public']['Tables']['yetenek']['Row']>;
      };

      malzeme: {
        Row: {
          malzeme_id: string;
          firma_id: string;
          malzeme_adi: string;
          olusturulma_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['malzeme']['Row']> & { firma_id: string; malzeme_adi: string };
        Update: Partial<Database['public']['Tables']['malzeme']['Row']>;
      };

      olcum_sistemi: {
        Row: {
          olcum_id: string;
          firma_id: string;
          ekipman_adi: string;
          marka: string | null;
          model: string | null;
          olusturulma_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['olcum_sistemi']['Row']> & { firma_id: string; ekipman_adi: string };
        Update: Partial<Database['public']['Tables']['olcum_sistemi']['Row']>;
      };

      kapasite: {
        Row: {
          kapasite_id: string;
          firma_id: string;
          min_siparis_adedi: number | null;
          vardiya: string | null;
          teslimat_suresi: string | null;
          acil_is: boolean | null;
          ihracat_deneyimi: boolean | null;
          ihracat_ulkeleri: string | null;
          fiyat_yontemi: string | null;
          odeme_kosulu: string | null;
          aylik_kapasite: number | null;
          doluluk_orani: number | null;
          olusturulma_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['kapasite']['Row']> & { firma_id: string };
        Update: Partial<Database['public']['Tables']['kapasite']['Row']>;
      };

      gorsel: {
        Row: {
          gorsel_id: string;
          firma_id: string;
          tip: GorselTip;
          url: string;
          baslik: string | null;
          aciklama: string | null;
          sira: number;
          olusturulma_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['gorsel']['Row']> & { firma_id: string; url: string };
        Update: Partial<Database['public']['Tables']['gorsel']['Row']>;
      };

      // ─── BÖLÜM B: ALICI ──────────────────────────────────────
      alici: {
        Row: {
          alici_id: string;
          firma_adi: string;
          sektor: string | null;
          ulke: string | null;
          vat_no: string | null;
          website: string | null;
          calisan_sayisi: string | null;
          ad: string;
          soyad: string;
          pozisyon: string | null;
          email: string;
          telefon: string | null;
          sifre_hash: string | null;
          dil_tercihi: string;
          aciliyet: AliciAciliyet | null;
          yillik_hacim: string | null;
          aranan_tezgah_tipleri: Json | null;
          aranan_malzemeler: Json | null;
          aranan_sertifikalar: Json | null;
          notlar: string | null;
          kvkk_onay: boolean;
          bulten_onay: boolean;
          email_dogrulandi: boolean;
          dogrulama_tarihi: string | null;
          son_giris: string | null;
          referans_kodu: string | null;
          olusturulma_tarihi: string;
          guncelleme_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['alici']['Row']> & {
          firma_adi: string; ad: string; soyad: string; email: string;
        };
        Update: Partial<Database['public']['Tables']['alici']['Row']>;
      };

      // ─── BÖLÜM C: RFQ & TEKLİF ───────────────────────────────
      rfq: {
        Row: {
          rfq_id: string;
          alici_id: string;
          hedef_firma_id: string | null;
          baslik: string;
          aciklama: string;
          tezgah_tipleri: Json | null;
          malzemeler: Json | null;
          tolerans: string | null;
          yuzey_puruzlulugu: string | null;
          sertifika_gereksinimleri: Json | null;
          adet: number;
          termin: string | null;
          butce_araligi: string | null;
          sehir_bolge: string | null;
          firma_sayisi: RfqFirmaSayisi;
          cevap_son_tarihi: string | null;
          iletisim_tercihi: Json | null;
          nda_request: boolean;
          durum: RfqDurum;
          son_durum_aciklama: string | null;
          iptal_nedeni: string | null;
          olusturulma_tarihi: string;
          guncelleme_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['rfq']['Row']> & {
          rfq_id: string; alici_id: string; baslik: string; aciklama: string; adet: number;
        };
        Update: Partial<Database['public']['Tables']['rfq']['Row']>;
      };

      rfq_dosya: {
        Row: {
          dosya_id: string;
          rfq_id: string;
          dosya_adi: string;
          dosya_url: string;
          boyut_mb: number | null;
          dosya_tipi: string | null;
          nda_korumali: boolean;
          yuklenme_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['rfq_dosya']['Row']> & { rfq_id: string; dosya_adi: string; dosya_url: string };
        Update: Partial<Database['public']['Tables']['rfq_dosya']['Row']>;
      };

      rfq_firma: {
        Row: {
          rfq_firma_id: string;
          rfq_id: string;
          firma_id: string;
          durum: RfqFirmaDurum;
          gonderilme_tarihi: string;
          okunma_tarihi: string | null;
          teklif_tarihi: string | null;
        };
        Insert: Partial<Database['public']['Tables']['rfq_firma']['Row']> & { rfq_id: string; firma_id: string };
        Update: Partial<Database['public']['Tables']['rfq_firma']['Row']>;
      };

      teklif: {
        Row: {
          teklif_id: string;
          rfq_firma_id: string;
          birim_fiyat: number;
          para_birimi: string;
          toplam_fiyat: number | null;
          termin_haftalari: number | null;
          notlar: string | null;
          durum: TeklifDurum;
          gecerlilik_bitis: string | null;
          olusturulma_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['teklif']['Row']> & { rfq_firma_id: string; birim_fiyat: number };
        Update: Partial<Database['public']['Tables']['teklif']['Row']>;
      };

      // ─── BÖLÜM D: MESAJLAŞMA & NDA ───────────────────────────
      konusma: {
        Row: {
          konusma_id: string;
          rfq_id: string | null;
          alici_id: string;
          firma_id: string;
          durum: KonusmaDurum;
          kimlik_gizli: boolean;
          anlasma_tarihi: string | null;
          iletisim_acildi: boolean;
          son_mesaj_tarihi: string;
          olusturulma_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['konusma']['Row']> & { alici_id: string; firma_id: string };
        Update: Partial<Database['public']['Tables']['konusma']['Row']>;
      };

      mesaj: {
        Row: {
          mesaj_id: string;
          konusma_id: string;
          gonderen_tip: KullaniciTip;
          gonderen_id: string;
          icerik: string;
          dosya_url: string | null;
          dosya_adi: string | null;
          dosya_boyut_mb: number | null;
          okundu: boolean;
          okunma_tarihi: string | null;
          orijinal_dil: string;
          ceviriler: Json | null;
          gonderilme_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['mesaj']['Row']> & {
          konusma_id: string; gonderen_tip: KullaniciTip; gonderen_id: string; icerik: string;
        };
        Update: Partial<Database['public']['Tables']['mesaj']['Row']>;
      };

      nda: {
        Row: {
          nda_id: string;
          konusma_id: string;
          alici_imza_tarihi: string | null;
          firma_imza_tarihi: string | null;
          belge_url: string | null;
          durum: NdaDurum;
          olusturulma_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['nda']['Row']> & { konusma_id: string };
        Update: Partial<Database['public']['Tables']['nda']['Row']>;
      };

      // ─── BÖLÜM E: TİCARİ ─────────────────────────────────────
      abonelik: {
        Row: {
          abonelik_id: string;
          firma_id: string;
          plan_tipi: AbonelikPlan;
          baslangic_tarihi: string;
          bitis_tarihi: string | null;
          aylik_ucret: number | null;
          faturalandirma: AbonelikFaturalandirma;
          aktif: boolean;
          deneme_mi: boolean;
          deneme_bitis: string | null;
          max_tezgah: number | null;
          max_mesaj_ay: number | null;
          max_kullanici: number | null;
          api_erisim: boolean;
          dogrulanmis_rozet: boolean;
          oncelikli_siralama: boolean;
          one_cikan_rozet: boolean;
          cok_sube: boolean;
          iptal_tarihi: string | null;
          iptal_nedeni: string | null;
          olusturulma_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['abonelik']['Row']> & { firma_id: string; plan_tipi: AbonelikPlan };
        Update: Partial<Database['public']['Tables']['abonelik']['Row']>;
      };

      odeme: {
        Row: {
          odeme_id: string;
          abonelik_id: string;
          tutar: number;
          para_birimi: string;
          odeme_tarihi: string;
          yontem: OdemeYontem | null;
          durum: OdemeDurum;
          fatura_no: string | null;
          saglayici_ref: string | null;
          saglayici_response: Json | null;
          olusturulma_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['odeme']['Row']> & { abonelik_id: string; tutar: number };
        Update: Partial<Database['public']['Tables']['odeme']['Row']>;
      };

      degerlendirme: {
        Row: {
          degerlendirme_id: string;
          rfq_id: string | null;
          alici_id: string;
          firma_id: string;
          puan: number;
          yorum: string | null;
          cevap: string | null;
          cevap_tarihi: string | null;
          dogrulanmis_is: boolean;
          yayinda: boolean;
          olusturulma_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['degerlendirme']['Row']> & {
          alici_id: string; firma_id: string; puan: number;
        };
        Update: Partial<Database['public']['Tables']['degerlendirme']['Row']>;
      };

      // ─── BÖLÜM F: TEZGAH LOOKUP ──────────────────────────────
      tezgah_tip: {
        Row: {
          tip_id: number;
          kod: string;
          ad: string;
          ad_en: string | null;
          aciklama: string | null;
          ikon: string | null;
          sira: number;
          aktif: boolean;
          olusturulma_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['tezgah_tip']['Row']> & { kod: string; ad: string };
        Update: Partial<Database['public']['Tables']['tezgah_tip']['Row']>;
      };

      tezgah_alt_kategori: {
        Row: {
          alt_kategori_id: number;
          tip_id: number;
          kod: string;
          ad: string;
          ad_en: string | null;
          aciklama: string | null;
          sira: number;
          aktif: boolean;
          olusturulma_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['tezgah_alt_kategori']['Row']> & { tip_id: number; kod: string; ad: string };
        Update: Partial<Database['public']['Tables']['tezgah_alt_kategori']['Row']>;
      };

      tezgah_eksen_secenek: {
        Row: {
          eksen_id: number;
          alt_kategori_id: number;
          ad: string;
          ad_en: string | null;
          eksen_sayisi: number | null;
          sira: number;
          aktif: boolean;
        };
        Insert: Partial<Database['public']['Tables']['tezgah_eksen_secenek']['Row']> & { alt_kategori_id: number; ad: string };
        Update: Partial<Database['public']['Tables']['tezgah_eksen_secenek']['Row']>;
      };

      tezgah_marka: {
        Row: {
          marka_id: number;
          ad: string;
          ulke: string | null;
          premium: boolean;
          manuel_eklenmis: boolean;
          aktif: boolean;
          olusturulma_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['tezgah_marka']['Row']> & { ad: string };
        Update: Partial<Database['public']['Tables']['tezgah_marka']['Row']>;
      };

      tezgah_marka_tip: {
        Row: {
          marka_tip_id: number;
          marka_id: number;
          tip_id: number;
        };
        Insert: Partial<Database['public']['Tables']['tezgah_marka_tip']['Row']> & { marka_id: number; tip_id: number };
        Update: Partial<Database['public']['Tables']['tezgah_marka_tip']['Row']>;
      };

      kontrol_sistemi: {
        Row: {
          kontrol_sistemi_id: number;
          ad: string;
          uretici: string | null;
          aciklama: string | null;
          aktif: boolean;
        };
        Insert: Partial<Database['public']['Tables']['kontrol_sistemi']['Row']> & { ad: string };
        Update: Partial<Database['public']['Tables']['kontrol_sistemi']['Row']>;
      };

      marka_onay_kuyrugu: {
        Row: {
          onay_id: string;
          teklif_edilen_ad: string;
          tip_id: number | null;
          teklif_eden_firma_id: string | null;
          durum: MarkaOnayDurum;
          karar_veren_admin_id: string | null;
          karar_tarihi: string | null;
          red_nedeni: string | null;
          yeni_marka_id: number | null;
          olusturulma_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['marka_onay_kuyrugu']['Row']> & { teklif_edilen_ad: string };
        Update: Partial<Database['public']['Tables']['marka_onay_kuyrugu']['Row']>;
      };

      // ─── BÖLÜM G: AUTH & GÜVENLİK ────────────────────────────
      sifre_sifirlama_token: {
        Row: {
          token_id: string;
          token_hash: string;
          kullanici_tip: KullaniciTip;
          kullanici_id: string;
          email: string;
          ip_adresi: string | null;
          user_agent: string | null;
          olusturulma_tarihi: string;
          bitis_tarihi: string;
          kullanildi: boolean;
          kullanilma_tarihi: string | null;
        };
        Insert: Partial<Database['public']['Tables']['sifre_sifirlama_token']['Row']> & {
          token_hash: string; kullanici_tip: KullaniciTip; kullanici_id: string; email: string; bitis_tarihi: string;
        };
        Update: Partial<Database['public']['Tables']['sifre_sifirlama_token']['Row']>;
      };

      email_dogrulama_token: {
        Row: {
          token_id: string;
          token_hash: string;
          kullanici_tip: KullaniciTip;
          kullanici_id: string;
          email: string;
          olusturulma_tarihi: string;
          bitis_tarihi: string;
          dogrulandi: boolean;
          dogrulanma_tarihi: string | null;
        };
        Insert: Partial<Database['public']['Tables']['email_dogrulama_token']['Row']> & {
          token_hash: string; kullanici_tip: KullaniciTip; kullanici_id: string; email: string; bitis_tarihi: string;
        };
        Update: Partial<Database['public']['Tables']['email_dogrulama_token']['Row']>;
      };

      oturum: {
        Row: {
          oturum_id: string;
          kullanici_tip: KullaniciTip;
          kullanici_id: string;
          refresh_token_hash: string | null;
          cihaz_bilgisi: Json | null;
          ip_adresi: string | null;
          konum: string | null;
          beni_hatirla: boolean;
          olusturulma_tarihi: string;
          son_kullanma: string;
          bitis_tarihi: string;
          iptal_tarihi: string | null;
        };
        Insert: Partial<Database['public']['Tables']['oturum']['Row']> & {
          kullanici_tip: KullaniciTip; kullanici_id: string; bitis_tarihi: string;
        };
        Update: Partial<Database['public']['Tables']['oturum']['Row']>;
      };

      // ─── BÖLÜM H: UX ─────────────────────────────────────────
      favori: {
        Row: {
          favori_id: string;
          alici_id: string;
          firma_id: string;
          notlar: string | null;
          eklenme_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['favori']['Row']> & { alici_id: string; firma_id: string };
        Update: Partial<Database['public']['Tables']['favori']['Row']>;
      };

      bildirim: {
        Row: {
          bildirim_id: string;
          alici_tip: KullaniciTip;
          alici_id: string;
          tip: BildirimTip;
          baslik: string;
          icerik: string | null;
          link: string | null;
          ref_tablo: string | null;
          ref_id: string | null;
          okundu: boolean;
          okunma_tarihi: string | null;
          email_gonderildi: boolean;
          email_gonderilme_tarihi: string | null;
          olusturulma_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['bildirim']['Row']> & {
          alici_tip: KullaniciTip; alici_id: string; tip: BildirimTip; baslik: string;
        };
        Update: Partial<Database['public']['Tables']['bildirim']['Row']>;
      };

      audit_log: {
        Row: {
          log_id: number;
          admin_id: string | null;
          olay_tipi: AuditOlay;
          hedef_tablo: string;
          hedef_id: string;
          eski_deger: Json | null;
          yeni_deger: Json | null;
          aciklama: string | null;
          ip_adresi: string | null;
          user_agent: string | null;
          olusturulma_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['audit_log']['Row']> & {
          olay_tipi: AuditOlay; hedef_tablo: string; hedef_id: string;
        };
        Update: Partial<Database['public']['Tables']['audit_log']['Row']>;
      };

      referans_programi: {
        Row: {
          referans_id: string;
          davet_eden_firma_id: string;
          davet_edilen_firma_id: string | null;
          referans_kodu: string;
          davet_email: string | null;
          durum: ReferansDurum;
          odul_tipi: ReferansOdul;
          odul_verildi_mi: boolean;
          odul_tarihi: string | null;
          kayit_tarihi: string | null;
          abone_olma_tarihi: string | null;
          olusturulma_tarihi: string;
        };
        Insert: Partial<Database['public']['Tables']['referans_programi']['Row']> & {
          davet_eden_firma_id: string; referans_kodu: string;
        };
        Update: Partial<Database['public']['Tables']['referans_programi']['Row']>;
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      current_firma_id: { Args: Record<string, never>; Returns: string | null };
      current_alici_id: { Args: Record<string, never>; Returns: string | null };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_firma_admin: { Args: { p_firma_id: string }; Returns: boolean };
      hesapla_profil_doluluk: { Args: { p_firma_id: string }; Returns: number };
    };

    Enums: {
      firma_durum: FirmaDurum;
      firma_mevcut_durum: FirmaMevcutDurum;
      kullanici_rol: KullaniciRol;
      tezgah_durum: TezgahDurum;
      alici_aciliyet: AliciAciliyet;
      rfq_durum: RfqDurum;
      rfq_firma_sayisi: RfqFirmaSayisi;
      rfq_firma_durum: RfqFirmaDurum;
      teklif_durum: TeklifDurum;
      kullanici_tip: KullaniciTip;
      konusma_durum: KonusmaDurum;
      nda_durum: NdaDurum;
      abonelik_plan: AbonelikPlan;
      abonelik_faturalandirma: AbonelikFaturalandirma;
      odeme_durum: OdemeDurum;
      odeme_yontem: OdemeYontem;
      gorsel_tip: GorselTip;
      marka_onay_durum: MarkaOnayDurum;
      bildirim_tip: BildirimTip;
      audit_olay: AuditOlay;
      referans_durum: ReferansDurum;
      referans_odul: ReferansOdul;
    };
  };
}

// =====================================================================
// Yardımcı tipler (Supabase resmi pattern'i)
// =====================================================================
type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update'];
export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];

// =====================================================================
// END database.types.ts
// =====================================================================
