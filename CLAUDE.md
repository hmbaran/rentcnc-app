# CLAUDE.md — RentCNCmachine.com

## Proje

**RentCNCmachine.com** — Türkiye'deki CNC fasoncu firmalarını Avrupa (Almanya/İtalya ağırlık), ABD ve Asya'daki alıcılarla buluşturan B2B pazaryeri.

**İş modeli:** Fasoncular ücretli abonelik (Free / Premium / Pro); alıcılar ücretsiz. Platform RFQ (Request for Quote) akışıyla teklif alışverişini yönetir, NDA ile dosya paylaşımını korur.

**Hedef:** İlk 6 ayda 30 doğrulanmış fasoncu + 10 ödeyen müşteri.

**Sahibi:** Murat Baran (FORM Makina CNC Takım Tezgahları, Bursa). murat@rentcncmachine.com

---

## Faz 1 Scope (şu an üzerinde çalıştığımız)

Bu projenin **sadece Faz 1**'i inşa ediliyor. Faz 1 = **Auth ve Kayıt**. Diğer fazlar sonra:

- ✅ Faz 1 (BURADAYIZ): Auth, kullanıcı kayıt (alıcı + fasoncu), e-posta doğrulama, şifre sıfırlama, rol bazlı yönlendirme, temel layout
- Faz 2: Fasoncu profil sayfası, tezgah ekleme, alıcı arama
- Faz 3: RFQ akışı, mesajlaşma, NDA
- Faz 4: Abonelik (Iyzico/Stripe), ödeme, admin paneli
- Faz 5: Test, optimize, deploy, launch

**Faz 1'de YAPMA:**
- RFQ form'larını henüz yapma
- Mesajlaşma yapma
- Ödeme entegrasyonu yapma
- Tezgah listeleme/arama yapma
- Çoklu dil (TR dışındaki diller) henüz yok — sadece TR için altyapı kur, DE/EN sonra
- Karmaşık admin UI — sadece bir kullanıcının admin olup olmadığını kontrol et

**Faz 1'i bitiren testler:**
1. Alıcı kayıt olabiliyor, doğrulama maili alıyor, doğruladıktan sonra login olabiliyor
2. Fasoncu kayıt olabiliyor, doğrulama maili alıyor, doğruladıktan sonra login olabiliyor
3. Şifremi unuttum → mail → reset linki → yeni şifre çalışıyor
4. Login olmuş alıcı `/alici/panel`'e yönleniyor
5. Login olmuş fasoncu `/panel`'e yönleniyor
6. Logout çalışıyor
7. Yetkisiz erişim doğru redirect ediyor

---

## Stack

| Katman | Teknoloji | Sürüm |
|--------|-----------|-------|
| Framework | Next.js (App Router) | 14+ |
| Dil | TypeScript (strict) | 5.x |
| Stil | Tailwind CSS | 3.4 |
| UI | shadcn/ui + Radix | latest |
| Form | react-hook-form + zod | latest |
| Auth | Supabase Auth | latest |
| Database | PostgreSQL (Supabase) | 15+ |
| ORM | Drizzle ORM | latest |
| Storage | Supabase Storage | - |
| Mail | Resend (Faz 1: Supabase Auth mail) | - |
| Deploy | Vercel | - |
| i18n | next-intl | latest |

**Server Components varsayılan. `"use client"` sadece interaktivite gerektiğinde.**

**Server Actions** form submit'leri için tercih et — `fetch` yerine.

---

## Klasör yapısı (hedef)

