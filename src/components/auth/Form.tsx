"use client";

import { useForm } from "react-hook-form";
import { registerSchema, loginSchema } from "./schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loading } from "../loading";
import api from "@/lib/axios";
import { toast } from "sonner";

type Props = {
  type: "login" | "register";
};

const schemas = {
  login: loginSchema,
  register: registerSchema,
};

const defaultValueMap = {
  login: {
    email: "",
    password: "",
  },
  register: {
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  },
} as const;

export default function AuthForm({ type }: Props) {
  const schema = schemas[type];
  type FormData = z.infer<typeof schema>;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValueMap[type],
  });

  const { handleSubmit, control } = form;
  const router = useRouter();

  const mutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (data: any) => {
      const endpoint =
        type === "register" ? "/api/auth/register" : "/api/auth/login";
      const res = await api.post(endpoint, data);
      return res.data;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (res: any) => {
      toast.success(res.data.message);
      router.push("/admin/dashboard");
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
        {type === "register" && (
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Full Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="password" placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {type === "register" && (
          <FormField
            control={control}
            name="confirm_password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? <Loading /> : "Submit"}
        </Button>
        <span className="flex gap-2">
          {type === "register"
            ? "Already have an account?"
            : "Don't have account yet?"}
          <Link
            href={
              type === "register" ? "/admin/auth/login" : "/admin/auth/register"
            }
            className="underline font-bold"
          >
            {type === "register" ? "Login" : "Register"}
          </Link>
        </span>
      </form>
    </Form>
  );
}
