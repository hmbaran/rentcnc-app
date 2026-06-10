"use client";

import { useState } from "react";
import { teklifKabulEt, teklifReddet } from "@/lib/actions/teklif";

export default function TeklifKabul({
  teklifId,
  rfqId,
  firmaAdi,
}: {
  teklifId: string;
  rfqId: string;
  firmaAdi: string;
}) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState("");

  async function handleKabul() {
    if (!confirm(`${firmaAdi} firmasının teklifini kabul etmek istiyor musunuz?`)) return;
    setYukleniyor(true);
    const sonuc = await teklifKabulEt(teklifId, rfqId);
    if ("hata" in sonuc) {
      setMesaj(sonuc.hata);
      setYukleniyor(false);
    } else {
      window.location.reload();
    }
  }

  async function handleRed() {
    setYukleniyor(true);
    const sonuc = await teklifReddet(teklifId);
    if ("hata" in sonuc) {
      setMesaj(sonuc.hata);
      setYukleniyor(false);
    } else {
      window.location.reload();
    }
  }

  return (
    <div>
      {mesaj && <div className="text-[11px] text-[#B83232] mb-2">{mesaj}</div>}
      <div className="flex gap-2">
        <button onClick={handleKabul} disabled={yukleniyor}
          className="px-4 py-[7px] bg-[#1A7A4A] text-white text-[10px] font-semibold tracking-[1px] uppercase rounded-[2px] hover:bg-[#0f5c34] transition-colors disabled:opacity-50">
          Kabul Et
        </button>
        <button onClick={handleRed} disabled={yukleniyor}
          className="px-4 py-[7px] border border-[#D4D8DC] text-[#5B6770] text-[10px] font-semibold tracking-[1px] uppercase rounded-[2px] hover:border-[#B83232] hover:text-[#B83232] transition-colors disabled:opacity-50">
          Reddet
        </button>
      </div>
    </div>
  );
}
