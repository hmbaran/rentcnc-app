"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { rfqBildirimiGonder } from "@/lib/email";

export type RFQOlusturInput = {
  baslik: string;
  aciklama: string;
  tezgahTipleri: string[];   // görünen ad listesi (alt kategori adları)
  malzemeler: string[];
  tolerans: string;
  yuzeyPuruzlulugu: string;
  sertifikaGereksinimleri: string[];
  adet?: number;
  termin: string;
  butceAraligi: string;
  sehirBolge: string;
  cevapSonTarihi: string;
  iletisimTercihi: string[];
  ndaRequest: boolean;
  hedefFirmaId?: string;
  // Yeni: kullanıcının seçtiği firma ID listesi
  secilenFirmaIdler?: string[];
};

function rfqIdUret(): string {
  const yil = new Date().getFullYear();
  const sayi = String(Math.floor(Math.random() * 9000) + 1000);
  return `RFQ-${yil}-${sayi}`;
}

export async function rfqOlustur(
  input: RFQOlusturInput
): Promise<{ hata: string } | { basari: true; rfqId: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { hata: "Teklif isteği göndermek için giriş yapmalısınız." };
  if (user.user_metadata?.tip !== "alici") {
    return { hata: "RFQ sadece alıcı hesaplarından gönderilebilir." };
  }

  const { data: alici } = await supabaseAdmin
    .from("alici")
    .select("alici_id")
    .eq("email", user.email!)
    .single();

  if (!alici) return { hata: "Alıcı hesabı bulunamadı. Lütfen tekrar giriş yapın." };

  // Çakışma ihtimaline karşı 3 deneme
  let rfqId = rfqIdUret();
  for (let i = 0; i < 3; i++) {
    const { data: var_ } = await supabaseAdmin
      .from("rfq").select("rfq_id").eq("rfq_id", rfqId).maybeSingle();
    if (!var_) break;
    rfqId = rfqIdUret();
  }

  const cevapSon = input.cevapSonTarihi
    ? input.cevapSonTarihi
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { error } = await supabaseAdmin.from("rfq").insert({
    rfq_id:                   rfqId,
    alici_id:                 alici.alici_id,
    hedef_firma_id:           input.hedefFirmaId || null,
    baslik:                   input.baslik,
    aciklama:                 input.aciklama,
    tezgah_tipleri:           input.tezgahTipleri,
    malzemeler:               input.malzemeler,
    tolerans:                 input.tolerans || null,
    yuzey_puruzlulugu:        input.yuzeyPuruzlulugu || null,
    sertifika_gereksinimleri: input.sertifikaGereksinimleri,
    adet:                     (input.adet ?? 0) > 0 ? input.adet : null,
    termin:                   input.termin || null,
    butce_araligi:            input.butceAraligi || null,
    sehir_bolge:              input.sehirBolge || null,
    firma_sayisi:             "sadece_hedef",
    cevap_son_tarihi:         cevapSon,
    iletisim_tercihi:         input.iletisimTercihi,
    nda_request:              input.ndaRequest,
    durum:                    "aktif",
  });

  if (error) return { hata: "RFQ kaydedilemedi: " + error.message };

  // rfq_firma eşleşmesi — kullanıcının seçtiği firmalar
  const firmaIdler = input.secilenFirmaIdler?.length
    ? input.secilenFirmaIdler
    : input.hedefFirmaId
    ? [input.hedefFirmaId]
    : [];

  if (firmaIdler.length > 0) {
    const kayitlar = firmaIdler.map((fId) => ({
      rfq_id: rfqId,
      firma_id: fId,
      durum: "gonderildi" as const,
    }));
    await supabaseAdmin.from("rfq_firma").insert(kayitlar);

    // Her firmaya email bildirimi gönder (hata olsa bile RFQ başarılı sayılır)
    const { data: firmaBilgileri } = await supabaseAdmin
      .from("firma")
      .select("firma_id, ticari_unvan, email")
      .in("firma_id", firmaIdler);

    // Alıcı adını al
    const { data: aliciBilgi } = await supabaseAdmin
      .from("alici")
      .select("ad_soyad")
      .eq("alici_id", alici.alici_id)
      .single();

    for (const firma of firmaBilgileri ?? []) {
      if (!firma.email) continue;
      await rfqBildirimiGonder({
        fasoncuEmail: firma.email,
        fasoncuAd:    firma.ticari_unvan,
        firmaAdi:     firma.ticari_unvan,
        rfqBaslik:    input.baslik,
        rfqId,
        aliciAdi:     aliciBilgi?.ad_soyad ?? undefined,
      }).catch(() => {}); // email hatası RFQ'yu engellesin
    }
  }

  return { basari: true, rfqId };
}

