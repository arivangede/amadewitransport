import { redirect } from "next/navigation";

export default function AdminRootPage() {
  return redirect("/admin/dashboard");
}