```
rentcnc-app/
├── app/
│   ├── (auth)/
│   │   ├── giris/page.tsx           ← 13_Giris_Sayfasi.html'den
│   │   ├── kayit/
│   │   │   ├── alici/page.tsx       ← 15_Alici_Kayit_Formu.html'den
│   │   │   └── fasoncu/page.tsx     ← 10_Fasoncu_Kayit_Formu.html'den
│   │   ├── sifre-sifirla/
│   │   │   ├── page.tsx              ← e-posta iste
│   │   │   └── yeni/page.tsx        ← 14_Sifre_Sifirla.html'den
│   │   ├── dogrulama/page.tsx        ← e-posta doğrulama landing
│   │   └── layout.tsx                ← auth layout (centered card)
│   ├── (dashboard)/
│   │   ├── panel/                    ← fasoncu paneli (Faz 1: iskelet)
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── alici/                    ← alıcı paneli (Faz 1: iskelet)
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   └── admin/                    ← admin (Faz 1: dummy)
│   │       └── page.tsx
│   ├── api/
│   │   └── auth/
│   │       └── callback/route.ts     ← Supabase auth callback
│   ├── layout.tsx                    ← root layout
│   ├── page.tsx                      ← ana sayfa (Faz 1: minimal)
│   └── globals.css
├── components/
│   ├── ui/                           ← shadcn (button, input, ...)
│   ├── auth/                         ← login-form, signup-form ...
│   └── layout/                       ← header, footer
├── lib/
│   ├── supabase/
│   │   ├── server.ts                 ← createClient() server
│   │   ├── client.ts                 ← createClient() browser
│   │   └── middleware.ts             ← session refresh
│   ├── db/
│   │   ├── schema.ts                 ← Drizzle (zaten kopyalandı)
│   │   ├── database.types.ts         ← Supabase tipleri (zaten kopyalandı)
│   │   └── index.ts                  ← db client
│   ├── validations/
│   │   ├── auth.ts                   ← zod şemaları
│   │   └── firma.ts
│   └── utils.ts
├── middleware.ts                     ← Supabase session middleware (root)
├── messages/
│   └── tr.json                       ← TR çeviriler (Faz 1: sadece TR)
├── public/
├── CLAUDE.md                         ← bu dosya
├── .env.local                        ← gitignored
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Database (önemli — sorma, ezbere bil)

**34 tablo, 24 ENUM, 4 storage bucket.**

Faz 1'de doğrudan dokunacağımız tablolar:

| Tablo | Amaç |
|-------|------|
| `kullanici` | Tüm kullanıcılar (Supabase Auth ile bağlı, `auth.users.id` referansı). `rol` ENUM = `'firma_sahibi' / 'firma_admin' / 'firma_kullanici' / 'admin'` |
| `firma` | Fasoncu firma. Kayıt sırasında oluşturulur. `durum` ENUM = `'taslak' / 'inceleme' / 'aktif' / 'askida' / 'pasif'` — yeni kayıt `'taslak'` ile başlar |
| `alici` | Alıcı (buyer). Firmadan bağımsız tablo |
| `sifre_sifirla_token` | Şifre sıfırlama tokenleri |
| `email_dogrulama_token` | E-posta doğrulama (Supabase Auth zaten yapıyor, çoğu durumda gerek olmayabilir) |
| `oturum` | Session tracking (Supabase Auth'a ek olarak audit için) |
| `audit_log` | Kritik aksiyonlar buraya yazılır |

**Schema tam dosyası:** `lib/db/schema.ts` (Drizzle). Tüm tabloları, ilişkileri, ENUM'ları görmek için bu dosyaya bak.

**Supabase JS client tipleri:** `lib/db/database.types.ts`. Doğrudan Supabase client kullanılırsa.

**Tercih:**
- Auth işlemleri → Supabase JS client (`@supabase/ssr`)
- Karmaşık veri sorguları → Drizzle (`lib/db/index.ts` üzerinden)
- Basit okuma → ikisi de OK

**RLS aktif** — tüm sorgular RLS politikalarına uyar. Service role key SADECE gerçekten gerekliyse (admin işlemleri).

---

## Tasarım dokümanları (mockup'lar)

Tüm mockup'lar HTML olarak hazır. **Görsel referans için bu dosyaları aç ve bak.** Asla mockup'tan sapma.

**Yol:** `C:\Users\murat.baran.FORMCNC\OneDrive - FORM MAKİNA CNC TAKIM TEZGAHLARI\RentCNCmachine.com\Tasarım Sayfaları Toplu Gösterimler\Mobil Tasarım\`

Faz 1'de kullanacağın mockup'lar:

| Mockup | Hangi sayfa için |
|--------|-----------------|
| `08_Ana_Sayfa_Tasarimi.html` | `app/page.tsx` (Faz 1: hero + CTA + footer kadarı) |
| `13_Giris_Sayfasi.html` | `app/(auth)/giris/page.tsx` |
| `14_Sifre_Sifirla.html` | `app/(auth)/sifre-sifirla/yeni/page.tsx` |
| `15_Alici_Kayit_Formu.html` | `app/(auth)/kayit/alici/page.tsx` |
| `10_Fasoncu_Kayit_Formu.html` | `app/(auth)/kayit/fasoncu/page.tsx` |
| `16_Firma_Panel_Dashboard.html` | `app/(dashboard)/panel/page.tsx` (Faz 1: sadece iskelet) |

---

## Kod konvansiyonları

### Naming

- **Türkçe domain isimleri** OK: `firma`, `kullanici`, `tezgah`, `teklif`, `rfq`. Database isimleri Türkçe.
- **TypeScript tip isimleri PascalCase**: `Firma`, `Kullanici`, `RfqDurum`.
- **Değişkenler / fonksiyonlar camelCase**: `getCurrentUser()`, `firmaListesi`.
- **Route'lar Türkçe**: `/giris`, `/kayit/alici`, `/sifre-sifirla`. SEO için Türkçe domain'lerde Türkçe URL doğru tercih.
- **Component isimleri İngilizce OK ama tutarlı**: `LoginForm`, `SignupForm`, `Header`, `Footer`.

### TypeScript

- `any` yasak. Bilinmeyen tip için `unknown`, sonra type guard.
- Component prop'ları için inline tip değil, ayrı `type Props = {...}`.
- Server actions için return tipini açıkça yaz.

### Form'lar

- Tüm form'lar `react-hook-form` + `zod`.
- Zod şemaları `lib/validations/` altında.
- Hata mesajları **Türkçe**.

### Server Components vs Client

- Varsayılan Server Component.
- Sadece şu durumlarda `"use client"`:
  - useState / useEffect / event handler
  - Browser-only API (localStorage, vs)
  - Üçüncü taraf client-only kütüphane

### Imports sırası

1. React / Next
2. Üçüncü taraf
3. `@/components/ui/...`
4. `@/lib/...`
5. Relative imports
6. Tipler son

### Yorumlar

- **Türkçe yorumlar OK** ama JSDoc İngilizce.
- Karmaşık iş kuralları için yorumla **neden** olduğunu açıkla, **ne** olduğunu değil.

### Dosya başı

Her server action dosyasında ilk satır:
```ts
"use server";
```

Her client component dosyasında ilk satır:
```ts
"use client";
```

---

## Test ve doğrulama

Faz 1'de full test piramidi kurmuyoruz. Ama her yeni özellikten sonra:

1. **Manuel test:** Senaryoyu kendin tıklayarak doğrula
2. **TypeScript:** `npm run build` hata vermemeli
3. **Lint:** `npm run lint` temiz olmalı
4. **Önemli iş mantığı için:** Vitest ile birkaç unit test (Faz 1 sonu)

---

## Git workflow

- Her feature için **branch aç**: `feature/auth-buyer-signup`, `feature/password-reset`
- Commit mesajları **kısa Türkçe veya İngilizce**, **conventional commits** tarzı:
  - `feat: alıcı kayıt formu`
  - `fix: e-posta doğrulama callback'i`
  - `chore: shadcn button ekle`
