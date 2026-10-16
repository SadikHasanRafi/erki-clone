import PDFDocument from "pdfkit";
import type { Insights, Row } from "./insights";

// ---------- JSON ----------

const round = (n: number, places = 4) => Math.round(n * 10 ** places) / 10 ** places;

// Breakdown rows share one flat shape, so each list loads straight into a spreadsheet, pandas or SQL.
function breakdown(rows: Row[]) {
  const total = rows.reduce((s, r) => s + r.pageviews, 0);
  return rows.map((r) => ({
    name: r.label,
    pageViews: r.pageviews,
    visitors: r.visitors,
    shareOfListed: total ? round(r.pageviews / total) : 0,
  }));
}

export function buildInsightsJson(data: Insights, siteName: string, generatedAt: Date) {
  const days = data.daily.filter((d) => d.known);
  const pageViews = days.reduce((s, d) => s + d.pageviews, 0);
  const peak = days.reduce<(typeof days)[number] | null>((best, d) => (!best || d.pageviews > best.pageviews ? d : best), null);
  return {
    meta: {
      schemaVersion: 1,
      site: siteName,
      generatedAt: generatedAt.toISOString(),
      source: "Vercel Web Analytics",
      timezone: "UTC",
      period: { from: days[0]?.date ?? null, to: days.at(-1)?.date ?? null, days: days.length },
      notes: [
        "daily[].visitors counts unique visitors per day, so summing it counts a returning person once per day.",
        "Breakdown lists are the top rows only; shareOfListed is each row's share of the page views of the rows listed, not of the whole site.",
      ],
    },
    summary: {
      pageViews,
      visitorsDailySum: days.reduce((s, d) => s + d.visitors, 0),
      avgPageViewsPerDay: days.length ? round(pageViews / days.length, 2) : 0,
      peakDay: peak ? { date: peak.date, pageViews: peak.pageviews } : null,
      pageViewsAllTime: data.lifetime?.pageviews ?? null,
      visitorsAllTime: data.lifetime?.visitors ?? null,
    },
    daily: days.map((d) => ({ date: d.date, pageViews: d.pageviews, visitors: d.visitors })),
    pages: breakdown(data.topPages),
    referrers: breakdown(data.referrers),
    countries: breakdown(data.countries),
    devices: breakdown(data.devices),
    browsers: breakdown(data.browsers),
    warnings: data.errors,
  };
}

// ---------- PDF ----------

const INK = "#121316";
const AMBER = "#e59819";
const MUTED = "#6b7280";
const FAINT = "#9ca3af";
const RULE = "#e5e7eb";
const TRACK = "#f0eee8";

// The built-in PDF fonts only cover basic Latin, so other scripts (such as Bangla page paths) become "?".
const clean = (s: string) => s.replace(/[^\x20-\x7E]/g, "?");
const num = (n: number) => n.toLocaleString("en-US");
const dateLong = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const dateShort = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const weekday = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" });

// Rounds a chart maximum up to 1, 2, 5 × a power of ten so the grid lines land on clean numbers.
function niceMax(n: number): number {
  const exp = 10 ** Math.floor(Math.log10(Math.max(1, n)));
  const f = n / exp;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * exp;
}

