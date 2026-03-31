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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const normalizedPhone = normalizePhone(body.phone ?? "");

    if (!isValidGhanaPhone(normalizedPhone)) {
      return NextResponse.json(
        { success: false, error: "Enter a valid Ghana phone number (e.g. 0244123456)" },
        { status: 400 }
      );
    }

    const updated = await prisma.registration.update({
      where: { id },
      data: {
        fullName: body.fullName,
        group: body.group,
        district: body.district,
        location: body.location ?? null,
        status: body.status,
        gender: body.gender,
        phone: normalizedPhone,
        email: body.email || null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "A registration with this phone number already exists." },
        { status: 409 }
      );
    }
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Registration not found." },
        { status: 404 }
      );
    }
    console.error("Update registration error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.registration.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Registration not found." },
        { status: 404 }
      );
    }
    console.error("Delete registration error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
