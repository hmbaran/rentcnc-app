"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { sertifikaEkle, sertifikaSil } from "@/lib/actions/sertifika";

const STANDART_SERTIFIKALAR = [
  "ISO 9001:2015",
  "ISO 14001:2015",
  "ISO 45001:2018",
  "IATF 16949:2016",
  "AS9100 Rev D",
  "EN 9100:2018",
  "ISO 13485:2016",
  "ISO/IEC 27001:2022",
  "ISO 50001:2018",
  "CE Belgesi",
  "TSE Belgesi",
  "TÜRKAK Akreditasyonu",
  "ISO 3834-2",
  "EN 1090",
  "OHSAS 18001",
];

type Sertifika = {
  sertifika_id: string;
  sertifika_adi: string;
  gecerlilik_bitis: string | null;
  dogrulandi: boolean;
};

export default function SertifikaYonetim({ mevcutlar }: { mevcutlar: Sertifika[] }) {
  const [liste, setListe] = useState<Sertifika[]>(mevcutlar);
  const [form, setForm] = useState({ sertifika_adi: "", gecerlilik_bitis: "" });
  const [hata, setHata] = useState("");
  const [acik, setAcik] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [dropdownAcik, setDropdownAcik] = useState(false);
  const [aramaMetni, setAramaMetni] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklayınca dropdown kapansın
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownAcik(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtrelenmis = STANDART_SERTIFIKALAR.filter(s =>
    s.toLowerCase().includes(aramaMetni.toLowerCase()) &&
    !liste.some(l => l.sertifika_adi === s)
  );

  function handleEkle(e: React.FormEvent) {
    e.preventDefault();
    setHata("");
    const fd = new FormData();
    fd.append("sertifika_adi", form.sertifika_adi);
    fd.append("gecerlilik_bitis", form.gecerlilik_bitis);

    startTransition(async () => {
      const res = await sertifikaEkle(fd);
      if (res?.hata) { setHata(res.hata); return; }
      // Geçici olarak listeye ekle (revalidate zaten tetiklenecek)
      setListe(prev => [...prev, {
        sertifika_id: Date.now().toString(),
        sertifika_adi: form.sertifika_adi,
        gecerlilik_bitis: form.gecerlilik_bitis || null,
        dogrulandi: false,
      }]);
      setForm({ sertifika_adi: "", gecerlilik_bitis: "" });
      setAcik(false);
    });
  }

  function handleSil(id: string) {
    startTransition(async () => {
      const res = await sertifikaSil(id);
      if (res?.hata) { setHata(res.hata); return; }
      setListe(prev => prev.filter(s => s.sertifika_id !== id));
    });
  }

  return (
    <div className="bg-white border border-[#DDE8F0] rounded-[4px] p-[16px] mb-[10px]">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-[20px]">📄</span>
          <div>
            <div className="text-[12px] font-semibold text-[#003057]">Sertifikalar</div>
            <div className="text-[10.5px] text-[#8A98A8]">ISO 9001, AS9100, IATF 16949 vb.</div>
          </div>
        </div>
        <button
          onClick={() => setAcik(!acik)}
          className={`text-[11px] font-medium px-3 py-1.5 rounded-[3px] border transition-colors ${acik ? "text-[#5B6770] border-[#DDE8F0] hover:bg-[#F7FAFC]" : "bg-[#0077CC] text-white border-[#0077CC] hover:bg-[#005FA3]"}`}
        >
          {acik ? "İptal" : "+ Ekle"}
        </button>
      </div>

      {/* Ekleme Formu */}
      {acik && (
        <form onSubmit={handleEkle} className="mb-3 p-3 bg-[#F7FAFC] border border-[#DDE8F0] rounded-[4px]">
          <div className="flex gap-2 mb-2">
            {/* Combo: dropdown + elle giriş */}
            <div className="flex-1 relative" ref={dropdownRef}>
              <input
                type="text"
                placeholder="Sertifika seçin veya yazın..."
                value={form.sertifika_adi}
                onChange={e => {
                  setForm(f => ({ ...f, sertifika_adi: e.target.value }));
                  setAramaMetni(e.target.value);
                  setDropdownAcik(true);
                }}
                onFocus={() => { setAramaMetni(form.sertifika_adi); setDropdownAcik(true); }}
                className="w-full border border-[#DDE8F0] rounded-[3px] px-2 py-1.5 text-[11px] text-[#003057] outline-none focus:border-[#0077CC]"
                required
              />
              {/* Dropdown listesi */}
              {dropdownAcik && filtrelenmis.length > 0 && (
                <ul className="absolute z-10 top-full left-0 right-0 bg-white border border-[#DDE8F0] rounded-[3px] shadow-md max-h-48 overflow-y-auto mt-0.5">
                  {filtrelenmis.map(s => (
                    <li
                      key={s}
                      className="px-3 py-1.5 text-[11px] text-[#003057] hover:bg-[#EBF4FF] cursor-pointer"
                      onMouseDown={() => {
                        setForm(f => ({ ...f, sertifika_adi: s }));
                        setDropdownAcik(false);
                      }}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <input
              type="date"
              title="Geçerlilik bitiş tarihi"
              value={form.gecerlilik_bitis}
              onChange={e => setForm(f => ({ ...f, gecerlilik_bitis: e.target.value }))}
              className="border border-[#DDE8F0] rounded-[3px] px-2 py-1.5 text-[11px] text-[#5B6770] outline-none focus:border-[#0077CC]"
            />
          </div>
          {hata && <p className="text-[10.5px] text-red-500 mb-2">{hata}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="bg-[#003057] text-white text-[11px] px-3 py-1.5 rounded-[3px] hover:bg-[#004080] disabled:opacity-50"
          >
            {isPending ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </form>
      )}

      {/* Sertifika Listesi */}
      {liste.length === 0 ? (
        <p className="text-[10.5px] text-[#8A98A8] italic">Henüz sertifika eklenmedi.</p>
      ) : (
        <ul className="space-y-1.5">
          {liste.map(s => (
            <li key={s.sertifika_id} className="flex items-center justify-between bg-[#F7FAFC] border border-[#EEF3F8] rounded-[3px] px-3 py-2">
              <div className="flex items-center gap-2">
                {s.dogrulandi && (
                  <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">✓ DOĞRULANDI</span>
                )}
                <span className="text-[11px] font-medium text-[#003057]">{s.sertifika_adi}</span>
                {s.gecerlilik_bitis && (
                  <span className="text-[10px] text-[#8A98A8]">
                    Son: {new Date(s.gecerlilik_bitis).toLocaleDateString("tr-TR")}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleSil(s.sertifika_id)}
                disabled={isPending}
                className="text-[10px] text-red-400 hover:text-red-600 disabled:opacity-50"
              >
                Sil
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
