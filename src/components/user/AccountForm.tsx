import { useForm } from "react-hook-form";
import { AccountSchema } from "./schemas";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useUserStore from "@/store/userStore";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Loading } from "../loading";

export default function AccountForm() {
  const { user, setUser } = useUserStore();
  type FormData = z.infer<typeof AccountSchema>;
  const form = useForm<FormData>({
    resolver: zodResolver(AccountSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormData) => {
      const res = await api.put("/api/user/account-info", values);
      return res;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (res: any) => {
      setUser(res.data.user);
      toast.success(res.data.message);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Something went wrong");
    },
  });

  function onSubmit(values: FormData) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Full Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button disabled={mutation.isPending}>
            {mutation.isPending ? <Loading /> : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
