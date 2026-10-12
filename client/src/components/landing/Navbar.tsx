import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useLocation } from "react-router-dom";
import { whatsappLink } from "@/lib/whatsapp";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLenis, useScrollTo } from "./smooth-scroll";

// Pages only — in-page sections live in the floating SectionIndicator.
const LINKS = [
  { to: "/", key: "nav.pages.home" },
  { to: "/fleet", key: "nav.pages.fleet" },
  { to: "/packages", key: "nav.pages.packages" },
  { to: "/about", key: "nav.pages.about" },
  { to: "/contact", key: "nav.pages.contact" },
];

export function Navbar() {
  const { t } = useTranslation("common");
  const scrollTo = useScrollTo();
  const lenis = useLenis();
  const { pathname } = useLocation();
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 40);
    setHidden(y > 480 && y > prev && !open);
  });

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis]);

  // Close the menu on navigation; a link to the page you're on scrolls back to its top instead.
  const go = (to: string) => (e: React.MouseEvent) => {
    setOpen(false);
    if (to !== pathname) return;
    e.preventDefault();
    scrollTo(0);
  };

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          solid ? "border-b border-ivory/10 bg-ink/80 backdrop-blur-xl" : "border-b border-ivory/10 bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 lg:h-[88px] lg:px-20">
          <Link to="/" onClick={go("/")} aria-label={t("brand.home")} className="flex items-center gap-3.5">
            <img src="/images/logo-adts.png" alt="ADTS" width={130} height={33} className="h-[26px] w-auto lg:h-[32px]" />
            <span className="hidden flex-col gap-0.5 sm:flex">
              <span className="text-[15px] font-bold tracking-[0.02em] text-ivory">
                Amadewi<span className="text-gold">Trans</span>
              </span>
              <span className="text-[9px] tracking-[0.34em] text-mist uppercase">{t("brand.tagline")}</span>
            </span>
          </Link>

          <nav aria-label={t("nav.label")} className="hidden items-center gap-9 text-[13px] tracking-[0.16em] uppercase xl:flex">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end
                onClick={go(l.to)}
                className={({ isActive }) => `group relative transition-colors hover:text-gold-hi ${isActive ? "text-gold-hi" : "text-ivory"}`}
              >
                {({ isActive }) => (
                  <>
                    {t(l.key)}
                    <span
                      className={`absolute -bottom-1.5 left-0 h-px w-full bg-gold-hi transition-transform duration-500 ease-out-expo ${
                        isActive ? "origin-left scale-x-100" : "origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 lg:gap-4">
            <LanguageSwitcher size="sm" />
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gold-brushed hidden h-12 items-center gap-2.5 rounded-full px-6 text-[13px] font-bold tracking-[0.08em] text-ink uppercase transition-[filter] hover:brightness-110 md:flex"
            >
              <MessageCircle className="size-[18px]" strokeWidth={1.8} aria-hidden />
              {t("cta.whatsapp")}
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t("nav.openMenu")}
              aria-expanded={open}
              className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-ivory/25 text-ivory xl:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                <path d="M4 9h16M4 15h10" />
              </svg>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="menu"
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.label")}
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.8, ease: [0.77, 0, 0.18, 1] }}
            className="fixed inset-0 z-[60] flex flex-col bg-ink px-4 pb-10 xl:hidden"
          >
            <div className="flex h-[72px] items-center justify-between">
              <img src="/images/logo-adts.png" alt="ADTS" className="h-[26px] w-auto" />
              <button
                type="button"
                autoFocus
                onClick={() => setOpen(false)}
                aria-label={t("nav.closeMenu")}
                className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-ivory/25 text-ivory"
              >
                <X className="size-5" strokeWidth={1.6} aria-hidden />
              </button>
            </div>
            <nav aria-label={t("nav.label")} className="mt-10 flex flex-col">
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <NavLink
                    to={l.to}
                    end
                    onClick={go(l.to)}
                    className={({ isActive }) =>
                      `flex items-baseline justify-between border-b border-line py-5 font-display text-[40px] leading-none ${isActive ? "text-gold-hi" : "text-ivory"}`
                    }
                  >
                    {t(l.key)}
                    <span className="font-code text-[12px] text-gold">0{i + 1}</span>
                  </NavLink>
                </motion.div>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-4">
              <LanguageSwitcher className="self-start" />
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gold-brushed flex h-14 items-center justify-center gap-2.5 rounded-full text-[13px] font-bold tracking-[0.1em] text-ink uppercase"
              >
                <MessageCircle className="size-[18px]" strokeWidth={1.8} aria-hidden />
                {t("cta.whatsapp")}
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
