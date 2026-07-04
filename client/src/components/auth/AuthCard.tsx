import { Card, CardContent } from "../ui/card";
import AuthForm from "./Form";

interface AuthCardProps {
  type: "register" | "login";
}

export default function AuthCard({ type }: AuthCardProps) {
  return (
    <div className="flex flex-col items-center gap-4 min-w-sm md:min-w-md lg:min-w-lg p-4">
      <div className="flex gap-4 items-center">
        <h1 className="text-3xl md:text-6xl font-bold">
          Amadewi <span className="text-primary">Trans</span>
        </h1>
        |<span className="md:text-xl font-bold uppercase">{type}</span>
      </div>
      <Card className="w-full">
        <CardContent>
          <AuthForm type={type} />
        </CardContent>
      </Card>
    </div>
  );
}
