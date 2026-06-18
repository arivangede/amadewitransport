import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import { subDays, subYears, startOfDay } from "date-fns";
countries.registerLocale(en);

const router = Router();

function getDeviceType(ua: string) {
  if (/mobile/i.test(ua)) return "mobile";
  if (/tablet/i.test(ua)) return "tablet";
  return "desktop";
}

// POST /api/track-visitor
router.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded
      ? Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded.split(",")[0].trim()
      : req.ip || "unknown";

    const userAgent = body.userAgent || req.headers["user-agent"] || "";
    const deviceType = getDeviceType(userAgent);

    let location: any = null;
    try {
      const resp = await fetch(
        `https://ipinfo.io/${ip}?token=${process.env.IPINFO_TOKEN}`,
      );
      if (resp.ok) {
        location = await resp.json();
      }
    } catch (e) {
      console.error("IP Info error:", e);
    }

    let countryName = "unknown";
    if (location?.country) {
      countryName = countries.getName(location.country, "en") || "unknown";
    }

    await prisma.visitor.create({
      data: {
        uuid: body.uuid,
        user_agent: userAgent,
        device: deviceType,
        ip_address: ip,
        city: location?.city || "unknown",
        region: location?.region || "unknown",
        country: countryName,
      },
    });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: (error as any)?.toString() || "Unknown error",
    });
  }
});

// GET /api/track-visitor
router.get("/", async (req: Request, res: Response) => {
  try {
    const range = (req.query.range as string) || "7days";

    let fromDate = new Date();
    let daysToGenerate = 0;
    let useMonthlyFormat = false;

    if (range === "1year") {
      fromDate = subYears(startOfDay(new Date()), 1);
      daysToGenerate = 12;
      useMonthlyFormat = true;
    } else if (range === "30days") {
      fromDate = subDays(startOfDay(new Date()), 30);
      daysToGenerate = 30;
    } else if (range === "7days") {
      fromDate = subDays(startOfDay(new Date()), 7);
      daysToGenerate = 7;
    } else {
      fromDate = subYears(startOfDay(new Date()), 1);
      daysToGenerate = 12;
      useMonthlyFormat = true;
    }

    const visitors = await prisma.visitor.findMany({
      where: {
        created_at: { gte: fromDate },
      },
      orderBy: { created_at: "asc" },
    });

    // Generate date map
    const graphMap: Record<string, number> = {};
    const deviceMap: Record<string, number> = {};
    const regionMap: Record<string, number> = {};
    const uuidSet = new Set<string>();

    // Initialize graph entries
    for (let i = 0; i < daysToGenerate; i++) {
      let key: string;
      if (useMonthlyFormat) {
        const d = new Date(fromDate);
        d.setMonth(d.getMonth() + i);
        key = d.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      } else {
        const d = new Date(fromDate);
        d.setDate(d.getDate() + i);
        key = d.toISOString().split("T")[0];
      }
      graphMap[key] = 0;
    }

    for (const v of visitors) {
      const d = new Date(v.created_at);
      let key: string;
      if (useMonthlyFormat) {
        key = d.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      } else {
        key = d.toISOString().split("T")[0];
      }
      if (graphMap[key] !== undefined) {
        graphMap[key]++;
      }

      // Device summary
      deviceMap[v.device] = (deviceMap[v.device] || 0) + 1;

      // Region summary
      regionMap[v.region || "unknown"] =
        (regionMap[v.region || "unknown"] || 0) + 1;

      // Track UUIDs for returning visitor percentage
      uuidSet.add(v.uuid);
    }

    const total = visitors.length;
    const uniqueUuids = uuidSet.size;

    return res.json({
      graph: Object.entries(graphMap).map(([date, visitors]) => ({
        date,
        visitors,
      })),
      summary: {
        total,
        device: Object.entries(deviceMap).map(([device, value]) => ({
          device,
          value,
        })),
        region: Object.entries(regionMap).map(([region, value]) => ({
          region,
          value,
        })),
        returningVisitorPercentage:
          total > 0 ? Math.round(((total - uniqueUuids) / total) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching visitors:", error);
    return res.status(500).json({ error: "Failed to get visitor data" });
  }
});

export default router;
