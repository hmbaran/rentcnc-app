"use client";

import { useState, useTransition } from "react";
import { firmaSektorGuncelle } from "@/lib/actions/sektor";

type Sektor = { sektor_id: number; kod: string; ad: string; kategori: string; ikon: string };

export default function SektorSecim({
  tumSektorler,
  seciliIds,
}: {
  tumSektorler: Sektor[];
  seciliIds: number[];
}) {
  const [secilenler, setSecilenler] = useState<Set<number>>(new Set(seciliIds));
  const [isPending, startTransition] = useTransition();
  const [mesaj, setMesaj] = useState<{ tip: "basari" | "hata"; text: string } | null>(null);

  function toggle(id: number) {
    setSecilenler((prev) => {
      const yeni = new Set(prev);
      if (yeni.has(id)) yeni.delete(id); else yeni.add(id);
      return yeni;
    });
  }

  function kaydet() {
    setMesaj(null);
    startTransition(async () => {
      const sonuc = await firmaSektorGuncelle(Array.from(secilenler));
      if ("hata" in sonuc) setMesaj({ tip: "hata",   text: sonuc.hata });
      else                  setMesaj({ tip: "basari", text: `${secilenler.size} sektör kaydedildi ✓` });
    });
  }

  // Kategorilere göre grupla
  const katMap: Record<string, Sektor[]> = {};
  tumSektorler.forEach((s) => {
    if (!katMap[s.kategori]) katMap[s.kategori] = [];
    katMap[s.kategori].push(s);
  });

  return (
    <div className="bg-white border border-[#DDE8F0] rounded-[4px] p-[18px] mb-[14px]">
      <div className="flex items-center justify-between mb-[14px] pb-[10px] border-b border-[#DDE8F0]">
        <div className="text-[10px] font-semibold text-[#003057] tracking-[1.5px] uppercase">
          Çalıştığınız Sektörler
          {secilenler.size > 0 && (
            <span className="ml-2 text-[9px] bg-[#003057] text-white px-[7px] py-[2px] rounded-[2px]">
              {secilenler.size} seçili
            </span>
          )}
        </div>
        <div className="text-[10px] text-[#8A98A8]">Birden fazla seçebilirsiniz</div>
      </div>

      <div className="space-y-[18px]">
        {Object.entries(katMap).map(([kategori, sektorler]) => (
          <div key={kategori}>
            <div className="text-[9px] font-semibold text-[#8A98A8] tracking-[1.5px] uppercase mb-[8px]">{kategori}</div>
            <div className="grid grid-cols-2 gap-[8px]">
              {sektorler.map((s) => {
                const secili = secilenler.has(s.sektor_id);
                return (
                  <button key={s.sektor_id} type="button" onClick={() => toggle(s.sektor_id)}
                    className={`flex items-center gap-[10px] px-[12px] py-[10px] rounded-[3px] border text-left transition-all cursor-pointer ${
                      secili
                        ? "border-[#003057] bg-[#F0F7FF] text-[#003057]"
                        : "border-[#DDE8F0] bg-white text-[#4A5568] hover:border-[#A0B4C8] hover:bg-[#F8FAFB]"
                    }`}>
                    <span className="text-[16px] flex-shrink-0">{s.ikon}</span>
                    <span className="text-[12px] font-medium leading-[1.3]">{s.ad}</span>
                    {secili && <span className="ml-auto text-[#003057] text-[14px] flex-shrink-0">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {mesaj && (
        <div className={`mt-[14px] px-[14px] py-[10px] rounded-[3px] text-[12px] ${
          mesaj.tip === "basari"
            ? "bg-[#E8F5EE] border border-[#A8D8B8] text-[#1A7A4A]"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>{mesaj.text}</div>
      )}

      <div className="flex items-center gap-3 mt-[16px] pt-[14px] border-t border-[#EEF2F6]">
        <button type="button" onClick={kaydet} disabled={isPending}
          className="px-[22px] py-[9px] rounded-[2px] text-[11px] font-medium tracking-[0.5px] uppercase bg-[#003057] text-white hover:bg-[#004080] transition-colors cursor-pointer disabled:opacity-60">
          {isPending ? "Kaydediliyor…" : "✓ Sektörleri Kaydet"}
        </button>
        {secilenler.size > 0 && (
          <span className="text-[11px] text-[#5B6770]">{secilenler.size} sektör seçildi</span>
        )}
      </div>
    </div>
  );
}
