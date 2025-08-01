import AuthForm from "@/components/auth/Form";

export default function Page() {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center">
      <div className="space-y-4 w-full max-w-sm">
        Register
        <AuthForm type="register" />
      </div>
    </div>
  );
}
