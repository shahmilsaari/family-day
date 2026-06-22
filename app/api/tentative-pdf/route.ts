import PDFDocument from "pdfkit/js/pdfkit.standalone";
import { loadDashboard } from "@/lib/dashboard";
import { formatScheduleDate, formatScheduleTime, groupTimetableByDay } from "@/lib/timetable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOP = 48;
const BOTTOM = 760;
const LEFT = 48;
const RIGHT = 560;
const TEXT = "#12241c";
const MUTED = "#52655b";
const GREEN = "#0b5f3c";
const LINE = "#dbeadf";

type Column = { label: string; x: number; width: number };

function streamToBuffer(doc: PDFKit.PDFDocument) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

function ensureSpace(doc: PDFKit.PDFDocument, y: number, needed = 70) {
  if (y + needed <= BOTTOM) return y;
  doc.addPage();
  return TOP;
}

function pageHeader(doc: PDFKit.PDFDocument, title: string, subtitle?: string) {
  doc.font("Helvetica-Bold").fontSize(20).fillColor(GREEN).text(title, LEFT, TOP);
  if (subtitle) doc.font("Helvetica").fontSize(10).fillColor(MUTED).text(subtitle, LEFT, TOP + 27, { width: 500 });
  const lineY = subtitle ? TOP + 50 : TOP + 36;
  doc.moveTo(LEFT, lineY).lineTo(RIGHT, lineY).lineWidth(1).strokeColor("#b7d8c6").stroke();
  return lineY + 18;
}

function section(doc: PDFKit.PDFDocument, title: string, y: number) {
  y = ensureSpace(doc, y, 42);
  doc.font("Helvetica-Bold").fontSize(13).fillColor(GREEN).text(title, LEFT, y);
  return y + 22;
}

function paragraph(doc: PDFKit.PDFDocument, text: string, y: number, x = LEFT, width = RIGHT - LEFT) {
  y = ensureSpace(doc, y, 34);
  doc.font("Helvetica").fontSize(10).fillColor(TEXT).text(text, x, y, { width, lineGap: 2 });
  return doc.y + 8;
}

function infoBox(doc: PDFKit.PDFDocument, label: string, value: string | number, x: number, y: number, width = 240) {
  doc.roundedRect(x, y, width, 48, 9).fillAndStroke("#f4fbf6", "#cfe6d8");
  doc.font("Helvetica-Bold").fontSize(8).fillColor(MUTED).text(label.toUpperCase(), x + 10, y + 9, { width: width - 20 });
  doc.font("Helvetica").fontSize(11).fillColor(TEXT).text(String(value), x + 10, y + 23, { width: width - 20 });
}

function tableHeader(doc: PDFKit.PDFDocument, cols: Column[], y: number) {
  y = ensureSpace(doc, y, 34);
  doc.font("Helvetica-Bold").fontSize(9).fillColor(GREEN);
  cols.forEach((col) => doc.text(col.label, col.x, y, { width: col.width }));
  doc.moveTo(LEFT, y + 16).lineTo(RIGHT, y + 16).lineWidth(1).strokeColor("#b7d8c6").stroke();
  return y + 25;
}

function tableRow(doc: PDFKit.PDFDocument, cols: Column[], values: string[], y: number) {
  doc.font("Helvetica").fontSize(9);
  const heights = values.map((value, index) => doc.heightOfString(value || "-", { width: cols[index].width, lineGap: 1 }));
  const rowHeight = Math.max(20, ...heights) + 14;
  y = ensureSpace(doc, y, rowHeight + 12);
  doc.fillColor(TEXT);
  values.forEach((value, index) => doc.text(value || "-", cols[index].x, y, { width: cols[index].width, lineGap: 1 }));
  doc.moveTo(LEFT, y + rowHeight).lineTo(RIGHT, y + rowHeight).lineWidth(0.5).strokeColor(LINE).stroke();
  return y + rowHeight + 8;
}

function bullet(doc: PDFKit.PDFDocument, text: string, y: number) {
  return paragraph(doc, `• ${text}`, y, 62, 470);
}

