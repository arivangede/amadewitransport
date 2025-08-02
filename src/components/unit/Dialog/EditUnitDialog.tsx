"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { UnitSchema } from "../forms/schemas";
import z from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/loading";
import { UnitWithRelations } from "@/store/unitStore";
import { useEffect, useState } from "react";
import { UnitImage } from "@prisma/client";

// Tipe data form unit
type UnitFormData = z.infer<typeof UnitSchema>;

function parseInclusions(raw: any): { item: string; description: string }[] {
  // Jika null/undefined, kembalikan array kosong
  if (!raw) return [];
  // Jika sudah array dengan item dan description, kembalikan langsung
  if (
    Array.isArray(raw) &&
    raw.every(
      (inc) =>
        inc && typeof inc === "object" && "item" in inc && "description" in inc
    )
  ) {
    return raw as { item: string; description: string }[];
  }
  // Jika array of string, konversi ke array objek
  if (Array.isArray(raw) && typeof raw[0] === "string") {
    return raw.map((item) => ({ item, description: "" }));
  }
  // Jika array of object tanpa item/description, kembalikan array kosong
  return [];
}

export default function EditUnitDialog({ unit }: { unit: UnitWithRelations }) {
  const queryClient = useQueryClient();
  const [existingImages, setExistingImages] = useState<UnitImage[] | null>(
    unit.images
  );

  // Perbaiki defaultValues agar sesuai dengan tipe UnitFormData
  const defaultValues: Partial<UnitFormData> = {
    name: unit.name || "",
    year: unit.year || new Date().getFullYear(),
    capacity: unit.capacity || 1,
    inclusions: parseInclusions(unit.inclusions),
    base_rate: unit.base_rate || 0,
    description: unit.description || "",
    images: undefined,
  };

  const form = useForm<UnitFormData>({
    resolver: zodResolver(UnitSchema),
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

  const mutation = useMutation({
    mutationFn: async (values: FormData) => {
      const res = await api.put(`/api/unit/${unit.id}`, values, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res;
    },
    onSuccess: (res: any) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ["units"] });
      form.resetField("images");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Something went wrong");
    },
  });

  function onSubmit(values: UnitFormData) {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("year", values.year.toString());
    formData.append("capacity", values.capacity.toString());
    formData.append("base_rate", values.base_rate.toString());
    if (values.description) {
      formData.append("description", values.description);
    }
    if (values.inclusions) {
      formData.append("inclusions", JSON.stringify(values.inclusions));
    }
    // Hanya upload file baru, bukan dari relasi images
    values.images?.forEach((file) => formData.append("images", file));

    if (unit.images?.length !== existingImages?.length) {
      formData.append(
        "remove_image_ids",
        JSON.stringify(
          unit.images
            ?.filter((img) => !existingImages?.find((e) => e.id === img.id))
            .map((img) => ({ id: img.id }))
        )
      );
    }

    mutation.mutate(formData);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Edit Unit</DialogTitle>
              <DialogDescription>
                Please fill out the form below to add a new unit to the system.
                Make sure all information is correct before saving.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g: Toyota Avanza 2020" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter year"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter Capacity"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormDescription>Number of passengers</FormDescription>
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
                    <FormDescription>Base rental rate</FormDescription>
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
                      placeholder="Enter car description..."
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
                    Add items that are included with this car rental
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
                  Add Inclusions
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
                              <Input
                                placeholder="e.g: GPS Navigation"
                                {...field}
                              />
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
                                placeholder="Additional detail..."
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

            {/* Upload Gambar */}
            <FormField
              control={form.control}
              name="images"
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
                    Select multiple image files for the car
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
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Image ${index}`}
                        className="w-full h-auto object-cover"
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
                        <img
                          src={img.path}
                          alt={`Image ${index}`}
                          className="w-full h-auto object-cover"
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
                    setExistingImages(unit.images);
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <Loading /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
