import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// GET /api/promotion
router.get("/", async (_req: Request, res: Response) => {
  try {
    const discounts = await prisma.discount.findMany({
      include: {
        unit_discounts: true,
        package_discounts: true,
      },
      orderBy: { created_at: "asc" },
    });

    return res.json(discounts);
  } catch (error) {
    console.error("Error when get discounts: ", error);
    return res.status(500).json({ error: "Failed to get promotions" });
  }
});

// POST /api/promotion
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      discount_type,
      discount_value,
      validity,
      unit_ids,
      package_ids,
    } = req.body;

    if (!name || !discount_type || !discount_value || !validity) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const discount = await prisma.discount.create({
      data: {
        name,
        description,
        discount_type,
        discount_value,
        validity,
        unit_discounts: {
          create: unit_ids?.map((unit_id: number) => ({ unit_id })),
        },
        package_discounts: {
          create: package_ids?.map((id: number) => ({ package_id: id })),
        },
      },
    });

    return res.json({ message: "New promotion added successfully", discount });
  } catch (error) {
    console.error("Error when add new promotion: ", error);
    return res.status(500).json({ error: "Failed to add new promotion" });
  }
});

// PUT /api/promotion/:id
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const discountId = parseInt(req.params.id);
    const {
      name,
      description,
      discount_type,
      discount_value,
      validity,
      unit_ids,
      package_ids,
    } = req.body;

    const existingDiscount = await prisma.discount.findUnique({
      where: { id: discountId },
    });
    if (!existingDiscount) {
      return res.status(404).json({ error: "Promotion not found" });
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
    const updateOperations: any[] = [];

    if (unit_ids !== undefined) {
      updateOperations.push(
        prisma.unitDiscount.deleteMany({ where: { discount_id: discountId } }),
      );
      if (unit_ids && unit_ids.length > 0) {
        updateOperations.push(
          prisma.unitDiscount.createMany({
            data: unit_ids.map((unit_id: number) => ({
              discount_id: discountId,
              unit_id,
            })),
          }),
        );
      }
    }

    if (package_ids !== undefined) {
      updateOperations.push(
        prisma.packageDiscount.deleteMany({
          where: { discount_id: discountId },
        }),
      );
      if (package_ids && package_ids.length > 0) {
        updateOperations.push(
          prisma.packageDiscount.createMany({
            data: package_ids.map((package_id: number) => ({
              discount_id: discountId,
              package_id,
            })),
          }),
        );
      }
    }

    // Execute updates in a transaction
    await prisma.$transaction([
      ...updateOperations,
      prisma.discount.update({
        where: { id: discountId },
        data: updateData,
      }),
    ]);

    const updatedDiscount = await prisma.discount.findUnique({
      where: { id: discountId },
      include: { unit_discounts: true, package_discounts: true },
    });

    return res.json({
      message: "Promotion updated successfully",
      discount: updatedDiscount,
    });
  } catch (error) {
    console.error("Error updating promotion:", error);
    return res.status(500).json({ error: "Failed to update promotion" });
  }
});

export default router;
