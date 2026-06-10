"use client";

import { useState, useTransition } from "react";
import { yetenekEkle, yetenekSil } from "@/lib/actions/yetenek";

const KATEGORILER = ["İşleme", "Yüzey İşlem", "Isıl İşlem", "Montaj", "Kaynak", "Döküm", "Diğer"];

const ORNEK_YETENEKLER: Record<string, string[]> = {
  "İşleme": ["CNC Frezeleme", "CNC Tornalama", "Taşlama", "Honlama", "EDM Tel Erozyon", "EDM Dalan Erozyon", "Delik Delme", "Raybalama", "Diş Açma"],
  "Yüzey İşlem": ["Boyama", "Elektrokaplama", "Nikel Kaplama", "Sert Krom", "Anodizasyon", "Fosfatlama", "Parlatma", "Kumlama"],
  "Isıl İşlem": ["Sertleştirme", "Tavlama", "Sementasyon", "Nitrürleme", "Normalizasyon", "Su Verme"],
  "Montaj": ["Mekanik Montaj", "Hassas Montaj", "Pres Fit", "Civata Montaj", "Alt Montaj"],
  "Kaynak": ["TIG Kaynak", "MIG/MAG Kaynak", "Lazer Kaynak", "Elektron Işın Kaynağı", "Nokta Kaynak"],
  "Döküm": ["Kum Döküm", "Hassas Döküm", "Basınçlı Döküm", "Kokil Döküm"],
  "Diğer": [],
};

type Yetenek = { yetenek_id: string; kategori: string | null; deger: string };

