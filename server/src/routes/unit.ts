import { Router, Request, Response } from "express";
import multer from "multer";
import { prisma } from "../lib/prisma";
import { uploadToSupabaseStorage } from "../lib/upload";
import { removeFileInSupabaseStorage } from "../lib/removeUpload";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/unit
router.get("/", async (_req: Request, res: Response) => {
  try {
    const now = new Date();

    const units = await prisma.unit.findMany({
      include: {
        images: true,
        discounts: {
          where: {
            discount: {
              AND: [
                {
                  validity: {
                    path: ["start_date"],
                    lte: now.toISOString(),
                  },
                },
                {
                  validity: {
                    path: ["end_date"],
                    gte: now.toISOString(),
                  },
                },
              ],
            },
          },
          include: {
            discount: true,
          },
        },
      },
      orderBy: { created_at: "asc" },
    });

    return res.json(units);
  } catch (error) {
    console.error("Error Get Unit:", error);
    return res.status(500).json({ error: "Failed get unit data" });
  }
});

// POST /api/unit
router.post(
  "/",
  upload.array("images"),
  async (req: Request, res: Response) => {
    try {
      const { name, year, capacity, base_rate, description, inclusions } =
        req.body;

      const images = req.files as Express.Multer.File[] | undefined;

      const uploadedImages: string[] = [];

      if (images && images.length > 0) {
        for (const file of images) {
          const url = await uploadToSupabaseStorage(file);
          uploadedImages.push(url);
        }
      }

      const unit = await prisma.unit.create({
        data: {
          name: String(name),
          year: parseInt(String(year)),
          capacity: parseInt(String(capacity)),
          base_rate: parseFloat(String(base_rate)),
          description: description ? String(description) : null,
          inclusions: inclusions ? JSON.parse(String(inclusions)) : [],
          images: {
            create: uploadedImages.map((path) => ({ path })),
          },
        },
        include: { images: true },
      });

      return res.json({ message: "New unit added successfully", unit });
    } catch (error) {
      console.error("Failed add new unit error: ", error);
      return res.status(500).json({ error: "Failed add new Unit" });
    }
  },
);

// GET /api/unit/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const unitId = parseInt(req.params.id);
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: { images: true, discounts: true },
    });

    if (!unit) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.json(unit);
  } catch (error) {
    console.error("Error Get Unit by ID:", error);
    return res.status(500).json({ error: "Failed get unit data" });
  }
});

// PUT /api/unit/:id
router.put(
  "/:id",
  upload.array("images"),
  async (req: Request, res: Response) => {
    try {
      const unitId = parseInt(req.params.id);
      const {
        name,
        year,
        capacity,
        base_rate,
        description,
        inclusions,
        remove_image_ids,
      } = req.body;

      const images = req.files as Express.Multer.File[] | undefined;

      let removedImages: { id: number }[] = [];
      if (typeof remove_image_ids === "string") {
        try {
          removedImages = JSON.parse(remove_image_ids);
        } catch (e) {
          console.error(e);
          removedImages = [];
        }
      }

      // Remove images from database and storage
      for (const img of removedImages) {
        if (img && typeof img === "object" && typeof img.id === "number") {
          const image = await prisma.unitImage.findUnique({
            where: { id: img.id },
          });
          if (image) {
            await removeFileInSupabaseStorage(image.path, "unit");
            await prisma.unitImage.delete({ where: { id: image.id } });
          }
        }
      }

      // Upload new images
      const uploadedImages: string[] = [];
      if (images && images.length > 0) {
        for (const file of images) {
          const url = await uploadToSupabaseStorage(file);
          uploadedImages.push(url);
        }
      }

      // Update unit
      const unit = await prisma.unit.update({
        where: { id: unitId },
        data: {
          name: String(name),
          year: parseInt(String(year)),
          capacity: parseInt(String(capacity)),
          base_rate: parseFloat(String(base_rate)),
          description: description ? String(description) : null,
          inclusions: inclusions ? JSON.parse(String(inclusions)) : [],
          images: {
            create: uploadedImages.map((path) => ({ path })),
          },
        },
        include: { images: true },
      });

      return res.json({ message: "Unit updated successfully", unit });
    } catch (error) {
      console.error("Error when update unit:", error);
      return res.status(500).json({
        error: "Failed to update unit data",
        detail: (error as any)?.message,
      });
    }
  },
);

export default router;
