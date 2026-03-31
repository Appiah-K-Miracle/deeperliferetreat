import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.startsWith("0")) {
    return "+233" + cleaned.slice(1);
  }
  return cleaned;
}

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");

  if (!phone) {
    return NextResponse.json(
      { success: false, error: "Phone number is required" },
      { status: 400 }
    );
  }

  const normalized = normalizePhone(phone);

  const registration = await prisma.registration.findUnique({
    where: { phone: normalized },
    select: {
      id: true,
      fullName: true,
      phone: true,
      district: true,
      location: true,
    },
  });

  if (!registration) {
    return NextResponse.json({ success: true, data: null });
  }

  return NextResponse.json({ success: true, data: registration });
}
