import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.startsWith("0")) {
    return "+233" + cleaned.slice(1);
  }
  return cleaned;
}

function isValidGhanaPhone(phone: string): boolean {
  return /^\+233[0-9]{9}$/.test(phone);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const group = searchParams.get("group");
    const district = searchParams.get("district");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};
    if (group) where.group = group;
    if (district) where.district = district;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    const registrations = await prisma.registration.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: registrations });
  } catch (error) {
    console.error("Fetch registrations error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const normalizedPhone = normalizePhone(body.phone ?? "");

    if (!isValidGhanaPhone(normalizedPhone)) {
      return NextResponse.json(
        { success: false, error: "Enter a valid Ghana phone number (e.g. 0244123456)" },
        { status: 400 }
      );
    }

    const data = await prisma.registration.create({
      data: {
        group: body.group,
        district: body.district,
        location: body.location || null,
        status: body.status,
        fullName: body.fullName,
        gender: body.gender,
        phone: normalizedPhone,
        email: body.email || null,
      },
    });

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "This phone number is already registered" },
        { status: 400 }
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
