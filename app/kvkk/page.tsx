import Link from "next/link";

export const metadata = { title: "KVKK Aydınlatma Metni — RentCNCmachine" };

export default function KvkkPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-sm text-gray-700">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">KVKK Aydınlatma Metni</h1>

      <p className="mb-4">
        Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında
        <strong> RentCNCmachine.com</strong> tarafından kişisel verilerinizin işlenmesine ilişkin
        aydınlatma amacıyla hazırlanmıştır.
      </p>

      <h2 className="font-semibold text-base mt-6 mb-2">1. Veri Sorumlusu</h2>
      <p className="mb-4">
        Veri sorumlusu sıfatıyla hareket eden FORM MAKİNA CNC TAKIM TEZGAHLARI, kişisel verilerinizi
        aşağıda açıklanan amaçlar dahilinde işlemektedir.
      </p>

      <h2 className="font-semibold text-base mt-6 mb-2">2. İşlenen Kişisel Veriler</h2>
      <ul className="list-disc ml-5 mb-4 space-y-1">
        <li>Ad, soyad, e-posta adresi, telefon numarası</li>
        <li>Firma bilgileri (ticari unvan, vergi numarası, adres)</li>
        <li>Platform kullanım verileri (oturum bilgileri, işlem geçmişi)</li>
      </ul>

      <h2 className="font-semibold text-base mt-6 mb-2">3. İşleme Amaçları</h2>
      <ul className="list-disc ml-5 mb-4 space-y-1">
        <li>Üyelik ve hesap yönetimi</li>
        <li>Fasoncu–alıcı eşleştirme hizmetinin sunulması</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
        <li>Güvenlik ve dolandırıcılık önleme</li>
      </ul>

      <h2 className="font-semibold text-base mt-6 mb-2">4. Hukuki Dayanak</h2>
      <p className="mb-4">
        Kişisel verileriniz; sözleşmenin ifası, veri sorumlusunun meşru menfaati ve açık rızanız
        hukuki sebeplerine dayanılarak işlenmektedir.
      </p>

      <h2 className="font-semibold text-base mt-6 mb-2">5. Haklarınız</h2>
      <p className="mb-4">
        KVKK&apos;nın 11. maddesi kapsamında; verilerinize erişme, düzeltme, silme, işlemeyi
        kısıtlama ve itiraz etme haklarına sahipsiniz. Talepleriniz için{" "}
        <a href="mailto:info@rentcncmachine.com" className="text-[#0077CC] hover:underline">
          info@rentcncmachine.com
        </a>{" "}
        adresine yazabilirsiniz.
      </p>

      <div className="mt-8">
        <Link href="/" className="text-[#0077CC] hover:underline text-sm">← Ana Sayfaya Dön</Link>
      </div>
    </div>
  );
}
