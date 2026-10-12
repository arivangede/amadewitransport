import { useTranslation } from "react-i18next";
import { DaySection } from "@/components/landing/DaySection";
import { FleetSection } from "@/components/landing/FleetSection";
import { HeroCarousel } from "@/components/landing/HeroCarousel";
import { HomeSection } from "@/components/landing/HomeSection";
import { JourneysSection } from "@/components/landing/JourneysSection";
import { Marquee } from "@/components/landing/Marquee";
import { ReserveSection } from "@/components/landing/ReserveSection";
import { SectionIndicator } from "@/components/landing/SectionIndicator";
import { StandardSection } from "@/components/landing/StandardSection";
import { VoicesSection } from "@/components/landing/VoicesSection";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function HomePage() {
  const { t } = useTranslation("home");
  usePageMeta(t("meta.title"), t("meta.description"));

  return (
    <>
      <SectionIndicator />
      <HeroCarousel />
      <Marquee />
      <StandardSection />
      <FleetSection />
      <DaySection />
      <JourneysSection />
      <VoicesSection />
      <HomeSection />
      <ReserveSection />
    </>
  );
}
