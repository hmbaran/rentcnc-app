"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type FirmaBilgileriInput = {
  ticariUnvan:    string;
  il:             string;
  ilce:           string;
  adres:          string;
  telefon:        string;   // İş/Ofis
  telefonGsm:     string;   // Cep
  email:          string;
  website:        string;
  kurulusYili:    string;
  calisanAralik:  string;
  hakkinda:       string;
  irtibat2Ad:        string;   // 2. yetkili kişi adı
  irtibat2Email:     string;   // 2. yetkili kişi e-posta
  irtibat2Telefon:   string;   // 2. yetkili kişi telefon
  irtibat2TelTip:    string;   // cep | is | ofis
};

async function getFirmaId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const { data } = await supabaseAdmin
    .from("kullanici").select("firma_id").eq("email", user.email).single();
  return data?.firma_id ?? null;
}

export async function firmaBilgileriniGetir() {
  const firmaId = await getFirmaId();
  if (!firmaId) return null;
  const { data } = await supabaseAdmin
    .from("firma")
    .select("firma_id, vergi_no, ticari_unvan, il, ilce, adres, telefon, telefon_gsm, email, website, kurulus_yili, calisan_aralik, hakkinda, irtibat_2_ad, irtibat_2_email, irtibat_2_telefon, irtibat_2_tel_tip")
    .eq("firma_id", firmaId)
    .single();
  return data;
}

// ── Arama sayfası için firma listesi ────────────────────────────────────────
export async function firmalariListele() {
  const { data: firmalar } = await supabaseAdmin
    .from("firma")
    .select("firma_id, ticari_unvan, il, ilce, kurulus_yili, calisan_aralik, dogrulanmis_rozet, profil_doluluk, mevcut_durum")
    .eq("durum", "yayinda")
    .order("profil_doluluk", { ascending: false });

  if (!firmalar || firmalar.length === 0) return [];

  const ids = firmalar.map((f) => f.firma_id);

  const [
    { data: tezgahlar },
    { data: sertifikalar },
    { data: yetenekler },
    { data: degerlendirmeler },
  ] = await Promise.all([
    supabaseAdmin
      .from("tezgah")
      .select("firma_id, eksen_ozellik, bag_x_mm, tezgah_tip(ad, kod), tezgah_alt_kategori(ad)")
      .in("firma_id", ids),
    supabaseAdmin
      .from("sertifika")
      .select("firma_id, sertifika_adi")
      .in("firma_id", ids),
    supabaseAdmin
      .from("yetenek")
      .select("firma_id, kategori, deger")
      .in("firma_id", ids),
    supabaseAdmin
      .from("degerlendirme")
      .select("firma_id, puan")
      .in("firma_id", ids)
      .eq("yayinda", true),
  ]);

  return firmalar.map((f) => {
    const ft = (tezgahlar ?? []).filter((t) => t.firma_id === f.firma_id);
    const fs = (sertifikalar ?? []).filter((s) => s.firma_id === f.firma_id);
    const fy = (yetenekler ?? []).filter((y) => y.firma_id === f.firma_id);
    const fd = (degerlendirmeler ?? []).filter((d) => d.firma_id === f.firma_id);
    const puan = fd.length ? fd.reduce((s, d) => s + d.puan, 0) / fd.length : null;

    const tipAdlari = [...new Set(
      ft.flatMap((t) => {
        const tip = Array.isArray(t.tezgah_tip) ? t.tezgah_tip[0] : t.tezgah_tip;
        const alt = Array.isArray(t.tezgah_alt_kategori) ? t.tezgah_alt_kategori[0] : t.tezgah_alt_kategori;
        return [tip?.ad, alt?.ad].filter(Boolean);
      })
    )];

    const eksenler = [...new Set(ft.map((t) => t.eksen_ozellik).filter(Boolean))];
    const bagXMax = ft.length ? Math.max(...ft.map((t) => t.bag_x_mm ?? 0)) : 0;
    const sertAdi = fs.map((s) => s.sertifika_adi);
    const malzemeler = fy.filter((y) => y.kategori === "Malzeme").map((y) => y.deger);
    const sektorler = fy.filter((y) => y.kategori === "Sektör").map((y) => y.deger);

    return {
      ...f,
      tezgahSayisi: ft.length,
      tipAdlari,
      eksenler,
      bagXMax,
      sertAdi,
      malzemeler,
      sektorler,
      puan: puan ? Number(puan.toFixed(1)) : null,
      degerlendirmeSayisi: fd.length,
    };
  });
}

export type FirmaListeItem = Awaited<ReturnType<typeof firmalariListele>>[number];

