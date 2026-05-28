import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tezgahMarka, tezgahMarkaTip, tezgahTip } from "@/lib/db/schema";
import { and, eq, asc } from "drizzle-orm";

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

    const markalar = await db
      .select({ markaId: tezgahMarka.markaId, ad: tezgahMarka.ad })
      .from(tezgahMarka)
      .innerJoin(tezgahMarkaTip, eq(tezgahMarkaTip.markaId, tezgahMarka.markaId))
      .where(
        and(
          eq(tezgahMarkaTip.tipId, tip.tipId),
          eq(tezgahMarka.aktif, true),
        ),
      )
      .orderBy(asc(tezgahMarka.ad));

    return NextResponse.json(markalar);
  } catch {
    return NextResponse.json({ hata: "Markalar alınamadı." }, { status: 500 });
  }
}
