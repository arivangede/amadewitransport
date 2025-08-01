"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Loading } from "../loading";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function LogoutButton() {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/auth/logout");
      return res.data;
    },
    onSuccess: (res) => {
      toast.info(res.message);
      router.push("/auth/login");
    },
  });

  function logout() {
    mutation.mutate();
  }

  return (
    <Button onClick={logout}>
      {mutation.isPending ? <Loading /> : "Logout"}
    </Button>
  );
}