// ── Herkese açık firma profili ──────────────────────────────────────────────
export async function firmaProfilGetir(firmaId: string) {
  const { data: firma, error } = await supabaseAdmin
    .from("firma")
    .select(`
      firma_id, ticari_unvan, il, ilce, adres, telefon, email, website,
      kurulus_yili, calisan_aralik, hakkinda, durum,
      dogrulanmis_rozet, mevcut_durum, profil_doluluk,
      ort_yanit_suresi_saat, son_aktif
    `)
    .eq("firma_id", firmaId)
    .eq("durum", "yayinda")
    .single();

  if (error || !firma) return null;

  const [
    { data: tezgahlar },
    { data: sertifikalar },
    { data: yetenekler },
    { data: malzemeler },
    { data: kapasite },
    { data: gorseller },
    { data: degerlendirmeler },
    { count: tezgahSayisi },
    { data: referansParcalar },
  ] = await Promise.all([
    supabaseAdmin
      .from("tezgah")
      .select(`
        tezgah_id, eksen_ozellik, model, durum, bag_x_mm, bag_y_mm, bag_z_mm, max_rpm, yapim_yili, notlar, parametreler,
        tezgah_tip(ad), tezgah_alt_kategori(ad), tezgah_marka(ad)
      `)
      .eq("firma_id", firmaId)
      .order("ekleme_tarihi", { ascending: false }),
    supabaseAdmin
      .from("sertifika")
      .select("sertifika_id, sertifika_adi, gecerlilik_bitis, dogrulandi")
      .eq("firma_id", firmaId),
    supabaseAdmin
      .from("yetenek")
      .select("yetenek_id, kategori, deger")
      .eq("firma_id", firmaId),
    supabaseAdmin
      .from("malzeme")
      .select("malzeme_id, malzeme_adi")
      .eq("firma_id", firmaId),
    supabaseAdmin
      .from("kapasite")
      .select("*")
      .eq("firma_id", firmaId)
      .maybeSingle(),
    supabaseAdmin
      .from("gorsel")
      .select("gorsel_id, url, baslik, tip, sira")
      .eq("firma_id", firmaId)
      .order("sira")
      .limit(10),
    supabaseAdmin
      .from("degerlendirme")
      .select("degerlendirme_id, puan, yorum, cevap, cevap_tarihi, dogrulanmis_is, olusturulma_tarihi")
      .eq("firma_id", firmaId)
      .eq("yayinda", true)
      .order("olusturulma_tarihi", { ascending: false })
      .limit(10),
    supabaseAdmin
      .from("tezgah")
      .select("*", { count: "exact", head: true })
      .eq("firma_id", firmaId),
    supabaseAdmin
      .from("referans_parca")
      .select("parca_id, baslik, aciklama, malzeme, islem_turu, gorsel_url, sira")
      .eq("firma_id", firmaId)
      .order("sira")
      .limit(12),
  ]);

  const puanOrtalama =
    degerlendirmeler && degerlendirmeler.length > 0
      ? (
          degerlendirmeler.reduce((t: number, d: { puan: number }) => t + d.puan, 0) /
          degerlendirmeler.length
        ).toFixed(1)
      : null;

  return {
    firma,
    tezgahlar: tezgahlar ?? [],
    sertifikalar: sertifikalar ?? [],
    yetenekler: yetenekler ?? [],
    malzemeler: malzemeler ?? [],
    kapasite: kapasite ?? null,
    gorseller: gorseller ?? [],
    degerlendirmeler: degerlendirmeler ?? [],
    referansParcalar: referansParcalar ?? [],
    tezgahSayisi: tezgahSayisi ?? 0,
    puanOrtalama,
    degerlendirmeSayisi: degerlendirmeler?.length ?? 0,
  };
}

// ── Benzer firmalar ──────────────────────────────────────────────────────────
export async function benzerFirmalariGetir(firmaId: string, il: string | null) {
  const query = supabaseAdmin
    .from("firma")
    .select("firma_id, ticari_unvan, il, ilce, dogrulanmis_rozet")
    .eq("durum", "yayinda")
    .neq("firma_id", firmaId)
    .limit(4);

  if (il) query.eq("il", il);

  const { data } = await query;
  return data ?? [];
}

export async function firmaBilgileriGuncelle(
  input: FirmaBilgileriInput
): Promise<{ hata: string } | { basari: true }> {
  const firmaId = await getFirmaId();
  if (!firmaId) return { hata: "Oturum bulunamadı." };

  const { error } = await supabaseAdmin.from("firma").update({
    ticari_unvan:     input.ticariUnvan   || undefined,
    il:               input.il            || null,
    ilce:             input.ilce          || null,
    adres:            input.adres         || null,
    telefon:          input.telefon       || null,
    telefon_gsm:      input.telefonGsm    || null,
    email:            input.email         || null,
    website:          input.website       || null,
    kurulus_yili:     input.kurulusYili   ? parseInt(input.kurulusYili) : null,
    calisan_aralik:   input.calisanAralik || null,
    hakkinda:         input.hakkinda      || null,
    irtibat_2_ad:       input.irtibat2Ad       || null,
    irtibat_2_email:    input.irtibat2Email    || null,
    irtibat_2_telefon:  input.irtibat2Telefon  || null,
    irtibat_2_tel_tip:  input.irtibat2TelTip   || null,
  }).eq("firma_id", firmaId);

  if (error) return { hata: error.message };
  return { basari: true };
}

