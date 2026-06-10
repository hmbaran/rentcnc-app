"use client";

import { useState, useTransition } from "react";
import { kapasiteKaydet } from "@/lib/actions/kapasite";

type Kapasite = {
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
};

const VARDIYA_SECENEKLERI = ["1 Vardiya (8 saat)", "2 Vardiya (16 saat)", "3 Vardiya (24 saat)"];
const TESLIMAT_SECENEKLERI = ["1-3 iş günü", "3-5 iş günü", "1-2 hafta", "2-4 hafta", "1-2 ay", "2+ ay"];
const FIYAT_YONTEMI_SECENEKLERI = ["Birim fiyat", "Lot fiyat", "Saatlik ücret", "Proje bazlı"];
const ODEME_KOSULU_SECENEKLERI = ["Peşin", "%30 avans, kalan teslimde", "%50 avans, kalan teslimde", "30 gün vadeli", "60 gün vadeli", "90 gün vadeli"];

export default function KapasiteYonetim({ mevcut }: { mevcut: Kapasite | null }) {
  const [form, setForm] = useState<Kapasite>({
    min_siparis_adedi: mevcut?.min_siparis_adedi ?? 1,
    vardiya: mevcut?.vardiya ?? "",
    teslimat_suresi: mevcut?.teslimat_suresi ?? "",
    acil_is: mevcut?.acil_is ?? true,
    ihracat_deneyimi: mevcut?.ihracat_deneyimi ?? false,
    ihracat_ulkeleri: mevcut?.ihracat_ulkeleri ?? "",
    fiyat_yontemi: mevcut?.fiyat_yontemi ?? "",
    odeme_kosulu: mevcut?.odeme_kosulu ?? "",
    aylik_kapasite: mevcut?.aylik_kapasite ?? null,
    doluluk_orani: mevcut?.doluluk_orani ?? null,
  });
  const [basari, setBasari] = useState(false);
  const [hata, setHata] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHata("");
    setBasari(false);

    const fd = new FormData();
    fd.append("min_siparis_adedi", String(form.min_siparis_adedi ?? 1));
    fd.append("vardiya", form.vardiya ?? "");
    fd.append("teslimat_suresi", form.teslimat_suresi ?? "");
    fd.append("acil_is", String(form.acil_is ?? true));
    fd.append("ihracat_deneyimi", String(form.ihracat_deneyimi ?? false));
    fd.append("ihracat_ulkeleri", form.ihracat_ulkeleri ?? "");
    fd.append("fiyat_yontemi", form.fiyat_yontemi ?? "");
    fd.append("odeme_kosulu", form.odeme_kosulu ?? "");
    fd.append("aylik_kapasite", String(form.aylik_kapasite ?? ""));
    fd.append("doluluk_orani", String(form.doluluk_orani ?? ""));

    startTransition(async () => {
      const res = await kapasiteKaydet(fd);
      if (res?.hata) { setHata(res.hata); return; }
      setBasari(true);
      setTimeout(() => setBasari(false), 3000);
    });
  }

  return (
    <div className="bg-white border border-[#DDE8F0] rounded-[4px] p-[16px] mb-[10px]">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[20px]">📊</span>
        <div>
          <div className="text-[12px] font-semibold text-[#003057]">Kapasite & Ticari Bilgiler</div>
          <div className="text-[10.5px] text-[#8A98A8]">Vardiya, teslimat süresi, ödeme koşulları</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Vardiya */}
          <div>
            <label className="block text-[10.5px] text-[#5B6770] mb-1">Vardiya</label>
            <select
              value={form.vardiya ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, vardiya: e.target.value }))}
              className="w-full border border-[#DDE8F0] rounded-[3px] px-2 py-1.5 text-[11px] text-[#003057] outline-none focus:border-[#0077CC] bg-white"
            >
              <option value="">Seçiniz</option>
              {VARDIYA_SECENEKLERI.map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>

          {/* Teslimat Süresi */}
          <div>
            <label className="block text-[10.5px] text-[#5B6770] mb-1">Ortalama Teslimat Süresi</label>
            <select
              value={form.teslimat_suresi ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, teslimat_suresi: e.target.value }))}
              className="w-full border border-[#DDE8F0] rounded-[3px] px-2 py-1.5 text-[11px] text-[#003057] outline-none focus:border-[#0077CC] bg-white"
            >
              <option value="">Seçiniz</option>
              {TESLIMAT_SECENEKLERI.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Min Sipariş */}
          <div>
            <label className="block text-[10.5px] text-[#5B6770] mb-1">Min. Sipariş Adedi</label>
            <input
              type="number"
              min={1}
              value={form.min_siparis_adedi ?? 1}
              onChange={(e) => setForm((f) => ({ ...f, min_siparis_adedi: Number(e.target.value) }))}
              className="w-full border border-[#DDE8F0] rounded-[3px] px-2 py-1.5 text-[11px] text-[#003057] outline-none focus:border-[#0077CC]"
            />
          </div>

          {/* Aylık Kapasite */}
          <div>
            <label className="block text-[10.5px] text-[#5B6770] mb-1">Aylık Kapasite (adet)</label>
            <input
              type="number"
              min={0}
              value={form.aylik_kapasite ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, aylik_kapasite: e.target.value ? Number(e.target.value) : null }))}
              placeholder="Ör: 5000"
              className="w-full border border-[#DDE8F0] rounded-[3px] px-2 py-1.5 text-[11px] text-[#003057] outline-none focus:border-[#0077CC]"
            />
          </div>

          {/* Fiyat Yöntemi */}
          <div>
            <label className="block text-[10.5px] text-[#5B6770] mb-1">Fiyatlandırma Yöntemi</label>
            <select
              value={form.fiyat_yontemi ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, fiyat_yontemi: e.target.value }))}
              className="w-full border border-[#DDE8F0] rounded-[3px] px-2 py-1.5 text-[11px] text-[#003057] outline-none focus:border-[#0077CC] bg-white"
            >
              <option value="">Seçiniz</option>
              {FIYAT_YONTEMI_SECENEKLERI.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>

          {/* Ödeme Koşulu */}
          <div>
            <label className="block text-[10.5px] text-[#5B6770] mb-1">Ödeme Koşulu</label>
            <select
              value={form.odeme_kosulu ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, odeme_kosulu: e.target.value }))}
              className="w-full border border-[#DDE8F0] rounded-[3px] px-2 py-1.5 text-[11px] text-[#003057] outline-none focus:border-[#0077CC] bg-white"
            >
              <option value="">Seçiniz</option>
              {ODEME_KOSULU_SECENEKLERI.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* Doluluk Oranı */}
        <div className="mb-3">
          <label className="block text-[10.5px] text-[#5B6770] mb-1">
            Mevcut Doluluk Oranı: <span className="font-semibold text-[#003057]">{form.doluluk_orani ?? 0}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={form.doluluk_orani ?? 0}
            onChange={(e) => setForm((f) => ({ ...f, doluluk_orani: Number(e.target.value) }))}
            className="w-full accent-[#003057]"
          />
          <div className="flex justify-between text-[9px] text-[#8A98A8] mt-0.5">
            <span>0% (Tamamen boş)</span>
            <span>50%</span>
            <span>100% (Dolu)</span>
          </div>
        </div>

        {/* Toggle'lar */}
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setForm((f) => ({ ...f, acil_is: !f.acil_is }))}
              className={`w-8 h-4 rounded-full transition-colors relative ${form.acil_is ? "bg-[#003057]" : "bg-[#D4D8DC]"}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${form.acil_is ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <span className="text-[11px] text-[#5B6770]">Acil iş kabul ediyorum</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setForm((f) => ({ ...f, ihracat_deneyimi: !f.ihracat_deneyimi }))}
              className={`w-8 h-4 rounded-full transition-colors relative ${form.ihracat_deneyimi ? "bg-[#003057]" : "bg-[#D4D8DC]"}`}
            >
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${form.ihracat_deneyimi ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <span className="text-[11px] text-[#5B6770]">İhracat deneyimim var</span>
          </label>
        </div>

        {form.ihracat_deneyimi && (
          <div className="mb-3">
            <label className="block text-[10.5px] text-[#5B6770] mb-1">İhracat yaptığınız ülkeler</label>
            <input
              type="text"
              placeholder="Ör: Almanya, Fransa, ABD..."
              value={form.ihracat_ulkeleri ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, ihracat_ulkeleri: e.target.value }))}
              className="w-full border border-[#DDE8F0] rounded-[3px] px-2 py-1.5 text-[11px] text-[#003057] outline-none focus:border-[#0077CC]"
            />
          </div>
        )}

        {hata && <p className="text-[10.5px] text-red-500 mb-2">{hata}</p>}
        {basari && <p className="text-[10.5px] text-green-600 mb-2">✓ Kaydedildi.</p>}

        <button
          type="submit"
          disabled={isPending}
          className="bg-[#003057] text-white text-[11px] px-4 py-1.5 rounded-[3px] hover:bg-[#004080] disabled:opacity-50"
        >
          {isPending ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>
    </div>
  );
}
