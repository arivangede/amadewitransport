"use client";

import z from "zod";
import { PackageSchema } from "../forms/schemas";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/loading";
import { PackageWithRelations } from "@/store/packageStore";
import { useState } from "react";
import { PackageImage } from "@prisma/client";
import Image from "next/image";

type PackageFormData = z.infer<typeof PackageSchema>;

interface PackageDialogProps {
  variant: "create" | "edit" | "delete";
  package?: PackageWithRelations;
}

function parseInclusions(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: any
): { item: string; description: string }[] {
  if (!raw) return [];

  if (
    Array.isArray(raw) &&
    raw.every(
      (inc) =>
        inc && typeof inc === "object" && "item" in inc && "description" in inc
    )
  ) {
    return raw as { item: string; description: string }[];
  }

  if (Array.isArray(raw) && typeof raw[0] === "string") {
    return raw.map((item) => ({ item, description: "" }));
  }

  return [];
}

export default function PackageDialog({
  variant,
  package: pkg,
}: PackageDialogProps) {
  const queryClient = useQueryClient();
  const [existingImages, setExistingImages] = useState<PackageImage[] | null>(
    pkg?.images || null
  );
  const defaultValues: Partial<PackageFormData> = {
    name: pkg?.name || "",
    description: pkg?.description || "",
    inclusions: parseInclusions(pkg?.inclusions) || [],
    base_rate: pkg?.base_rate || 0,
    images: undefined,
  };
  const form = useForm<PackageFormData>({
    resolver: zodResolver(PackageSchema),
    defaultValues,
  });

  const {
    fields: inclusionFields,
    append: appendInclusion,
    remove: removeInclusion,
  } = useFieldArray({
    control: form.control,
    name: "inclusions",
  });

  const ApiMethod = {
    create: async (values: FormData) => {
      const res = await api.post("/api/package", values, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res;
    },
    edit: async (values: FormData) => {
      if (variant === "edit" && pkg) {
        const res = api.put(`/api/package/${pkg.id}`, values, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return res;
      }
    },
    delete: async () => {
      if (variant === "delete" && pkg) {
        const res = await api.delete(`/api/package/${pkg.id}`);
        return res;
      }
    },
  };

  const mutation = useMutation({
    mutationFn: async (values: FormData) => {
      const res = await ApiMethod[variant](values);
      return res;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      toast.success(res.data.message);
      form.reset();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Something went wrong");
    },
  });

  function onSubmit(values: PackageFormData) {
    const formData = new FormData();
    formData.append("name", values.name);
    if (values.description) {
      formData.append("description", values.description);
    }
    if (values.inclusions) {
      formData.append("inclusions", JSON.stringify(values.inclusions));
    }
    formData.append("base_rate", values.base_rate.toString());

    values.images?.forEach((file) => formData.append("images", file));

    if (variant === "edit" && pkg?.images?.length !== existingImages?.length) {
      formData.append(
        "remove_image_ids",
        JSON.stringify(
          pkg?.images
            ?.filter((img) => !existingImages?.find((e) => e.id === img.id))
            .map((img) => ({ id: img.id }))
        )
      );
    }

    mutation.mutate(formData);
  }

  if (variant === "delete") {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Remove Package Alert</DialogTitle>
          <DialogDescription className="text-base">
            Are you sure you want to remove this package? <br />
            <span className="text-destructive font-semibold">
              (this process cannot be undone)
            </span>
          </DialogDescription>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant={"outline"}>Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => onSubmit(form.getValues())}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? <Loading /> : "Remove Package"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={variant === "create" ? "default" : "outline"}
          className="font-semibold"
        >
          {variant === "create" ? "Add +" : <Edit className="h-4 w-4" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {variant === "create"
                  ? "Register New Package +"
                  : "Edit Package"}
              </DialogTitle>
              <DialogDescription>
                {variant === "create"
                  ? "Please fill out the form below to add a new package to thesystem. Make sure all information is correct before saving."
                  : "Please update the information below to edit the selected package. Ensure all changes are accurate before saving."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g Weekend Holiday" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="base_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Rate</FormLabel>
                    <FormControl>
                      <Input
                        type="price"
                        placeholder="Enter base rate"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter package description..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Inclusions (Optional)</h3>
                  <p className="text-sm text-muted-foreground">
                    Add items that are included with this package
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendInclusion({ item: "", description: "" })}
                  disabled={mutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Inclusion
                </Button>
              </div>

              {inclusionFields?.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`inclusions.${index}.item`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Item</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., City Tour" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`inclusions.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Additional details..."
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeInclusion(index)}
                      disabled={mutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <FormField
              control={form.control}
              name="images"
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Upload Images (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        onChange(Array.from(e.target.files || []))
                      }
                      disabled={mutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Select multiple image files for the package
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pratinjau Gambar */}
            {(form.watch("images") ?? []).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Selected Images:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(form.watch("images") ?? []).map((file, index) => (
                    <div key={index} className="text-sm p-2 bg-muted rounded">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Image ${index}`}
                        className="w-full h-auto object-cover"
                        height={150}
                        width={250}
                      />
                      <p className="truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tampilkan gambar yang sudah ada jika ada */}
            {existingImages &&
              Array.isArray(existingImages) &&
              existingImages.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Existing Images:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((img, index) => (
                      <div
                        key={img.id}
                        className="relative group border rounded overflow-hidden"
                      >
                        <Image
                          src={img.path}
                          alt={`Image ${index}`}
                          className="w-full h-auto object-cover"
                          height={200}
                          width={350}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setExistingImages((prev) => {
                              if (!prev) return [];
                              // Hapus gambar berdasarkan id, jika hasilnya kosong, kembalikan array kosong
                              const filtered = prev.filter(
                                (item) => item.id !== img.id
                              );
                              return filtered.length > 0 ? filtered : [];
                            })
                          }
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant={"outline"}
                  onClick={() => {
                    form.reset();
                    if (pkg?.images) {
                      setExistingImages(pkg?.images);
                    }
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <Loading />
                ) : variant === "create" ? (
                  "Register New Package"
                ) : (
                  "Update Package"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
