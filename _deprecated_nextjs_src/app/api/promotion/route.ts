import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const discounts = await prisma.discount.findMany({
      include: {
        unit_discounts: true,
        package_discounts: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    return NextResponse.json(discounts);
  } catch (error) {
    console.error("Error when get discounts: ", error);
  }
}

interface CreateBodyRequest {
  name: string;
  description?: string;
  discount_type: "PERCENTAGE" | "FIX_VALUE";
  discount_value: number;
  validity: { start_date?: string; end_date?: string };
  unit_ids?: number[];
  package_ids?: number[];
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateBodyRequest = await req.json();

    const {
      name,
      description,
      discount_type,
      discount_value,
      validity,
      unit_ids,
      package_ids,
    } = body;

    if (!name || !discount_type || !discount_value || !validity) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const discount = await prisma.discount.create({
      data: {
        name,
        description,
        discount_type,
        discount_value,
        validity,
        unit_discounts: {
          create: unit_ids?.map((unit_id) => ({ unit_id })),
        },
        package_discounts: {
          create: package_ids?.map((id) => ({ package_id: id })),
        },
      },
    });

    return NextResponse.json({
      message: "New promotion added successfully",
      discount,
    });
  } catch (error) {
    console.error("Error when add new promotion: ", error);
    return NextResponse.json(
      { error: "Failed to add new promotion" },
      { status: 500 }
    );
  }
}
