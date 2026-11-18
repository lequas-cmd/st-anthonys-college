export const LOCALES = ["en", "am"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  am: "አማርኛ",
};

export function getLocaleFromPathname(pathname: string): Locale {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized === "/am" || normalized.startsWith("/am/")) {
    return "am";
  }
  return "en";
}

export function getLocaleAwarePath(pathname: string, locale: Locale): string {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const withoutLocale = normalized.startsWith("/am") ? normalized.slice(3) || "/" : normalized;
  const basePath = withoutLocale === "" ? "/" : withoutLocale;

  if (locale === "am") {
    return basePath === "/" ? "/am" : `/am${basePath}`;
  }

  return basePath;
}

export function getLocaleToggleTarget(pathname: string): { from: Locale; to: Locale; target: string } {
  const current = getLocaleFromPathname(pathname);
  const next = current === "en" ? "am" : "en";
  return {
    from: current,
    to: next,
    target: getLocaleAwarePath(pathname, next),
  };
}
