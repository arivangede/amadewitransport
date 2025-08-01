import AuthForm from "@/components/auth/Form";

export default function Page() {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center">
      <div className="w-full max-w-sm space-y-4">
        Login
        <AuthForm type="login" />
      </div>
    </div>
  );
}
