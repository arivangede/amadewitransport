"use client";

import { Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DISCOUNT_TYPE } from "@prisma/client";
import PromotionDialog from "./dialog/PromotionDialog";
import { PromotionWithRelations } from "@/store/promotionStore";

interface PromotionCardProps {
  promotion: PromotionWithRelations;
}

export function PromotionCard({ promotion: prom }: PromotionCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDiscountValue = () => {
    if (prom.discount_type === DISCOUNT_TYPE.PERCENTAGE) {
      return `${prom.discount_value}%`;
    } else {
      return formatPrice(prom.discount_value);
    }
  };

  const isExpired = () => {
    if (!prom.validity || !prom.validity.end_date) return false;
    return new Date(prom.validity.end_date) < new Date();
  };

  const getValidityText = () => {
    if (!prom.validity || !prom.validity.end_date) return "No Limit Time";

    const endDate = new Date(prom.validity.end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} day/s`;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-center w-full">
          {/* Main Info */}
          <div className="min-w-0 w-full">
            <div className="flex flex-col items-start justify-between">
              <h3 className="font-semibold text-lg truncate flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {prom.name}
              </h3>
              <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                <span>ID: {prom.id}</span>
                <span>
                  Applied to:{" "}
                  {(prom.unit_discounts?.length ?? 0) +
                    (prom.package_discounts?.length ?? 0)}{" "}
                  item
                </span>
                {getValidityText() !== "Expired" && (
                  <span>Expiration in: {getValidityText()}</span>
                )}
              </div>

              {/* Icon & prom Value */}
              <div className="flex flex-row items-center gap-2 mt-6 md:mt-0 w-full">
                <p className="text-xl font-bold text-primary">
                  {formatDiscountValue()}
                </p>
                {/* Status */}
                <div className="flex-shrink-0">
                  <Badge
                    variant={isExpired() ? "destructive" : "default"}
                    className="mb-2"
                  >
                    {isExpired() ? "Expired" : "Active"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 ml-4 mt-6 md:mt-0">
            <PromotionDialog variant="edit" promotion={prom} />
            <PromotionDialog variant="delete" promotion={prom} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
