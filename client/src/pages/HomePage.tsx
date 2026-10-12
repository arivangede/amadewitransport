import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Cursor } from "@/components/landing/Cursor";
import { DaySection } from "@/components/landing/DaySection";
import { FleetSection } from "@/components/landing/FleetSection";
import { Footer } from "@/components/landing/Footer";
import { HeroCarousel } from "@/components/landing/HeroCarousel";
import { HomeSection } from "@/components/landing/HomeSection";
import { JourneysSection } from "@/components/landing/JourneysSection";
import { Marquee } from "@/components/landing/Marquee";
import { Navbar } from "@/components/landing/Navbar";
import { Preloader } from "@/components/landing/Preloader";
import { ReserveSection } from "@/components/landing/ReserveSection";
import { SmoothScroll } from "@/components/landing/SmoothScroll";
import { StandardSection } from "@/components/landing/StandardSection";
import { VoicesSection } from "@/components/landing/VoicesSection";
import { ScrollTrigger } from "@/lib/gsap";

export default function HomePage() {
  const { t, i18n } = useTranslation("home");

  // Localised document title + description.
  useEffect(() => {
    document.title = t("meta.title");
    document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta.description"));
    // Copy length changes with language; re-measure pinned/scrubbed sections.
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [t, i18n.resolvedLanguage]);

  return (
    <SmoothScroll>
      <div className="landing min-h-screen overflow-x-clip">
        <Preloader />
        <Cursor />
        <Navbar />
        <main>
          <HeroCarousel />
          <Marquee />
          <StandardSection />
          <FleetSection />
          <DaySection />
          <JourneysSection />
          <VoicesSection />
          <HomeSection />
          <ReserveSection />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
