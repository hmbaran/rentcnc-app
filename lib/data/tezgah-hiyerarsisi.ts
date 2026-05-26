export type AltKategori = {
  label: string;
  eksenler: string[];
};

export type TezgahTipVeri = {
  label: string;
  alts: Record<string, AltKategori>;
  markalar: string[];
};

export const tezgahHiyerarsisi: Record<string, TezgahTipVeri> = {
  dik_isleme: {
    label: "Dik İşleme Merkezi",
    alts: {
      kopru_tip: { label: "Köprü Tipi Dik İşleme Merkezi", eksenler: ["3-Eksenli", "4-Eksenli (Divizörlü)", "5-Eksen"] },
      c_tip: { label: "C-Tipi Dik İşleme Merkezi", eksenler: ["3-Eksenli", "4-Eksenli (Divizörlü)", "5-Eksen"] },
      kolon_hareketli: { label: "Kolon Hareketli Dik İşleme Merkezi", eksenler: ["3-Eksenli", "4-Eksenli (Divizörlü)", "5-Eksen"] },
      bes_eksen_dik: { label: "5-Eksen Dik İşleme Merkezi", eksenler: ["5-Eksen Simultane", "5+1 Eksen", "5 Eksen Trunnion", "5 Eksen Fork (Çatal)"] },
    },
    markalar: ["DMG Mori", "Mazak", "Okuma", "Haas", "Makino", "Hermle", "Grob", "Chiron", "Matsuura", "Kitamura", "Hurco", "Hwacheon", "Hyundai WIA", "DN Solutions", "Feeler", "YCM", "Quaser", "Leadwell", "Brother", "Fanuc Robodrill", "Kern", "Mikron", "Datron", "İğrek Makine 🇹🇷", "Etasis 🇹🇷", "Mazaka 🇹🇷", "SMTCL 🇨🇳", "Diğer / Manuel Giriş"],
  },
  yatay_isleme: {
    label: "Yatay İşleme Merkezi",
    alts: {
      uc_eksen: { label: "3-Eksen Yatay İşleme", eksenler: ["3-Eksen"] },
      dort_eksen: { label: "4-Eksen Yatay İşleme", eksenler: ["4-Eksen"] },
      bes_eksen: { label: "5-Eksen Yatay İşleme", eksenler: ["5-Eksen Simultane", "5+1 Eksen"] },
    },
    markalar: ["DMG Mori", "Mazak", "Okuma", "Makino", "Grob", "Chiron", "Heller", "Burkhardt+Weber", "Alfing", "Liebherr", "DN Solutions", "Hwacheon", "Diğer / Manuel Giriş"],
  },
  torna: {
    label: "Tornalar",
    alts: {
      yatay_torna: { label: "Yatay Tornalar", eksenler: ["2-Eksen", "3-Eksen (C-Eksenli)", "4-Eksen (C/Y Eksenli)", "Çift Aynalı", "Çift Ayna-Çift Taretli", "Çok Eksenli"] },
      dik_torna: { label: "Dik Tornalar (VTL)", eksenler: ["2-Eksen Dik", "3-Eksen (C-Eksenli) Dik", "Çok Eksenli Dik"] },
      millturn: { label: "Tornalama Merkezleri — Turn-Mill", eksenler: ["4-Eksen Turn-Mill", "5-Eksen Turn-Mill", "Multi-tasking (7+ Eksen)"] },
      jant: { label: "Jant Tornaları", eksenler: ["2-Eksen", "3-Eksen"] },
      poligon: { label: "Poligon Tornalar", eksenler: ["2-Eksen", "3-Eksen"] },
    },
    markalar: ["DMG Mori", "Mazak", "Okuma", "Haas", "Nakamura-Tome", "Miyano", "Monforts", "WFL Millturn", "Hardinge", "Hwacheon", "Hyundai WIA", "DN Solutions", "Hankook", "EMAG", "Pietro Carnaghi", "Eurotech Elite", "Index Traub", "Weiler", "Takisawa", "Fuji", "Dainichi", "Niles-Simmons", "Diğer / Manuel Giriş"],
  },
  otomat: {
    label: "Otomatlar ve Kayar Otomatlar",
    alts: {
      otomat_std: { label: "Otomatlar", eksenler: ["Tek Milli", "Çok Milli (4-8 Mil)"] },
      kayar: { label: "Kayar Otomatlar (Swiss Type)", eksenler: ["6-Eksen Swiss", "7-Eksen Swiss", "9-Eksen Swiss", "Multi-tasking Swiss"] },
    },
    markalar: ["Citizen", "Star", "Tsugami", "Tornos", "DMG Mori", "DN Solutions", "Nomura", "Sowin", "Index", "Maier", "Muratec", "Haas", "Hanwha", "NexTurn", "Diğer / Manuel Giriş"],
  },
  taslama: {
    label: "Taşlama Tezgahları",
    alts: {
      silindirik: { label: "Silindirik Taşlama", eksenler: ["Dış Silindirik", "İç Silindirik", "Universal (İç+Dış)", "Puntasız (Centerless)"] },
      satih: { label: "Satıh Taşlama", eksenler: ["Yatay Milli", "Dikey Milli", "Döner Tablalı"] },
      profil: { label: "Profil Taşlama", eksenler: ["2-Eksen", "3-Eksen CNC", "5-Eksen"] },
      delik_tas: { label: "Delik Taşlama", eksenler: ["Manuel", "CNC", "Universal"] },
      disli_tas: { label: "Dişli Taşlama", eksenler: ["Silindirik Dişli", "Konik Dişli", "Spline"] },
    },
    markalar: ["Fritz Studer", "Kellenberger", "Blohm", "Schaudt", "Mikrosa", "Mägerle", "Jones & Shipman", "Okamoto", "Danobat", "Anca", "Walter", "Rollomatic", "Niles-Simmons", "EMAG", "Erwin Junker", "Reishauer", "Gleason", "Klingelnberg", "Sunnen", "Chevalier", "Diğer / Manuel Giriş"],
  },
  erozyon: {
    label: "Erozyon Tezgahları",
    alts: {
      tel_erozyon: { label: "Tel Erozyon (Wire EDM)", eksenler: ["2-Eksen", "4-Eksen (Konik)", "5-Eksen"] },
      dalma_erozyon: { label: "Dalma Erozyon (Sinker EDM)", eksenler: ["2-Eksen", "3-Eksen CNC", "5-Eksen"] },
      delik_erozyon: { label: "Delik Delme Erozyon (EDM Drill)", eksenler: ["Manuel", "CNC"] },
    },
    markalar: ["Sodick", "GF Machining Solutions", "Mitsubishi EDM", "Makino", "ONA", "Chmer", "AccuteX", "Exeron", "Seibu", "Diğer / Manuel Giriş"],
  },
  portal: {
    label: "Portal Tezgahlar",
    alts: {
      dik_portal: { label: "Dik Portal Freze", eksenler: ["3-Eksen", "5-Eksen"] },
      yatay_portal: { label: "Yatay Portal / Floor Boring Mill", eksenler: ["3-Eksen", "4-Eksen", "5-Eksen"] },
    },
    markalar: ["Zimmermann", "Droop+Rein", "WaldrichCoburg", "Schiess", "PAMA", "FPT Industrie", "Parpas", "Soraluce", "Jobs", "Mecof", "Diğer / Manuel Giriş"],
  },
  sac: {
    label: "Metal Şekillendirme / Kesme / Bükme / Delme",
    alts: {
      abkant: { label: "Abkant Pres (Press Brake)", eksenler: ["2-Eksen", "4-Eksen", "6-Eksen CNC", "Robot Abkant"] },
      fiber_lazer: { label: "Fiber Lazer Kesim", eksenler: ["2D Düz Sac", "3D / 5-Eksen", "Boru-Profil Lazer"] },
      plazma: { label: "Plazma Kesim", eksenler: ["2D", "Yüksek Hassasiyetli (HPP)"] },
      su_jeti: { label: "Su Jeti Kesim (Waterjet)", eksenler: ["2D", "5-Eksen"] },
      punch: { label: "Punch / Delme Presi", eksenler: ["Mekanik", "Hidrolik", "CNC Turret"] },
      makas: { label: "Sac Kesme Makası (Shear)", eksenler: ["Düz Kesim", "Giyotin"] },
      roll: { label: "Roll Bükme", eksenler: ["3 Merdaneli", "4 Merdaneli"] },
    },
    markalar: ["Trumpf", "Bystronic", "Amada", "LVD", "Salvagnini", "Prima Power", "Ermaksan 🇹🇷", "Durmazlar 🇹🇷", "Baykal 🇹🇷", "MVD 🇹🇷", "Bodor Laser 🇨🇳", "HSG Laser 🇨🇳", "Hypertherm", "Flow (Su Jeti)", "OMAX", "Diğer / Manuel Giriş"],
  },
  kaynak: {
    label: "Kaynak Tezgahları",
    alts: {
      mig_mag: { label: "MIG / MAG Kaynak", eksenler: ["Manuel", "Robot Kaynak", "CNC Kaynak"] },
      tig: { label: "TIG Kaynak", eksenler: ["Manuel", "Orbital"] },
      lazer_kaynak: { label: "Lazer Kaynak", eksenler: ["Nokta Kaynak", "Sürekli"] },
      direnc: { label: "Direnç Kaynağı", eksenler: ["Nokta", "Dikiş"] },
    },
    markalar: ["Trumpf", "Fronius", "Lincoln Electric", "Miller", "ESAB", "Kemppi", "Fanuc (Robot)", "KUKA (Robot)", "Diğer / Manuel Giriş"],
  },
  universal: {
    label: "Universal / Manuel Tezgahlar",
    alts: {
      univ_torna: { label: "Universal Torna", eksenler: ["Manuel"] },
      univ_freze: { label: "Universal Freze", eksenler: ["Manuel", "Normal Freze", "Kalıpçı Freze"] },
      univ_matkap: { label: "Universal Delik Delme", eksenler: ["Kayışlı Masa Üstü Matkap", "Sütunlu Matkap", "Radyal Matkap"] },
      pres: { label: "Pres", eksenler: ["Eksantrik Pres", "Hidrolik Pres"] },
    },
    markalar: ["Emco", "Knuth", "Sharp", "South Bend", "Clausing", "Kent CNC", "Bridgeport", "Diğer / Manuel Giriş"],
  },
  testere: {
    label: "Testereler",
    alts: {
      serit_mafsalli: { label: "Mafsallı Şerit Testere", eksenler: ["Manuel", "Yarı Otomatik", "Tam Otomatik"] },
      serit_sutunlu: { label: "Sütunlu Şerit Testere", eksenler: ["Yarı Otomatik", "Tam Otomatik"] },
    },
    markalar: ["Behringer", "Kasto", "DoALL", "Marvel", "Cosen", "MEP", "Diğer / Manuel Giriş"],
  },
  disli: {
    label: "Dişli Tezgahları",
    alts: {
      dis_hobbing: { label: "Diş Frezeleme (Gear Hobbing)", eksenler: ["4-Eksen", "5-Eksen", "CNC"] },
      dis_grinding: { label: "Diş Taşlama (Gear Grinding)", eksenler: ["Silindirik Dişli", "Konik Dişli (Bevel)", "Spline"] },
      dis_shaping: { label: "Diş Dalma (Gear Shaping)", eksenler: ["CNC", "Manuel"] },
    },
    markalar: ["Liebherr", "Gleason", "Klingelnberg", "Reishauer", "HOFLER", "Samputensili", "Diğer / Manuel Giriş"],
  },
  additive: {
    label: "Additive Manufacturing Tezgahları",
    alts: {
      slm_dmls: { label: "Metal Toz Yatağı (SLM / DMLS)", eksenler: ["Tek Lazer", "Çift Lazer", "Dörtlü Lazer"] },
      ded_lmd: { label: "Doğrudan Enerji Birikimi (DED / LMD)", eksenler: ["5-Eksen"] },
      binder: { label: "Binder Jetting", eksenler: ["Standart"] },
    },
    markalar: ["Trumpf TruPrint", "EOS", "SLM Solutions", "Renishaw", "DMG Mori LASERTEC", "Desktop Metal", "Markforged", "Diğer / Manuel Giriş"],
  },
  tapping: {
    label: "Tapping Centers / Delik Delme-Kılavuz Açma",
    alts: {
      tapping_std: { label: "Tapping Center (Standart)", eksenler: ["3-Eksen", "4-Eksen"] },
      derin_delik: { label: "Derin Delik Delme", eksenler: ["Gun-Drill", "BTA / STS", "Ejektör"] },
    },
    markalar: ["Brother", "Fanuc Robodrill", "Yasda", "Makino", "UNISIG", "TBT", "Diğer / Manuel Giriş"],
  },
};

