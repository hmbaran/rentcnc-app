import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import TezgahDuzenleForm from "./TezgahDuzenleForm";

export default async function TezgahDuzenlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const { data: kul } = await supabaseAdmin
    .from("kullanici").select("firma_id").eq("email", user.email!).single();
  if (!kul?.firma_id) redirect("/panel");

  // Tezgahı getir
  const { data: tezgah } = await supabaseAdmin
    .from("tezgah")
    .select(`
      tezgah_id, durum, model, eksen_ozellik,
      bag_x_mm, bag_y_mm, bag_z_mm, max_rpm, yapim_yili,
      tip_id, alt_kategori_id, marka_id, notlar, parametreler,
      tezgah_tip ( tip_id, kod, ad ),
      tezgah_alt_kategori ( alt_kategori_id, kod, ad ),
      tezgah_marka ( marka_id, ad ),
      kontrol_sistemi ( kontrol_sistemi_id, ad )
    `)
    .eq("tezgah_id", id)
    .eq("firma_id", kul.firma_id)
    .single();

  if (!tezgah) notFound();

  // Mevcut görselleri getir
  const { data: mevcutGorseller } = await supabaseAdmin
    .from("tezgah_gorsel")
    .select("gorsel_id, url, storage_path, sira")
    .eq("tezgah_id", id)
    .order("sira");

  return (
    <div>
      {/* Başlık */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/panel/tezgahlar" className="text-[11px] text-[#5B6770] hover:text-[#003057] tracking-[0.5px] no-underline transition-colors">
          ← Tezgah Parkım
        </Link>
        <span className="text-[#D4D8DC] text-[11px]">/</span>
        <span className="text-[11px] text-[#003057] font-medium tracking-[0.5px]">Tezgah Düzenle</span>
      </div>

      <div className="flex items-center gap-[10px] mb-4">
        <div className="w-7 h-7 rounded-full bg-[#C77700] text-white flex items-center justify-center text-[11px] font-semibold">✏</div>
        <div>
          <div className="text-[14px] font-medium text-[#003057]">
            {(tezgah.tezgah_marka as { ad: string }[] | null)?.[0]?.ad ?? "Tezgah"} Düzenle
          </div>
          <div className="text-[11px] text-[#8A98A8] mt-[1px]">
            Bilgileri güncelleyin, kaydedin
          </div>
        </div>
      </div>

      <TezgahDuzenleForm
        tezgah={tezgah as Record<string, unknown>}
        mevcutGorseller={(mevcutGorseller ?? []) as { gorsel_id: string; url: string; storage_path: string; sira: number }[]}
      />
    </div>
  );
}
