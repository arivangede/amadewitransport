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
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/loading";

type UnitFormData = z.infer<typeof UnitSchema>;
const defaultValues: Partial<UnitFormData> = {
  name: "",
  year: new Date().getFullYear(),
  capacity: 1,
  inclusions: [],
  base_rate: 0,
  description: "",
  images: undefined,
};

export default function CreateUnitDialog() {
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
      const res = await api.post("/api/unit", values, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res;
    },
    onSuccess: (res: any) => {
      toast.success(res.data.message);
      form.reset();
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

    values.images?.forEach((file) => formData.append("images", file));

    mutation.mutate(formData);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="font-semibold">Add +</Button>
      </DialogTrigger>
      <Form {...form}>
        <DialogContent className="max-h-screen overflow-y-auto">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Register New Unit +</DialogTitle>
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
                      <Input placeholder="e.g Toyota Avanza 2020" {...field} />
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
                        placeholder="Enter capacity"
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
                        type="number"
                        step="0.01"
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
                              <Input
                                placeholder="e.g., GPS Navigation"
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

            {/* Images */}
            <FormField
              control={form.control}
              name="images"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Images (Optional)</FormLabel>
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
                      <p className="truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button variant={"outline"} onClick={() => form.reset()}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <Loading /> : "Register New Unit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Form>
    </Dialog>
  );
}
