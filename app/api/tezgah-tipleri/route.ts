import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tezgahTip } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const tipler = await db
      .select({ tipId: tezgahTip.tipId, kod: tezgahTip.kod, ad: tezgahTip.ad })
      .from(tezgahTip)
      .where(eq(tezgahTip.aktif, true))
      .orderBy(asc(tezgahTip.sira));
    return NextResponse.json(tipler);
  } catch {
    return NextResponse.json({ hata: "Tezgah tipleri alınamadı." }, { status: 500 });
  }
}
