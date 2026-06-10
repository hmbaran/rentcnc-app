/**
 * Tezgah tiplerine göre dinamik parametre tanımları.
 * tip_id → ParamTanim[] eşlemesi.
 * Form bileşenleri ve firma profil sayfası bu şemayı kullanır.
 */

export type ParamTip = "sayi" | "metin" | "secim";

export type ParamTanim = {
  key: string;
  label: string;
  tip: ParamTip;
  birim?: string;
  secenekler?: string[];
  placeholder?: string;
  ipucu?: string;
};

// ─── tip_id → parametre listesi ──────────────────────────────────────────────
export const TEZGAH_PARAMETRELERI: Record<number, ParamTanim[]> = {

  // 33 — Dik İşleme Merkezi
  33: [
    {
      key: "spindle_taper", label: "Spindle Taper / Bağlantı", tip: "secim",
      secenekler: ["BT30", "BT40", "BT50", "HSK-A40", "HSK-A50", "HSK-A63", "HSK-A100", "CAT40", "CAT50"],
    },
    { key: "tabla_yuklenme_kg", label: "Tabla Max. Yüklenme", tip: "sayi", birim: "kg", placeholder: "500" },
    { key: "alet_sayisi", label: "Alet Magazini Kapasitesi", tip: "sayi", birim: "alet", placeholder: "24" },
    {
      key: "sogutma", label: "Soğutma Tipi", tip: "secim",
      secenekler: ["İç Soğutma (Through Spindle)", "Dış Soğutma", "Hava Soğutma", "Minimum Yağlama (MQL)", "Yok"],
    },
    { key: "palet", label: "Palet Değiştirici", tip: "secim", secenekler: ["Var", "Yok"] },
  ],

  // 34 — Yatay İşleme Merkezi
  34: [
    {
      key: "spindle_taper", label: "Spindle Taper / Bağlantı", tip: "secim",
      secenekler: ["BT40", "BT50", "HSK-A50", "HSK-A63", "HSK-A100", "CAT40", "CAT50"],
    },
    { key: "palet_boyutu_mm", label: "Palet Boyutu", tip: "metin", birim: "mm", placeholder: "500×500" },
    { key: "tabla_yuklenme_kg", label: "Tabla Max. Yüklenme", tip: "sayi", birim: "kg", placeholder: "800" },
    { key: "alet_sayisi", label: "Alet Magazini Kapasitesi", tip: "sayi", birim: "alet", placeholder: "60" },
    {
      key: "sogutma", label: "Soğutma Tipi", tip: "secim",
      secenekler: ["İç Soğutma (Through Spindle)", "Dış Soğutma", "Hava Soğutma", "Minimum Yağlama (MQL)", "Yok"],
    },
    { key: "palet", label: "Palet Değiştirici", tip: "secim", secenekler: ["Var", "Yok"] },
  ],

  // 35 — Tornalar
  35: [
    { key: "max_tur_capi_mm",    label: "Max. Torna Çapı",            tip: "sayi", birim: "mm",   placeholder: "400" },
    { key: "max_is_boyu_mm",     label: "Max. İş Parçası Boyu",       tip: "sayi", birim: "mm",   placeholder: "1000" },
    { key: "bar_kapasitesi_mm",  label: "Bar Kapasitesi (Çap)",        tip: "sayi", birim: "mm",   placeholder: "65" },
    { key: "ayna_capi_inc",      label: "Ayna (Chuck) Çapı",           tip: "sayi", birim: "inç",  placeholder: "8" },
    {
      key: "sogutma", label: "Soğutma Tipi", tip: "secim",
      secenekler: ["İç Soğutma", "Dış Soğutma", "Yok"],
    },
    { key: "canli_takimlar", label: "Canlı Takımlar (Driven Tools)", tip: "secim", secenekler: ["Var", "Yok"] },
  ],

  // 36 — Otomatlar ve Kayar Otomatlar
  36: [
    { key: "max_cap_mm",          label: "Max. Çubuk Çapı",    tip: "sayi", birim: "mm",   placeholder: "32" },
    { key: "besleme_uzunlugu_mm", label: "Besleme Uzunluğu",   tip: "sayi", birim: "mm",   placeholder: "1200" },
    { key: "milli_sayisi",        label: "Milli Sayısı",        tip: "sayi", birim: "milli", placeholder: "1" },
  ],

  // 37 — Taşlama Tezgahları
  37: [
    {
      key: "taslama_turu", label: "Taşlama Türü", tip: "secim",
      secenekler: ["Düzlem Taşlama", "Silindirik Taşlama", "İç Taşlama", "Diş Taşlama", "Profil Taşlama", "Yüzey Taşlama"],
    },
    { key: "tabla_boyu_mm",     label: "Tabla / Sürüş Boyu",     tip: "sayi", birim: "mm", placeholder: "600" },
    { key: "tabla_genisligi_mm",label: "Tabla / Sürüş Genişliği", tip: "sayi", birim: "mm", placeholder: "300" },
  ],

  // 38 — Erozyon Tezgahları
  38: [
    {
      key: "erozyon_turu", label: "Erozyon Türü", tip: "secim",
      secenekler: ["Tel Erozyon (Wire EDM)", "Dalma Erozyon (Sinker EDM)", "Delik Delme EDM"],
    },
    { key: "max_is_yuksekligi_mm", label: "Max. İş Yüksekliği", tip: "sayi", birim: "mm", placeholder: "200" },
    { key: "tel_capi_mm",          label: "Tel Çapı (Tel Erozyon)", tip: "metin", birim: "mm", placeholder: "0.25" },
  ],

  // 39 — Portal Tezgahlar
  39: [
    { key: "portal_genisligi_mm", label: "Portal Genişliği (Y)", tip: "sayi", birim: "mm",  placeholder: "2000" },
    { key: "tabla_yuklenme_kg",   label: "Tabla Max. Yüklenme",  tip: "sayi", birim: "kg",  placeholder: "5000" },
    {
      key: "spindle_taper", label: "Spindle Taper / Bağlantı", tip: "secim",
      secenekler: ["BT40", "BT50", "HSK-A50", "HSK-A63", "HSK-A100", "CAT40", "CAT50"],
    },
    {
      key: "sogutma", label: "Soğutma Tipi", tip: "secim",
      secenekler: ["İç Soğutma", "Dış Soğutma", "Hava Soğutma", "Yok"],
    },
  ],

  // 40 — Gantry Tezgahlar
  40: [
    { key: "portal_genisligi_mm", label: "Portal Genişliği (Y)", tip: "sayi", birim: "mm", placeholder: "3000" },
    { key: "tabla_yuklenme_kg",   label: "Max. Yüklenme",         tip: "sayi", birim: "kg", placeholder: "10000" },
    {
      key: "spindle_taper", label: "Spindle Taper / Bağlantı", tip: "secim",
      secenekler: ["BT40", "BT50", "HSK-A50", "HSK-A63", "HSK-A100"],
    },
  ],

  // 41 — Metal Şekillendirme/Kesme/Bükme
  41: [
    {
      key: "isleme_turu", label: "İşleme / Teknoloji Türü", tip: "secim",
      secenekler: [
        "Lazer Kesme (Fiber)", "Lazer Kesme (CO2)", "Plazma Kesme", "Su Jeti Kesme",
        "Abkant Pres", "Giyotin Makas", "Eksantrik / Hidrolik Pres",
        "Profil Bükme", "Hadde / Silindir Bükme",
      ],
    },
    { key: "guc_kw",                  label: "Güç",                              tip: "sayi", birim: "kW",  placeholder: "6" },
    { key: "max_sac_kalinligi_mm",    label: "Max. Sac / Malzeme Kalınlığı",     tip: "sayi", birim: "mm",  placeholder: "20" },
    { key: "kesme_bükme_uzunlugu_mm", label: "Max. Kesme / Bükme Uzunluğu",      tip: "sayi", birim: "mm",  placeholder: "3000" },
    { key: "pres_kapasitesi_ton",     label: "Pres Kapasitesi (Abkant / Pres)",  tip: "sayi", birim: "ton", placeholder: "100" },
  ],

  // 42 — Kaynak Tezgahları
  42: [
    {
      key: "kaynak_turu", label: "Kaynak Türü", tip: "secim",
      secenekler: [
        "MIG/MAG (GMAW)", "TIG (GTAW)", "MMA / Elektrod",
        "Lazer Kaynak", "Plazma Kaynak", "Nokta Kaynak",
        "Direnç Kaynak", "Sürtünme Kaynak", "Tozaltı Kaynak (SAW)",
      ],
    },
    { key: "max_kaynak_genisligi_mm", label: "Max. Kaynak Erişim Genişliği", tip: "sayi", birim: "mm", placeholder: "2000" },
    {
      key: "otomasyon", label: "Otomasyon Seviyesi", tip: "secim",
      secenekler: ["Tam Otomatik (Robot)", "Yarı Otomatik", "Manuel"],
    },
  ],

  // 44 — Testereler
  44: [
    {
      key: "testere_turu", label: "Testere Türü", tip: "secim",
      secenekler: ["Şerit Testere (Band Saw)", "Daire Testere (Circular Saw)", "Soğuk Testere", "Disk Testere"],
    },
    { key: "max_kesme_cap_mm",      label: "Max. Kesme Çapı (Yuvarlak)", tip: "sayi", birim: "mm", placeholder: "300" },
    { key: "max_kesme_genislik_mm", label: "Max. Kesme Genişliği",        tip: "sayi", birim: "mm", placeholder: "250" },
  ],

  // 47 — Additive Manufacturing
  47: [
    {
      key: "baski_teknolojisi", label: "Baskı Teknolojisi", tip: "secim",
      secenekler: [
        "FDM / FFF (Filament)", "SLA / DLP (Reçine)", "SLS (Nylon / Toz)",
        "DMLS / SLM (Metal Toz)", "Binder Jetting", "Polyjet / Multijet", "DED / WAAM",
      ],
    },
    {
      key: "malzeme_tipi", label: "Malzeme Tipi", tip: "secim",
      secenekler: ["Plastik / Polimer", "Metal (Çelik, Ti, Al vb.)", "Seramik", "Kompozit / Karbon Fiber", "Çoklu Malzeme"],
    },
    { key: "baski_hacmi_mm",       label: "Baskı Hacmi (X×Y×Z)", tip: "metin", birim: "mm", placeholder: "250×250×300" },
    { key: "katman_kalinligi_um",  label: "Min. Katman Kalınlığı", tip: "sayi", birim: "µm", placeholder: "50" },
  ],

  // 48 — Tapping Centers / Delik Delme
  48: [
    {
      key: "spindle_taper", label: "Spindle Taper", tip: "secim",
      secenekler: ["BT30", "BT40", "HSK-A40", "HSK-A50", "HSK-F40 (Hollow Shank)"],
    },
    { key: "alet_sayisi", label: "Alet Sayısı", tip: "sayi", birim: "alet", placeholder: "21" },
  ],

  // 59 — Ölçüm / CMM Tezgahları
  59: [
    { key: "olcum_hacmi_mm",  label: "Ölçüm Hacmi (X×Y×Z)",         tip: "metin", birim: "mm", placeholder: "500×700×500" },
    { key: "hassasiyet_um",   label: "Ölçüm Hassasiyeti (MPEe)",     tip: "sayi",  birim: "µm",  placeholder: "2" },
    { key: "kafas_tipi",      label: "Dokunma Kafası / Sensör Tipi", tip: "metin", placeholder: "Renishaw TP20, Zeiss RDS vb." },
    {
      key: "calisma_sekli", label: "Çalışma Şekli", tip: "secim",
      secenekler: ["Tam CNC Otomatik", "Manuel CNC", "Optik / Lazer", "Taşınabilir Kol"],
    },
  ],
};

// ─── Yardımcı fonksiyonlar ────────────────────────────────────────────────────

/** tip_id için parametre tanımı listesini döner (yoksa boş dizi) */
export function getTipParametreleri(tipId: number | null): ParamTanim[] {
  if (!tipId) return [];
  return TEZGAH_PARAMETRELERI[tipId] ?? [];
}

/** Verilen key için label döner */
export function parametreLabel(key: string): string {
  for (const params of Object.values(TEZGAH_PARAMETRELERI)) {
    const found = params.find((p) => p.key === key);
    if (found) return found.label;
  }
  return key;
}

/** Verilen key için birim döner */
export function parametreBirim(key: string): string | undefined {
  for (const params of Object.values(TEZGAH_PARAMETRELERI)) {
    const found = params.find((p) => p.key === key);
    if (found) return found.birim;
  }
}
