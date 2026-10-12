import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "@/i18n";
import { CONTACT_EMAIL, CONTACT_PHONE, whatsappLink } from "@/lib/whatsapp";
import { useScrollTo } from "./smooth-scroll";

export function Footer() {
  const { t } = useTranslation("common");
  const home = useTranslation("home");
  const scrollTo = useScrollTo();
  const destinations = ((home.t("marquee.items", { returnObjects: true }) as string[]) ?? []).slice(0, 4);

  const anchor = (href: string, label: string) => (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        scrollTo(href);
      }}
      className="text-ivory transition-colors hover:text-gold-hi"
    >
      {label}
    </a>
  );

  return (
    <footer className="mx-auto flex max-w-[1440px] flex-col gap-14 px-4 pt-20 pb-10 sm:px-8 lg:gap-16 lg:px-20 lg:pt-[100px]">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
        <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-4">
          <img src="/images/logo-adts.png" alt="ADTS" className="h-9 w-auto self-start lg:h-10" loading="lazy" />
          <p className="max-w-[320px] text-[14px] leading-[1.7] text-mist">{t("footer.about")}</p>
        </div>
        <nav aria-label={t("footer.services")} className="flex flex-col gap-3 text-[14px] lg:col-span-2 lg:col-start-6">
          <span className="label-caps text-fog">{t("footer.services")}</span>
          {anchor("#fleet", t("footer.charter"))}
          {anchor("#journeys", t("footer.packages"))}
          {anchor("#contact", t("footer.airport"))}
          {anchor("#contact", t("footer.custom"))}
        </nav>
        <nav aria-label={t("footer.destinations")} className="flex flex-col gap-3 text-[14px] lg:col-span-2">
          <span className="label-caps text-fog">{t("footer.destinations")}</span>
          {destinations.map((d) => (
            <span key={d}>{anchor("#journeys", d)}</span>
          ))}
        </nav>
        <div className="flex flex-col gap-3 text-[14px] lg:col-span-2">
          <span className="label-caps text-fog">{t("footer.contact")}</span>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="text-ivory transition-colors hover:text-gold-hi">
            {CONTACT_PHONE}
          </a>
          {CONTACT_EMAIL ? (
            <a href={`mailto:${CONTACT_EMAIL}`} className="break-all text-ivory transition-colors hover:text-gold-hi">
              {CONTACT_EMAIL}
            </a>
          ) : null}
          <span className="text-mist">{t("footer.available")}</span>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-3 border-t border-[#1c2026] pt-6 text-[13px] text-fog sm:flex-row">
        <span>{t("footer.rights", { year: new Date().getFullYear() })}</span>
        <span className="font-code uppercase">{SUPPORTED_LANGUAGES.join(" · ")}</span>
      </div>
    </footer>
  );
}
