const STATS = [
  { lbl: "Gelen RFQ (30 gün)", icon: "▸", val: "—", delta: "Faz 2'de aktif", renk: "text-[#8B97A4]" },
  { lbl: "Profil Görüntüleme", icon: "◉", val: "—", delta: "Faz 2'de aktif", renk: "text-[#8B97A4]" },
  { lbl: "Aktif Mesaj", icon: "✉", val: "—", delta: "Faz 2'de aktif", renk: "text-[#8B97A4]" },
  { lbl: "Kayıtlı Tezgah", icon: "▦", val: "0", delta: "Profili tamamlayın", renk: "text-[#8B97A4]" },
];

const HIZLI = [
  { icon: "+", label: "Tezgah Ekle" },
  { icon: "📄", label: "Sertifika Yükle" },
  { icon: "📷", label: "Galeri Yönet" },
  { icon: "⇵", label: "Kapasiteyi Güncelle" },
];

export default function PanelPage() {
  return (
    <div>

      {/* Hoş geldiniz banner */}
      <div className="bg-gradient-to-r from-[#003057] to-[#1A3A5C] text-white px-[22px] py-[18px] rounded-[2px] mb-[18px] flex flex-wrap justify-between items-center gap-5">
        <div>
          <h1 className="text-[18px] font-light tracking-[0.2px] mb-1">Hoş geldiniz! 👋</h1>
          <p className="text-[11.5px] text-white/70 tracking-[0.2px]">
            Profilinizi tamamlayın ve alıcılara görünür olmaya başlayın.
          </p>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-4 gap-3 mb-[18px]">
        {STATS.map((s) => (
          <div key={s.lbl} className="bg-white border border-[#D4D8DC] rounded-[2px] px-4 py-[14px]">
            <div className="flex justify-between items-start mb-[6px]">
              <span className="text-[9.5px] text-[#5B6770] tracking-[1.5px] uppercase font-semibold leading-[1.3]">{s.lbl}</span>
              <span className="w-[22px] h-[22px] bg-[#F0F7FF] text-[#003057] rounded-[2px] flex items-center justify-center text-[11px] font-bold flex-shrink-0 ml-1">{s.icon}</span>
            </div>
            <div className="text-[26px] font-light text-[#003057] tracking-[-0.5px] leading-[1.1]">{s.val}</div>
            <div className={`text-[10px] mt-[5px] tracking-[0.2px] ${s.renk}`}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* Profil tamamlama */}
      <div className="bg-white border border-[#D4D8DC] rounded-[2px] border-l-[3px] border-l-[#C77700] px-[18px] py-4 mb-[18px] flex items-center gap-[18px]">
        <div className="w-[42px] h-[42px] bg-[#FEF0E6] text-[#C77700] rounded-[2px] flex items-center justify-center text-[20px] font-bold flex-shrink-0">
          !
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-semibold text-[#003057] mb-[3px]">Profiliniz tamamlanmayı bekliyor</div>
          <div className="text-[11.5px] text-[#3D4E63] leading-[1.5] mb-2">
            Kayıt tamamlandı. Tezgah bilgileri, sertifikalar ve görseller eklenince profiliniz alıcılara görünür olacak.
          </div>
          <div className="h-[6px] bg-[#D4D8DC] rounded-[1px] overflow-hidden mb-[6px]">
            <div className="h-full bg-[#C77700] w-[14%] rounded-[1px]" />
          </div>
          <div className="flex justify-between text-[10.5px] text-[#5B6770]">
            <span>Profil Doluluk Oranı</span>
            <span className="font-semibold text-[#C77700]">%14 — Onay Bekliyor</span>
          </div>
        </div>
      </div>

      {/* 2 kolonlu grid */}
      <div className="grid grid-cols-[2fr_1fr] gap-[18px] mb-[18px]">

        {/* Sol: RFQ boş durum */}
        <div className="bg-white border border-[#D4D8DC] rounded-[2px]">
          <div className="px-[18px] py-[14px] border-b border-[#D4D8DC] flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#003057] tracking-[1.5px] uppercase">Son RFQ Talepleri</span>
          </div>
          <div className="px-[18px] py-[44px] text-center">
            <div className="text-[28px] mb-3 opacity-30">▸</div>
            <p className="text-[13px] text-[#5B6770] font-medium mb-1">Henüz gelen RFQ yok</p>
            <p className="text-[11.5px] text-[#8B97A4] leading-[1.5] max-w-[280px] mx-auto">
              Profiliniz onaylandıktan sonra Avrupa, ABD ve Asya&apos;daki alıcılardan RFQ alabilirsiniz.
            </p>
          </div>
        </div>

        {/* Sağ: Abonelik + Hızlı aksiyonlar */}
        <div>
          {/* Abonelik */}
          <div className="bg-white border border-[#D4D8DC] rounded-[2px] p-[18px] mb-[18px]">
            <div className="flex justify-between items-start mb-[14px]">
              <div>
                <div className="text-[10px] tracking-[2px] text-[#5B6770] uppercase font-semibold mb-1">Mevcut Plan</div>
                <div className="text-[18px] font-light text-[#003057] tracking-[-0.2px]">Ücretsiz</div>
              </div>
              <span className="text-[9px] px-2 py-[3px] bg-[#E8F5EE] text-[#1A7A4A] rounded-[2px] tracking-[1px] uppercase font-semibold">Aktif</span>
            </div>
            <div className="grid grid-cols-2 gap-[10px] p-3 bg-[#F4F6F8] rounded-[2px] mb-3 text-[10px] text-[#5B6770] tracking-[0.5px]">
              <div>Aylık RFQ<span className="block text-[13px] text-[#003057] font-semibold mt-[2px] tracking-0 normal-case">5 adet</span></div>
              <div>Tezgah Listesi<span className="block text-[13px] text-[#003057] font-semibold mt-[2px] tracking-0 normal-case">3 adet</span></div>
            </div>
            <span className="block w-full text-center py-[10px] text-[10px] tracking-[1.5px] uppercase bg-[#003057] text-white rounded-[2px] font-medium cursor-not-allowed opacity-60 select-none">
              Plana Yükselt (Faz 2)
            </span>
          </div>

          {/* Hızlı aksiyonlar */}
          <div className="bg-white border border-[#D4D8DC] rounded-[2px]">
            <div className="px-[18px] py-[14px] border-b border-[#D4D8DC]">
              <span className="text-[11px] font-semibold text-[#003057] tracking-[1.5px] uppercase">Hızlı Aksiyonlar</span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-[14px]">
              {HIZLI.map((a) => (
                <div
                  key={a.label}
                  className="p-[14px_12px] bg-white border border-[#D4D8DC] rounded-[2px] text-center opacity-50 cursor-not-allowed select-none"
                  title="Faz 2'de aktif"
                >
                  <div className="text-[18px] mb-[6px] text-[#003057]">{a.icon}</div>
                  <div className="text-[10.5px] tracking-[0.5px] text-[#003057] font-semibold uppercase leading-[1.3]">{a.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tezgah boş durum */}
      <div className="bg-white border border-[#D4D8DC] rounded-[2px]">
        <div className="px-[18px] py-[14px] border-b border-[#D4D8DC] flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#003057] tracking-[1.5px] uppercase">Tezgah Parkım — Aktif Listeler</span>
        </div>
        <div className="px-[18px] py-[40px] text-center">
          <div className="text-[28px] mb-3 opacity-30">▦</div>
          <p className="text-[13px] text-[#5B6770] font-medium mb-1">Henüz tezgah eklenmedi</p>
          <p className="text-[11.5px] text-[#8B97A4] leading-[1.5]">
            Faz 2&apos;de tezgah ekleme özelliği aktif olacak.
          </p>
        </div>
      </div>
    </div>
  );
}
