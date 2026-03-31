import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const group    = searchParams.get("group")    || undefined;
  const district = searchParams.get("district") || undefined;
  const location = searchParams.get("location") || undefined;
  const status   = searchParams.get("status")   || undefined;
  const gender   = searchParams.get("gender")   || undefined;

  const data = await prisma.registration.findMany({
    where: {
      ...(group    && { group:    { equals: group,    mode: "insensitive" } }),
      ...(district && { district: { equals: district, mode: "insensitive" } }),
      ...(location && { location: { equals: location, mode: "insensitive" } }),
      ...(status   && { status:   { equals: status,   mode: "insensitive" } }),
      ...(gender   && { gender:   { equals: gender,   mode: "insensitive" } }),
    },
    orderBy: { createdAt: "desc" },
  });

  // Shape rows for the sheet
  const rows = data.map((r, i) => ({
    "#":         i + 1,
    "Full Name": r.fullName,
    "Phone":     r.phone,
    "Group":     r.group,
    "District":  r.district,
    "Area":      r.location ?? "",
    "Status":    r.status,
    "Gender":    r.gender,
    "Registered":new Date(r.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    }),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Style column widths
  worksheet["!cols"] = [
    { wch: 4 }, { wch: 28 }, { wch: 16 }, { wch: 10 },
    { wch: 18 }, { wch: 18 }, { wch: 10 }, { wch: 8 }, { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="registrations.xlsx"`,
    },
  });
}
