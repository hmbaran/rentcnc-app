"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { gorselSil } from "@/lib/actions/gorsel";

type Gorsel = {
  gorsel_id: string;
  url: string;
  baslik: string | null;
};

export default function GorselYonetim({
  firmaId,
  mevcutlar,
}: {
  firmaId: string;
  mevcutlar: Gorsel[];
}) {
  const [liste, setListe] = useState<Gorsel[]>(mevcutlar);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [basari, setBasari] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  async function handleYukle(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setHata("");
    setYukleniyor(true);

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        setHata("Her görsel max 5 MB olmalıdır.");
        setYukleniyor(false);
        return;
      }

      const fd = new FormData();
      fd.append("file", file);
      fd.append("firma_id", firmaId);

      try {
        const res = await fetch("/api/gorsel-yukle", { method: "POST", body: fd });
        const json = await res.json();
        if (json.hata) { setHata(json.hata); break; }
        setListe(prev => [...prev, json.gorsel]);
        setBasari("✓ Görsel kaydedildi");
        setTimeout(() => setBasari(""), 3000);
      } catch {
        setHata("Yükleme sırasında hata oluştu.");
        break;
      }
    }

    setYukleniyor(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleSil(id: string, storagePath: string) {
    startTransition(async () => {
      const res = await gorselSil(id, storagePath);
      if (res?.hata) { setHata(res.hata); return; }
      setListe(prev => prev.filter(g => g.gorsel_id !== id));
    });
  }

  return (
    <div className="bg-white border border-[#DDE8F0] rounded-[4px] p-[16px] mb-[10px]">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-[20px]">📷</span>
          <div>
            <div className="text-[12px] font-semibold text-[#003057]">Tesis Görselleri</div>
            <div className="text-[10.5px] text-[#8A98A8]">Atölye, tezgah ve referans fotoğrafları (max 5 MB)</div>
          </div>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={yukleniyor}
          className="text-[11px] font-medium px-3 py-1.5 rounded-[3px] border bg-[#0077CC] text-white border-[#0077CC] hover:bg-[#005FA3] disabled:opacity-50 transition-colors"
        >
          {yukleniyor ? "Yükleniyor..." : "+ Görsel Ekle"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleYukle}
        />
      </div>

      {hata && <p className="text-[10.5px] text-red-500 mb-2">{hata}</p>}
      {basari && <p className="text-[10.5px] text-green-600 font-medium mb-2">{basari}</p>}

      {/* Görsel Grid */}
      {liste.length === 0 ? (
        <div
          className="border-2 border-dashed border-[#DDE8F0] rounded-[4px] p-8 text-center cursor-pointer hover:border-[#0077CC] transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <div className="text-3xl mb-2">🖼️</div>
          <p className="text-[11px] text-[#8A98A8]">Görsel yüklemek için tıklayın veya sürükleyin</p>
          <p className="text-[10px] text-[#B0BEC5] mt-1">JPG, PNG, WEBP • Max 5 MB</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {liste.map(g => (
            <div key={g.gorsel_id} className="relative group aspect-square rounded-[3px] overflow-hidden border border-[#DDE8F0]">
              <Image
                src={g.url}
                alt={g.baslik ?? "Tesis görseli"}
                fill
                className="object-cover"
              />
              {/* Yeşil check rozeti */}
              <div className="absolute top-1.5 left-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm z-10">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {/* Hover: sil */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleSil(g.gorsel_id, g.url)}
                  disabled={isPending}
                  className="text-white text-[10px] bg-red-500 hover:bg-red-600 px-2 py-1 rounded disabled:opacity-50"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
          {/* Ekle butonu */}
          <div
            className="aspect-square rounded-[3px] border-2 border-dashed border-[#DDE8F0] flex items-center justify-center cursor-pointer hover:border-[#0077CC] transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <span className="text-[24px] text-[#B0BEC5]">+</span>
          </div>
        </div>
      )}
    </div>
  );
}
