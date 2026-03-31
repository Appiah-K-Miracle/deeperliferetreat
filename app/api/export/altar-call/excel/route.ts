import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
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

  const data = await prisma.altarCall.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const rows = data.map((r, i) => ({
    "#": i + 1,
    "Full Name": r.fullName,
    "Phone": r.phone,
    "District": r.district ?? "",
    "Area": r.location ?? "",
    "First Timer": r.isFirstTimer === true ? "Yes" : r.isFirstTimer === false ? "No" : "—",
    "Date": new Date(r.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    }),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 4 }, { wch: 28 }, { wch: 16 }, { wch: 18 },
    { wch: 18 }, { wch: 12 }, { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Altar Calls");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="altar-calls.xlsx"`,
    },
  });
}
