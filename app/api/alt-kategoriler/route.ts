import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tezgahAltKategori, tezgahTip } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const tipKod = req.nextUrl.searchParams.get("tipKod");
  if (!tipKod) return NextResponse.json([]);

  try {
    const [tip] = await db
      .select({ tipId: tezgahTip.tipId })
      .from(tezgahTip)
      .where(eq(tezgahTip.kod, tipKod))
      .limit(1);

    if (!tip) return NextResponse.json([]);

    const altKategoriler = await db
      .select({
        altKategoriId: tezgahAltKategori.altKategoriId,
        kod: tezgahAltKategori.kod,
        ad: tezgahAltKategori.ad,
      })
      .from(tezgahAltKategori)
      .where(eq(tezgahAltKategori.tipId, tip.tipId))
      .orderBy(asc(tezgahAltKategori.sira));

    return NextResponse.json(altKategoriler);
  } catch {
    return NextResponse.json({ hata: "Alt kategoriler alınamadı." }, { status: 500 });
  }
}
