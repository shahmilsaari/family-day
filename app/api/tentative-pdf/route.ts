import PDFDocument from "pdfkit/js/pdfkit.standalone";
import { loadDashboard } from "@/lib/dashboard";
import { formatScheduleDate, formatScheduleTime, groupTimetableByDay } from "@/lib/timetable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function streamToBuffer(doc: PDFKit.PDFDocument) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

function drawTableHeader(doc: PDFKit.PDFDocument, startY: number) {
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#0b5f3c")
    .text("Time", 48, startY, { width: 70 })
    .text("Activity", 122, startY, { width: 160 })
    .text("PIC", 286, startY, { width: 104 })
    .text("Venue", 394, startY, { width: 90 })
    .text("Notes", 488, startY, { width: 72 });

  doc
    .moveTo(48, startY + 18)
    .lineTo(560, startY + 18)
    .lineWidth(1)
    .strokeColor("#b7d8c6")
    .stroke();
}

export async function GET() {
  const state = await loadDashboard();

  if (!state.event) {
    return new Response("No active event found.", { status: 404 });
  }

  const groupedTimetable = groupTimetableByDay(state.timetable);
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 42, right: 36, bottom: 42, left: 36 }
  });

  const filename = `${state.event.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}-tentative.pdf`;
  const pdfBufferPromise = streamToBuffer(doc);

  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor("#0f241a")
    .text(state.event.title);

  doc
    .moveDown(0.25)
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#52655b")
    .text(`Tentative timetable • ${state.event.year}`);

  if (state.event.location) {
    doc.text(`Venue: ${state.event.location}`);
  }

  if (state.event.startDate || state.event.endDate) {
    const dateRange = [state.event.startDate, state.event.endDate]
      .filter(Boolean)
      .map((value) => formatScheduleDate(value ?? null))
      .join(" - ");
    doc.text(`Event dates: ${dateRange}`);
  }

  doc.moveDown(0.8);

  if (!groupedTimetable.length) {
    doc
      .font("Helvetica")
      .fontSize(12)
      .fillColor("#52655b")
      .text("No agenda slots have been added yet.");
    doc.end();
    const buffer = await pdfBufferPromise;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  }

  for (const [groupIndex, group] of groupedTimetable.entries()) {
    if (groupIndex > 0) {
      doc.addPage();
    }

    doc
      .font("Helvetica-Bold")
      .fontSize(15)
      .fillColor("#0b5f3c")
      .text(group.label, 48, 132);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#52655b")
      .text(`${group.items.length} slot${group.items.length === 1 ? "" : "s"}`, 48, 151);

    let y = 182;
    drawTableHeader(doc, y);
    y += 28;

    for (const item of group.items) {
      const rowTop = y;
      const rowValues = {
        time: formatScheduleTime(item.time),
        activity: item.title,
        pic: item.pic ?? "Unassigned",
        venue: item.location ?? "TBC",
        notes: item.notes ?? "No notes"
      };

      doc.font("Helvetica").fontSize(10).fillColor("#12241c");
      doc.text(rowValues.time, 48, rowTop, { width: 70 });
      doc.text(rowValues.activity, 122, rowTop, { width: 160 });
      doc.text(rowValues.pic, 286, rowTop, { width: 104 });
      doc.text(rowValues.venue, 394, rowTop, { width: 90 });
      doc.text(rowValues.notes, 488, rowTop, { width: 72 });

      const rowBottom = Math.max(
        doc.y,
        rowTop + 18
      ) + 10;

      doc
        .moveTo(48, rowBottom)
        .lineTo(560, rowBottom)
        .lineWidth(0.6)
        .strokeColor("#dbeadf")
        .stroke();

      y = rowBottom + 8;

      if (y > 742) {
        doc.addPage();
        y = 48;
        drawTableHeader(doc, y);
        y += 28;
      }
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