- PR'a gerek yok (tek geliştirici), main'e direkt merge OK
- **Yapmadan önce commit at**: küçük adımlarla ilerle

---

## Önemli: yapma listesi

- ❌ `service_role` key'i client tarafında kullanma — sadece server-only
- ❌ RLS'i bypass etme — admin işlemleri için bile uygun politika yaz
- ❌ Şifreyi düz metin logla / kaydet
- ❌ Mockup'tan tasarım sapma — birebir uygula
- ❌ Çoklu dil'i Faz 1'de uygulama — sadece altyapıyı (next-intl config) kur
- ❌ Tezgah / RFQ / Mesajlaşma'ya başlama — sonraki fazlar
- ❌ Optimize etmek için erken refactor — önce çalışsın, sonra düzelt
- ❌ npm paketi eklemeden önce gerçekten gerekli mi düşün — bağımlılık şişirme

---

## Hızlı referans — Supabase Auth pattern

Server Component'tan kullanıcı al:
```ts
import { createClient } from "@/lib/supabase/server";

const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
```

Server Action'dan signup:
```ts
"use server";
import { createClient } from "@/lib/supabase/server";

export async function signupBuyer(formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      data: { rol: "alici" }
    }
  });
  // ...
}
```

Middleware (session refresh):
```ts
// middleware.ts kökünde
import { updateSession } from "@/lib/supabase/middleware";
export async function middleware(request) {
  return await updateSession(request);
}
```

---

## Notlar

- Bu CLAUDE.md proje ilerledikçe güncellenir. Faz 1 bitince **CLAUDE.md** Faz 2 scope'una geçer.
- Murat'a günde 1-2 kez progress raporu — neyi bitirdin, nerede takıldın, sonraki adım.
- Türkçe konuş (kod hariç).
- Acele etme. Doğru çalışan kod, hızlı yazılmış buggy kodtan çok daha değerli.

---

**Versiyon:** 1.0 — Faz 1 başlangıç
**Son güncelleme:** 2026-05-26
