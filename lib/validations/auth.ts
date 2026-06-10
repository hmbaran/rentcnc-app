import { z } from "zod";

export const girisSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  sifre: z.string().min(8, "Şifre en az 8 karakter olmalı"),
  beniHatirla: z.boolean(),
});

export type GirisFormData = z.infer<typeof girisSchema>;

export const fasoncuAdim1Schema = z
  .object({
    // Kimlik
    vkn: z
      .string()
      .length(10, "VKN 10 haneli olmalı")
      .regex(/^\d+$/, "Sadece rakam girin"),
    ticariUnvan: z.string().min(2, "Ticari ünvan gerekli"),
    il: z.string().min(1, "İl seçin"),
    ilce: z.string().min(1, "İlçe seçin"),
    // İletişim
    yetkiliKisi: z.string().min(2, "Yetkili kişi adı gerekli"),
    telefon: z.string().min(10, "Geçerli telefon numarası girin"),
    email: z.string().email("Geçerli bir e-posta girin"),
    sifre: z
      .string()
      .min(8, "Şifre en az 8 karakter olmalı")
      .regex(/[a-zA-ZğüşıöçĞÜŞİÖÇ]/, "Şifre en az bir harf içermeli")
      .regex(/[0-9]/, "Şifre en az bir rakam içermeli"),
    sifreTekrar: z.string().min(1, "Şifre tekrarı gerekli"),
    // Panelden tamamlanacak — opsiyonel
    adres: z.string().optional(),
    website: z.string().optional(),
    kurulisYili: z.string().optional(),
    calisanAralik: z.string().optional(),
    kisaTanitim: z.string().max(300).optional(),
  })
  .refine((d) => d.sifre === d.sifreTekrar, {
    message: "Şifreler eşleşmiyor",
    path: ["sifreTekrar"],
  });

export type FasoncuAdim1Data = z.infer<typeof fasoncuAdim1Schema>;

export const aliciKayitSchema = z.object({
  firmaAdi: z.string().min(1, "Firma adı gerekli"),
  sektor: z.string().min(1, "Sektör seçin"),
  ulke: z.string().min(1, "Ülke seçin"),
  vatNo: z.string().optional(),
  website: z.string().optional(),
  calisanSayisi: z.string().optional(),
  ad: z.string().min(1, "Ad gerekli"),
  soyad: z.string().min(1, "Soyad gerekli"),
  pozisyon: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta girin"),
  telefon: z.string().optional(),
  sifre: z.string().min(8, "Şifre en az 8 karakter olmalı"),
  dilTercihi: z.string().optional(),
  yillikHacim: z.string().optional(),
  notlar: z.string().optional(),
});

export type AliciKayitData = z.infer<typeof aliciKayitSchema>;

export const sifreSifirlamaSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
});

export type SifreSifirlamaData = z.infer<typeof sifreSifirlamaSchema>;

export const yeniSifreSchema = z
  .object({
    yeniSifre: z.string().min(8, "Şifre en az 8 karakter olmalı"),
    sifreTekrar: z.string().min(1, "Şifre tekrarı gerekli"),
  })
  .refine((d) => d.yeniSifre === d.sifreTekrar, {
    message: "Şifreler eşleşmiyor",
    path: ["sifreTekrar"],
  });

export type YeniSifreData = z.infer<typeof yeniSifreSchema>;
