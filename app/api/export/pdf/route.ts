import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
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

  // Build filter summary string
  const filterParts: string[] = [];
  if (group)    filterParts.push(`Group: ${group}`);
  if (district) filterParts.push(`District: ${district}`);
  if (location) filterParts.push(`Area: ${location}`);
  if (status)   filterParts.push(`Status: ${status}`);
  if (gender)   filterParts.push(`Gender: ${gender}`);
  const filterSummary = filterParts.length ? filterParts.join("  |  ") : "All records";

  const generated = new Date().toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  });

  // ── pdf-lib setup ────────────────────────────────────────────────────────
  const pdfDoc   = await PDFDocument.create();
  const fontReg  = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const NAVY  = rgb(0.075, 0.200, 0.345); // #133358
  const WHITE = rgb(1, 1, 1);
  const GRAY1 = rgb(0.941, 0.957, 0.973); // #f0f4f8 alternating row
  const TEXT  = rgb(0.2,  0.2,  0.2);
  const MUTED = rgb(0.4,  0.4,  0.4);

  const PAGE_W = 595;  // A4 pts
  const PAGE_H = 842;
  const MARGIN = 40;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  // Column config: [label, fraction of CONTENT_W]
  const COL_DEF: [string, number][] = [
    ["#",        0.05],
    ["Name",     0.22],
    ["Phone",    0.14],
    ["District", 0.18],
    ["Area",     0.14],
    ["Status",   0.10],
    ["Gender",   0.09],
    ["Group",    0.08],
  ];
  const colWidths = COL_DEF.map(([, f]) => f * CONTENT_W);
  const colLabels = COL_DEF.map(([l]) => l);

  const ROW_H    = 15;
  const CELL_PAD = 3;
  const HDR_H    = 18;
  const FONT_SM  = 7.5;

  // Helper: clamp text to fit column width
  function clampText(text: string, maxW: number, font: typeof fontReg, size: number) {
    let t = text;
    while (t.length > 1 && font.widthOfTextAtSize(t, size) > maxW - CELL_PAD * 2) {
      t = t.slice(0, -1);
    }
    return t.length < text.length ? t.slice(0, -1) + "…" : t;
  }

  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let y    = PAGE_H - MARGIN;

  // ── Title ────────────────────────────────────────────────────────────────
  page.drawText("Deeper Life Retreat — Registrations", {
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

  // ── Table header drawing helper ──────────────────────────────────────────
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

  // ── Rows ─────────────────────────────────────────────────────────────────
  data.forEach((reg, idx) => {
    // New page if needed
    if (y - ROW_H < MARGIN + 20) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      y    = PAGE_H - MARGIN;
      y    = drawHeader(page, y);
    }

    // Alternating row background
    if (idx % 2 === 0) {
      page.drawRectangle({
        x: MARGIN, y: y - ROW_H + 4,
        width: CONTENT_W, height: ROW_H,
        color: GRAY1,
      });
    }

    const values = [
      String(idx + 1),
      reg.fullName,
      reg.phone,
      reg.district,
      reg.location ?? "—",
      reg.status,
      reg.gender,
      reg.group,
    ];

    let cx = MARGIN;
    values.forEach((val, i) => {
      const clamped = clampText(val, colWidths[i], fontReg, FONT_SM);
      page.drawText(clamped, {
        x: cx + CELL_PAD,
        y: y - ROW_H + 4 + (ROW_H - FONT_SM) / 2,
        font: fontReg, size: FONT_SM, color: TEXT,
      });
      cx += colWidths[i];
    });

    y -= ROW_H;
  });

  const pdfBytes  = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="registrations.pdf"`,
    },
  });
}
