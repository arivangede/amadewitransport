"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Package2,
  Star,
  CheckCircle,
  Tag,
  Percent,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PackageWithRelations } from "@/store/packageStore";
import PackageDialog from "./Dialog/PackageDialog";

interface PackageCardProps {
  package: PackageWithRelations;
  variant: "admin" | "guest";
  onBook?: (pkg: PackageWithRelations) => void;
}

export function PackageCard({
  package: pkg,
  variant,
  onBook,
}: PackageCardProps) {
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
    if (!pkg.discounts || pkg.discounts.length === 0) return pkg.base_rate;

    const activeDiscount = pkg.discounts[0]?.discount;
    if (!activeDiscount) return pkg.base_rate;

    if (activeDiscount.discount_type === "PERCENTAGE") {
      return pkg.base_rate * (1 - activeDiscount.discount_value / 100);
    } else {
      return pkg.base_rate - activeDiscount.discount_value;
    }
  };

  const discountedPrice = getDiscountedPrice();
  const hasDiscount = discountedPrice < pkg.base_rate;
  const activeDiscount = pkg.discounts?.[0]?.discount;

  const images = pkg.images ?? [];

  const inclusions = Array.isArray(pkg.inclusions)
    ? (pkg.inclusions as unknown as { item: string; description: string }[])
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
                alt={pkg.name}
                height={150}
                width={250}
                priority
                className="object-cover"
              />
              {images.length > 1 && (
                <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1 rounded text-xs">
                  {images.length}
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-lg truncate flex items-center gap-2">
                    <Package2 className="h-4 w-4" />
                    {pkg.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>ID: {pkg.id}</span>
                    <span>{pkg.inclusions.length} inclusions</span>
                    {pkg.description && (
                      <span className="truncate max-w-[200px]">
                        {pkg.description}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price & Discount */}
                <div className="mt-6 md:mt-0 flex-shrink-0">
                  <div className="font-bold text-lg">
                    {formatPrice(pkg.base_rate)}
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
              <PackageDialog variant="edit" package={pkg} />
              <PackageDialog variant="delete" package={pkg} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Guest variant with integrated discount and image carousel
  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary/20 relative overflow-hidden">
      {hasDiscount && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-gradient-to-l from-red-500 to-red-600 text-white px-3 py-1 text-sm font-bold flex items-center gap-1">
            {activeDiscount?.discount_type === "PERCENTAGE" ? (
              <Percent className="h-3 w-3" />
            ) : (
              <DollarSign className="h-3 w-3" />
            )}
            {activeDiscount?.discount_type === "PERCENTAGE"
              ? `${activeDiscount.discount_value}% OFF`
              : `${formatPrice(activeDiscount?.discount_value || 0)} OFF`}
          </div>
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-red-600"></div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Package2 className="h-5 w-5 text-primary" />
              {pkg.name}
            </CardTitle>
            <Badge variant="outline" className="mt-1 w-fit">
              Paket Lengkap
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">4.9</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {images.length > 0 && (
          <div className="relative aspect-video rounded-lg overflow-hidden group">
            <Image
              src={
                images[currentImageIndex]?.path ||
                "https://placehold.co/150x150.png"
              }
              alt={pkg.name}
              height={400}
              width={600}
              priority
              className="object-cover transition-transform duration-300 group-hover:scale-105"
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

            <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-xs font-medium">
              POPULER
            </div>
          </div>
        )}

        {pkg.description && (
          <p className="text-sm text-muted-foreground">{pkg.description}</p>
        )}

        <div>
          <p className="text-sm font-medium mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Semua termasuk:
          </p>
          <div className="space-y-2">
            {inclusions.slice(0, 5).map((inclusion, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                <span>{inclusion.item}</span>
              </div>
            ))}
            {pkg.inclusions.length > 5 && (
              <p className="text-xs text-muted-foreground ml-5">
                +{pkg.inclusions.length - 5} fasilitas lainnya
              </p>
            )}
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
              <span className="text-sm text-red-600">Penawaran terbatas</span>
              <Badge variant="destructive" className="text-xs">
                Hemat {formatPrice(pkg.base_rate - discountedPrice)}
              </Badge>
            </div>
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            {hasDiscount ? (
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(discountedPrice)}
                </p>
                <p className="text-sm text-muted-foreground line-through">
                  {formatPrice(pkg.base_rate)}
                </p>
              </div>
            ) : (
              <p className="text-2xl font-bold">{formatPrice(pkg.base_rate)}</p>
            )}
            <p className="text-xs text-muted-foreground">paket lengkap</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Waktu terbatas</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full" size="lg" onClick={() => onBook?.(pkg)}>
          {hasDiscount ? "Pesan Paket dengan Diskon" : "Pesan Paket Sekarang"}
        </Button>
      </CardFooter>
    </Card>
  );
}