export type RfqEslesmeFirma = {
  firma_id: string;
  ticari_unvan: string;
  il: string | null;
  tezgah_sayisi: number;
  eslesen_tezgahlar: string[];
  sertifikalar: string[];
  dogrulanmis_rozet: boolean;
};

export type RfqKriter = {
  altKategoriIdler: number[];   // seçilen tezgah alt kategorileri
  malzemeler: string[];         // seçilen malzemeler
  sertifikalar: string[];       // seçilen sertifikalar
  il?: string;                  // şehir filtresi
};

export async function rfqEslesmeFirmalariGetir(
  kriter: RfqKriter
): Promise<RfqEslesmeFirma[]> {
  // 1. Tezgah alt kategorilerine göre firma_id listesi
  let firmaIdler: string[] = [];

  if (kriter.altKategoriIdler.length > 0) {
    const { data: tezgahlar } = await supabaseAdmin
      .from("tezgah")
      .select("firma_id, alt_kategori_id, tezgah_alt_kategori(ad)")
      .in("alt_kategori_id", kriter.altKategoriIdler);

    const idSet = new Set<string>();
    for (const t of tezgahlar ?? []) idSet.add(t.firma_id);
    firmaIdler = Array.from(idSet);
  }

  // 2. Firma sorgusu
  let query = supabaseAdmin
    .from("firma")
    .select("firma_id, ticari_unvan, il, dogrulanmis_rozet")
    .eq("durum", "yayinda");

  if (firmaIdler.length > 0) {
    query = query.in("firma_id", firmaIdler);
  }
  if (kriter.il) {
    query = query.eq("il", kriter.il);
  }

  const { data: firmalar } = await query.limit(30);
  if (!firmalar || firmalar.length === 0) return [];

  const sonucFirmaIdler = firmalar.map((f) => f.firma_id);

  // 3. Her firma için tezgah, sertifika, malzeme çek
  const [{ data: tezgahlarDetay }, { data: sertifikalarDetay }, { data: malzemelerDetay }] = await Promise.all([
    supabaseAdmin
      .from("tezgah")
      .select("firma_id, tezgah_alt_kategori(ad)")
      .in("firma_id", sonucFirmaIdler),
    supabaseAdmin
      .from("sertifika")
      .select("firma_id, sertifika_adi")
      .in("firma_id", sonucFirmaIdler),
    supabaseAdmin
      .from("malzeme")
      .select("firma_id, malzeme_adi")
      .in("firma_id", sonucFirmaIdler),
  ]);

  // Malzeme filtresi (seçildiyse)
  const malzemeFiltreli = kriter.malzemeler.length > 0
    ? new Set(
        (malzemelerDetay ?? [])
          .filter((m) =>
            kriter.malzemeler.some((k) =>
              m.malzeme_adi.toLowerCase().includes(k.toLowerCase())
            )
          )
          .map((m) => m.firma_id)
      )
    : null;

  // Sertifika filtresi (seçildiyse)
  const sertifikaFiltreli = kriter.sertifikalar.length > 0
    ? new Set(
        (sertifikalarDetay ?? [])
          .filter((s) =>
            kriter.sertifikalar.some((k) =>
              s.sertifika_adi.toLowerCase().includes(k.toLowerCase())
            )
          )
          .map((s) => s.firma_id)
      )
    : null;

  const sonuclar: RfqEslesmeFirma[] = [];

  for (const f of firmalar) {
    if (malzemeFiltreli && !malzemeFiltreli.has(f.firma_id)) continue;
    if (sertifikaFiltreli && !sertifikaFiltreli.has(f.firma_id)) continue;

    const firmaTezgahlar = (tezgahlarDetay ?? []).filter((t) => t.firma_id === f.firma_id);
    const eslesenTezgahlar = firmaTezgahlar
      .map((t) => (t.tezgah_alt_kategori as unknown as { ad: string } | null)?.ad ?? "")
      .filter(Boolean);

    const firmaSertifikalar = (sertifikalarDetay ?? [])
      .filter((s) => s.firma_id === f.firma_id)
      .map((s) => s.sertifika_adi);

    sonuclar.push({
      firma_id: f.firma_id,
      ticari_unvan: f.ticari_unvan,
      il: f.il,
      tezgah_sayisi: firmaTezgahlar.length,
      eslesen_tezgahlar: [...new Set(eslesenTezgahlar)].slice(0, 6),
      sertifikalar: firmaSertifikalar.slice(0, 5),
      dogrulanmis_rozet: f.dogrulanmis_rozet,
    });
  }

  return sonuclar;
}
