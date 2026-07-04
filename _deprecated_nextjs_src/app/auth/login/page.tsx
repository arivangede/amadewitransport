import AuthCard from "@/components/auth/AuthCard";

export default function Page() {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-primary/20 via-white to-slate-100">
      <AuthCard type="login" />
    </div>
  );
}
