import Link from "next/link";

const DILLER = [
  { kod: "TR", aktif: true },
  { kod: "EN", aktif: false },
  { kod: "DE", aktif: false },
] as const;

type Props = {
  baslik?: string;
  /** Dil seçici yerine "Zaten hesabınız var mı?" linki gösterir */
  girisLinki?: boolean;
};

export function AuthTopbar({ baslik, girisLinki = false }: Props) {
  return (
    <header className="bg-[#003057] h-[54px] px-6 flex items-center gap-5 flex-shrink-0">
      <Link
        href="/"
        className="text-white uppercase font-medium tracking-[2px] text-[12px] no-underline"
      >
        RENT<span className="text-[#7ABFFF] font-bold">CNC</span>MACHINE
      </Link>

      {baslik && (
        <span className="text-[10px] tracking-[1.5px] text-white/60 uppercase">
          {baslik}
        </span>
      )}

      <div className="ml-auto flex items-center gap-1">
        {girisLinki ? (
          <Link
            href="/giris"
            className="text-[11px] text-white/60 no-underline tracking-[0.5px] hover:text-white/90 transition-colors duration-150"
          >
            Zaten hesabınız var mı?{" "}
            <span className="text-[#7ABFFF] font-bold">Giriş Yap</span>
          </Link>
        ) : (
          DILLER.map(({ kod, aktif }) => (
            <button
              key={kod}
              disabled={!aktif}
              className={
                aktif
                  ? "bg-[rgba(122,191,255,0.15)] border border-[#7ABFFF] text-[#7ABFFF] px-[9px] py-[5px] text-[10px] tracking-[1px] rounded-[2px] cursor-default"
                  : "bg-transparent border border-white/20 text-white/40 px-[9px] py-[5px] text-[10px] tracking-[1px] rounded-[2px] cursor-not-allowed"
              }
            >
              {kod}
            </button>
          ))
        )}
      </div>
    </header>
  );
}
