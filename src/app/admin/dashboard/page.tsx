import AdminNavbar from "@/components/admin-navbar";
import LogoutButton from "@/components/auth/LogoutButton";
import UnitSection from "@/components/unit/UnitSection";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex-1 rounded-xl md:min-h-min">
        <AdminNavbar />
      </div>
      <h1 className="font-bold text-2xl">Dashboard</h1>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl">
          <UnitSection />
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
    </div>
  );
}
