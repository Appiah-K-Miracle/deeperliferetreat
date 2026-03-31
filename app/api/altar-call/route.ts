import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.startsWith("0")) {
    return "+233" + cleaned.slice(1);
  }
  return cleaned;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { fullName, phone: rawPhone, district, location, isFirstTimer, gender, group } = body;

    if (!rawPhone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    const phone = normalizePhone(rawPhone);

    // Registration is the source of truth — always ensure user exists there
    const existing = await prisma.registration.findUnique({
      where: { phone },
    });

    let record;
    if (existing) {
      // User is already registered — snapshot their data + honour body isFirstTimer
      record = await prisma.altarCall.create({
        data: {
          phone,
          fullName: existing.fullName,
          district: existing.district,
          location: existing.location,
          isFirstTimer: isFirstTimer ?? null,
          registrationId: existing.id,
        },
      });
    } else {
      // User not registered — register them first, then log the altar call
      if (!fullName?.trim()) {
        return NextResponse.json(
          { success: false, error: "Full name is required" },
          { status: 400 }
        );
      }

      const newReg = await prisma.registration.create({
        data: {
          phone,
          fullName: fullName.trim(),
          district: district || "Unknown",
          location: location || null,
          group: group || "Altar Call",
          status: "visitor",
          gender: gender || "unspecified",
        },
      });

      record = await prisma.altarCall.create({
        data: {
          phone,
          fullName: fullName.trim(),
          district: district || null,
          location: location || null,
          isFirstTimer: isFirstTimer ?? null,
          registrationId: newReg.id,
        },
      });
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Altar call creation error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    const district = searchParams.get("district") || undefined;
    const location = searchParams.get("location") || undefined;
    const isFirstTimerParam = searchParams.get("isFirstTimer");
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;

    const isFirstTimer =
      isFirstTimerParam === "true"
        ? true
        : isFirstTimerParam === "false"
        ? false
        : undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};
    if (district) where.district = { equals: district, mode: "insensitive" };
    if (location) where.location = { equals: location, mode: "insensitive" };
    if (isFirstTimer !== undefined) where.isFirstTimer = isFirstTimer;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const records = await prisma.altarCall.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: records, total: records.length });
  } catch (error) {
    console.error("Fetch altar calls error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
