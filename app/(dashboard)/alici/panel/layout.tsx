import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { cikisYap } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Alıcı Paneli" };

function NavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-[10px] px-[18px] py-[9px] text-[12px] text-white/70 tracking-[0.3px] no-underline hover:text-white hover:bg-white/5 transition-colors"
    >
      <span className="w-[14px] flex-shrink-0">{icon}</span>
      {label}
    </Link>
  );
}

function YakindaItem({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="flex items-center gap-[10px] px-[18px] py-[9px] text-[12px] text-white/30 tracking-[0.3px] cursor-not-allowed select-none">
      <span className="w-[14px] flex-shrink-0 opacity-50">{icon}</span>
      {label}
      <span className="ml-auto text-[8px] bg-white/10 text-white/30 px-[5px] py-[1px] rounded-[2px] tracking-[0.5px] whitespace-nowrap">Yakında</span>
    </span>
  );
}

export default async function AliciPanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/giris");
  const tip = user.user_metadata?.tip as string | undefined;
  if (tip !== "alici") redirect("/panel");

  // Alıcı bilgilerini çek
  const { data: alici } = await supabaseAdmin
    .from("alici")
    .select("ad, soyad, firma_adi")
    .eq("email", user.email!)
    .single();

  const adSoyad = alici ? `${alici.ad} ${alici.soyad}` : user.email ?? "";
  const email = user.email ?? "";
  const initials = alici
    ? ((alici.ad?.[0] ?? "") + (alici.soyad?.[0] ?? "")).toUpperCase()
    : email.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#F4F6F8]">

      {/* Sidebar */}
      <aside className="w-[220px] flex-shrink-0 bg-[#003057] flex flex-col sticky top-0 h-screen overflow-y-auto">

        {/* Logo */}
        <div className="px-[18px] py-[18px] border-b border-white/10 flex-shrink-0">
          <div className="text-[13px] font-medium tracking-[2px] text-white uppercase">
            RENT<span className="text-[#7ABFFF] font-bold">CNC</span>MACHINE
          </div>
          <div className="text-[9px] tracking-[1.5px] text-white/40 mt-[3px] uppercase">Alıcı Paneli</div>
        </div>

        {/* Kullanıcı özeti */}
        <div className="px-[18px] py-[14px] bg-black/[0.18] border-b border-white/[0.08] flex-shrink-0">
          <div className="text-[12px] text-white font-medium tracking-[0.3px] leading-[1.3] truncate">
            {adSoyad}
          </div>
          {alici?.firma_adi && (
            <div className="text-[10px] text-white/50 mt-0.5 truncate">{alici.firma_adi}</div>
          )}
          <div className="text-[9px] text-[#7ABFFF] tracking-[1.5px] mt-1.5 uppercase flex items-center gap-[5px]">
            <span className="w-[6px] h-[6px] rounded-full bg-[#1A7A4A] flex-shrink-0" />
            Ücretsiz Üye
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1">
          <p className="px-[18px] pt-[14px] pb-[6px] text-[9px] tracking-[2px] text-white/30 uppercase font-semibold">Ana</p>
          <Link
            href="/alici/panel"
            className="flex items-center gap-[10px] px-[18px] py-[9px] text-[12px] text-[#7ABFFF] border-l-2 border-[#7ABFFF] bg-[rgba(122,191,255,0.08)] tracking-[0.3px] no-underline"
          >
            <span className="w-[14px] flex-shrink-0">▤</span> Dashboard
          </Link>
          <NavLink href="/ara"   icon="⊕" label="Fabrika Ara" />
          <YakindaItem icon="♡" label="Favorilerim" />

          <p className="px-[18px] pt-[14px] pb-[6px] text-[9px] tracking-[2px] text-white/30 uppercase font-semibold">RFQ & Teklifler</p>
          <NavLink href="/rfq"  icon="▸" label="RFQ Gönder" />
          <YakindaItem icon="◈" label="Tekliflerim" />
          <YakindaItem icon="✉" label="Mesajlar" />

          <p className="px-[18px] pt-[14px] pb-[6px] text-[9px] tracking-[2px] text-white/30 uppercase font-semibold">Hesap</p>
          <YakindaItem icon="⚙" label="Ayarlar" />
          <YakindaItem icon="?" label="Yardım & Destek" />
        </nav>

        {/* Kullanıcı + Çıkış */}
        <div className="px-[18px] py-[14px] border-t border-white/[0.08] flex-shrink-0">
          <div className="flex items-center gap-[9px] mb-[8px]">
            <div className="w-[28px] h-[28px] rounded-[2px] bg-[#7ABFFF] text-[#003057] flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-white font-medium truncate">{email}</div>
              <div className="text-[9.5px] text-white/50 tracking-[0.5px]">Alıcı</div>
            </div>
          </div>
          <form action={cikisYap}>
            <button type="submit"
              className="text-[10.5px] text-white/50 hover:text-white/80 tracking-[0.5px] transition-colors duration-150 cursor-pointer bg-transparent border-none p-0">
              Çıkış Yap →
            </button>
          </form>
        </div>
      </aside>

      {/* Ana alan */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-[#D4D8DC] px-6 h-[54px] flex items-center justify-between flex-shrink-0 sticky top-0 z-10">
          <div className="text-[14px] font-medium text-[#003057] tracking-[0.2px]">Dashboard</div>
          <Link href="/rfq"
            className="px-4 py-2 text-[10px] font-semibold tracking-[1px] uppercase text-white rounded-[2px] hover:opacity-90 transition-opacity"
            style={{ background: "#003057" }}>
            + RFQ Gönder
          </Link>
        </header>
        <div className="flex-1 p-[22px_24px] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
