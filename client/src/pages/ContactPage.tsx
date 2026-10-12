import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { BookingBar } from "@/components/landing/BookingBar";
import { HomeSection } from "@/components/landing/HomeSection";
import { PageHeader } from "@/components/landing/PageHeader";
import { Reveal } from "@/components/landing/Reveal";
import { usePageMeta } from "@/hooks/usePageMeta";
import { CONTACT_EMAIL, CONTACT_PHONE, MAPS_URL, whatsappLink } from "@/lib/whatsapp";

export default function ContactPage() {
  const { t } = useTranslation("pages");
  usePageMeta(t("contact.meta.title"), t("contact.meta.description"));

  const channels = [
    { icon: MessageCircle, label: t("contact.whatsapp"), value: CONTACT_PHONE, href: whatsappLink(), external: true },
    ...(CONTACT_EMAIL ? [{ icon: Mail, label: t("contact.email"), value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, external: false }] : []),
    { icon: MapPin, label: t("contact.garage"), value: <Trans ns="home" i18nKey="home.address" components={{ br: <br /> }} />, href: MAPS_URL, external: true },
    { icon: Clock, label: t("contact.hours"), value: t("common:footer.available"), href: null, external: false },
  ];

  return (
    <>
      <PageHeader page="contact" />
      <section className="mx-auto flex max-w-[1440px] flex-col gap-12 px-4 py-16 sm:px-8 lg:gap-16 lg:px-20 lg:py-24">
        <Reveal className="flex flex-col gap-5">
          <span className="eyebrow">{t("contact.quote")}</span>
          <div className="hidden lg:block">
            <BookingBar />
          </div>
          <div className="lg:hidden">
            <BookingBar compact />
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((c, i) => {
            const body = (
              <>
                <c.icon className="size-5 text-gold-hi" strokeWidth={1.6} aria-hidden />
                <span className="label-caps mt-6 text-[10px] text-fog">{c.label}</span>
                <span className="mt-2 text-[16px] leading-[1.5] font-semibold break-words text-ivory">{c.value}</span>
                {c.href ? <ArrowUpRight className="absolute top-6 right-6 size-[18px] text-mist transition-colors group-hover:text-gold-hi" strokeWidth={1.8} aria-hidden /> : null}
              </>
            );
            const card = "group relative flex h-full flex-col rounded-md border border-line bg-surface p-6 transition-colors";
            return (
              <Reveal key={i} delay={i * 0.06}>
                {c.href ? (
                  <a href={c.href} {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={`${card} hover:border-gold/60`}>
                    {body}
                  </a>
                ) : (
                  <div className={card}>{body}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </section>
      <HomeSection />
    </>
  );
}
