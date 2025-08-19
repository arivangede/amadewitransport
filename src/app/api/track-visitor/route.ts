import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import { subDays, subMonths, subYears, startOfDay } from "date-fns";
countries.registerLocale(en);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    const userAgent = body.userAgent || req.headers.get("user-agent") || "";
    const deviceType = getDeviceType(userAgent);

    let location = null;
    try {
      const res = await fetch(
        `https://ipinfo.io/${ip}?token=${process.env.IPINFO_TOKEN}`
      );
      if (res.ok) {
        location = await res.json();
      }
    } catch (e) {
      console.error(e);
      location = null;
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

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error?.toString() || "Unknown error" },
      { status: 500 }
    );
  }
}

function getDeviceType(ua: string) {
  if (/mobile/i.test(ua)) return "mobile";
  if (/tablet/i.test(ua)) return "tablet";
  return "desktop";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "7days";

    let fromDate = new Date();
    let daysToGenerate = 0;
    let useMonthlyFormat = false;
    
    if (range === "1year") {
      fromDate = subYears(startOfDay(new Date()), 1);
      daysToGenerate = 12; // 12 months instead of 365 days
      useMonthlyFormat = true;
    } else if (range === "3month") {
      fromDate = subMonths(startOfDay(new Date()), 3);
      daysToGenerate = 90;
    } else if (range === "30days") {
      fromDate = subDays(startOfDay(new Date()), 30);
      daysToGenerate = 30;
    } else if (range === "7days") {
      fromDate = subDays(startOfDay(new Date()), 7);
      daysToGenerate = 7;
    } else {
      fromDate = subYears(startOfDay(new Date()), 1);
      daysToGenerate = 12; // Default to monthly for 1 year
      useMonthlyFormat = true;
    }

    const visitors = await prisma.visitor.findMany({
      where: {
        created_at: {
          gte: fromDate,
        },
      },
      orderBy: {
        created_at: "asc",
      },
    });

    // Generate all dates in the range
    const graphMap: Record<string, number> = {};
    
    if (useMonthlyFormat) {
      // Generate monthly data points for 1 year
      for (let i = 0; i < daysToGenerate; i++) {
        const date = subMonths(new Date(), i);
        const dateKey = date.toISOString().slice(0, 7); // YYYY-MM format
        graphMap[dateKey] = 0;
      }

      // Fill in monthly visitor counts
      visitors.forEach((v) => {
        const dateKey = v.created_at.toISOString().slice(0, 7);
        if (dateKey in graphMap) {
          graphMap[dateKey] = (graphMap[dateKey] || 0) + 1;
        }
      });
    } else {
      // Original daily format for other ranges
      for (let i = 0; i < daysToGenerate; i++) {
        const date = subDays(new Date(), i);
        const dateKey = date.toISOString().slice(0, 10);
        graphMap[dateKey] = 0;
      }

      visitors.forEach((v) => {
        const dateKey = v.created_at.toISOString().slice(0, 10);
        if (dateKey in graphMap) {
          graphMap[dateKey] = (graphMap[dateKey] || 0) + 1;
        }
      });
    }

    const graphData = Object.entries(graphMap)
      .sort((a, b) => a[0].localeCompare(b[0])) // Sort by date
      .map(([date, visitors]) => ({
        date,
        visitors,
      }));

    // Data summary in array format as requested
    const deviceSummaryMap: Record<string, number> = {};
    const regionSummaryMap: Record<string, number> = {};

    visitors.forEach((v) => {
      // Device
      if (v.device) {
        deviceSummaryMap[v.device] = (deviceSummaryMap[v.device] || 0) + 1;
      }
      // Region (combine region and country)
      if (v.region && v.country) {
        const regionKey = `${v.region} ${v.country}`;
        regionSummaryMap[regionKey] = (regionSummaryMap[regionKey] || 0) + 1;
      }
    });

    // Convert to array as requested
    const deviceSummary = Object.entries(deviceSummaryMap).map(
      ([device, value]) => ({
        device,
        value,
      })
    );

    const regionSummary = Object.entries(regionSummaryMap).map(
      ([region, value]) => ({
        region,
        value,
      })
    );

    // Calculate returning visitor percentage
    // We assume "uuid" is used to identify unique visitors
    // A returning visitor is a uuid that appears more than once in the selected range
    const uuidCountMap: Record<string, number> = {};
    visitors.forEach((v) => {
      if (v.uuid) {
        uuidCountMap[v.uuid] = (uuidCountMap[v.uuid] || 0) + 1;
      }
    });

    const uniqueVisitorCount = Object.keys(uuidCountMap).length;
    const returningVisitorCount = Object.values(uuidCountMap).filter(
      (count) => count > 1
    ).length;
    // If there are no visitors, avoid division by zero
    const returningVisitorPercentage =
      uniqueVisitorCount > 0
        ? Math.round((returningVisitorCount / uniqueVisitorCount) * 100)
        : 0;

    return NextResponse.json({
      graph: graphData,
      summary: {
        total: visitors.length,
        device: deviceSummary,
        region: regionSummary,
        returningVisitorPercentage, // percentage of unique visitors who came back more than once
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error?.toString() || "Unknown error" },
      { status: 500 }
    );
  }
}
