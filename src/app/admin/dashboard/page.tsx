import AdminNavbar from "@/components/admin-navbar";
import LogoutButton from "@/components/auth/LogoutButton";
import UnitSection from "@/components/unit/UnitSection";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AdminNavbar />
      <main className="flex-1 p-4 flex flex-col gap-6 pb-6">
        <h1 className="font-bold text-2xl mb-2">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white rounded-xl shadow flex flex-col min-h-[300px]">
            <UnitSection />
          </section>
          <section className="bg-muted/50 rounded-xl shadow min-h-[300px]" />
        </div>
        <section className="bg-muted/50 rounded-xl shadow min-h-[300px] w-full" />
      </main>
    </div>
  );
}
