import Link from "next/link";

export const metadata = { title: "Abonelik Şartları — RentCNCmachine" };

export default function AbonelikSartlariPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-sm text-gray-700">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Abonelik Şartları</h1>

      <p className="mb-4">
        Bu sayfa, <strong>RentCNCmachine.com</strong> üzerindeki fasoncu üyelik planlarına ilişkin
        abonelik koşullarını açıklamaktadır.
      </p>

      <h2 className="font-semibold text-base mt-6 mb-2">1. Üyelik Planları</h2>
      <p className="mb-4">
        Platform, fasoncu firmalara Ücretsiz, Standart ve Premium olmak üzere farklı üyelik seçenekleri
        sunmaktadır. Her planın kapsam ve limitleri platform üzerinden duyurulur.
      </p>

      <h2 className="font-semibold text-base mt-6 mb-2">2. Ücretlendirme</h2>
      <ul className="list-disc ml-5 mb-4 space-y-1">
        <li>Ücretli planlar için fatura, dönem başında kesilir.</li>
        <li>Fiyatlar KDV hariç olup Türk Lirası cinsinden belirtilir.</li>
        <li>Abonelik yenilemeden önce e-posta ile bildirim yapılır.</li>
      </ul>

      <h2 className="font-semibold text-base mt-6 mb-2">3. İptal ve İade</h2>
      <p className="mb-4">
        Aboneliğinizi dönem sonuna kadar istediğiniz zaman iptal edebilirsiniz. Kullanılmamış dönem
        ücretleri için iade yapılmaz. İptal talebinizi hesap ayarlarından veya destek ekibimize
        yazarak iletebilirsiniz.
      </p>

      <h2 className="font-semibold text-base mt-6 mb-2">4. Plan Değişikliği</h2>
      <p className="mb-4">
        Üst plana geçiş anında etkin olur; alt plana geçiş ise mevcut dönem sonunda uygulanır.
      </p>

      <h2 className="font-semibold text-base mt-6 mb-2">5. İletişim</h2>
      <p className="mb-4">
        Abonelikle ilgili sorularınız için{" "}
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
