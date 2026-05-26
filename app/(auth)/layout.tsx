import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F8]">
      {children}
      <footer className="mt-auto border-t border-[#D4D8DC] bg-white px-6 py-[18px] flex justify-between items-center flex-wrap gap-[10px]">
        <div className="text-[10px] text-[#8B97A4] tracking-[0.5px]">
          © 2026 RentCNCmachine.com
        </div>
        <div className="flex gap-[18px]">
          {[
            { href: "/kvkk", label: "KVKK" },
            { href: "/gizlilik", label: "Gizlilik" },
            { href: "/cerez", label: "Çerez" },
            { href: "/iletisim", label: "İletişim" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[#5B6770] text-[9.5px] uppercase tracking-[1px] no-underline hover:text-[#003057] transition-colors duration-150"
            >
              {label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
