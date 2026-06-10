import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { tezgahDolulukHesapla } from "@/lib/utils/doluluk";

const HIZLI_YAKIN = [
  { icon: "⚙", label: "Referans Parçalar", href: "/panel/referans-parcalar" },
  { icon: "👤", label: "Profili Düzenle", href: "/panel/profil" },
  { icon: "📋", label: "Gelen RFQ'lar", href: "/panel/rfq" },
];

const DURUM_LABEL: Record<string, { txt: string; cls: string }> = {
  aktif_tam_kapasite: { txt: "Aktif",        cls: "bg-[#E8F5EE] text-[#1A7A4A]" },
  kismen_musait:      { txt: "Kısmen Müsait", cls: "bg-[#FEF8E6] text-[#B07A00]" },
  bakimda:            { txt: "Bakımda",       cls: "bg-[#FEF0E6] text-[#C05C00]" },
  satildi_kapali:     { txt: "Kapalı",        cls: "bg-[#F4F6F8] text-[#8B97A4]" },
};

export default async function PanelPage() {
  // 1. Oturumu al
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Firma ID'sini bul
  let firmaId: string | null = null;
  if (user?.email) {
    const { data: kul } = await supabaseAdmin
      .from("kullanici")
      .select("firma_id")
      .eq("email", user.email)
      .single();
    firmaId = kul?.firma_id ?? null;
  }

  // 3. Tezgahları çek (max 5 — dashboard önizlemesi)
  type TezgahRow = {
    tezgah_id: string;
    durum: string;
    model: string | null;
    bag_x_mm: number | null;
    bag_y_mm: number | null;
    bag_z_mm: number | null;
    max_rpm: number | null;
    yapim_yili: number | null;
    tezgah_tip: { ad: string } | null;
    tezgah_marka: { ad: string } | null;
  };

  let tezgahlar: TezgahRow[] = [];
  if (firmaId) {
    const { data } = await supabaseAdmin
      .from("tezgah")
      .select(`
        tezgah_id, durum, model, bag_x_mm, bag_y_mm, bag_z_mm, max_rpm, yapim_yili,
        tezgah_tip ( ad ),
        tezgah_marka ( ad )
      `)
      .eq("firma_id", firmaId)
      .order("ekleme_tarihi", { ascending: false })
      .limit(5);
    tezgahlar = (data as unknown as TezgahRow[]) ?? [];
  }

  const tezgahSayisi = tezgahlar.length;

  // Genel profil doluluk hesabı
  const tezgahDolulukOrtalama = tezgahSayisi === 0 ? 0 : Math.round(
    tezgahlar.reduce((toplam, t) => {
      const { yuzde } = tezgahDolulukHesapla({
        model: t.model, bag_x_mm: t.bag_x_mm, bag_y_mm: t.bag_y_mm,
        bag_z_mm: t.bag_z_mm, max_rpm: t.max_rpm, yapim_yili: t.yapim_yili,
        kontrol_sistemi: (t.tezgah_marka as { ad?: string } | null)?.ad
          ? null : null,
      });
      return toplam + yuzde;
    }, 0) / tezgahSayisi
  );
  // Temel profil puanı: tezgah varsa +20, tezgah doluluk ortalaması * 0.6 + sektör varsa +20
  const profilYuzde = Math.min(100, (tezgahSayisi > 0 ? 20 : 0) +
    Math.round(tezgahDolulukOrtalama * 0.6) +
    20 // sektör eklenmiş sayıyoruz (sonra dinamik hale gelir)
  );

  return (
    <div>
      {/* Hoş geldiniz banner */}
      <div className="bg-gradient-to-r from-[#003057] to-[#1A3A5C] text-white px-[22px] py-[18px] rounded-[2px] mb-[18px] flex flex-wrap justify-between items-center gap-5">
        <div>
          <h1 className="text-[18px] font-light tracking-[0.2px] mb-1">Hoş geldiniz! 👋</h1>
          <p className="text-[11.5px] text-white/70 tracking-[0.2px]">
            Profilinizi tamamlayın ve alıcılara görünür olmaya başlayın.
          </p>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-4 gap-3 mb-[18px]">
        {[
          { lbl: "Gelen RFQ (30 gün)", icon: "▸", val: "—",  delta: "Faz 2'de aktif",        renk: "text-[#8B97A4]" },
          { lbl: "Profil Görüntüleme", icon: "◉", val: "—",  delta: "Faz 2'de aktif",        renk: "text-[#8B97A4]" },
          { lbl: "Aktif Mesaj",        icon: "✉", val: "—",  delta: "Faz 2'de aktif",        renk: "text-[#8B97A4]" },
          { lbl: "Kayıtlı Tezgah",    icon: "▦", val: String(tezgahSayisi),
            delta: tezgahSayisi > 0 ? "Tezgah parkını gör →" : "Tezgah ekleyin",
            renk: tezgahSayisi > 0 ? "text-[#1A7A4A]" : "text-[#8B97A4]",
            href: "/panel/tezgahlar" },
        ].map((s) => (
          <div key={s.lbl} className="bg-white border border-[#D4D8DC] rounded-[2px] px-4 py-[14px]">
            <div className="flex justify-between items-start mb-[6px]">
              <span className="text-[9.5px] text-[#5B6770] tracking-[1.5px] uppercase font-semibold leading-[1.3]">{s.lbl}</span>
              <span className="w-[22px] h-[22px] bg-[#F0F7FF] text-[#003057] rounded-[2px] flex items-center justify-center text-[11px] font-bold flex-shrink-0 ml-1">{s.icon}</span>
            </div>
            <div className="text-[26px] font-light text-[#003057] tracking-[-0.5px] leading-[1.1]">{s.val}</div>
            {"href" in s && s.href && tezgahSayisi > 0
              ? <Link href={s.href} className={`text-[10px] mt-[5px] tracking-[0.2px] no-underline ${s.renk}`}>{s.delta}</Link>
              : <div className={`text-[10px] mt-[5px] tracking-[0.2px] ${s.renk}`}>{s.delta}</div>
            }
          </div>
        ))}
      </div>

      {/* Profil tamamlama */}
      <div className="bg-white border border-[#D4D8DC] rounded-[2px] border-l-[3px] border-l-[#C77700] px-[18px] py-4 mb-[18px] flex items-center gap-[18px]">
        <div className="w-[42px] h-[42px] bg-[#FEF0E6] text-[#C77700] rounded-[2px] flex items-center justify-center text-[20px] font-bold flex-shrink-0">!</div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-semibold text-[#003057] mb-[3px]">Profiliniz tamamlanmayı bekliyor</div>
          <div className="text-[11.5px] text-[#3D4E63] leading-[1.5] mb-2">
            Tezgah bilgileri, sertifikalar ve görseller eklenince profiliniz alıcılara görünür olacak.
          </div>
          <div className="h-[6px] bg-[#D4D8DC] rounded-[1px] overflow-hidden mb-[6px]">
            <div className="h-full bg-[#C77700] rounded-[1px]" style={{ width: `${profilYuzde}%` }} />
          </div>
          <div className="flex justify-between text-[10.5px] text-[#5B6770]">
            <span>Profil Doluluk Oranı</span>
            <span className="font-semibold text-[#C77700]">%{profilYuzde} — Onay Bekliyor</span>
          </div>
        </div>
      </div>

      {/* 2 kolonlu grid */}
      <div className="grid grid-cols-[2fr_1fr] gap-[18px] mb-[18px]">
        {/* Sol: RFQ boş durum */}
        <div className="bg-white border border-[#D4D8DC] rounded-[2px]">
          <div className="px-[18px] py-[14px] border-b border-[#D4D8DC]">
            <span className="text-[11px] font-semibold text-[#003057] tracking-[1.5px] uppercase">Son RFQ Talepleri</span>
          </div>
          <div className="px-[18px] py-[44px] text-center">
            <div className="text-[28px] mb-3 opacity-30">▸</div>
            <p className="text-[13px] text-[#5B6770] font-medium mb-1">Henüz gelen RFQ yok</p>
            <p className="text-[11.5px] text-[#8B97A4] leading-[1.5] max-w-[280px] mx-auto">
              Profiliniz onaylandıktan sonra Avrupa, ABD ve Asya&apos;daki alıcılardan RFQ alabilirsiniz.
            </p>
          </div>
        </div>

        {/* Sağ: Abonelik + Hızlı aksiyonlar */}
        <div>
          <div className="bg-white border border-[#D4D8DC] rounded-[2px] p-[18px] mb-[18px]">
            <div className="flex justify-between items-start mb-[14px]">
              <div>
                <div className="text-[10px] tracking-[2px] text-[#5B6770] uppercase font-semibold mb-1">Mevcut Plan</div>
                <div className="text-[18px] font-light text-[#003057] tracking-[-0.2px]">Ücretsiz</div>
              </div>
              <span className="text-[9px] px-2 py-[3px] bg-[#E8F5EE] text-[#1A7A4A] rounded-[2px] tracking-[1px] uppercase font-semibold">Aktif</span>
            </div>
            <div className="grid grid-cols-2 gap-[10px] p-3 bg-[#F4F6F8] rounded-[2px] mb-3 text-[10px] text-[#5B6770] tracking-[0.5px]">
              <div>Aylık RFQ<span className="block text-[13px] text-[#003057] font-semibold mt-[2px] tracking-0 normal-case">5 adet</span></div>
              <div>Tezgah Listesi<span className="block text-[13px] text-[#003057] font-semibold mt-[2px] tracking-0 normal-case">3 adet</span></div>
            </div>
            <span className="block w-full text-center py-[10px] text-[10px] tracking-[1.5px] uppercase bg-[#003057] text-white rounded-[2px] font-medium cursor-not-allowed opacity-60 select-none">
              Plana Yükselt (Faz 2)
            </span>
          </div>

          <div className="bg-white border border-[#D4D8DC] rounded-[2px]">
            <div className="px-[18px] py-[14px] border-b border-[#D4D8DC]">
              <span className="text-[11px] font-semibold text-[#003057] tracking-[1.5px] uppercase">Hızlı Aksiyonlar</span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-[14px]">
              <Link href="/panel/tezgah-ekle" className="p-[14px_12px] bg-white border border-[#003057] rounded-[2px] text-center no-underline hover:bg-[#F0F7FF] transition-colors">
                <div className="text-[18px] mb-[6px] text-[#003057]">+</div>
                <div className="text-[10.5px] tracking-[0.5px] text-[#003057] font-semibold uppercase leading-[1.3]">Tezgah Ekle</div>
              </Link>
              {HIZLI_YAKIN.map((a) => (
                <Link key={a.label} href={a.href} className="p-[14px_12px] bg-white border border-[#D4D8DC] rounded-[2px] text-center no-underline hover:bg-[#F0F7FF] hover:border-[#003057] transition-colors">
                  <div className="text-[18px] mb-[6px] text-[#003057]">{a.icon}</div>
                  <div className="text-[10.5px] tracking-[0.5px] text-[#003057] font-semibold uppercase leading-[1.3]">{a.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tezgah Parkı */}
      <div className="bg-white border border-[#D4D8DC] rounded-[2px]">
        <div className="px-[18px] py-[14px] border-b border-[#D4D8DC] flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#003057] tracking-[1.5px] uppercase">
            Tezgah Parkım {tezgahSayisi > 0 && <span className="ml-2 text-[10px] bg-[#003057] text-white px-[7px] py-[2px] rounded-[2px]">{tezgahSayisi}</span>}
          </span>
          {tezgahSayisi > 0 && (
            <Link href="/panel/tezgahlar" className="text-[10.5px] text-[#00529C] no-underline hover:underline">Tümünü gör →</Link>
          )}
        </div>

        {tezgahlar.length === 0 ? (
          <div className="px-[18px] py-[40px] text-center">
            <div className="text-[28px] mb-3 opacity-30">▦</div>
            <p className="text-[13px] text-[#5B6770] font-medium mb-2">Henüz tezgah eklenmedi</p>
            <Link href="/panel/tezgah-ekle" className="inline-block px-5 py-[9px] bg-[#003057] text-white text-[11px] font-medium tracking-[0.5px] uppercase rounded-[2px] no-underline hover:bg-[#004080] transition-colors">
              + İlk Tezgahı Ekle
            </Link>
          </div>
        ) : (
          <div>
            {tezgahlar.map((t, i) => {
              const tip  = (t.tezgah_tip as { ad: string } | null)?.ad ?? "—";
              const marka = (t.tezgah_marka as { ad: string } | null)?.ad ?? "—";
              const durum = DURUM_LABEL[t.durum] ?? { txt: t.durum, cls: "bg-[#F4F6F8] text-[#8B97A4]" };
              const strok = t.bag_x_mm && t.bag_y_mm
                ? `${t.bag_x_mm}×${t.bag_y_mm}${t.bag_z_mm ? `×${t.bag_z_mm}` : ""} mm`
                : null;
              return (
                <div key={t.tezgah_id} className={`px-[18px] py-[13px] flex items-center gap-4 ${i < tezgahlar.length - 1 ? "border-b border-[#EEF2F6]" : ""}`}>
                  <div className="w-[34px] h-[34px] bg-[#F0F7FF] text-[#003057] rounded-[2px] flex items-center justify-center text-[14px] font-light flex-shrink-0">
                    ▦
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#1A2535] truncate">
                      {marka} {t.model && <span className="font-normal text-[#5B6770]">— {t.model}</span>}
                    </div>
                    <div className="text-[10.5px] text-[#8B97A4] mt-[2px] flex gap-3 flex-wrap">
                      <span>{tip}</span>
                      {strok && <span>Strok: {strok}</span>}
                      {t.max_rpm && <span>{t.max_rpm.toLocaleString()} RPM</span>}
                      {t.yapim_yili && <span>{t.yapim_yili}</span>}
                    </div>
                  </div>
                  <span className={`text-[9.5px] font-semibold px-[8px] py-[3px] rounded-[2px] tracking-[0.5px] whitespace-nowrap ${durum.cls}`}>
                    {durum.txt}
                  </span>
                </div>
              );
            })}
            <div className="px-[18px] py-[12px] border-t border-[#EEF2F6] flex gap-3">
              <Link href="/panel/tezgahlar" className="text-[10.5px] text-[#00529C] no-underline hover:underline">Tümünü Yönet →</Link>
              <Link href="/panel/tezgah-ekle" className="text-[10.5px] text-[#1A7A4A] no-underline hover:underline">+ Yeni Tezgah Ekle</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
