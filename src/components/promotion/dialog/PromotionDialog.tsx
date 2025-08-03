"use client";
import { PromotionWithRelations } from "@/store/promotionStore";
import { PromotionSchema } from "../forms/schemas";
import z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Edit, Percent, Trash2 } from "lucide-react";
import { Loading } from "@/components/loading";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Package, Unit } from "@prisma/client";

interface PromotionDialogProps {
  variant: "create" | "edit" | "delete";
  promotion?: PromotionWithRelations;
}

type PromotionFormData = z.infer<typeof PromotionSchema>;

const formatDateOnly = (date: Date) => {
  return format(date, "yyyy-MM-dd");
};

export default function PromotionDialog({
  variant,
  promotion: prom,
}: PromotionDialogProps) {
  const queryClient = useQueryClient();
  const defaultValues: Partial<PromotionFormData> = {
    name: prom?.name || "",
    description: prom?.description || "",
    discount_type:
      typeof prom?.discount_type === "string"
        ? prom.discount_type
        : "PERCENTAGE",
    discount_value:
      typeof prom?.discount_value === "number" ? prom.discount_value : 0,
    validity:
      prom &&
      typeof prom.validity === "object" &&
      prom.validity !== null &&
      "start_date" in prom.validity &&
      "end_date" in prom.validity
        ? (prom.validity as { start_date?: string; end_date?: string })
        : {
            start_date: new Date().toISOString().split("T")[0],
            end_date: (() => {
              const tomorow = new Date();
              tomorow.setDate(tomorow.getDate() + 1);
              return tomorow.toISOString().split("T")[0];
            })(),
          },
    unit_ids:
      prom?.unit_discounts && prom?.unit_discounts?.length > 0
        ? prom?.unit_discounts.map((u) => u.unit_id)
        : [],
    package_ids:
      prom?.package_discounts && prom?.package_discounts?.length > 0
        ? prom?.package_discounts.map((p) => p.package_id)
        : [],
  };

  const form = useForm<PromotionFormData>({
    resolver: zodResolver(PromotionSchema),
    defaultValues,
  });

  const ApiMethod = {
    create: async (values: PromotionFormData) => {
      const res = await api.post("/api/promotion", values);
      return res;
    },
    edit: async (values: PromotionFormData) => {
      const res = await api.put(`/api/promotion/${prom?.id}`, values);
      return res;
    },
    delete: async () => {
      const res = await api.delete(`/api/promotion/${prom?.id}`);
      return res;
    },
  };

  const mutation = useMutation({
    mutationFn: async (values: PromotionFormData) => {
      const res = await ApiMethod[variant](values);
      return res;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.invalidateQueries({ queryKey: ["units"] });
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      toast.success(res.data.message);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Something went wrong");
    },
  });

  function onSubmit(values: PromotionFormData) {
    mutation.mutate(values);
  }

  const discountType = form.watch("discount_type");

  const {
    data: units,
    isLoading: isUnitsLoading,
    error: unitsError,
  } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const res = await api.get("/api/unit");
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: packages,
    isLoading: isPackagesLoading,
    error: packagesError,
  } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await api.get("/api/package");
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (variant === "delete") {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Remove Promotion Alert</DialogTitle>
          <DialogDescription className="text-base">
            Are you sure you want to remove this promotion? <br />
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
              {mutation.isPending ? <Loading /> : "Remove Promotion"}
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
          className="font-semobold"
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
                  ? "Register New Promotion +"
                  : "Edit Promotion"}
              </DialogTitle>
              <DialogDescription>
                {variant === "create"
                  ? "Please fill out the form below to add a new promotion. Make sure all information is correct before saving."
                  : "Please update the information below to edit the selected promotion. Ensure all changes are accurate before saving."}
              </DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promotion Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g Summer Holiday Promotion"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="discount_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Discount Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Discount Types</SelectLabel>
                            <SelectItem value="PERCENTAGE">
                              Percentage Discount
                            </SelectItem>
                            <SelectItem value="FIX_VALUE">
                              Fix Amount Discount
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discount_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Value</FormLabel>
                    <FormControl>
                      {discountType === "PERCENTAGE" ? (
                        <div className="flex flex-1 items-center relative">
                          <Input
                            type="number"
                            min={0}
                            {...field}
                            className="pr-8 w-full"
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                          <Percent className="absolute right-6 h-4 w-4" />
                        </div>
                      ) : (
                        <Input
                          type="price"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number.parseFloat(e.target.value))
                          }
                        />
                      )}
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
              <div>
                <h3 className="text-lg font-medium">Validity</h3>
                <p className="text-sm text-muted-foreground">
                  Promotion validity determines the period during which this
                  promotion is active and can be used by customers.
                </p>
              </div>
              <Card className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="validity.start_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? format(new Date(field.value), "PPP")
                                    : "Pick a date"}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onSelect={(date) => {
                                  field.onChange(
                                    date ? formatDateOnly(date) : ""
                                  );
                                }}
                                disabled={(date) =>
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="validity.end_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? format(new Date(field.value), "PPP")
                                    : "Pick a date"}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
                                }
                                onSelect={(date) => {
                                  field.onChange(
                                    date ? formatDateOnly(date) : ""
                                  );
                                }}
                                disabled={(date) =>
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="unit_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Units</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          const current = field.value || [];
                          const numValue = Number(value);
                          if (value && !current.includes(numValue)) {
                            field.onChange([...current, numValue]);
                          }
                        }}
                        value=""
                        disabled={isUnitsLoading || !!unitsError}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isUnitsLoading ? "Loading..." : "Select units"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Units</SelectLabel>
                            {units?.map((unit: Unit) => (
                              <SelectItem
                                key={unit.id}
                                value={unit.id.toString()}
                              >
                                {unit.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {field.value?.map((id) => {
                        const unit = units?.find((u: Unit) => u.id === id);
                        return (
                          <div
                            key={id}
                            className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"
                          >
                            {unit.name}
                            <button
                              type="button"
                              onClick={() => {
                                field.onChange(
                                  field.value?.filter((v) => v !== id)
                                );
                              }}
                              className="text-red-500"
                            >
                              &times;
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {unitsError && (
                      <p className="text-red-500 text-sm">
                        Error loading units
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="package_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Packages</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          const current = field.value || [];
                          const numValue = Number(value);
                          if (value && !current.includes(numValue)) {
                            field.onChange([...current, numValue]);
                          }
                        }}
                        value=""
                        disabled={isPackagesLoading || !!packagesError}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isPackagesLoading
                                ? "Loading..."
                                : "Select packages"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Packages</SelectLabel>
                            {packages?.map((pkg: Package) => (
                              <SelectItem
                                key={pkg.id}
                                value={pkg.id.toString()}
                              >
                                {pkg.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {field.value?.map((id) => {
                        const pkg = packages?.find((p: Package) => p.id === id);
                        return (
                          <div
                            key={id}
                            className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"
                          >
                            {pkg?.name || id}
                            <button
                              type="button"
                              onClick={() => {
                                field.onChange(
                                  field.value?.filter((v) => v !== id)
                                );
                              }}
                              className="text-red-500"
                            >
                              &times;
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {packagesError && (
                      <p className="text-red-500 text-sm">
                        Error loading packages
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant={"outline"}
                  onClick={() => {
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <Loading />
                ) : variant === "create" ? (
                  "Register New Promotion"
                ) : (
                  "Update Promotion"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
