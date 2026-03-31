import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
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

  // Build filter summary
  const filterParts: string[] = [];
  if (district) filterParts.push(`District: ${district}`);
  if (location) filterParts.push(`Area: ${location}`);
  if (isFirstTimer !== undefined) filterParts.push(`First Timer: ${isFirstTimer ? "Yes" : "No"}`);
  if (dateFrom) filterParts.push(`From: ${dateFrom}`);
  if (dateTo) filterParts.push(`To: ${dateTo}`);
  const filterSummary = filterParts.length ? filterParts.join("  |  ") : "All records";

  const generated = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const pdfDoc = await PDFDocument.create();
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const NAVY = rgb(0.075, 0.200, 0.345);
  const WHITE = rgb(1, 1, 1);
  const GRAY1 = rgb(0.941, 0.957, 0.973);
  const TEXT = rgb(0.2, 0.2, 0.2);
  const MUTED = rgb(0.4, 0.4, 0.4);
  const GREEN = rgb(0.1, 0.6, 0.3);

  const PAGE_W = 595;
  const PAGE_H = 842;
  const MARGIN = 40;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  const COL_DEF: [string, number][] = [
    ["#", 0.05],
    ["Name", 0.26],
    ["Phone", 0.16],
    ["District", 0.20],
    ["Area", 0.16],
    ["First Timer", 0.10],
    ["Date", 0.07],
  ];
  const colWidths = COL_DEF.map(([, f]) => f * CONTENT_W);
  const colLabels = COL_DEF.map(([l]) => l);

  const ROW_H = 15;
  const CELL_PAD = 3;
  const HDR_H = 18;
  const FONT_SM = 7.5;

  function clampText(text: string, maxW: number, font: typeof fontReg, size: number) {
    let t = text;
    while (t.length > 1 && font.widthOfTextAtSize(t, size) > maxW - CELL_PAD * 2) {
      t = t.slice(0, -1);
    }
    return t.length < text.length ? t.slice(0, -1) + "…" : t;
  }

  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  page.drawText("Deeper Life Retreat — Altar Calls", {
    x: MARGIN, y,
    font: fontBold, size: 15, color: NAVY,
  });
  y -= 16;

  page.drawText(`Filters: ${filterSummary}`, {
    x: MARGIN, y,
    font: fontReg, size: 8, color: MUTED,
  });
  y -= 13;

  page.drawText(
    `Total: ${data.length} record${data.length !== 1 ? "s" : ""}   |   Generated: ${generated}`,
    { x: MARGIN, y, font: fontReg, size: 8, color: MUTED }
  );
  y -= 20;

  function drawHeader(pg: ReturnType<typeof pdfDoc.addPage>, headerY: number) {
    pg.drawRectangle({
      x: MARGIN, y: headerY - HDR_H + 4,
      width: CONTENT_W, height: HDR_H,
      color: NAVY,
    });
    let cx = MARGIN;
    colLabels.forEach((label, i) => {
      pg.drawText(label, {
        x: cx + CELL_PAD,
        y: headerY - HDR_H + 4 + (HDR_H - FONT_SM) / 2,
        font: fontBold, size: FONT_SM, color: WHITE,
      });
      cx += colWidths[i];
    });
    return headerY - HDR_H - 2;
  }

  y = drawHeader(page, y);

  data.forEach((rec, idx) => {
    if (y - ROW_H < MARGIN + 20) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
      y = drawHeader(page, y);
    }

    if (idx % 2 === 0) {
      page.drawRectangle({
        x: MARGIN, y: y - ROW_H + 4,
        width: CONTENT_W, height: ROW_H,
        color: GRAY1,
      });
    }

    const firstTimerLabel =
      rec.isFirstTimer === true ? "Yes" : rec.isFirstTimer === false ? "No" : "—";

    const values = [
      String(idx + 1),
      rec.fullName,
      rec.phone,
      rec.district ?? "—",
      rec.location ?? "—",
      firstTimerLabel,
      new Date(rec.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    ];

    let cx = MARGIN;
    values.forEach((val, i) => {
      const clamped = clampText(val, colWidths[i], fontReg, FONT_SM);
      const color = i === 5 && val === "Yes" ? GREEN : TEXT;
      page.drawText(clamped, {
        x: cx + CELL_PAD,
        y: y - ROW_H + 4 + (ROW_H - FONT_SM) / 2,
        font: fontReg, size: FONT_SM, color,
      });
      cx += colWidths[i];
    });

    y -= ROW_H;
  });

  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="altar-calls.pdf"`,
    },
  });
}
