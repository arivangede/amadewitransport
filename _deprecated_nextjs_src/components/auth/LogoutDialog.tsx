"use client";

import { useMutation } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Loading } from "../loading";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { LogOut } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import useUserStore from "@/store/userStore";

export default function LogoutDialog() {
  const { clearUser } = useUserStore();
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/auth/logout");
      return res.data;
    },
    onSuccess: (res) => {
      clearUser();
      toast.info(res.message);
      router.push("/auth/login");
    },
  });

  function logout() {
    mutation.mutate();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"destructive"}>
          Logout <LogOut />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Logout Confirmation</DialogTitle>
        </DialogHeader>

        <p>Are you sure you want to logout?</p>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>Cancel</Button>
          </DialogClose>
          <Button
            variant={"destructive"}
            onClick={() => logout()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Loading /> : "Logout Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
