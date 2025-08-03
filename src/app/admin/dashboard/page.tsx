import AdminNavbar from "@/components/admin-navbar";
import PackageSection from "@/components/package/PackageSection";
import PromotionSection from "@/components/promotion/PromotionSection";
import UnitSection from "@/components/unit/UnitSection";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary/20 via-white to-slate-100">
      <AdminNavbar />
      <main className="flex-1 p-4 flex flex-col gap-6 pb-6">
        <h1 className="font-bold text-2xl mb-2">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UnitSection />
          <PackageSection />
          <PromotionSection />
        </div>
      </main>
    </div>
  );
}
