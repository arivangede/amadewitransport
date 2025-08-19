import PackageSection from "@/components/package/PackageSection";
import PromotionSection from "@/components/promotion/PromotionSection";
import UnitSection from "@/components/unit/UnitSection";
import VisitorLogSection from "@/components/visitor/VisitorLogSection";

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="font-bold text-2xl mb-2">Dashboard</h1>
      <VisitorLogSection />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UnitSection />
        <PackageSection />
        <PromotionSection />
      </div>
    </div>
  );
}
