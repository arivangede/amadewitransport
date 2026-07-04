import AdminNavbar from "@/components/admin-navbar";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col bg-gradient-to-br from-primary/20 via-white to-slate-100">
      <AdminNavbar />
      <main className="p-4 flex flex-col gap-6 pb-6">{children}</main>
    </div>
  );
}
