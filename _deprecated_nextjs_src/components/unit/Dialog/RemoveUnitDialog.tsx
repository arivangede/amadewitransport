import { Loading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import api from "@/lib/axios";
import { UnitWithRelations } from "@/store/unitStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function RemoveUnitDialog({
  unit,
}: {
  unit: UnitWithRelations;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/api/unit/${unit.id}`);
      return res;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (res: any) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Something went wrong");
    },
  });

  function handleRemove() {
    mutation.mutate();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Remove Unit Alert</DialogTitle>
        <DialogDescription className="text-base">
          Are you sure you want to remove this unit? <br />
          <span className="text-destructive font-semibold">
            (this process cannot be undone)
          </span>
        </DialogDescription>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"}>Cancel</Button>
          </DialogClose>
          <Button onClick={() => handleRemove()} disabled={mutation.isPending}>
            {mutation.isPending ? <Loading /> : "Remove Unit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
