import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "@/i18n";

export function LanguageSwitcher({ size = "md", className = "" }: { size?: "sm" | "md"; className?: string }) {
  const { t, i18n } = useTranslation("common");
  const current = i18n.resolvedLanguage;

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className={`flex rounded-full border border-ivory/25 p-[3px] text-[12px] font-bold tracking-[0.1em] ${className}`}
    >
      {SUPPORTED_LANGUAGES.map((lng) => {
        const active = lng === current;
        return (
          <button
            key={lng}
            type="button"
            lang={lng}
            aria-pressed={active}
            aria-label={t("language.switchTo", { name: t("language.name", { lng }) })}
            onClick={() => i18n.changeLanguage(lng)}
            className={`${size === "sm" ? "h-8 min-w-10" : "h-9 min-w-11"} cursor-pointer rounded-full px-2 transition-colors duration-300 ${
              active ? "bg-ivory text-ink" : "text-ivory hover:text-gold-hi"
            }`}
          >
            {t("language.short", { lng })}
          </button>
        );
      })}
    </div>
  );
}
