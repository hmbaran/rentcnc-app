// Tezgah bilgi doluluk hesaplama

export type TezgahDolulukInput = {
  model:             string | null;
  bag_x_mm:          number | null;
  bag_y_mm:          number | null;
  bag_z_mm:          number | null;
  max_rpm:           number | null;
  yapim_yili:        number | null;
  kontrol_sistemi:   { ad: string } | null;
  gorsel_sayisi?:    number;
};

type DolulukAdim = {
  alan:    string;
  puan:    number;
  tamam:   boolean;
  link?:   string;  // "Ekle" linki
};

export function tezgahDolulukHesapla(t: TezgahDolulukInput): {
  yuzde:   number;
  adimlar: DolulukAdim[];
} {
  const adimlar: DolulukAdim[] = [
    {
      alan:  "Model adı",
      puan:  15,
      tamam: !!(t.model?.trim()),
    },
    {
      alan:  "X/Y/Z Eksen Stroku",
      puan:  20,
      tamam: !!(t.bag_x_mm && t.bag_y_mm),
    },
    {
      alan:  "Max. İşmili Devri",
      puan:  10,
      tamam: !!(t.max_rpm),
    },
    {
      alan:  "Yapım Yılı",
      puan:  10,
      tamam: !!(t.yapim_yili),
    },
    {
      alan:  "Kontrol Sistemi",
      puan:  15,
      tamam: !!(t.kontrol_sistemi?.ad),
    },
    {
      alan:  "Fotoğraf",
      puan:  30,
      tamam: (t.gorsel_sayisi ?? 0) > 0,
    },
  ];

  const kazanilan = adimlar.filter((a) => a.tamam).reduce((s, a) => s + a.puan, 0);
  const toplam    = adimlar.reduce((s, a) => s + a.puan, 0);
  const yuzde     = Math.round((kazanilan / toplam) * 100);

  return { yuzde, adimlar };
}

export function dolulukRenk(yuzde: number): {
  bar: string; badge: string; text: string;
} {
  if (yuzde >= 80) return {
    bar:   "bg-[#1A7A4A]",
    badge: "bg-[#E8F5EE] text-[#1A7A4A]",
    text:  "text-[#1A7A4A]",
  };
  if (yuzde >= 50) return {
    bar:   "bg-[#C77700]",
    badge: "bg-[#FEF8E6] text-[#B07A00]",
    text:  "text-[#B07A00]",
  };
  return {
    bar:   "bg-[#C05C00]",
    badge: "bg-[#FEF0E6] text-[#C05C00]",
    text:  "text-[#C05C00]",
  };
}
