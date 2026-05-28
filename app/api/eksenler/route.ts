import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tezgahEksenSecenek } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const altKategoriId = parseInt(req.nextUrl.searchParams.get("altKategoriId") ?? "0");
  if (!altKategoriId) return NextResponse.json([]);

  try {
    const eksenler = await db
      .select({ eksenId: tezgahEksenSecenek.eksenId, ad: tezgahEksenSecenek.ad })
      .from(tezgahEksenSecenek)
      .where(eq(tezgahEksenSecenek.altKategoriId, altKategoriId))
      .orderBy(asc(tezgahEksenSecenek.sira));

    return NextResponse.json(eksenler);
  } catch {
    return NextResponse.json({ hata: "Eksen seçenekleri alınamadı." }, { status: 500 });
  }
}
