"use client";

import { useState, useTransition } from "react";
import { malzemeEkle, malzemeSil } from "@/lib/actions/malzeme";

const MALZEME_GRUPLARI: Record<string, string[]> = {
  "Tümü": [],
  "Çelik": [
    "Çelik St37", "Çelik St52", "S235", "S355",
    "Paslanmaz 304", "Paslanmaz 316", "Paslanmaz 316L",
    "Paslanmaz 420", "Paslanmaz 440C",
    "Takım Çeliği 1.2379", "Takım Çeliği 1.2344", "Takım Çeliği 1.2083",
    "Sertleşebilir Çelik 42CrMo4", "Sertleşebilir Çelik 16MnCr5",
    "HSS M2", "HSS M35", "Yay Çeliği 65Mn", "Rulman Çeliği 100Cr6",
    "Otomat Çeliği 11SMn30",
  ],
  "Alüminyum": [
    "Alüminyum 6061", "Alüminyum 6082", "Alüminyum 7075", "Alüminyum 2024",
    "Alüminyum 5083", "Alüminyum 6063",
    "Alüminyum Döküm ADC12", "Alüminyum Döküm AlSi7Mg",
  ],
  "Titanyum / Nikel": [
    "Titanyum Grade 2", "Titanyum Grade 5 (Ti6Al4V)",
    "Inconel 625", "Inconel 718",
    "Hastelloy C276", "Waspaloy", "Nikel 200",
    "Kobalt-Krom (CoCr)",
  ],
  "Non-Demir": [
    "Bakır", "Pirinç CuZn37", "Pirinç CuZn39Pb3",
    "Bronz CuSn8", "Fosfor Bronz", "Berilenyum Bakır",
    "Çinko Döküm ZnAl4", "Magnezyum AZ31",
  ],
  "Döküm Demir": [
    "Gri Dökme Demir GG25", "Gri Dökme Demir GG30",
    "Küresel Grafitli GGG40", "Küresel Grafitli GGG60",
    "Temper Dökme Demir", "Beyaz Dökme Demir",
    "Sinter Metal (Demir Bazlı)", "Sinter Metal (Bakır Bazlı)",
  ],
  "Plastik / Diğer": [
    "POM (Delrin)", "PA6 (Naylon)", "PA66", "PEEK",
    "PTFE (Teflon)", "UHMWPE", "ABS", "PC (Polikarbonat)",
    "PP", "PVC", "Epoksi Kompozit", "CFRP (Karbon Fiber)",
    "Seramik Al2O3", "Seramik ZrO2",
  ],
};

const TUM_MALZEMELER = Object.entries(MALZEME_GRUPLARI)
  .filter(([g]) => g !== "Tümü")
  .flatMap(([, items]) => items);

// "Tümü" grubuna tüm malzemeleri ata
MALZEME_GRUPLARI["Tümü"] = TUM_MALZEMELER;

const TUM_GRUPLAR = Object.keys(MALZEME_GRUPLARI);

type Malzeme = { malzeme_id: string; malzeme_adi: string };