export async function GET(request: Request) {
  const eventIdParam = new URL(request.url).searchParams.get("eventId");
  const eventId = eventIdParam ? Number.parseInt(eventIdParam, 10) : undefined;
  const state = await loadDashboard(Number.isFinite(eventId) ? eventId : undefined);

  if (!state.event) return new Response("No active event found.", { status: 404 });

  const doc = new PDFDocument({ size: "A4", margins: { top: 42, right: 36, bottom: 42, left: 36 } });
  const pdfBufferPromise = streamToBuffer(doc);
  const safeTitle = state.event.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  const filename = `${safeTitle || "family-day"}-briefing.pdf`;
  const scoredGames = state.games.filter((game) => game.includeInScore);
  const funGames = state.games.filter((game) => !game.includeInScore);

  doc.font("Helvetica-Bold").fontSize(26).fillColor("#0f241a").text("Family Day Briefing Pack", LEFT, 60);
  doc.font("Helvetica-Bold").fontSize(18).fillColor(GREEN).text(state.event.title, LEFT, 96);
  doc.font("Helvetica").fontSize(10).fillColor(MUTED).text(`Information pack for crew, PICs and participants • ${state.event.year}`, LEFT, 122);

  const dateRange = [state.event.startDate, state.event.endDate].filter(Boolean).map((value) => formatScheduleDate(value ?? null)).join(" - ") || "Date to be announced";
  let y = 166;
  y = section(doc, "Event Information", y);
  infoBox(doc, "Venue", state.event.location ?? "TBC", LEFT, y, 246);
  infoBox(doc, "Date", dateRange, 314, y, 246);
  y += 66;
  infoBox(doc, "Teams", state.teams.length, LEFT, y, 116);
  infoBox(doc, "Activities", state.games.length, 180, y, 116);
  infoBox(doc, "Official Games", scoredGames.length, 312, y, 116);
  infoBox(doc, "Fun Activities", funGames.length, 444, y, 116);
  y += 76;

  y = section(doc, "Briefing Notes", y);
  y = bullet(doc, "This document is for event briefing and operational information only.", y);
  y = bullet(doc, "Refer to the dashboard/live display for current scores and final standings.", y);
  y = bullet(doc, "Games marked Official Game are part of the competition flow. Fun Activity games are for enjoyment and engagement.", y);
  y = bullet(doc, "PICs should confirm equipment, venue readiness and participants before each activity starts.", y);

  y += 14;
  y = section(doc, "Teams", y);
  if (!state.teams.length) {
    y = paragraph(doc, "No teams registered yet.", y);
  } else {
    const cols = [
      { label: "Team", x: 48, width: 150 },
      { label: "Members", x: 210, width: 292 },
      { label: "Count", x: 516, width: 44 }
    ];
    y = tableHeader(doc, cols, y);
    for (const team of state.teams) {
      y = tableRow(doc, cols, [team.name, team.members.map((member) => member.name).join(", ") || "Not decided yet", String(team.members.length)], y);
    }
  }

  y += 12;
  y = section(doc, "Games / Activities", y);
  if (!state.games.length) {
    y = paragraph(doc, "No games or activities created yet.", y);
  } else {
    const cols = [
      { label: "Activity", x: 48, width: 130 },
      { label: "Brief / Rules", x: 188, width: 235 },
      { label: "Rounds", x: 434, width: 50 },
      { label: "Type", x: 494, width: 66 }
    ];
    y = tableHeader(doc, cols, y);
    for (const game of state.games) {
      y = tableRow(doc, cols, [
        game.name,
        game.description ?? "No description provided",
        String(game.rounds || 1),
        game.includeInScore ? "Official" : "Fun"
      ], y);
    }
  }

  y += 12;
  y = section(doc, "Tentative Schedule", y);
  const groupedTimetable = groupTimetableByDay(state.timetable);
  if (!groupedTimetable.length) {
    y = paragraph(doc, "No agenda slots have been added yet.", y);
  } else {
    const cols = [
      { label: "Time", x: 48, width: 66 },
      { label: "Activity", x: 122, width: 155 },
      { label: "PIC", x: 286, width: 95 },
      { label: "Venue", x: 390, width: 82 },
      { label: "Notes", x: 482, width: 78 }
    ];

    for (const group of groupedTimetable) {
      y = ensureSpace(doc, y, 90);
      doc.font("Helvetica-Bold").fontSize(12).fillColor(GREEN).text(group.label, LEFT, y);
      y += 22;
      y = tableHeader(doc, cols, y);
      for (const item of group.items) {
        y = tableRow(doc, cols, [
          formatScheduleTime(item.time),
          item.title,
          item.pic ?? "Unassigned",
          item.location ?? "TBC",
          item.notes ?? "No notes"
        ], y);
      }
      y += 14;
    }
  }

  doc.end();
  const buffer = await pdfBufferPromise;
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
