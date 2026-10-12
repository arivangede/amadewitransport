import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ScrollTrigger } from "@/lib/gsap";
import { getPricing } from "@/lib/pricing";
import type { PackageWithRelations } from "@/store/packageStore";
import { PackageModal } from "./PackageModal";
import { Reveal } from "./Reveal";
import { usePackages } from "@/hooks/useLandingData";
import { SectionHeading } from "./SectionHeading";

export function JourneysSection({ heading = true }: { heading?: boolean }) {
  const { t } = useTranslation("home");
  const { data: packages = [], isLoading, isError } = usePackages();
  const [params, setParams] = useSearchParams();

  // ?journey=<id> opens a package directly — shareable links for promotions.
  const selectedId = Number(params.get("journey"));
  const selected = packages.find((p) => p.id === selectedId) ?? null;

  const open = (id: number) => {
    const next = new URLSearchParams(params);
    next.set("journey", String(id));
    setParams(next, { replace: true, preventScrollReset: true });
  };
  const close = () => {
    const next = new URLSearchParams(params);
    next.delete("journey");
    setParams(next, { replace: true, preventScrollReset: true });
  };

  // The cards change the page height once they arrive; re-measure the scrubbed sections below.
  useEffect(() => {
    if (isLoading) return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [isLoading, packages.length]);

  const [featured, ...rest] = packages;

  return (
    <section id="journeys" className="bg-[#111419]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-4 py-20 sm:px-8 lg:gap-16 lg:px-20 lg:py-[120px]">
        {heading ? <SectionHeading eyebrow="journeys.eyebrow" title="journeys.title" /> : null}

        {isLoading ? (
          <div className="grid gap-8">
            <div className="h-[520px] animate-pulse rounded-md bg-raised lg:h-[600px]" />
            <div className="grid gap-8 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[440px] animate-pulse rounded bg-raised" />
              ))}
            </div>
          </div>
        ) : null}

        {!isLoading && (isError || !packages.length) ? (
          <p className="text-[15px] text-mist">{isError ? t("common:state.error") : t("common:state.empty")}</p>
        ) : null}

        {featured ? (
          <Reveal>
            <FeaturedCard pkg={featured} onOpen={() => open(featured.id)} />
          </Reveal>
        ) : null}

        {rest.length ? (
          <div className="grid gap-12 md:grid-cols-2 md:gap-8 lg:grid-cols-6">
            {rest.map((pkg, i) => {
              const size = cardSize(i, rest.length);
              return (
                <Reveal key={pkg.id} delay={(i % 3) * 0.1} className={`${SPAN[size]} ${i === rest.length - 1 && rest.length % 2 ? "md:col-span-2" : ""}`}>
                  <PackageCard pkg={pkg} size={size} onOpen={() => open(pkg.id)} />
                </Reveal>
              );
            })}
          </div>
        ) : null}
      </div>

      <PackageModal pkg={selected} onClose={close} />
    </section>
  );
}

type CardSize = "third" | "half" | "wide";

const SPAN: Record<CardSize, string> = {
  third: "lg:col-span-2",
  half: "lg:col-span-3",
  wide: "lg:col-span-6",
};

/** Rows of three; a last row of two splits the width, a lone last card spans it — no empty columns. */
function cardSize(i: number, total: number): CardSize {
  const remainder = total % 3;
  if (!remainder || i < total - remainder) return "third";
  return remainder === 2 ? "half" : "wide";
}

function Media({ pkg, className, sizes }: { pkg: PackageWithRelations; className: string; sizes?: string }) {
  const image = pkg.images?.[0]?.path;
  return image ? (
    <img
      src={image}
      alt=""
      sizes={sizes}
      loading="lazy"
      decoding="async"
      className={`size-full object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.05] ${className}`}
    />
  ) : (
    <div className={`flex size-full items-center justify-center bg-well ${className}`}>
      <img src="/images/logo-adts.png" alt="" className="w-1/2 opacity-10" />
    </div>
  );
}

