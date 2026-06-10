import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

function getAnthropicKey(): string {
  // process.env zaten gerçek değer içeriyorsa kullan
  const envKey = process.env.ANTHROPIC_API_KEY;
  if (envKey && envKey.startsWith("sk-")) return envKey;

  // .env.local dosyasından direkt oku (SDK boş string set ediyor olabilir)
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    const content = fs.readFileSync(envPath, "utf-8");
    const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    return match?.[1]?.trim() ?? "";
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  const apiKey = getAnthropicKey();
  if (!apiKey) {
    return NextResponse.json(
      { hata: "ANTHROPIC_API_KEY bulunamadı. .env.local dosyasını kontrol edin." },
      { status: 500 }
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    const formData = await req.formData();
    const file = formData.get("foto") as File | null;

    if (!file) {
      return NextResponse.json({ hata: "Fotoğraf bulunamadı." }, { status: 400 });
    }

    // Dosyayı base64'e çevir
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = (file.type || "image/jpeg") as
      | "image/jpeg"
      | "image/png"
      | "image/gif"
      | "image/webp";

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: `Bu bir CNC tezgah fotoğrafı. Lütfen görseli analiz et ve aşağıdaki bilgileri JSON formatında döndür.
Emin olmadığın alanları null bırak — yanlış bilgi verme, null daha iyidir.

Döndür (sadece JSON, açıklama yok):
{
  "marka": "marka adı veya null",
  "model": "model adı/numarası veya null",
  "tezgahTipi": "dik_isleme | yatay_isleme | torna | taslama | erozyon | portal | hibrit | otomat | tapping | universal | sac | null",
  "kontrolSistemi": "kontrol sistemi adı (Fanuc 0i-MF, Siemens 840D vb.) veya null",
  "yaklasikYil": yıl sayısı veya null,
  "guven": "yuksek | orta | dusuk",
  "notlar": "görselden okunan önemli bilgiler (max 1 cümle) veya null"
}`,
            },
          ],
        },
      ],
    });

    // JSON çıktısını parse et
    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ hata: "Analiz sonucu okunamadı." }, { status: 500 });
    }

    const analiz = JSON.parse(jsonMatch[0]);
    return NextResponse.json(analiz);

  } catch (err) {
    console.error("Foto analiz hatası:", err);
    return NextResponse.json(
      { hata: "Analiz yapılamadı: " + String(err) },
      { status: 500 }
    );
  }
}
