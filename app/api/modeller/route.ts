import { NextRequest, NextResponse } from "next/server";
import { MODELS } from "@/lib/tezgah-data";

export async function GET(req: NextRequest) {
  const markaAdi = req.nextUrl.searchParams.get("markaAdi") ?? "";
  const modeller = MODELS[markaAdi] ?? [];
  return NextResponse.json(modeller);
}
