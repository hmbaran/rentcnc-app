import { Resend } from "resend";
import crypto from "crypto";

// Lazy init — build zamanında API key olmasa da hata vermez
function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
}

const FROM = "RentCNCmachine <bildirim@rentcncmachine.com>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// ── Yardımcı: HTML şablon sarıcı ─────────────────────────────────────────────
function htmlSarici(icerik: string) {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>RentCNCmachine</title>
</head>
<body style="margin:0;padding:0;background:#F4F7FB;font-family:-apple-system,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FB;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- HEADER -->
        <tr><td style="background:#003057;padding:20px 32px;border-radius:4px 4px 0 0;">
          <span style="color:#fff;font-size:13px;font-weight:300;letter-spacing:3px;text-transform:uppercase;">
            RENT<span style="color:#7ABFFF;font-weight:700;">CNC</span>MACHINE
          </span>
        </td></tr>

        <!-- BODY -->
        <tr><td style="background:#fff;padding:32px;border:1px solid #DDE8F0;border-top:none;">
          ${icerik}
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="padding:16px 32px;text-align:center;">
          <p style="font-size:10px;color:#8A98A8;margin:0;">
            Bu e-posta RentCNCmachine.com platformu tarafından gönderilmiştir.<br/>
            <a href="${SITE}" style="color:#0077CC;text-decoration:none;">rentcncmachine.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Buton bileşeni ────────────────────────────────────────────────────────────
function buton(url: string, metin: string) {
  return `<a href="${url}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#003057;color:#fff;text-decoration:none;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;border-radius:3px;">${metin}</a>`;
}

// ════════════════════════════════════════════════════════════════════════════
// 1. Fasoncuya — Yeni RFQ geldi
// ════════════════════════════════════════════════════════════════════════════
export async function rfqBildirimiGonder(params: {
  fasoncuEmail: string;
  fasoncuAd: string;
  firmaAdi: string;
  rfqBaslik: string;
  rfqId: string;
  aliciAdi?: string;
}) {
  if (!process.env.RESEND_API_KEY) return { hata: "RESEND_API_KEY eksik" };

  const panelUrl = `${SITE}/panel/rfq/${params.rfqId}`;

  const html = htmlSarici(`
    <p style="font-size:12px;color:#8A98A8;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Yeni Teklif İsteği</p>
    <h1 style="font-size:22px;font-weight:300;color:#003057;margin:0 0 16px;">${params.rfqBaslik}</h1>
    <p style="font-size:13px;color:#3D4E63;line-height:1.7;margin:0 0 12px;">
      Merhaba <strong>${params.fasoncuAd}</strong>,<br/><br/>
      <strong>${params.firmaAdi}</strong> firmasına yeni bir teklif isteği (RFQ) iletildi.
      ${params.aliciAdi ? `Talebi gönderen: <strong>${params.aliciAdi}</strong>.` : ""}
    </p>
    <p style="font-size:13px;color:#3D4E63;line-height:1.7;margin:0;">
      Teklif vermek veya detayları incelemek için aşağıdaki butona tıklayın.
    </p>
    ${buton(panelUrl, "RFQ'yu İncele ve Teklif Ver →")}
    <p style="font-size:11px;color:#8A98A8;margin-top:24px;">
      RFQ No: <code style="background:#F4F7FB;padding:2px 6px;border-radius:2px;">${params.rfqId}</code>
    </p>
  `);

  const { error } = await getResend().emails.send({
    from: FROM,
    to: params.fasoncuEmail,
    subject: `Yeni Teklif İsteği: ${params.rfqBaslik}`,
    html,
  });

  if (error) return { hata: error.message };
  return { basari: true };
}

// ════════════════════════════════════════════════════════════════════════════
// 2. Alıcıya — Teklif geldi
// ════════════════════════════════════════════════════════════════════════════
export async function teklifBildirimiGonder(params: {
  aliciEmail: string;
  aliciAd: string;
  firmaAdi: string;
  rfqBaslik: string;
  rfqId: string;
  teklifFiyat?: string;
  teklifTermin?: string;
}) {
  if (!process.env.RESEND_API_KEY) return { hata: "RESEND_API_KEY eksik" };

  const rfqUrl = `${SITE}/alici/rfq/${params.rfqId}`;

  const html = htmlSarici(`
    <p style="font-size:12px;color:#8A98A8;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Yeni Teklif Aldınız</p>
    <h1 style="font-size:22px;font-weight:300;color:#003057;margin:0 0 16px;">${params.rfqBaslik}</h1>
    <p style="font-size:13px;color:#3D4E63;line-height:1.7;margin:0 0 16px;">
      Merhaba <strong>${params.aliciAd}</strong>,<br/><br/>
      <strong>${params.firmaAdi}</strong> firması talebinize teklif verdi.
    </p>
    ${params.teklifFiyat || params.teklifTermin ? `
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      ${params.teklifFiyat ? `<tr>
        <td style="padding:10px 14px;background:#F4F7FB;border:1px solid #DDE8F0;font-size:11px;color:#8A98A8;width:40%;">Teklif Fiyatı</td>
        <td style="padding:10px 14px;background:#F4F7FB;border:1px solid #DDE8F0;font-size:13px;color:#003057;font-weight:600;">${params.teklifFiyat}</td>
      </tr>` : ""}
      ${params.teklifTermin ? `<tr>
        <td style="padding:10px 14px;border:1px solid #DDE8F0;font-size:11px;color:#8A98A8;">Termin</td>
        <td style="padding:10px 14px;border:1px solid #DDE8F0;font-size:13px;color:#003057;">${params.teklifTermin}</td>
      </tr>` : ""}
    </table>` : ""}
    <p style="font-size:13px;color:#3D4E63;margin:0;">Teklifi inceleyip kabul veya red edebilirsiniz.</p>
    ${buton(rfqUrl, "Teklifi İncele →")}
  `);

  const { error } = await getResend().emails.send({
    from: FROM,
    to: params.aliciEmail,
    subject: `Yeni Teklif: ${params.firmaAdi} — ${params.rfqBaslik}`,
    html,
  });

  if (error) return { hata: error.message };
  return { basari: true };
}

// ════════════════════════════════════════════════════════════════════════════
// 3. Fasoncuya — Teklif kabul edildi
// ════════════════════════════════════════════════════════════════════════════
export async function teklifKabulBildirimiGonder(params: {
  fasoncuEmail: string;
  fasoncuAd: string;
  firmaAdi: string;
  rfqBaslik: string;
  rfqId: string;
}) {
  if (!process.env.RESEND_API_KEY) return { hata: "RESEND_API_KEY eksik" };

  const panelUrl = `${SITE}/panel/rfq/${params.rfqId}`;

  const html = htmlSarici(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;background:#E8F5EE;border-radius:50%;line-height:56px;font-size:24px;">✓</div>
    </div>
    <p style="font-size:12px;color:#1A7A4A;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;text-align:center;">Teklif Kabul Edildi</p>
    <h1 style="font-size:22px;font-weight:300;color:#003057;margin:0 0 16px;text-align:center;">${params.rfqBaslik}</h1>
    <p style="font-size:13px;color:#3D4E63;line-height:1.7;margin:0 0 16px;">
      Merhaba <strong>${params.fasoncuAd}</strong>,<br/><br/>
      Harika haber! <strong>${params.firmaAdi}</strong> firmasına verdiğiniz teklif <strong style="color:#1A7A4A;">kabul edildi</strong>.
      Alıcı ile iletişime geçebilirsiniz.
    </p>
    ${buton(panelUrl, "Detayları Gör →")}
  `);

  const { error } = await getResend().emails.send({
    from: FROM,
    to: params.fasoncuEmail,
    subject: `✓ Teklifiniz Kabul Edildi — ${params.rfqBaslik}`,
    html,
  });

  if (error) return { hata: error.message };
  return { basari: true };
}

// ════════════════════════════════════════════════════════════════════════════
// 4. Fasoncuya — Teklif reddedildi
// ════════════════════════════════════════════════════════════════════════════
export async function teklifRedBildirimiGonder(params: {
  fasoncuEmail: string;
  fasoncuAd: string;
  rfqBaslik: string;
  rfqId: string;
}) {
  if (!process.env.RESEND_API_KEY) return { hata: "RESEND_API_KEY eksik" };

  const panelUrl = `${SITE}/panel/rfq/${params.rfqId}`;

  const html = htmlSarici(`
    <p style="font-size:12px;color:#8A98A8;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Teklif Durumu</p>
    <h1 style="font-size:22px;font-weight:300;color:#003057;margin:0 0 16px;">${params.rfqBaslik}</h1>
    <p style="font-size:13px;color:#3D4E63;line-height:1.7;margin:0 0 16px;">
      Merhaba <strong>${params.fasoncuAd}</strong>,<br/><br/>
      Bu sefer olmadı — verdiğiniz teklif alıcı tarafından reddedildi. Diğer RFQ fırsatlarını incelemeye devam edebilirsiniz.
    </p>
    ${buton(panelUrl, "Panele Dön →")}
  `);

  const { error } = await getResend().emails.send({
    from: FROM,
    to: params.fasoncuEmail,
    subject: `Teklif Güncelleme — ${params.rfqBaslik}`,
    html,
  });

  if (error) return { hata: error.message };
  return { basari: true };
}

// ════════════════════════════════════════════════════════════════════════════
// 5. Admin'e — Yeni firma kaydı (hızlı onay/red butonları)
// ════════════════════════════════════════════════════════════════════════════

export function adminOnayTokenUret(firmaId: string, islem: string): string {
  const secret = process.env.ADMIN_ONAY_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "fallback";
  return crypto
    .createHmac("sha256", secret)
    .update(`${firmaId}:${islem}`)
    .digest("hex")
    .slice(0, 32);
}

export async function yeniFirmaAdminBildirimi(params: {
  firmaId: string;
  firmaAdi: string;
  firmaEmail: string;
  il?: string;
  vergiNo?: string;
}) {
  if (!process.env.RESEND_API_KEY) return { hata: "RESEND_API_KEY eksik" };

  const adminEmail = "hmbaran@yahoo.com";
  const profilUrl  = `${SITE}/firma/${params.firmaId}`;
  const onayUrl    = `${SITE}/api/admin/hizli-onayla?firma_id=${params.firmaId}&islem=onayla&token=${adminOnayTokenUret(params.firmaId, "onayla")}`;
  const redUrl     = `${SITE}/api/admin/hizli-onayla?firma_id=${params.firmaId}&islem=reddet&token=${adminOnayTokenUret(params.firmaId, "reddet")}`;
  const adminPanel = `${SITE}/admin`;

  const html = htmlSarici(`
    <p style="font-size:12px;color:#8A98A8;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Yeni Firma Kaydı</p>
    <h1 style="font-size:22px;font-weight:300;color:#003057;margin:0 0 20px;">${params.firmaAdi}</h1>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr>
        <td style="padding:9px 12px;background:#F4F7FB;border:1px solid #DDE8F0;font-size:11px;color:#8A98A8;width:35%;">E-posta</td>
        <td style="padding:9px 12px;background:#F4F7FB;border:1px solid #DDE8F0;font-size:13px;color:#003057;">${params.firmaEmail}</td>
      </tr>
      ${params.il ? `<tr>
        <td style="padding:9px 12px;border:1px solid #DDE8F0;font-size:11px;color:#8A98A8;">İl</td>
        <td style="padding:9px 12px;border:1px solid #DDE8F0;font-size:13px;color:#003057;">${params.il}</td>
      </tr>` : ""}
      ${params.vergiNo ? `<tr>
        <td style="padding:9px 12px;background:#F4F7FB;border:1px solid #DDE8F0;font-size:11px;color:#8A98A8;">Vergi No</td>
        <td style="padding:9px 12px;background:#F4F7FB;border:1px solid #DDE8F0;font-size:13px;color:#003057;">${params.vergiNo}</td>
      </tr>` : ""}
    </table>
    <p style="font-size:13px;color:#3D4E63;margin:0 0 20px;">Profili inceleyip onaylayabilir veya reddedebilirsiniz:</p>
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="padding-right:8px;">
        <a href="${onayUrl}" style="display:inline-block;padding:11px 24px;background:#1A7A4A;color:#fff;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;border-radius:3px;">✓ Onayla</a>
      </td>
      <td style="padding-right:8px;">
        <a href="${redUrl}" style="display:inline-block;padding:11px 24px;background:#CC2200;color:#fff;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;border-radius:3px;">✗ Reddet</a>
      </td>
      <td>
        <a href="${profilUrl}" style="display:inline-block;padding:11px 24px;background:#003057;color:#fff;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;border-radius:3px;">Profili Gör</a>
      </td>
    </tr></table>
    <p style="margin-top:20px;font-size:11px;color:#8A98A8;">
      Veya <a href="${adminPanel}" style="color:#0077CC;text-decoration:none;">Admin Paneli</a>'nden işlem yapabilirsiniz.
    </p>
  `);

  const { error } = await getResend().emails.send({
    from: FROM,
    to: adminEmail,
    subject: `Yeni Kayıt Onayı Bekliyor: ${params.firmaAdi}`,
    html,
  });

  if (error) return { hata: error.message };
  return { basari: true };
}

// ════════════════════════════════════════════════════════════════════════════
// 6. Fasoncuya — Admin firma onayı
// ════════════════════════════════════════════════════════════════════════════
export async function firmaOnayBildirimiGonder(params: {
  firmaEmail: string;
  firmaAdi: string;
  firmaId: string;
}) {
  if (!process.env.RESEND_API_KEY) return { hata: "RESEND_API_KEY eksik" };

  const profilUrl = `${SITE}/firma/${params.firmaId}`;
  const panelUrl  = `${SITE}/panel`;

  const html = htmlSarici(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;background:#E8F5EE;border-radius:50%;line-height:56px;font-size:24px;">✓</div>
    </div>
    <p style="font-size:12px;color:#1A7A4A;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;text-align:center;">Firma Profiliniz Onaylandı</p>
    <h1 style="font-size:22px;font-weight:300;color:#003057;margin:0 0 16px;text-align:center;">${params.firmaAdi}</h1>
    <p style="font-size:13px;color:#3D4E63;line-height:1.7;margin:0 0 16px;">
      Tebrikler! Firma profiliniz incelendi ve <strong style="color:#1A7A4A;">yayına alındı</strong>.
      Artık alıcılar sizi arama sayfasında bulabilir ve teklif isteği gönderebilir.
    </p>
    <p style="font-size:13px;color:#3D4E63;line-height:1.7;margin:0;">
      Profil doluluk oranınızı artırarak daha fazla alıcıya ulaşabilirsiniz.
    </p>
    <div style="margin-top:20px;display:flex;gap:12px;">
      ${buton(profilUrl, "Profilimi Gör →")}
    </div>
    <a href="${panelUrl}" style="display:inline-block;margin-top:12px;font-size:11px;color:#0077CC;text-decoration:none;">Panel'e Git →</a>
  `);

  const { error } = await getResend().emails.send({
    from: FROM,
    to: params.firmaEmail,
    subject: `✓ Firma Profiliniz Yayına Alındı — ${params.firmaAdi}`,
    html,
  });

  if (error) return { hata: error.message };
  return { basari: true };
}