export default function MalzemeYonetim({ mevcutlar }: { mevcutlar: Malzeme[] }) {
  const [liste, setListe] = useState<Malzeme[]>(mevcutlar);
  const [acik, setAcik] = useState(false);
  const [grup, setGrup] = useState("Tümü");
  const [secililer, setSecililer] = useState<string[]>([]);
  const [elleGiris, setElleGiris] = useState("");
  const [arama, setArama] = useState("");
  const [hata, setHata] = useState("");
  const [isPending, startTransition] = useTransition();

  const mevcut_adlar = liste.map((m) => m.malzeme_adi);

  const onerililer = (MALZEME_GRUPLARI[grup] ?? []).filter(
    (m) => !mevcut_adlar.includes(m) &&
      (arama === "" || m.toLowerCase().includes(arama.toLowerCase()))
  );

  function toggleSecim(adi: string) {
    setSecililer((prev) =>
      prev.includes(adi) ? prev.filter((s) => s !== adi) : [...prev, adi]
    );
  }

  function handleGrupDegis(yeniGrup: string) {
    setGrup(yeniGrup);
    setSecililer([]);
    setArama("");
  }

  function handleEkle(e: React.FormEvent) {
    e.preventDefault();
    setHata("");

    const eklenecekler: string[] = [
      ...secililer,
      ...(elleGiris.trim() ? [elleGiris.trim()] : []),
    ].filter((d) => !mevcut_adlar.includes(d));

    if (eklenecekler.length === 0) return;

    startTransition(async () => {
      const yeniler: Malzeme[] = [];
      for (const adi of eklenecekler) {
        const fd = new FormData();
        fd.append("malzeme_adi", adi);
        const res = await malzemeEkle(fd);
        if (res?.hata) { setHata(res.hata); return; }
        yeniler.push({ malzeme_id: Date.now().toString() + adi, malzeme_adi: adi });
      }
      setListe((prev) => [...prev, ...yeniler]);
      setSecililer([]);
      setElleGiris("");
      setArama("");
      setAcik(false);
    });
  }

  function handleSil(id: string) {
    startTransition(async () => {
      const res = await malzemeSil(id);
      if (res?.hata) { setHata(res.hata); return; }
      setListe((prev) => prev.filter((m) => m.malzeme_id !== id));
    });
  }

  const eklenecekSayi = secililer.length + (elleGiris.trim() ? 1 : 0);

  return (
    <div className="bg-white border border-[#DDE8F0] rounded-[4px] p-[16px] mb-[10px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-[20px]">🔩</span>
          <div>
            <div className="text-[12px] font-semibold text-[#003057]">İşlenen Malzemeler</div>
            <div className="text-[10.5px] text-[#8A98A8]">Çelik, alüminyum, titanyum vb.</div>
          </div>
        </div>
        <button
          onClick={() => { setAcik(!acik); setSecililer([]); setElleGiris(""); setArama(""); }}
          className={`text-[11px] font-medium px-3 py-1.5 rounded-[3px] border transition-colors ${acik ? "text-[#5B6770] border-[#DDE8F0] hover:bg-[#F7FAFC]" : "bg-[#0077CC] text-white border-[#0077CC] hover:bg-[#005FA3]"}`}
        >
          {acik ? "İptal" : "+ Ekle"}
        </button>
      </div>

      {acik && (
        <form onSubmit={handleEkle} className="mb-3 p-3 bg-[#F7FAFC] border border-[#DDE8F0] rounded-[4px]">
          {/* Arama */}
          <input
            type="text"
            placeholder="Malzeme ara..."
            value={arama}
            onChange={(e) => { setArama(e.target.value); setGrup("Tümü"); }}
            className="w-full border border-[#DDE8F0] rounded-[3px] px-2 py-1.5 text-[11px] text-[#003057] outline-none focus:border-[#0077CC] mb-2"
          />

          {/* Grup sekmeleri */}
          <div className="flex flex-wrap gap-1 mb-3">
            {TUM_GRUPLAR.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => handleGrupDegis(g)}
                className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                  grup === g
                    ? "bg-[#003057] text-white border-[#003057]"
                    : "bg-white text-[#5B6770] border-[#DDE8F0] hover:border-[#003057] hover:text-[#003057]"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Malzeme chip listesi */}
          <div className="flex flex-wrap gap-1.5 mb-3 max-h-48 overflow-y-auto">
            {onerililer.length === 0 ? (
              <p className="text-[10.5px] text-[#8A98A8] italic">
                {arama ? "Arama sonucu bulunamadı." : "Bu gruptaki tüm malzemeler eklenmiş."}
              </p>
            ) : (
              onerililer.map((m) => {
                const secili = secililer.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleSecim(m)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                      secili
                        ? "bg-[#003057] text-white border-[#003057]"
                        : "bg-white text-[#7A4500] border-[#FFDDB3] hover:bg-[#FFF8F0]"
                    }`}
                  >
                    {secili ? "✓ " : ""}{m}
                  </button>
                );
              })
            )}
          </div>

          {/* Elle giriş */}
          <input
            type="text"
            placeholder="Listede yoksa buraya yazın..."
            value={elleGiris}
            onChange={(e) => setElleGiris(e.target.value)}
            className="w-full border border-[#DDE8F0] rounded-[3px] px-2 py-1.5 text-[11px] text-[#003057] outline-none focus:border-[#0077CC] mb-2"
          />

          {hata && <p className="text-[10.5px] text-red-500 mb-2">{hata}</p>}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isPending || eklenecekSayi === 0}
              className="bg-[#003057] text-white text-[11px] px-3 py-1.5 rounded-[3px] hover:bg-[#004080] disabled:opacity-40"
            >
              {isPending ? "Kaydediliyor..." : eklenecekSayi > 1 ? `${eklenecekSayi} Malzemeyi Ekle` : "Ekle"}
            </button>
            {secililer.length > 0 && (
              <span className="text-[10.5px] text-[#5B6770]">{secililer.length} seçili</span>
            )}
          </div>
        </form>
      )}

      {liste.length === 0 ? (
        <p className="text-[10.5px] text-[#8A98A8] italic">Henüz malzeme eklenmedi.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {liste.map((m) => (
            <span
              key={m.malzeme_id}
              className="flex items-center gap-1.5 bg-[#FFF8F0] border border-[#FFDDB3] text-[#7A4500] text-[11px] px-2.5 py-1 rounded-full"
            >
              {m.malzeme_adi}
              <button
                onClick={() => handleSil(m.malzeme_id)}
                disabled={isPending}
                className="text-[#C4873A] hover:text-red-500 leading-none disabled:opacity-50"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
