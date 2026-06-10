import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { cikisYap } from "@/lib/actions/auth";
import {
  adminIstatistikler,
  bekleyenFirmalariGetir,
  tumFirmalariGetir,
  firmaOnayla,
  firmaReddet,
  firmaDogrula,
  firmaDurumGuncelle,
} from "@/lib/actions/admin";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/giris");
  const rol = user.user_metadata?.rol as string | undefined;
  if (rol !== "admin") redirect("/panel");

  const [istatistikler, bekleyenler, tumFirmalar] = await Promise.all([
    adminIstatistikler(),
    bekleyenFirmalariGetir(),
    tumFirmalariGetir(),
  ]);

  const durumRenk: Record<string, string> = {
    yayinda: "#1A7A4A",
    taslak: "#8A98A8",
    beklemede: "#C05C00",
    reddedildi: "#C0392B",
    askiya_alindi: "#7B4E12",
  };

  const durumLabel: Record<string, string> = {
    yayinda: "Yayında",
    taslak: "Taslak",
    beklemede: "Beklemede",
    reddedildi: "Reddedildi",
    askiya_alindi: "Askıda",
  };

  return (
    <div className="min-h-screen" style={{ background: "#F4F7FB", fontFamily: "-apple-system,'Segoe UI',sans-serif" }}>
      {/* HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6" style={{ background: "#003057", height: 52 }}>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-white text-[13px] font-light tracking-[3px] uppercase">
            RENT<span className="font-semibold" style={{ color: "#7ABFFF" }}>CNC</span>MACHINE
          </Link>
          <span className="text-[9px] tracking-[1.5px] uppercase px-2 py-0.5 rounded-sm font-semibold" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
            Admin
          </span>
        </div>
        <form action={cikisYap}>
          <button type="submit" className="text-[10px] uppercase tracking-wide px-3 py-1.5 rounded-sm border transition-all" style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)" }}>
            Çıkış Yap
          </button>
        </form>
      </header>

      <div className="max-w-6xl mx-auto p-6">

        {/* İSTATİSTİKLER */}
        {istatistikler && (
          <div className="grid grid-cols-5 gap-3 mb-6">
            {[
              { lbl: "Toplam Firma", val: istatistikler.toplamFirma ?? 0, renk: "#003057" },
              { lbl: "Yayında", val: istatistikler.yayindaFirma ?? 0, renk: "#1A7A4A" },
              { lbl: "Onay Bekleyen", val: istatistikler.bekleyenFirma ?? 0, renk: "#C05C00" },
              { lbl: "Toplam Alıcı", val: istatistikler.toplamAlici ?? 0, renk: "#003057" },
              { lbl: "Toplam RFQ", val: istatistikler.toplamRfq ?? 0, renk: "#0077CC" },
            ].map((s, i) => (
              <div key={i} className="rounded border p-4 text-center" style={{ background: "#fff", borderColor: "#DDE8F0" }}>
                <div className="text-2xl font-bold mb-1" style={{ color: s.renk }}>{s.val}</div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8A98A8" }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        )}

        {/* ONAY BEKLEYENler */}
        {bekleyenler.length > 0 && (
          <div className="rounded border mb-6" style={{ background: "#fff", borderColor: "#DDE8F0" }}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "#DDE8F0" }}>
              <span className="text-xs font-bold tracking-wider uppercase" style={{ color: "#003057" }}>
                Onay Bekleyen Firmalar
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-sm font-semibold" style={{ background: "#FEF3C7", color: "#C05C00" }}>
                {bekleyenler.length} bekliyor
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: "#DDE8F0" }}>
              {bekleyenler.map((f) => (
                <div key={f.firma_id} className="p-4 flex items-start gap-4">
                  {/* Logo */}
                  <div className="flex-shrink-0 flex items-center justify-center text-sm font-bold rounded" style={{ width: 40, height: 40, background: "#E8F2FA", color: "#003057" }}>
                    {f.ticari_unvan.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()}
                  </div>

                  {/* Bilgi */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold" style={{ color: "#003057" }}>{f.ticari_unvan}</div>
                    <div className="text-[11px] mt-0.5 flex flex-wrap gap-3" style={{ color: "#8A98A8" }}>
                      {f.il && <span>📍 {[f.ilce, f.il].filter(Boolean).join(", ")}</span>}
                      {f.vergi_no && <span>VKN: {f.vergi_no}</span>}
                      {f.email && <span>{f.email}</span>}
                      {f.kurulus_yili && <span>Kur. {f.kurulus_yili}</span>}
                      {f.calisan_aralik && <span>{f.calisan_aralik} çalışan</span>}
                    </div>
                    {f.hakkinda && (
                      <div className="text-[11px] mt-1.5 line-clamp-2" style={{ color: "#4A5568" }}>
                        {f.hakkinda}
                      </div>
                    )}
                    <div className="text-[10px] mt-1.5" style={{ color: "#C8D8E8" }}>
                      Kayıt: {new Date(f.olusturulma_tarihi).toLocaleDateString("tr-TR")}
                    </div>
                  </div>

                  {/* Aksiyonlar */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <Link
                      href={`/firma/${f.firma_id}`}
                      target="_blank"
                      className="text-[10px] px-3 py-1.5 rounded-sm border text-center uppercase tracking-wide transition-all hover:opacity-80"
                      style={{ borderColor: "#C8D8E8", color: "#4A5568" }}
                    >
                      Profil →
                    </Link>
                    <form action={async () => { "use server"; await firmaOnayla(f.firma_id); }}>
                      <button type="submit" className="w-full text-[10px] px-3 py-1.5 rounded-sm text-white uppercase tracking-wide transition-all hover:opacity-90" style={{ background: "#1A7A4A" }}>
                        ✓ Onayla
                      </button>
                    </form>
                    <form action={async () => { "use server"; await firmaReddet(f.firma_id); }}>
                      <button type="submit" className="w-full text-[10px] px-3 py-1.5 rounded-sm text-white uppercase tracking-wide transition-all hover:opacity-90" style={{ background: "#C0392B" }}>
                        ✕ Reddet
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {bekleyenler.length === 0 && (
          <div className="rounded border p-8 text-center mb-6" style={{ background: "#fff", borderColor: "#DDE8F0" }}>
            <div className="text-3xl mb-2">✓</div>
            <div className="text-sm font-semibold" style={{ color: "#1A7A4A" }}>Onay bekleyen firma yok</div>
          </div>
        )}

        {/* TÜM FİRMALAR */}
        <div className="rounded border" style={{ background: "#fff", borderColor: "#DDE8F0" }}>
          <div className="px-5 py-3.5 border-b" style={{ borderColor: "#DDE8F0" }}>
            <span className="text-xs font-bold tracking-wider uppercase" style={{ color: "#003057" }}>Tüm Firmalar</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid #DDE8F0" }}>
                {["Firma", "İl", "Durum", "Profil %", "Doğrulanmış", "İşlemler"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wider" style={{ color: "#8A98A8", fontSize: 9 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tumFirmalar.map((f) => (
                <tr key={f.firma_id} className="border-b last:border-0 hover:bg-[#F4F7FB] transition-colors" style={{ borderColor: "#DDE8F0" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "#003057" }}>{f.ticari_unvan}</td>
                  <td className="px-4 py-3" style={{ color: "#4A5568" }}>{f.il ?? "–"}</td>
                  <td className="px-4 py-3">
                    <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wide text-white" style={{ background: durumRenk[f.durum] ?? "#8A98A8" }}>
                      {durumLabel[f.durum] ?? f.durum}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "#4A5568" }}>{f.profil_doluluk ?? "–"}%</td>
                  <td className="px-4 py-3">
                    <form action={async () => {
                      "use server";
                      await firmaDogrula(f.firma_id, !f.dogrulanmis_rozet);
                    }}>
                      <button type="submit" className="text-[10px] px-2 py-0.5 rounded-sm border transition-all" style={
                        f.dogrulanmis_rozet
                          ? { background: "#E8F5EE", borderColor: "#1A7A4A", color: "#1A7A4A" }
                          : { background: "#fff", borderColor: "#DDE8F0", color: "#8A98A8" }
                      }>
                        {f.dogrulanmis_rozet ? "✓ Doğrulandı" : "Doğrula"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/firma/${f.firma_id}`} target="_blank" className="text-[10px] px-2 py-0.5 rounded-sm border transition-all hover:opacity-80" style={{ borderColor: "#C8D8E8", color: "#4A5568" }}>
                        Profil
                      </Link>
                      {f.durum !== "yayinda" && (
                        <form action={async () => { "use server"; await firmaDurumGuncelle(f.firma_id, "yayinda"); }}>
                          <button type="submit" className="text-[10px] px-2 py-0.5 rounded-sm text-white transition-all hover:opacity-90" style={{ background: "#1A7A4A" }}>
                            Yayınla
                          </button>
                        </form>
                      )}
                      {f.durum === "yayinda" && (
                        <form action={async () => { "use server"; await firmaDurumGuncelle(f.firma_id, "askiya_alindi"); }}>
                          <button type="submit" className="text-[10px] px-2 py-0.5 rounded-sm text-white transition-all hover:opacity-90" style={{ background: "#7B4E12" }}>
                            Askıya Al
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
