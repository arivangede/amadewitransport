import { Trans, useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { CONTACT_EMAIL, CONTACT_PHONE, MAPS_URL, whatsappLink } from "@/lib/whatsapp";
import { MakerMark } from "./MakerMark";
import { PAGES } from "./pages";
import { useScrollTo } from "./smooth-scroll";

// Mirrors the BookingBar services so each link opens WhatsApp with that service pre-filled.
const SERVICES = ["charter", "airport", "package"] as const;

export function Footer() {
  const { t } = useTranslation("common");
  const home = useTranslation("home");
  const scrollTo = useScrollTo();
  const { pathname } = useLocation();

  const link = "text-ivory transition-colors hover:text-gold-hi";
  const external = { target: "_blank", rel: "noopener noreferrer" };

  // A link to the page you're on scrolls back to its top instead.
  const go = (to: string) => (e: React.MouseEvent) => {
    if (to !== pathname) return;
    e.preventDefault();
    scrollTo(0);
  };

  return (
    <footer className="mx-auto flex max-w-[1440px] flex-col gap-14 px-4 pt-20 pb-10 sm:px-8 lg:gap-16 lg:px-20 lg:pt-[100px]">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
        <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-4">
          <Link to="/" onClick={go("/")} aria-label={t("brand.home")} className="flex items-center gap-3.5 self-start">
            <img src="/images/logo-adts.png" alt="ADTS" className="h-9 w-auto lg:h-10" loading="lazy" />
            <span className="flex flex-col gap-0.5">
              <span className="text-[15px] font-bold tracking-[0.02em] text-ivory">
                Amadewi<span className="text-gold">Trans</span>
              </span>
              <span className="text-[9px] tracking-[0.34em] text-mist uppercase">{t("brand.tagline")}</span>
            </span>
          </Link>
          <p className="max-w-[320px] text-[14px] leading-[1.7] text-mist">{t("footer.about")}</p>
        </div>

        <nav aria-label={t("footer.explore")} className="flex flex-col gap-3 text-[14px] lg:col-span-2 lg:col-start-6">
          <span className="label-caps text-fog">{t("footer.explore")}</span>
          {PAGES.map((p) => (
            <Link key={p.to} to={p.to} onClick={go(p.to)} className={`self-start ${link}`}>
              {t(p.key)}
            </Link>
          ))}
        </nav>

        <nav aria-label={t("footer.services")} className="flex flex-col gap-3 text-[14px] lg:col-span-2">
          <span className="label-caps text-fog">{t("footer.services")}</span>
          {SERVICES.map((s) => (
            <a key={s} href={whatsappLink({ item: home.t(`booking.services.${s}`) })} {...external} className={`self-start ${link}`}>
              {home.t(`booking.services.${s}`)}
            </a>
          ))}
          <a href={whatsappLink({ item: t("footer.custom") })} {...external} className={`self-start ${link}`}>
            {t("footer.custom")}
          </a>
        </nav>

        <div className="flex flex-col gap-3 text-[14px] sm:col-span-2 lg:col-span-3">
          <span className="label-caps text-fog">{t("footer.contact")}</span>
          <a href={whatsappLink()} {...external} className={`self-start ${link}`}>
            {CONTACT_PHONE}
          </a>
          {CONTACT_EMAIL ? (
            <a href={`mailto:${CONTACT_EMAIL}`} className={`self-start break-all ${link}`}>
              {CONTACT_EMAIL}
            </a>
          ) : null}
          <a href={MAPS_URL} {...external} className="self-start leading-[1.6] text-mist transition-colors hover:text-gold-hi">
            <Trans ns="home" i18nKey="home.address" components={{ br: <br /> }} />
          </a>
          <span className="text-mist">{t("footer.available")}</span>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-3 border-t border-[#1c2026] pt-6 text-[13px] text-fog sm:flex-row sm:items-center">
        <span>{t("footer.rights", { year: new Date().getFullYear() })}</span>
        <MakerMark />
      </div>
    </footer>
  );
}
