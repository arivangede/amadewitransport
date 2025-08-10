import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface UpdateDiscountRequest {
  name?: string;
  description?: string;
  discount_type?: "PERCENTAGE" | "FIX_VALUE";
  discount_value?: number;
  validity?: { start_date: string; end_date: string };
  unit_ids?: number[] | null;
  package_ids?: number[] | null;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const discountId = Number(id);

    const body: UpdateDiscountRequest = await req.json();
    const {
      name,
      description,
      discount_type,
      discount_value,
      validity,
      unit_ids,
      package_ids,
    } = body;

    const existingDiscount = await prisma.discount.findUnique({
      where: { id: discountId },
    });
    if (!existingDiscount) {
      return NextResponse.json(
        { error: "Promotion not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (discount_type !== undefined) updateData.discount_type = discount_type;
    if (discount_value !== undefined)
      updateData.discount_value = discount_value;
    if (validity !== undefined) updateData.validity = validity;

    // Handle unit_discounts and package_discounts
    const updateOperations = [];

    if (unit_ids !== undefined) {
      // Delete existing unit_discounts
      updateOperations.push(
        prisma.unitDiscount.deleteMany({
          where: { discount_id: discountId },
        })
      );
      // Create new unit_discounts if provided
      if (unit_ids && unit_ids.length > 0) {
        updateOperations.push(
          prisma.unitDiscount.createMany({
            data: unit_ids.map((unit_id) => ({
              discount_id: discountId,
              unit_id,
            })),
          })
        );
      }
    }

    if (package_ids !== undefined) {
      // Delete existing package_discounts
      updateOperations.push(
        prisma.packageDiscount.deleteMany({
          where: { discount_id: discountId },
        })
      );
      // Create new package_discounts if provided
      if (package_ids && package_ids.length > 0) {
        updateOperations.push(
          prisma.packageDiscount.createMany({
            data: package_ids.map((package_id) => ({
              discount_id: discountId,
              package_id,
            })),
          })
        );
      }
    }

    // Execute updates in a transaction
    await prisma.$transaction([
      ...updateOperations,
      prisma.discount.update({
        where: { id: discountId },
        data: updateData,
        include: {
          unit_discounts: true,
          package_discounts: true,
        },
      }),
    ]);

    // Fetch the updated discount
    const updatedDiscount = await prisma.discount.findUnique({
      where: { id: discountId },
      include: {
        unit_discounts: true,
        package_discounts: true,
      },
    });

    return NextResponse.json({
      message: "Promotion updated successfully",
      discount: updatedDiscount,
    });
  } catch (error) {
    console.error("Error when updating promotion:", error);
    return NextResponse.json(
      {
        error: "Failed to update promotion",
        detail: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const discountId = Number(id);

    // Validate discount ID
    if (isNaN(discountId)) {
      return NextResponse.json(
        { error: "Invalid discount ID" },
        { status: 400 }
      );
    }

    // Check if discount exists
    const existingDiscount = await prisma.discount.findUnique({
      where: { id: discountId },
    });

    if (!existingDiscount) {
      return NextResponse.json(
        { error: "Discount not found" },
        { status: 404 }
      );
    }

    // Delete the discount and its related records in a transaction
    await prisma.$transaction([
      prisma.unitDiscount.deleteMany({
        where: { discount_id: discountId },
      }),
      prisma.packageDiscount.deleteMany({
        where: { discount_id: discountId },
      }),
      prisma.discount.delete({
        where: { id: discountId },
      }),
    ]);

    return NextResponse.json({
      message: "Promotion deleted successfully",
    });
  } catch (error) {
    console.error("Error when deleting promotion:", error);
    return NextResponse.json(
      {
        error: "Failed to delete promotion",
        detail: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
