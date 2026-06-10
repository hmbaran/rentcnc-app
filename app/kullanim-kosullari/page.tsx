import Link from "next/link";

export const metadata = { title: "Kullanım Koşulları — RentCNCmachine" };

export default function KullanimKosullariPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-sm text-gray-700">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Kullanım Koşulları</h1>

      <p className="mb-4">
        Bu Kullanım Koşulları, <strong>RentCNCmachine.com</strong> platformunu kullanan tüm
        kullanıcılar için geçerlidir. Platforma kaydolarak bu koşulları kabul etmiş sayılırsınız.
      </p>

      <h2 className="font-semibold text-base mt-6 mb-2">1. Hizmet Tanımı</h2>
      <p className="mb-4">
        RentCNCmachine.com; CNC işleme kapasitesi arayan alıcılar ile fason üretim hizmeti sunan
        fasoncu firmaları dijital ortamda buluşturan bir B2B pazaryeridir.
      </p>

      <h2 className="font-semibold text-base mt-6 mb-2">2. Kullanıcı Yükümlülükleri</h2>
      <ul className="list-disc ml-5 mb-4 space-y-1">
        <li>Kayıt sırasında doğru ve güncel bilgi sağlamak</li>
        <li>Hesap güvenliğini korumak, şifreyi üçüncü şahıslarla paylaşmamak</li>
        <li>Platformu yalnızca yasal amaçlarla kullanmak</li>
        <li>Diğer kullanıcıların haklarına saygı göstermek</li>
      </ul>

      <h2 className="font-semibold text-base mt-6 mb-2">3. Yasaklı Kullanımlar</h2>
      <ul className="list-disc ml-5 mb-4 space-y-1">
        <li>Yanıltıcı veya sahte firma/ürün bilgisi paylaşmak</li>
        <li>Platform altyapısına zarar verecek eylemler gerçekleştirmek</li>
        <li>Spam veya izinsiz ticari iletişim göndermek</li>
      </ul>

      <h2 className="font-semibold text-base mt-6 mb-2">4. Sorumluluk Sınırı</h2>
      <p className="mb-4">
        Platform, fasoncu ile alıcı arasındaki iş ilişkisinden doğan anlaşmazlıklarda taraf değildir.
        Kullanıcılar arasındaki sözleşme ve teslimat yükümlülükleri ilgili taraflara aittir.
      </p>

      <h2 className="font-semibold text-base mt-6 mb-2">5. Değişiklikler</h2>
      <p className="mb-4">
        Bu koşullar önceden bildirim yapılmaksızın güncellenebilir. Güncel versiyona her zaman bu
        sayfadan ulaşabilirsiniz.
      </p>

      <div className="mt-8">
        <Link href="/" className="text-[#0077CC] hover:underline text-sm">← Ana Sayfaya Dön</Link>
      </div>
    </div>
  );
}
