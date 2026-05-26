import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // Faz 1: sadece Türkçe. Faz 2+'da locale parametresi HTTP header veya cookie'den okunacak.
  const locale = "tr";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
