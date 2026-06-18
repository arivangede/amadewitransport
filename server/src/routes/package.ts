import { Router, Request, Response } from "express";
import multer from "multer";
import { prisma } from "../lib/prisma";
import { uploadToSupabaseStorage } from "../lib/upload";
import { removeFileInSupabaseStorage } from "../lib/removeUpload";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/package
router.get("/", async (_req: Request, res: Response) => {
  try {
    const now = new Date();

    const packages = await prisma.package.findMany({
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

    return res.json(packages);
  } catch (error) {
    console.error("Error Get Packages:", error);
    return res.status(500).json({ error: "Failed get packages data" });
  }
});

// POST /api/package
router.post(
  "/",
  upload.array("images"),
  async (req: Request, res: Response) => {
    try {
      const { name, description, inclusions, base_rate } = req.body;

      const images = req.files as Express.Multer.File[] | undefined;
      const uploadedImages: string[] = [];

      if (images && images.length > 0) {
        for (const file of images) {
          const url = await uploadToSupabaseStorage(file, "package");
          uploadedImages.push(url);
        }
      }

      const data = await prisma.package.create({
        data: {
          name: String(name),
          description: String(description),
          inclusions: inclusions ? JSON.parse(String(inclusions)) : [],
          base_rate: parseFloat(String(base_rate)),
          images: {
            create: uploadedImages.map((path) => ({ path })),
          },
        },
        include: { images: true },
      });

      return res.json({ message: "New package added successfully", data });
    } catch (error) {
      console.error("Failed add new package error: ", error);
      return res.status(500).json({ error: "Failed to add new package" });
    }
  },
);

// GET /api/package/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const packageId = parseInt(req.params.id);
    const packageData = await prisma.package.findUnique({
      where: { id: packageId },
      include: { images: true, discounts: true },
    });

    if (!packageData) {
      return res.status(404).json({ error: "Package not found" });
    }

    return res.json(packageData);
  } catch (error) {
    console.error("Failed get package error: ", error);
    return res.status(500).json({ error: "Failed get package data" });
  }
});

// PUT /api/package/:id
router.put(
  "/:id",
  upload.array("images"),
  async (req: Request, res: Response) => {
    try {
      const packageId = parseInt(req.params.id);
      const { name, description, inclusions, base_rate, remove_image_ids } =
        req.body;

      const images = req.files as Express.Multer.File[] | undefined;

      let removedImages: { id: number }[] = [];
      if (typeof remove_image_ids === "string") {
        try {
          removedImages = JSON.parse(remove_image_ids);
        } catch (error) {
          console.error(error);
          removedImages = [];
        }
      }

      // Remove images from database and storage
      if (removedImages.length > 0) {
        for (const img of removedImages) {
          if (img && typeof img === "object" && typeof img.id === "number") {
            const image = await prisma.packageImage.findUnique({
              where: { id: img.id },
            });
            if (image) {
              await removeFileInSupabaseStorage(image.path, "package");
              await prisma.packageImage.delete({ where: { id: image.id } });
            }
          }
        }
      }

      // Upload new images
      const uploadedImages: string[] = [];
      if (images && images.length > 0) {
        for (const file of images) {
          const url = await uploadToSupabaseStorage(file, "package");
          uploadedImages.push(url);
        }
      }

      // Update package
      const updatedPackage = await prisma.package.update({
        where: { id: packageId },
        data: {
          name: String(name),
          description: String(description),
          inclusions: inclusions ? JSON.parse(inclusions) : [],
          base_rate: parseFloat(String(base_rate)),
          images: {
            create: uploadedImages.map((path) => ({ path })),
          },
        },
        include: { images: true },
      });

      return res.json({
        message: "Package updated successfully",
        updatedPackage,
      });
    } catch (error) {
      console.error("Failed update package error: ", error);
      return res.status(500).json({
        error: "Failed to update package",
        detail: (error as any)?.message,
      });
    }
  },
);

export default router;
