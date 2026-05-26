import type { Metadata } from "next";
import Link from "next/link";
import { AuthTopbar } from "@/components/auth/auth-topbar";

export const metadata: Metadata = { title: "E-posta Doğrulama" };

export default function DogrulamaPage() {
  return (
    <>
      <AuthTopbar baslik="E-posta Doğrulama" />
      <main className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-[420px]">
          <div className="bg-white border border-[#DDE8F0] rounded-[4px] p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-[#E8F5EE] flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A7A4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>

            <h1 className="text-[18px] font-medium text-[#003057] mb-3">
              E-postanızı doğrulayın
            </h1>
            <p className="text-[13px] text-[#4A5568] leading-[1.7] mb-6">
              Kayıt işleminiz tamamlandı. Hesabınızı aktifleştirmek için e-posta adresinize gönderdiğimiz doğrulama bağlantısına tıklayın.
            </p>

            <div className="bg-[#F0F7FF] border border-[#C8D8E8] rounded-[3px] px-5 py-4 text-left mb-6">
              <p className="text-[11px] font-medium text-[#003057] uppercase tracking-[0.5px] mb-2">Sonraki adımlar</p>
              <ol className="text-[12px] text-[#4A5568] leading-[1.7] list-decimal list-inside space-y-1">
                <li>Gelen kutunuzu kontrol edin</li>
                <li>RentCNCmachine.com&apos;dan gelen e-postayı açın</li>
                <li>Doğrulama bağlantısına tıklayın</li>
                <li>Hesabınıza giriş yapın</li>
              </ol>
            </div>

            <p className="text-[11px] text-[#8A98A8] mb-5 leading-[1.6]">
              E-posta gelmedi mi? Spam / Gereksiz klasörünü kontrol edin. Birkaç dakika içinde gelmezse tekrar deneyebilirsiniz.
            </p>

            <Link
              href="/giris"
              className="inline-block px-6 py-[10px] bg-[#003057] text-white text-[12px] uppercase tracking-[0.5px] rounded-[2px] hover:bg-[#004080] transition-colors duration-150 no-underline"
            >
              Giriş Sayfasına Git
            </Link>
          </div>

          <p className="text-center text-[11px] text-[#8A98A8] mt-5">
            Sorun mu var?{" "}
            <a href="mailto:murat@rentcncmachine.com" className="text-[#0077CC] hover:underline">
              Bize yazın
            </a>
          </p>
        </div>
      </main>
    </>
  );
}
