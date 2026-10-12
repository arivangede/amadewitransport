import { useTranslation } from "react-i18next";
import { JourneysSection } from "@/components/landing/JourneysSection";
import { PageHeader } from "@/components/landing/PageHeader";
import { ReserveSection } from "@/components/landing/ReserveSection";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function PackagesPage() {
  const { t } = useTranslation("pages");
  usePageMeta(t("packages.meta.title"), t("packages.meta.description"));

  return (
    <>
      <PageHeader page="packages" />
      <JourneysSection heading={false} />
      <div className="py-20 lg:py-[120px]">
        <ReserveSection />
      </div>
    </>
  );
}
