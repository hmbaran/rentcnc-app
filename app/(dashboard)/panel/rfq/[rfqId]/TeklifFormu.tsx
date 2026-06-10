"use client";

import { useState } from "react";
import { teklifVer, teklifGeriCek } from "@/lib/actions/teklif";

type MevcutTeklif = {
  teklif_id: string;
  birim_fiyat: string | number;
  toplam_fiyat: string | number | null;
  para_birimi: string;
  termin_haftalari: number | null;
  notlar: string | null;
  gecerlilik_bitis: string | null;
  durum: string;
} | null;

export default function TeklifFormu({
  rfqFirmaId,
  rfqId,
  sureDoldu,
  mevcutTeklif,
}: {
  rfqFirmaId: string;
  rfqId: string;
  sureDoldu: boolean;
  mevcutTeklif: MevcutTeklif;
}) {
  const [duzenle, setDuzenle] = useState(!mevcutTeklif);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState<{ tip: "basari" | "hata"; yazi: string } | null>(null);

  const [birimFiyat, setBirimFiyat] = useState(mevcutTeklif ? String(mevcutTeklif.birim_fiyat) : "");
  const [toplamFiyat, setToplamFiyat] = useState(mevcutTeklif?.toplam_fiyat ? String(mevcutTeklif.toplam_fiyat) : "");
  const [paraBirimi, setParaBirimi] = useState(mevcutTeklif?.para_birimi ?? "EUR");
  const [terminHaftalari, setTerminHaftalari] = useState(mevcutTeklif?.termin_haftalari ? String(mevcutTeklif.termin_haftalari) : "");
  const [notlar, setNotlar] = useState(mevcutTeklif?.notlar ?? "");
  const [gecerlilik, setGecerlilik] = useState(mevcutTeklif?.gecerlilik_bitis ?? "");

  async function handleGonder(e: React.FormEvent) {
    e.preventDefault();
    setYukleniyor(true);
    setMesaj(null);

    const sonuc = await teklifVer({
      rfqFirmaId,
      birimFiyat: parseFloat(birimFiyat),
      toplamFiyat: toplamFiyat ? parseFloat(toplamFiyat) : undefined,
      paraBirimi,
      terminHaftalari: terminHaftalari ? parseInt(terminHaftalari) : undefined,
      notlar: notlar || undefined,
      gecerlilikBitis: gecerlilik || undefined,
    });

    setYukleniyor(false);
    if ("hata" in sonuc) {
      setMesaj({ tip: "hata", yazi: sonuc.hata });
    } else {
      setMesaj({ tip: "basari", yazi: mevcutTeklif ? "Teklifiniz güncellendi." : "Teklifiniz gönderildi!" });
      setDuzenle(false);
      // Sayfayı yenile (server side revalidate yeterli, ama kullanıcıya anlık görünüm için)
      window.location.reload();
    }
  }

  async function handleGeriCek() {
    if (!confirm("Teklifinizi geri çekmek istediğinizden emin misiniz?")) return;
    setYukleniyor(true);
    const sonuc = await teklifGeriCek(rfqFirmaId);
    setYukleniyor(false);
    if ("hata" in sonuc) {
      setMesaj({ tip: "hata", yazi: sonuc.hata });
    } else {
      window.location.reload();
    }
  }

  if (sureDoldu && !mevcutTeklif) {
    return (
      <div className="bg-white border border-[#D4D8DC] rounded-[2px] p-[22px] text-center">
        <div className="text-[13px] text-[#5B6770]">Bu RFQ'nun son teklif tarihi geçti. Teklif verilemez.</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#D4D8DC] rounded-[2px]">
      <div className="px-[22px] py-[14px] border-b border-[#D4D8DC] flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#003057] tracking-[1.5px] uppercase">
          {mevcutTeklif ? "Teklifiniz" : "Teklif Ver"}
        </span>
        {mevcutTeklif && mevcutTeklif.durum !== "geri_cekildi" && !duzenle && (
          <div className="flex gap-3">
            <button onClick={() => setDuzenle(true)}
              className="text-[10px] text-[#0077CC] hover:underline">
              Düzenle
            </button>
            <button onClick={handleGeriCek} disabled={yukleniyor}
              className="text-[10px] text-[#B83232] hover:underline">
              Geri Çek
            </button>
          </div>
        )}
      </div>

      <div className="p-[22px]">
        {/* Mevcut teklif özeti — düzenle modunda değilse */}
        {mevcutTeklif && !duzenle && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {[
              { lbl: "Birim Fiyat", val: `${Number(mevcutTeklif.birim_fiyat).toLocaleString("tr-TR")} ${mevcutTeklif.para_birimi}` },
              { lbl: "Toplam Fiyat", val: mevcutTeklif.toplam_fiyat ? `${Number(mevcutTeklif.toplam_fiyat).toLocaleString("tr-TR")} ${mevcutTeklif.para_birimi}` : "—" },
              { lbl: "Termin", val: mevcutTeklif.termin_haftalari ? `${mevcutTeklif.termin_haftalari} hafta` : "—" },
              { lbl: "Geçerlilik", val: mevcutTeklif.gecerlilik_bitis ? new Date(mevcutTeklif.gecerlilik_bitis).toLocaleDateString("tr-TR") : "—" },
              { lbl: "Durum", val: mevcutTeklif.durum === "verildi" ? "Teklif Verildi" : mevcutTeklif.durum },
            ].map((d) => (
              <div key={d.lbl} className="bg-[#F8FAFB] rounded-[2px] p-3">
                <div className="text-[9px] text-[#8B97A4] uppercase tracking-[1px] mb-[3px]">{d.lbl}</div>
                <div className="text-[13px] font-medium text-[#1A2535]">{d.val}</div>
              </div>
            ))}
            {mevcutTeklif.notlar && (
              <div className="col-span-full bg-[#F8FAFB] rounded-[2px] p-3">
                <div className="text-[9px] text-[#8B97A4] uppercase tracking-[1px] mb-[3px]">Notlar</div>
                <div className="text-[12px] text-[#3D4E63] leading-[1.6] whitespace-pre-wrap">{mevcutTeklif.notlar}</div>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        {duzenle && (
          <form onSubmit={handleGonder} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Birim fiyat */}
              <div>
                <label className="block text-[10px] font-semibold text-[#3D4E63] uppercase tracking-[1px] mb-1.5">
                  Birim Fiyat <span className="text-[#B83232]">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={birimFiyat}
                    onChange={(e) => setBirimFiyat(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 border border-[#D4D8DC] rounded-[2px] px-3 py-2 text-[13px] text-[#1A2535] focus:outline-none focus:border-[#0077CC]"
                  />
                  <select
                    value={paraBirimi}
                    onChange={(e) => setParaBirimi(e.target.value)}
                    className="border border-[#D4D8DC] rounded-[2px] px-2 py-2 text-[12px] text-[#1A2535] focus:outline-none focus:border-[#0077CC] bg-white"
                  >
                    {["EUR", "USD", "TRY", "GBP"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toplam fiyat */}
              <div>
                <label className="block text-[10px] font-semibold text-[#3D4E63] uppercase tracking-[1px] mb-1.5">
                  Toplam Fiyat
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={toplamFiyat}
                  onChange={(e) => setToplamFiyat(e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-[#D4D8DC] rounded-[2px] px-3 py-2 text-[13px] text-[#1A2535] focus:outline-none focus:border-[#0077CC]"
                />
              </div>

              {/* Termin */}
              <div>
                <label className="block text-[10px] font-semibold text-[#3D4E63] uppercase tracking-[1px] mb-1.5">
                  Termin (hafta)
                </label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={terminHaftalari}
                  onChange={(e) => setTerminHaftalari(e.target.value)}
                  placeholder="Örn: 4"
                  className="w-full border border-[#D4D8DC] rounded-[2px] px-3 py-2 text-[13px] text-[#1A2535] focus:outline-none focus:border-[#0077CC]"
                />
              </div>

              {/* Geçerlilik */}
              <div>
                <label className="block text-[10px] font-semibold text-[#3D4E63] uppercase tracking-[1px] mb-1.5">
                  Teklif Geçerlilik Tarihi
                </label>
                <input
                  type="date"
                  value={gecerlilik}
                  onChange={(e) => setGecerlilik(e.target.value)}
                  className="w-full border border-[#D4D8DC] rounded-[2px] px-3 py-2 text-[13px] text-[#1A2535] focus:outline-none focus:border-[#0077CC]"
                />
              </div>
            </div>

            {/* Notlar */}
            <div>
              <label className="block text-[10px] font-semibold text-[#3D4E63] uppercase tracking-[1px] mb-1.5">
                Notlar / Açıklama
              </label>
              <textarea
                rows={4}
                value={notlar}
                onChange={(e) => setNotlar(e.target.value)}
                placeholder="Teklif detayları, teslimat koşulları, ödeme şartları..."
                className="w-full border border-[#D4D8DC] rounded-[2px] px-3 py-2 text-[13px] text-[#1A2535] leading-[1.6] focus:outline-none focus:border-[#0077CC] resize-none"
              />
            </div>

            {mesaj && (
              <div className={`px-3 py-2 rounded-[2px] text-[12px] ${
                mesaj.tip === "basari"
                  ? "bg-[#E8F5EE] text-[#1A7A4A]"
                  : "bg-[#FEE2E2] text-[#B83232]"
              }`}>
                {mesaj.yazi}
              </div>
            )}

            <div className="flex gap-3 items-center">
              <button
                type="submit"
                disabled={yukleniyor || !birimFiyat}
                className="px-6 py-[10px] bg-[#003057] text-white text-[11px] font-semibold tracking-[1px] uppercase rounded-[2px] hover:bg-[#004080] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {yukleniyor ? "Gönderiliyor…" : mevcutTeklif ? "Teklifi Güncelle" : "Teklifi Gönder"}
              </button>
              {mevcutTeklif && (
                <button type="button" onClick={() => setDuzenle(false)}
                  className="text-[11px] text-[#5B6770] hover:text-[#1A2535]">
                  İptal
                </button>
              )}
            </div>
          </form>
        )}

        {mesaj && !duzenle && (
          <div className={`px-3 py-2 rounded-[2px] text-[12px] ${
            mesaj.tip === "basari" ? "bg-[#E8F5EE] text-[#1A7A4A]" : "bg-[#FEE2E2] text-[#B83232]"
          }`}>
            {mesaj.yazi}
          </div>
        )}
      </div>
    </div>
  );
}
