"use client";
import Image from "next/image";
import { UnitWithRelations } from "@/store/unitStore";
import EditUnitDialog from "./Dialog/EditUnitDialog";
import RemoveUnitDialog from "./Dialog/RemoveUnitDialog";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Percent,
  Tag,
  Users,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

interface CarUnitCardProps {
  unit: UnitWithRelations;
  variant: "admin" | "guest";
  onBook?: (unit: UnitWithRelations) => void;
}

export function CarUnitCard({ unit, variant, onBook }: CarUnitCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getDiscountedPrice = () => {
    if (!unit.discounts || unit.discounts.length === 0) return unit.base_rate;

    const activeDiscount = unit.discounts[0].discount;
    if (!activeDiscount) return unit.base_rate;

    if (activeDiscount.discount_type === "PERCENTAGE") {
      return unit.base_rate * (1 - activeDiscount.discount_value / 100);
    }
    return unit.base_rate - activeDiscount.discount_value;
  };

  const discountedPrice = getDiscountedPrice();
  const hasDiscount = discountedPrice < unit.base_rate;
  const activeDiscount = unit.discounts?.[0]?.discount;

  const images = unit.images ?? [];

  const inclusions = Array.isArray(unit.inclusions)
    ? (unit.inclusions as unknown as { item: string; description: string }[])
    : [];

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
      );
    }
  };

  if (variant === "admin") {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Image */}
            <div className="relative w-full h-32 md:w-24 md:h-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={images[0]?.path || "https://placehold.co/150x150.png"}
                alt={unit.name}
                priority
                fill
                className="object-contain"
              />
              {images.length > 1 && (
                <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1 rounded text-xs">
                  {images.length}
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col justify-between w-full">
                <h3 className="font-semibold text-lg truncate">{unit.name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {unit.year}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {unit.capacity} seats
                  </span>
                  <span>ID: {unit.id}</span>
                </div>

                {/* Price & Discount */}
                <div className="mt-6 md:mt-0 flex-shrink-0">
                  <div className="font-bold text-lg">
                    {formatPrice(unit.base_rate)}
                  </div>
                  {hasDiscount && (
                    <Badge variant="destructive" className="text-xs">
                      {activeDiscount?.discount_type === "PERCENTAGE"
                        ? `${activeDiscount.discount_value}% OFF`
                        : `${formatPrice(
                            activeDiscount?.discount_value || 0
                          )} OFF`}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-2 ml-4">
              <EditUnitDialog unit={unit} />
              <RemoveUnitDialog unit={unit} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Guest variant with integrated discount and image carousel
  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-300 relative overflow-hidden">
      {hasDiscount && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-gradient-to-l from-red-500 to-red-600 text-white px-3 py-1 text-sm font-bold flex items-center gap-1">
            {activeDiscount?.discount_type === "PERCENTAGE"
              ? `${activeDiscount.discount_value}% OFF`
              : `${formatPrice(activeDiscount?.discount_value || 0)} OFF`}
          </div>
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-red-600"></div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{unit.name}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {images.length > 0 && (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
            <Image
              src={
                images[currentImageIndex]?.path ||
                "/placeholder.svg?height=200&width=300&query=modern car"
              }
              alt={unit.name}
              priority
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />

            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                {/* Previous Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Next Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Image Indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>

                {/* Image Counter */}
                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium">{unit.year}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary" />
            <span className="font-medium">{unit.capacity} seats</span>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground">
            What&apos;s included:
          </p>
          <div className="space-y-1">
            {inclusions.slice(0, 4).map((inclusion, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>{inclusion.item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Integrated Discount Section */}
        {hasDiscount && activeDiscount && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-red-600" />
              <span className="font-semibold text-red-800">
                {activeDiscount.name}
              </span>
            </div>
            {activeDiscount.description && (
              <p className="text-sm text-red-700 mb-2">
                {activeDiscount.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-600">Limited time offer</span>
              <Badge variant="destructive" className="text-xs">
                Save {formatPrice(unit.base_rate - discountedPrice)}
              </Badge>
            </div>
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            {hasDiscount ? (
              <div>
                <p className="text-lg font-bold text-green-600">
                  {formatPrice(discountedPrice)}
                </p>
                <p className="text-sm text-muted-foreground line-through">
                  {formatPrice(unit.base_rate)}
                </p>
              </div>
            ) : (
              <p className="text-lg font-bold">{formatPrice(unit.base_rate)}</p>
            )}
            <p className="text-xs text-muted-foreground">/ 12hours</p>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full" onClick={() => onBook?.(unit)}>
          {hasDiscount ? "Book with Discount" : "Book Now"}
        </Button>
      </CardFooter>
    </Card>
  );
}
