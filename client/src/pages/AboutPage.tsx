import { useTranslation } from "react-i18next";
import { DaySection } from "@/components/landing/DaySection";
import { HomeSection } from "@/components/landing/HomeSection";
import { PageHeader } from "@/components/landing/PageHeader";
import { ReserveSection } from "@/components/landing/ReserveSection";
import { Reveal } from "@/components/landing/Reveal";
import { StandardSection } from "@/components/landing/StandardSection";
import { VoicesSection } from "@/components/landing/VoicesSection";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function AboutPage() {
  const { t } = useTranslation("pages");
  const story = (t("about.story", { returnObjects: true }) as string[]) ?? [];
  usePageMeta(t("about.meta.title"), t("about.meta.description"));

  return (
    <>
      <PageHeader page="about" />
      <section className="mx-auto grid max-w-[1440px] gap-10 px-4 py-20 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:px-20 lg:py-[120px]">
        <Reveal className="lg:col-span-4">
          <span className="eyebrow">{t("about.storyEyebrow")}</span>
        </Reveal>
        <div className="flex flex-col gap-6 lg:col-span-7 lg:col-start-6">
          {story.map((p, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <p className={i === 0 ? "font-display text-[28px] leading-[1.3] text-ivory lg:text-[38px]" : "text-[15px] leading-[1.8] text-[#c9c6bf] lg:text-[17px]"}>{p}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <div className="border-t border-line">
        <StandardSection />
      </div>
      <DaySection />
      <VoicesSection />
      <HomeSection />
      <div className="pb-20 lg:pb-[120px]">
        <ReserveSection />
      </div>
    </>
  );
}
