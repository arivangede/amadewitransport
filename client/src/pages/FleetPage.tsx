import { useTranslation } from "react-i18next";
import { UnitCard } from "@/components/landing/FleetSection";
import { PageHeader } from "@/components/landing/PageHeader";
import { ReserveSection } from "@/components/landing/ReserveSection";
import { Reveal } from "@/components/landing/Reveal";
import { useUnits } from "@/hooks/useLandingData";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function FleetPage() {
  const { t } = useTranslation("pages");
  const { data: units = [], isLoading, isError } = useUnits();
  usePageMeta(t("fleet.meta.title"), t("fleet.meta.description"));

  return (
    <>
      <PageHeader page="fleet">
        {units.length ? <span className="font-code text-[13px] text-gold-hi">{t("fleet.count", { count: units.length })}</span> : null}
      </PageHeader>
      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-20 lg:py-24">
        {!isLoading && (isError || !units.length) ? (
          <p className="text-[15px] text-mist">{isError ? t("common:state.error") : t("common:state.empty")}</p>
        ) : null}
        <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? [0, 1, 2].map((i) => <div key={i} className="aspect-[3/2] animate-pulse rounded bg-raised" />) : null}
          {units.map((u, i) => (
            <Reveal key={u.id} delay={(i % 3) * 0.1}>
              <UnitCard unit={u} layout="grid" />
            </Reveal>
          ))}
        </div>
      </section>
      <div className="pb-20 lg:pb-[120px]">
        <ReserveSection />
      </div>
    </>
  );
}