export function buildInsightsPdf(data: Insights, siteName: string, generatedAt: Date): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const margin = 44;
    const doc = new PDFDocument({ size: "A4", margin, bufferPages: true, info: { Title: `${clean(siteName)} - Traffic report` } });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = doc.page.width;
    const H = doc.page.height;
    const width = W - margin * 2;
    const footerY = H - 34;
    const limit = footerY - 14; // content stops above the footer
    const days = data.daily.filter((d) => d.known);
    const first = days[0]?.date;
    const last = days.at(-1)?.date;
    const views = days.reduce((s, d) => s + d.pageviews, 0);
    const visitors = days.reduce((s, d) => s + d.visitors, 0);
    const avg = days.length ? views / days.length : 0;
    const peak = days.reduce<(typeof days)[number] | null>((b, d) => (!b || d.pageviews > b.pageviews ? d : b), null);

    const label = (text: string, x: number, y: number, w: number, align: "left" | "right" = "left") =>
      doc.font("Helvetica-Bold").fontSize(7.5).fillColor(MUTED).text(text.toUpperCase(), x, y, { width: w, align, lineBreak: false, characterSpacing: 0.8 });

    // pdfkit does not cut long text on its own, so shorten it to the width with an ellipsis.
    const fit = (text: string, w: number, font: string, size: number) => {
      doc.font(font).fontSize(size);
      let t = clean(text);
      if (doc.widthOfString(t) <= w) return t;
      while (t.length > 1 && doc.widthOfString(`${t}...`) > w) t = t.slice(0, -1);
      return `${t}...`;
    };

    // ----- Header band -----
    doc.rect(0, 0, W, 88).fill(INK);
    doc.rect(0, 88, W, 4).fill(AMBER);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(AMBER).text("TRAFFIC REPORT", margin, 26, { lineBreak: false, characterSpacing: 1.5 });
    doc.font("Helvetica-Bold").fontSize(24).fillColor("#ffffff").text(fit(siteName, width * 0.6, "Helvetica-Bold", 24), margin, 40, { lineBreak: false });
    if (first && last) {
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#ffffff").text(`${dateLong(first)}  -  ${dateLong(last)}`, margin, 30, { width, align: "right", lineBreak: false });
      doc.font("Helvetica").fontSize(9).fillColor(FAINT).text(`Last ${days.length} days`, margin, 47, { width, align: "right", lineBreak: false });
    }

    // ----- Key figures -----
    let y = 118;
    const kpis = [
      { label: "Page views", value: num(views), note: `${avg.toFixed(1)} per day on average` },
      { label: "Daily visitors", value: num(visitors), note: "unique per day, summed" },
      { label: "Busiest day", value: peak ? num(peak.pageviews) : "-", note: peak ? `${weekday(peak.date)} ${dateShort(peak.date)}` : "" },
      { label: "All time", value: num(data.lifetime?.pageviews ?? 0), note: `page views, ${num(data.lifetime?.visitors ?? 0)} visitors` },
    ];
    const colW = width / kpis.length;
    kpis.forEach((k, i) => {
      const x = margin + i * colW + (i === 0 ? 0 : 16);
      const w = colW - (i === 0 ? 16 : 16);
      if (i > 0) doc.moveTo(margin + i * colW, y).lineTo(margin + i * colW, y + 58).lineWidth(0.5).stroke(RULE);
      label(k.label, x, y, w);
      doc.font("Helvetica-Bold").fontSize(26).fillColor(INK).text(k.value, x, y + 14, { width: w, lineBreak: false });
      doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(fit(k.note, w, "Helvetica", 8), x, y + 46, { lineBreak: false });
    });
    y += 58 + 26;

    // ----- Daily chart -----
    label("Page views per day", margin, y, width / 2);
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(peak ? `Peak ${num(peak.pageviews)} on ${dateShort(peak.date)}` : "", margin + width / 2, y, { width: width / 2, align: "right", lineBreak: false });
    y += 20;
    const chartH = 130;
    const axisW = 34;
    const cx = margin + axisW;
    const cw = width - axisW;
    const top = niceMax(Math.max(1, ...days.map((d) => d.pageviews)));
    for (let i = 0; i <= 4; i++) {
      const gy = y + chartH - (chartH * i) / 4;
      doc.moveTo(cx, gy).lineTo(cx + cw, gy).lineWidth(i === 0 ? 0.8 : 0.4).stroke(i === 0 ? FAINT : RULE);
      doc.font("Helvetica").fontSize(7).fillColor(MUTED).text(num((top * i) / 4), margin, gy - 3.5, { width: axisW - 6, align: "right", lineBreak: false });
    }
    const slot = cw / Math.max(1, days.length);
    const barW = Math.min(34, Math.max(1.5, slot * 0.68));
    days.forEach((d, i) => {
      const h = Math.max(d.pageviews > 0 ? 1.2 : 0, (d.pageviews / top) * chartH);
      doc.rect(cx + i * slot + (slot - barW) / 2, y + chartH - h, barW, h).fill(peak && d.date === peak.date ? AMBER : INK);
    });
    // Date labels: about six, evenly spaced, kept inside the margins.
    const ticks = days.length <= 8 ? days.length : 6;
    for (let t = 0; t < ticks; t++) {
      const i = ticks === 1 ? 0 : Math.round((t * (days.length - 1)) / (ticks - 1));
      const bx = cx + i * slot + slot / 2;
      const lx = Math.min(Math.max(bx - 25, cx - 10), cx + cw - 50);
      doc.font("Helvetica").fontSize(7).fillColor(MUTED).text(dateShort(days[i].date), lx, y + chartH + 7, { width: 50, align: "center", lineBreak: false });
    }
    y += chartH + 38;

    // ----- Ranked lists in two columns -----
    const gutter = 28;
    const lw = (width - gutter) / 2;
    const rowH = 21;
    const blockHeight = (rows: Row[]) => 28 + Math.max(1, rows.length) * rowH + 14;
    let yy = [y, y];

    const block = (title: string, rows: Row[]) => {
      const need = blockHeight(rows);
      // Put it in the shorter column; if it doesn't fit, continue on a fresh page.
      let col = yy[0] <= yy[1] ? 0 : 1;
      if (yy[col] + need > limit) {
        doc.addPage();
        yy = [margin, margin];
        col = 0;
      }
      const x = margin + col * (lw + gutter);
      let by = yy[col];
      label(title, x, by, lw);
      doc.moveTo(x, by + 14).lineTo(x + lw, by + 14).lineWidth(0.8).stroke(INK);
      by += 24;
      if (rows.length === 0) {
        doc.font("Helvetica").fontSize(8.5).fillColor(MUTED).text("No data for this period.", x, by, { width: lw, lineBreak: false });
        by += rowH;
      }
      const sum = rows.reduce((s, r) => s + r.pageviews, 0);
      const max = Math.max(1, ...rows.map((r) => r.pageviews));
      for (const r of rows) {
        const pct = sum ? Math.round((r.pageviews / sum) * 100) : 0;
        doc.font("Helvetica").fontSize(8.5).fillColor(INK).text(fit(r.label, lw - 84, "Helvetica", 8.5), x, by, { lineBreak: false });
        doc.font("Helvetica-Bold").fontSize(8.5).fillColor(INK).text(num(r.pageviews), x + lw - 70, by, { width: 42, align: "right", lineBreak: false });
        doc.font("Helvetica").fontSize(8).fillColor(MUTED).text(`${pct}%`, x + lw - 24, by, { width: 24, align: "right", lineBreak: false });
        doc.rect(x, by + 12, lw, 2.5).fill(TRACK);
        doc.rect(x, by + 12, Math.max(1, (r.pageviews / max) * lw), 2.5).fill(INK);
        by += rowH;
      }
      yy[col] = by + 14;
    };
    block("Top pages", data.topPages);
    block("Referrers", data.referrers);
    block("Countries", data.countries);
    block("Devices", data.devices);
    block("Browsers", data.browsers);

    // ----- Daily table -----
    if (days.length > 0) {
      // Continue below the lists when there is room for a few rows, otherwise start a new page.
      let ty = Math.max(yy[0], yy[1]) + 6;
      if (ty + 90 > limit) {
        doc.addPage();
        ty = margin;
      }
      label("Daily breakdown", margin, ty, width);
      ty += 20;
      const cols = { date: margin, views: margin + 150, visitors: margin + 230, bar: margin + 300 };
      const head = () => {
        doc.rect(margin, ty - 4, width, 18).fill("#f6f5f1");
        label("Date", cols.date + 6, ty, 120);
        label("Page views", cols.views, ty, 70, "right");
        label("Visitors", cols.visitors, ty, 60, "right");
        ty += 20;
      };
      head();
      const maxViews = Math.max(1, ...days.map((d) => d.pageviews));
      days.forEach((d, i) => {
        if (ty + 17 > limit) {
          doc.addPage();
          ty = margin;
          head();
        }
        if (i % 2 === 1) doc.rect(margin, ty - 3, width, 17).fill("#fbfaf7");
        doc.font("Helvetica").fontSize(8.5).fillColor(INK).text(`${weekday(d.date)}  ${dateLong(d.date)}`, cols.date + 6, ty, { width: 140, lineBreak: false });
        doc.font("Helvetica-Bold").text(num(d.pageviews), cols.views, ty, { width: 70, align: "right", lineBreak: false });
        doc.font("Helvetica").fillColor(MUTED).text(num(d.visitors), cols.visitors, ty, { width: 60, align: "right", lineBreak: false });
        doc.rect(cols.bar, ty + 2, Math.max(d.pageviews ? 1 : 0, (d.pageviews / maxViews) * (margin + width - cols.bar)), 5).fill(peak && d.date === peak.date ? AMBER : INK);
        ty += 17;
      });
    }

    // ----- Footer on every page -----
    const { start, count } = doc.bufferedPageRange();
    for (let i = start; i < start + count; i++) {
      doc.switchToPage(i);
      doc.page.margins.bottom = 0; // writing below the bottom margin would otherwise add a page
      doc.moveTo(margin, footerY - 8).lineTo(W - margin, footerY - 8).lineWidth(0.5).stroke(RULE);
      doc.font("Helvetica").fontSize(7.5).fillColor(MUTED).text(`${clean(siteName)}  |  Generated ${generatedAt.toISOString().slice(0, 16).replace("T", " ")} UTC`, margin, footerY, { width: width * 0.75, lineBreak: false });
      doc.text(`Page ${i - start + 1} of ${count}`, margin, footerY, { width, align: "right", lineBreak: false });
    }

    doc.end();
  });
}
