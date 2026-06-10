"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { tezgahSil } from "@/lib/actions/tezgah";

export default function TezgahIslemler({ tezgahId }: { tezgahId: string }) {
  const [onay, setOnay] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hata, setHata] = useState("");
  const router = useRouter();

  function sil() {
    setHata("");
    startTransition(async () => {
      const sonuc = await tezgahSil(tezgahId);
      if ("hata" in sonuc) {
        setHata(sonuc.hata);
        setOnay(false);
      } else {
        router.refresh(); // Listeyi yenile
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1 flex-shrink-0">
      {!onay ? (
        <div className="flex items-center gap-[8px]">
          {/* Düzenle */}
          <Link
            href={`/panel/tezgahlar/${tezgahId}/duzenle`}
            className="px-[14px] py-[7px] text-[12px] font-semibold border-2 border-[#00529C] rounded-[3px] bg-white text-[#00529C] hover:bg-[#00529C] hover:text-white transition-colors no-underline"
          >
            ✏ Düzenle
          </Link>
          {/* Sil */}
          <button
            type="button"
            onClick={() => setOnay(true)}
            className="px-[14px] py-[7px] text-[12px] font-semibold border-2 border-red-300 rounded-[3px] bg-white text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors cursor-pointer"
          >
            🗑 Sil
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-[6px] bg-red-50 border border-red-200 rounded-[3px] px-[10px] py-[6px]">
          <span className="text-[10.5px] text-red-700 font-medium">Emin misiniz?</span>
          <button
            type="button"
            onClick={sil}
            disabled={isPending}
            className="px-[8px] py-[3px] text-[10px] bg-red-600 text-white rounded-[2px] font-medium cursor-pointer hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {isPending ? "Siliniyor…" : "Evet, Sil"}
          </button>
          <button
            type="button"
            onClick={() => setOnay(false)}
            className="px-[8px] py-[3px] text-[10px] border border-red-300 text-red-600 rounded-[2px] cursor-pointer hover:bg-red-100 transition-colors"
          >
            İptal
          </button>
        </div>
      )}
      {hata && <p className="text-[10px] text-red-600 mt-1">{hata}</p>}
    </div>
  );
}
