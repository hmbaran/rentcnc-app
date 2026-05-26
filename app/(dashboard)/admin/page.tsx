import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cikisYap } from "@/lib/actions/auth";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/giris");

  const rol = user.user_metadata?.rol as string | undefined;
  if (rol !== "admin") redirect("/panel");

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col">
      <header className="bg-[#003057] px-6 h-[54px] flex items-center justify-between">
        <div className="text-[13px] font-medium tracking-[2px] text-white uppercase">
          RENT<span className="text-[#7ABFFF] font-bold">CNC</span>MACHINE
          <span className="ml-3 text-[9px] tracking-[1.5px] text-white/40 normal-case">Admin</span>
        </div>
        <form action={cikisYap}>
          <button
            type="submit"
            className="text-[10.5px] text-white/50 hover:text-white/80 tracking-[0.5px] transition-colors duration-150 cursor-pointer bg-transparent border-none"
          >
            Çıkış Yap →
          </button>
        </form>
      </header>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white border border-[#D4D8DC] rounded-[2px] p-[40px] max-w-[480px] w-full text-center">
          <div className="text-[32px] mb-4 opacity-40">⚙</div>
          <div className="text-[16px] font-medium text-[#003057] mb-2 tracking-[-0.2px]">Admin Paneli</div>
          <div className="text-[12px] text-[#5B6770] leading-[1.6] mb-6">
            Admin paneli Faz 4&apos;te tam kapasitesiyle aktif olacak.<br />
            Kullanıcı yönetimi, firma onaylama ve içerik moderasyonu burada olacak.
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F4F6F8] border border-[#D4D8DC] rounded-[2px]">
            <span className="w-[6px] h-[6px] rounded-full bg-[#1A7A4A]" />
            <span className="text-[10px] tracking-[1px] text-[#5B6770] uppercase font-semibold">Oturum Aktif — {user.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
