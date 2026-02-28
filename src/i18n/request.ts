import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headersList = await headers();
  const locale =
    cookieStore.get("NEXT_LOCALE")?.value ||
    (headersList.get("accept-language") || "").split(",")[0].split("-")[0] ||
    "zh";

  if (!locales.includes(locale as Locale)) {
    return {
      locale: "zh",
      messages: (await import("@/messages/zh.json")).default,
    };
  }

  return {
    locale: locale as Locale,
    messages: (await import(`@/messages/${locale as Locale}.json`)).default,
  };
});