function FeaturedCard({ pkg, onOpen }: { pkg: PackageWithRelations; onOpen: () => void }) {
  const { t, i18n } = useTranslation("home");
  const pricing = getPricing(pkg, i18n.resolvedLanguage ?? "en");

  return (
    <button
      type="button"
      onClick={onOpen}
      data-cursor="view"
      className="group grid w-full cursor-pointer overflow-hidden rounded-md border border-line bg-raised text-left transition-colors hover:border-line-strong lg:h-[600px] lg:grid-cols-12"
    >
      <div className="relative h-[280px] overflow-hidden sm:h-[380px] lg:col-span-7 lg:h-full">
        <Media pkg={pkg} className="" sizes="(min-width: 1024px) 58vw, 100vw" />
        <span className="absolute top-5 left-5 rounded-full bg-gold px-3.5 py-2 text-[10px] font-bold tracking-[0.2em] text-ink uppercase lg:top-6 lg:left-6 lg:text-[11px]">
          {t("journeys.featured")}
        </span>
      </div>
      <div className="flex flex-col justify-between gap-8 p-6 lg:col-span-5 lg:p-11">
        <div className="flex flex-col gap-5">
          <h3 className="font-display text-[36px] leading-[1.02] font-medium text-ivory lg:text-[56px] lg:leading-none">{pkg.name}</h3>
          {pkg.description ? <p className="line-clamp-4 text-[15px] leading-[1.7] text-mist lg:text-[16px]">{pkg.description}</p> : null}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-5 border-t border-line pt-6">
          <Price pricing={pricing} big />
          <span className="inline-flex h-[52px] items-center gap-3 rounded-full border border-gold-hi px-6 text-[13px] font-bold tracking-[0.12em] text-gold-hi uppercase transition-colors group-hover:bg-gold-hi group-hover:text-ink">
            {t("journeys.view")}
            <ArrowUpRight className="size-[18px]" strokeWidth={1.8} aria-hidden />
          </span>
        </div>
      </div>
    </button>
  );
}

function PackageCard({ pkg, size, onOpen }: { pkg: PackageWithRelations; size: CardSize; onOpen: () => void }) {
  const { t, i18n } = useTranslation("home");
  const pricing = getPricing(pkg, i18n.resolvedLanguage ?? "en");
  const photos = pkg.images?.length ?? 0;
  const wide = size === "wide";

  return (
    <button
      type="button"
      onClick={onOpen}
      data-cursor="view"
      className={`group flex w-full cursor-pointer flex-col gap-5 text-left lg:gap-[22px] ${wide ? "lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-12" : ""}`}
    >
      <div
        className={`relative h-[260px] w-full overflow-hidden rounded border border-line ${
          wide ? "lg:col-span-7 lg:h-[380px]" : size === "half" ? "lg:h-[380px]" : "lg:h-[300px]"
        }`}
      >
        <Media
          pkg={pkg}
          className=""
          sizes={size === "third" ? "(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 50vw, 100vw"}
        />
        {pricing.hasDiscount ? (
          <span className="absolute top-5 right-5 rounded-full bg-promo px-3 py-1.5 text-[11px] font-bold tracking-[0.16em] text-promo-fg uppercase">
            {t("common:price.promo")} −{pricing.discountLabel}
          </span>
        ) : null}
        {photos > 1 ? (
          <span className="absolute bottom-4 left-4 rounded-full bg-ink/70 px-3 py-1 font-code text-[11px] text-ivory">{t("journeys.photos", { count: photos })}</span>
        ) : null}
      </div>
      <div className={`flex flex-col gap-5 lg:gap-[22px] ${wide ? "lg:col-span-5" : ""}`}>
        <div className="flex flex-col gap-2.5">
          <h3 className={`font-display leading-[1.05] font-medium text-ivory ${size === "third" ? "text-[30px] lg:text-[34px]" : "text-[30px] lg:text-[40px]"}`}>{pkg.name}</h3>
          {pkg.description ? <p className={`text-[15px] leading-[1.6] text-mist ${wide ? "line-clamp-3" : "line-clamp-2"}`}>{pkg.description}</p> : null}
        </div>
        <div className="flex items-center justify-between border-t border-line pt-4">
          <Price pricing={pricing} />
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold tracking-[0.12em] text-ivory uppercase transition-colors group-hover:text-gold-hi">
            {t("journeys.details")}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" strokeWidth={1.8} aria-hidden />
          </span>
        </div>
      </div>
    </button>
  );
}

export function Price({ pricing, big = false }: { pricing: ReturnType<typeof getPricing>; big?: boolean }) {
  const { t } = useTranslation("common");
  return (
    <span className="flex flex-col gap-1">
      {big ? <span className="label-caps text-mist">{t("price.perCar")}</span> : null}
      <span className={`font-semibold whitespace-nowrap text-gold-hi ${big ? "text-[26px] lg:text-[28px]" : "text-[18px]"}`}>{pricing.formatted}</span>
      {pricing.hasDiscount ? <span className="text-[13px] text-fog line-through">{pricing.formattedBase}</span> : null}
    </span>
  );
}