export default function YetenekYonetim({ mevcutlar }: { mevcutlar: Yetenek[] }) {
  const [liste, setListe] = useState<Yetenek[]>(mevcutlar);
  const [acik, setAcik] = useState(false);
  const [kategori, setKategori] = useState("İşleme");
  const [secililer, setSecililer] = useState<string[]>([]);
  const [elleGiris, setElleGiris] = useState("");
  const [hata, setHata] = useState("");
  const [isPending, startTransition] = useTransition();

  const mevcut_degerler = liste.map((y) => y.deger);
  const onerililer = (ORNEK_YETENEKLER[kategori] ?? []).filter(
    (o) => !mevcut_degerler.includes(o)
  );

  function toggleSecim(deger: string) {
    setSecililer((prev) =>
      prev.includes(deger) ? prev.filter((s) => s !== deger) : [...prev, deger]
    );
  }

  function handleKategoriDegis(yeniKategori: string) {
    setKategori(yeniKategori);
    setSecililer([]);
  }

  function handleEkle(e: React.FormEvent) {
    e.preventDefault();
    setHata("");

    const eklenecekler: string[] = [
      ...secililer,
      ...(elleGiris.trim() ? [elleGiris.trim()] : []),
    ].filter((d) => !mevcut_degerler.includes(d));

    if (eklenecekler.length === 0) return;

    startTransition(async () => {
      const yeniler: Yetenek[] = [];
      for (const deger of eklenecekler) {
        const fd = new FormData();
        fd.append("deger", deger);
        fd.append("kategori", kategori);
        const res = await yetenekEkle(fd);
        if (res?.hata) { setHata(res.hata); return; }
        yeniler.push({ yetenek_id: Date.now().toString() + deger, kategori, deger });
      }
      setListe((prev) => [...prev, ...yeniler]);
      setSecililer([]);
      setElleGiris("");
      setAcik(false);
    });
  }

  function handleSil(id: string) {
    startTransition(async () => {
      const res = await yetenekSil(id);
      if (res?.hata) { setHata(res.hata); return; }
      setListe((prev) => prev.filter((y) => y.yetenek_id !== id));
    });
  }

  const gruplar = KATEGORILER.map((k) => ({
    kategori: k,
    items: liste.filter((y) => y.kategori === k),
  })).filter((g) => g.items.length > 0);

  const kategorisiz = liste.filter((y) => !y.kategori || !KATEGORILER.includes(y.kategori));

  return (
    <div className="bg-white border border-[#DDE8F0] rounded-[4px] p-[16px] mb-[10px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-[20px]">⚙️</span>
          <div>
            <div className="text-[12px] font-semibold text-[#003057]">Yetenekler</div>
            <div className="text-[10.5px] text-[#8A98A8]">İşleme, yüzey, kaynak vb. üretim yetenekleri</div>
          </div>
        </div>
        <button
          onClick={() => { setAcik(!acik); setSecililer([]); setElleGiris(""); }}
          className={`text-[11px] font-medium px-3 py-1.5 rounded-[3px] border transition-colors ${acik ? "text-[#5B6770] border-[#DDE8F0] hover:bg-[#F7FAFC]" : "bg-[#0077CC] text-white border-[#0077CC] hover:bg-[#005FA3]"}`}
        >
          {acik ? "İptal" : "+ Ekle"}
        </button>
      </div>

      {acik && (
        <form onSubmit={handleEkle} className="mb-3 p-3 bg-[#F7FAFC] border border-[#DDE8F0] rounded-[4px]">
          {/* Kategori seçimi */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {KATEGORILER.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleKategoriDegis(k)}
                className={`text-[10.5px] px-2.5 py-1 rounded-full border transition-colors ${
                  kategori === k
                    ? "bg-[#003057] text-white border-[#003057]"
                    : "bg-white text-[#5B6770] border-[#DDE8F0] hover:border-[#003057] hover:text-[#003057]"
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          {/* Öneriler — çoklu seçim */}
          {onerililer.length > 0 && (
            <div className="mb-3">
              <div className="text-[10px] text-[#8A98A8] mb-1.5">Seçmek için tıklayın (birden fazla seçebilirsiniz):</div>
              <div className="flex flex-wrap gap-1.5">
                {onerililer.map((o) => {
                  const secili = secililer.includes(o);
                  return (
                    <button
                      key={o}
                      type="button"
                      onClick={() => toggleSecim(o)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                        secili
                          ? "bg-[#003057] text-white border-[#003057]"
                          : "bg-white text-[#0077CC] border-[#C8DEFF] hover:bg-[#EBF4FF]"
                      }`}
                    >
                      {secili ? "✓ " : ""}{o}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Elle giriş */}
          <div className="mb-2">
            <input
              type="text"
              placeholder="Listede yoksa buraya yazın..."
              value={elleGiris}
              onChange={(e) => setElleGiris(e.target.value)}
              className="w-full border border-[#DDE8F0] rounded-[3px] px-2 py-1.5 text-[11px] text-[#003057] outline-none focus:border-[#0077CC]"
            />
          </div>

          {hata && <p className="text-[10.5px] text-red-500 mb-2">{hata}</p>}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isPending || (secililer.length === 0 && !elleGiris.trim())}
              className="bg-[#003057] text-white text-[11px] px-3 py-1.5 rounded-[3px] hover:bg-[#004080] disabled:opacity-40"
            >
              {isPending
                ? "Kaydediliyor..."
                : secililer.length + (elleGiris.trim() ? 1 : 0) > 1
                ? `${secililer.length + (elleGiris.trim() ? 1 : 0)} Yeteneği Ekle`
                : "Ekle"}
            </button>
            {secililer.length > 0 && (
              <span className="text-[10.5px] text-[#5B6770]">{secililer.length} seçili</span>
            )}
          </div>
        </form>
      )}

      {liste.length === 0 ? (
        <p className="text-[10.5px] text-[#8A98A8] italic">Henüz yetenek eklenmedi.</p>
      ) : (
        <div className="space-y-3">
          {gruplar.map((g) => (
            <div key={g.kategori}>
              <div className="text-[10px] font-semibold text-[#5B6770] uppercase tracking-wider mb-1">{g.kategori}</div>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((y) => (
                  <span
                    key={y.yetenek_id}
                    className="flex items-center gap-1.5 bg-[#F0F6FF] border border-[#C8DEFF] text-[#003057] text-[11px] px-2.5 py-1 rounded-full"
                  >
                    {y.deger}
                    <button
                      onClick={() => handleSil(y.yetenek_id)}
                      disabled={isPending}
                      className="text-[#8A98A8] hover:text-red-500 leading-none disabled:opacity-50"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
          {kategorisiz.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {kategorisiz.map((y) => (
                <span
                  key={y.yetenek_id}
                  className="flex items-center gap-1.5 bg-[#F0F6FF] border border-[#C8DEFF] text-[#003057] text-[11px] px-2.5 py-1 rounded-full"
                >
                  {y.deger}
                  <button
                    onClick={() => handleSil(y.yetenek_id)}
                    disabled={isPending}
                    className="text-[#8A98A8] hover:text-red-500 leading-none disabled:opacity-50"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
