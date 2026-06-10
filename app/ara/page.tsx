import { firmalariListele } from "@/lib/actions/firma";
import AramaSayfasi from "./AramaSayfasi";

export const metadata = {
  title: "Fasoncu Ara",
  description: "Türkiye'deki CNC fasoncu firmalarını tezgah tipi, malzeme, sertifika ve şehre göre arayın.",
};

export default async function AraPage() {
  const firmalar = await firmalariListele();
  return <AramaSayfasi firmalar={firmalar} />;
}
