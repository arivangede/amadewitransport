import { Outlet } from "react-router-dom";
import AdminNavbar from "@/components/admin-navbar";

export default function AdminLayout() {
  return (
    <div className="flex flex-col bg-gradient-to-br from-primary/20 via-white to-slate-100">
      <AdminNavbar />
      <main className="p-4 flex flex-col gap-6 pb-6">
        <Outlet />
      </main>
    </div>
  );
}