export const TEZGAH_TIP_SECENEKLERI = [
  { value: "dik_isleme", label: "Dik İşleme Merkezi" },
  { value: "yatay_isleme", label: "Yatay İşleme Merkezi" },
  { value: "torna", label: "Tornalar" },
  { value: "otomat", label: "Otomatlar ve Kayar Otomatlar" },
  { value: "taslama", label: "Taşlama Tezgahları" },
  { value: "erozyon", label: "Erozyon Tezgahları" },
  { value: "portal", label: "Portal Tezgahlar" },
  { value: "sac", label: "Metal Şekillendirme / Kesme / Bükme / Delme" },
  { value: "kaynak", label: "Kaynak Tezgahları" },
  { value: "universal", label: "Universal / Manuel Tezgahlar" },
  { value: "testere", label: "Testereler" },
  { value: "disli", label: "Dişli Tezgahları" },
  { value: "additive", label: "Additive Manufacturing Tezgahları" },
  { value: "tapping", label: "Tapping Centers / Delik Delme-Kılavuz Açma" },
] as const;

export const KONTROL_SISTEMLERI = [
  "Fanuc 0i-MF", "Fanuc 31i", "Siemens 840D sl",
  "Heidenhain TNC 640", "Heidenhain TNC 7",
  "Mazatrol SmoothG (Mazak)", "Mazatrol SmoothX (Mazak)",
  "OSP-P300 (Okuma)", "Mitsubishi M800", "Brother Speedio",
  "Diğer / Manuel Giriş",
];
