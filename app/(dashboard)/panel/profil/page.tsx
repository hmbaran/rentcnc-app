import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { firmaBilgileriniGetir } from "@/lib/actions/firma";
import SektorSecim from "./SektorSecim";
import FirmaBilgileriForm from "./FirmaBilgileriForm";
import SertifikaYonetim from "./SertifikaYonetim";
import GorselYonetim from "./GorselYonetim";
import YetenekYonetim from "./YetenekYonetim";
import MalzemeYonetim from "./MalzemeYonetim";
import KapasiteYonetim from "./KapasiteYonetim";

export default async function ProfilPage() {
  // Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Firma ID
  let firmaId: string | null = null;
  if (user?.email) {
    const { data: kul } = await supabaseAdmin
      .from("kullanici").select("firma_id").eq("email", user.email).single();
    firmaId = kul?.firma_id ?? null;
  }

  // Mevcut sektörler
  let seciliSektorIds: number[] = [];
  if (firmaId) {
    const { data: fs } = await supabaseAdmin
      .from("firma_sektor").select("sektor_id").eq("firma_id", firmaId);
    seciliSektorIds = (fs ?? []).map((r) => r.sektor_id as number);
  }

  // Tüm sektörler
  const { data: tumSektorler } = await supabaseAdmin
    .from("sektor").select("sektor_id, kod, ad, kategori, ikon, sira")
    .eq("aktif", true).order("sira");

  // Firma bilgileri
  const firma = await firmaBilgileriniGetir();

  // Sertifikalar
  let sertifikalar: { sertifika_id: string; sertifika_adi: string; gecerlilik_bitis: string | null; dogrulandi: boolean }[] = [];
  if (firmaId) {
    const { data } = await supabaseAdmin
      .from("sertifika")
      .select("sertifika_id, sertifika_adi, gecerlilik_bitis, dogrulandi")
      .eq("firma_id", firmaId)
      .order("olusturulma_tarihi", { ascending: false });
    sertifikalar = data ?? [];
  }

  // Tesis Görselleri
  let gorseller: { gorsel_id: string; url: string; baslik: string | null }[] = [];
  if (firmaId) {
    const { data } = await supabaseAdmin
      .from("gorsel")
      .select("gorsel_id, url, baslik")
      .eq("firma_id", firmaId)
      .order("sira");
    gorseller = data ?? [];
  }

  // Yetenekler
  let yetenekler: { yetenek_id: string; kategori: string | null; deger: string }[] = [];
  if (firmaId) {
    const { data } = await supabaseAdmin
      .from("yetenek")
      .select("yetenek_id, kategori, deger")
      .eq("firma_id", firmaId)
      .order("olusturulma_tarihi");
    yetenekler = data ?? [];
  }

  // Malzemeler
  let malzemeler: { malzeme_id: string; malzeme_adi: string }[] = [];
  if (firmaId) {
    const { data } = await supabaseAdmin
      .from("malzeme")
      .select("malzeme_id, malzeme_adi")
      .eq("firma_id", firmaId)
      .order("olusturulma_tarihi");
    malzemeler = data ?? [];
  }

  // Kapasite
  let kapasite = null;
  if (firmaId) {
    const { data } = await supabaseAdmin
      .from("kapasite")
      .select("*")
      .eq("firma_id", firmaId)
      .single();
    kapasite = data ?? null;
  }

  return (
    <div>
      {/* Başlık */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/panel" className="text-[11px] text-[#5B6770] hover:text-[#003057] tracking-[0.5px] no-underline transition-colors">
          ← Dashboard
        </Link>
        <span className="text-[#D4D8DC] text-[11px]">/</span>
        <span className="text-[11px] text-[#003057] font-medium tracking-[0.5px]">Firma Profili</span>
      </div>

      <div className="flex items-center gap-[10px] mb-5">
        <div className="w-7 h-7 rounded-full bg-[#003057] text-white flex items-center justify-center text-[11px] font-semibold">◉</div>
        <div>
          <div className="text-[14px] font-medium text-[#003057]">Firma Profili</div>
          <div className="text-[11px] text-[#8A98A8] mt-[1px]">Alıcılara gösterilecek firma bilgilerinizi tamamlayın</div>
        </div>
      </div>

      {/* 1. Firma Bilgileri */}
      <FirmaBilgileriForm firma={firma as Record<string, unknown> | null} />

      {/* 2. Sektör Deneyimi */}
      <SektorSecim
        tumSektorler={(tumSektorler ?? []) as { sektor_id: number; kod: string; ad: string; kategori: string; ikon: string }[]}
        seciliIds={seciliSektorIds}
      />

      {/* 3. Sertifikalar */}
      <SertifikaYonetim mevcutlar={sertifikalar} />

      {/* 4. Yetenekler */}
      <YetenekYonetim mevcutlar={yetenekler} />

      {/* 5. İşlenen Malzemeler */}
      <MalzemeYonetim mevcutlar={malzemeler} />

      {/* 6. Kapasite & Ticari Bilgiler */}
      <KapasiteYonetim mevcut={kapasite} />

      {/* 7. Tesis Görselleri */}
      {firmaId && (
        <GorselYonetim firmaId={firmaId} mevcutlar={gorseller} />
      )}
    </div>
  );
}
