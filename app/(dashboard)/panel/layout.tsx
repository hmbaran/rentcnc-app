import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { cikisYap } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Firma Paneli" };

const NAV_ANA = [
  { icon: "◉", label: "Firma Profili" },
  { icon: "▦", label: "Tezgah Parkım" },
];

const NAV_ILETISIM = [
  { icon: "✉", label: "Mesajlar" },
  { icon: "▸", label: "Gelen RFQ" },
  { icon: "★", label: "Değerlendirmeler" },
];

const NAV_HESAP = [
  { icon: "◈", label: "Abonelik" },
  { icon: "$", label: "Ödemeler" },
  { icon: "⚙", label: "Ayarlar" },
  { icon: "?", label: "Yardım & Destek" },
];

function YakindaItem({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="flex items-center gap-[10px] px-[18px] py-[9px] text-[12px] text-white/35 tracking-[0.3px] cursor-not-allowed select-none">
      <span className="w-[14px] flex-shrink-0 opacity-70">{icon}</span>
      {label}
      <span className="ml-auto text-[8px] bg-white/10 text-white/35 px-[5px] py-[1px] rounded-[2px] tracking-[0.5px] whitespace-nowrap">Faz 2</span>
    </span>
  );
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/giris");

  const email = user.email ?? "";
  const localPart = email.split("@")[0];
  const segments = localPart.split(/[._-]/);
  const initials = ((segments[0]?.[0] ?? "") + (segments[1]?.[0] ?? segments[0]?.[1] ?? "")).toUpperCase() || "??";

  return (
    <div className="flex min-h-screen bg-[#F4F6F8]">

      {/* Sidebar */}
      <aside className="w-[220px] flex-shrink-0 bg-[#003057] flex flex-col sticky top-0 h-screen overflow-y-auto">

        {/* Logo */}
        <div className="px-[18px] py-[18px] border-b border-white/10 flex-shrink-0">
          <div className="text-[13px] font-medium tracking-[2px] text-white uppercase">
            RENT<span className="text-[#7ABFFF] font-bold">CNC</span>MACHINE
          </div>
          <div className="text-[9px] tracking-[1.5px] text-white/40 mt-[3px] uppercase">Firma Paneli</div>
        </div>

        {/* Firma */}
        <div className="px-[18px] py-[14px] bg-black/[0.18] border-b border-white/[0.08] flex-shrink-0">
          <div className="text-[12px] text-white font-medium tracking-[0.3px] leading-[1.3] truncate">—</div>
          <div className="text-[9px] text-[#7ABFFF] tracking-[1.5px] mt-1 uppercase flex items-center gap-[5px]">
            <span className="w-[6px] h-[6px] rounded-full bg-[#1A7A4A] flex-shrink-0" />
            Ücretsiz Plan
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1">
          <p className="px-[18px] pt-[14px] pb-[6px] text-[9px] tracking-[2px] text-white/30 uppercase font-semibold">Ana</p>
          <Link
            href="/panel"
            className="flex items-center gap-[10px] px-[18px] py-[9px] text-[12px] text-[#7ABFFF] border-l-2 border-[#7ABFFF] bg-[rgba(122,191,255,0.08)] tracking-[0.3px] no-underline"
          >
            <span className="w-[14px] flex-shrink-0">▤</span> Dashboard
          </Link>
          {NAV_ANA.map((item) => <YakindaItem key={item.label} {...item} />)}

          <p className="px-[18px] pt-[14px] pb-[6px] text-[9px] tracking-[2px] text-white/30 uppercase font-semibold">İletişim</p>
          {NAV_ILETISIM.map((item) => <YakindaItem key={item.label} {...item} />)}

          <p className="px-[18px] pt-[14px] pb-[6px] text-[9px] tracking-[2px] text-white/30 uppercase font-semibold">Hesap</p>
          {NAV_HESAP.map((item) => <YakindaItem key={item.label} {...item} />)}
        </nav>

        {/* Kullanıcı + Çıkış */}
        <div className="px-[18px] py-[14px] border-t border-white/[0.08] flex-shrink-0">
          <div className="flex items-center gap-[9px] mb-[8px]">
            <div className="w-[28px] h-[28px] rounded-[2px] bg-[#7ABFFF] text-[#003057] flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-white font-medium truncate">{email}</div>
              <div className="text-[9.5px] text-white/50 tracking-[0.5px]">Firma Yöneticisi</div>
            </div>
          </div>
          <form action={cikisYap}>
            <button
              type="submit"
              className="text-[10.5px] text-white/50 hover:text-white/80 tracking-[0.5px] transition-colors duration-150 cursor-pointer bg-transparent border-none p-0"
            >
              Çıkış Yap →
            </button>
          </form>
        </div>
      </aside>

      {/* Ana alan */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-[#D4D8DC] px-6 h-[54px] flex items-center justify-between flex-shrink-0 sticky top-0 z-10">
          <div className="text-[14px] font-medium text-[#003057] tracking-[0.2px]">Dashboard</div>
          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              className="w-[34px] h-[34px] border border-[#D4D8DC] rounded-[2px] bg-white flex items-center justify-center text-[#5B6770] hover:bg-[#F4F6F8] hover:text-[#003057] transition-colors duration-150"
              title="Bildirimler"
            >
              🔔
            </button>
          </div>
        </header>

        {/* İçerik */}
        <div className="flex-1 p-[22px_24px] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
