"use client";

import { getTipParametreleri, type ParamTanim } from "@/lib/tezgah-parametreleri";

const inputCls =
  "w-full px-3 py-[9px] border border-[#C8D8E8] rounded-[3px] bg-white text-[#1A2535] text-[13px] outline-none focus:border-[#00529C] focus:ring-2 focus:ring-[#0077CC]/10 transition-[border-color]";
const labelCls = "text-[10px] font-semibold text-[#4A5568] tracking-[0.8px] uppercase";
const selectCls = inputCls + " appearance-none cursor-pointer";

interface Props {
  tipId: number | null;
  degerler: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function TezgahParametrelerBolumu({ tipId, degerler, onChange }: Props) {
  const params = getTipParametreleri(tipId);
  if (params.length === 0) return null;

  function ParamAlan({ p }: { p: ParamTanim }) {
    const val = degerler[p.key] ?? "";
    const label = (
      <label className={labelCls}>
        {p.label}
        {p.birim && (
          <span className="text-[9px] font-normal normal-case tracking-normal text-[#8A98A8] ml-1">
            ({p.birim})
          </span>
        )}
      </label>
    );

    if (p.tip === "secim") {
      return (
        <div className="flex flex-col gap-[5px]">
          {label}
          <select
            className={selectCls}
            value={val}
            onChange={(e) => onChange(p.key, e.target.value)}
          >
            <option value="">— Seçin —</option>
            {p.secenekler!.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      );
    }

    if (p.tip === "sayi") {
      return (
        <div className="flex flex-col gap-[5px]">
          {label}
          <input
            type="text"
            inputMode="decimal"
            className={inputCls}
            placeholder={p.placeholder ?? ""}
            value={val}
            onChange={(e) => {
              // Sadece rakam ve nokta/virgül kabul et
              const temiz = e.target.value.replace(/[^0-9.,]/g, "");
              onChange(p.key, temiz);
            }}
          />
        </div>
      );
    }

    // metin
    return (
      <div className="flex flex-col gap-[5px]">
        {label}
        <input
          type="text"
          className={inputCls}
          placeholder={p.placeholder ?? ""}
          value={val}
          onChange={(e) => onChange(p.key, e.target.value)}
        />
        {p.ipucu && (
          <div className="text-[9.5px] text-[#8A98A8] mt-[2px]">{p.ipucu}</div>
        )}
      </div>
    );
  }

  return (
    <div className="border-t border-[#DDE8F0] mt-[16px] pt-[14px]">
      {/* Bölüm başlığı */}
      <div className="flex items-center gap-[8px] mb-[12px]">
        <div className="text-[10px] font-semibold text-[#003057] tracking-[1.5px] uppercase">
          Teknik Parametreler
        </div>
        <span className="text-[9px] px-[7px] py-[2px] rounded-[2px] bg-[#E8F2FA] text-[#00529C] font-semibold tracking-[0.3px]">
          İsteğe Bağlı
        </span>
      </div>
      <div className="text-[10.5px] text-[#5B6770] mb-[12px] leading-[1.5]">
        Bu tezgah tipine özgü teknik veriler alıcıların aramasında ve profil sayfanızda görünür.
      </div>

      {/* Parametre alanları — 2 sütun grid */}
      {/* NOT: ParamAlan JSX olarak değil fonksiyon olarak çağrılıyor.
          JSX ile çağrılırsa her render'da yeni component tipi → focus kaybı */}
      <div className="grid grid-cols-2 gap-[12px]">
        {params.map((p) => (
          <div key={p.key}>
            {ParamAlan({ p })}
          </div>
        ))}
      </div>
    </div>
  );
}
