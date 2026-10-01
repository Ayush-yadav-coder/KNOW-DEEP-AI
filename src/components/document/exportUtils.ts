import jsPDF from "jspdf";

export interface ExportParagraph {
  id: string;
  type: "h1" | "h2" | "h3" | "p" | "bullet";
  text: string;
  pageNumber?: number;
  highlightColor?: string;
  comment?: string;
}

export interface ExportOptions {
  includeStamp?: boolean;
  stampText?: string | null;
  authorName?: string;
  includeDate?: boolean;
  fontSize?: "compact" | "normal" | "spacious";
}

/**
 * Downloads a Blob as a file with the specified name
 */
export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * High-fidelity PDF Exporter using jsPDF with page wrapping, styled typography, and margins
 */
export function exportToPdf(
  title: string,
  paragraphs: ExportParagraph[],
  options: ExportOptions = {}
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 54; // 0.75 in
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - margin - 30) {
      doc.addPage();
      currentY = margin;
      drawHeaderFooter();
    }
  };

  const drawHeaderFooter = () => {
    const totalPages = (doc.internal as any).getNumberOfPages
      ? (doc.internal as any).getNumberOfPages()
      : 1;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 165);
    doc.text(title, margin, margin - 20);
    doc.text(
      `Page ${totalPages}`,
      pageWidth - margin - 35,
      pageHeight - margin + 20
    );
  };

  // Watermark Stamp if requested
  if (options.includeStamp && options.stampText) {
    doc.saveGraphicsState();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(225, 29, 72);
    doc.setDrawColor(225, 29, 72);
    doc.setLineWidth(1.5);
    const stampW = doc.getTextWidth(options.stampText) + 20;
    doc.roundedRect(pageWidth - margin - stampW, margin - 15, stampW, 26, 4, 4);
    doc.text(options.stampText, pageWidth - margin - stampW + 10, margin + 3);
    doc.restoreGraphicsState();
  }

  // Document Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42); // slate-900
  const titleLines = doc.splitTextToSize(title || "Document", contentWidth);
  doc.text(titleLines, margin, currentY);
  currentY += titleLines.length * 28 + 8;

  // Metadata Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  const metaDate = options.includeDate !== false ? new Date().toLocaleDateString(undefined, { dateStyle: "long" }) : "";
  const metaAuthor = options.authorName ? `Created by ${options.authorName}` : "Know Deep Document Studio";
  doc.text(`${metaAuthor} · ${metaDate}`, margin, currentY);
  currentY += 16;

  // Decorative Rule
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(1);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 24;

  // Paragraphs
  for (const p of paragraphs) {
    if (!p.text.trim()) continue;

    if (p.type === "h1") {
      checkPageBreak(40);
      currentY += 14;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.setTextColor(15, 23, 42);
      const lines = doc.splitTextToSize(p.text, contentWidth);
      doc.text(lines, margin, currentY);
      currentY += lines.length * 22 + 8;

      // Bottom accent bar for H1
      doc.setDrawColor(2, 132, 199); // sky-600
      doc.setLineWidth(1.5);
      doc.line(margin, currentY - 4, margin + 45, currentY - 4);
      currentY += 6;
    } else if (p.type === "h2") {
      checkPageBreak(32);
      currentY += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(2, 132, 199);
      const lines = doc.splitTextToSize(p.text, contentWidth);
      doc.text(lines, margin, currentY);
      currentY += lines.length * 17 + 6;
    } else if (p.type === "h3") {
      checkPageBreak(26);
      currentY += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(p.text, contentWidth);
      doc.text(lines, margin, currentY);
      currentY += lines.length * 15 + 4;
    } else if (p.type === "bullet") {
      checkPageBreak(22);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);

      // Bullet dot
      doc.setFillColor(2, 132, 199);
      doc.circle(margin + 6, currentY - 3, 2, "F");

      const lines = doc.splitTextToSize(p.text, contentWidth - 20);
      doc.text(lines, margin + 16, currentY);
      currentY += lines.length * 14 + 5;
    } else {
      // Standard paragraph
      checkPageBreak(24);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(p.text, contentWidth);
      doc.text(lines, margin, currentY);
      currentY += lines.length * 14.5 + 8;
    }
  }

  // Add numbering to all pages
  const totalPages = (doc.internal as any).getNumberOfPages
    ? (doc.internal as any).getNumberOfPages()
    : 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Document Studio · Page ${i} of ${totalPages}`,
      pageWidth / 2 - 40,
      pageHeight - 24
    );
  }

  const safeFilename = (title || "Document").replace(/[^a-z0-9_-]/gi, "_");
  doc.save(`${safeFilename}.pdf`);
}

/**
 * Microsoft Word (.doc / .docx compatible HTML) Exporter preserving rich headings, styles, and lists
 */
export function exportToWord(
  title: string,
  paragraphs: ExportParagraph[],
  options: ExportOptions = {}
): void {
  const safeTitle = escapeHtml(title || "Document");
  const dateStr = new Date().toLocaleDateString(undefined, { dateStyle: "long" });

  let bodyContent = `
    <div class="doc-header">
      <h1 class="main-title">${safeTitle}</h1>
      <p class="doc-meta">Created with Know Deep Document Studio &middot; ${dateStr}</p>
      ${
        options.includeStamp && options.stampText
          ? `<div class="stamp-box">${escapeHtml(options.stampText)}</div>`
          : ""
      }
    </div>
    <hr class="divider"/>
  `;

  for (const p of paragraphs) {
    const text = escapeHtml(p.text);
    if (!text.trim()) continue;

    switch (p.type) {
      case "h1":
        bodyContent += `<h1 class="h1-heading">${text}</h1>\n`;
        break;
      case "h2":
        bodyContent += `<h2 class="h2-heading">${text}</h2>\n`;
        break;
      case "h3":
        bodyContent += `<h3 class="h3-heading">${text}</h3>\n`;
        break;
      case "bullet":
        bodyContent += `<ul class="bullet-list"><li>${text}</li></ul>\n`;
        break;
      case "p":
      default:
        bodyContent += `<p class="paragraph">${text}</p>\n`;
        break;
    }
  }

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${safeTitle}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page WordSection1 {
          size: 8.5in 11.0in;
          margin: 1.0in 1.0in 1.0in 1.0in;
          mso-header-margin: .5in;
          mso-footer-margin: .5in;
          mso-paper-source: 0;
        }
        div.WordSection1 {
          page: WordSection1;
          font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #1e293b;
        }
        .main-title {
          font-size: 24pt;
          font-weight: bold;
          color: #0f172a;
          margin-bottom: 6pt;
          margin-top: 0;
        }
        .doc-meta {
          font-size: 9.5pt;
          color: #64748b;
          margin-bottom: 14pt;
          margin-top: 0;
        }
        .stamp-box {
          display: inline-block;
          padding: 4pt 10pt;
          border: 2pt dashed #e11d48;
          color: #e11d48;
          font-weight: bold;
          font-size: 10pt;
          letter-spacing: 1.5pt;
          text-transform: uppercase;
          margin-bottom: 12pt;
        }
        .divider {
          border: none;
          border-top: 1pt solid #e2e8f0;
          margin: 16pt 0 20pt 0;
        }
        .h1-heading {
          font-size: 17pt;
          font-weight: bold;
          color: #0f172a;
          margin-top: 20pt;
          margin-bottom: 8pt;
          border-bottom: 1.5pt solid #0284c7;
          padding-bottom: 4pt;
        }
        .h2-heading {
          font-size: 13.5pt;
          font-weight: bold;
          color: #0284c7;
          margin-top: 16pt;
          margin-bottom: 6pt;
        }
        .h3-heading {
          font-size: 11.5pt;
          font-weight: 600;
          color: #334155;
          margin-top: 12pt;
          margin-bottom: 4pt;
        }
        .paragraph {
          font-size: 11pt;
          line-height: 1.55;
          color: #334155;
          margin-top: 0;
          margin-bottom: 9pt;
        }
        .bullet-list {
          margin-top: 0;
          margin-bottom: 9pt;
          padding-left: 20pt;
        }
        .bullet-list li {
          font-size: 11pt;
          color: #334155;
          margin-bottom: 4pt;
        }
      </style>
    </head>
    <body>
      <div class="WordSection1">
        ${bodyContent}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(["\ufeff", wordHtml], {
    type: "application/msword;charset=utf-8",
  });
  const safeFilename = (title || "Document").replace(/[^a-z0-9_-]/gi, "_");
  triggerDownload(blob, `${safeFilename}.doc`);
}

/**
 * Standard Markdown (.md) Exporter
 */
export function exportToMarkdown(
  title: string,
  paragraphs: ExportParagraph[],
  options: ExportOptions = {}
): void {
  let md = `# ${title || "Document"}\n\n`;
  const dateStr = new Date().toLocaleDateString(undefined, { dateStyle: "long" });
  md += `*Generated with Know Deep Document Studio · ${dateStr}*\n\n`;

  if (options.includeStamp && options.stampText) {
    md += `> **STATUS / STAMP**: \`${options.stampText}\`\n\n`;
  }

  md += `---\n\n`;

  for (const p of paragraphs) {
    if (!p.text.trim()) continue;

    switch (p.type) {
      case "h1":
        md += `\n# ${p.text}\n\n`;
        break;
      case "h2":
        md += `\n## ${p.text}\n\n`;
        break;
      case "h3":
        md += `\n### ${p.text}\n\n`;
        break;
      case "bullet":
        md += `- ${p.text}\n`;
        break;
      case "p":
      default:
        md += `${p.text}\n\n`;
        break;
    }
  }

  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const safeFilename = (title || "Document").replace(/[^a-z0-9_-]/gi, "_");
  triggerDownload(blob, `${safeFilename}.md`);
}

/**
 * Plain Text (.txt) Exporter
 */
export function exportToPlainText(
  title: string,
  paragraphs: ExportParagraph[]
): void {
  let txt = `${title.toUpperCase()}\n`;
  txt += `=".repeat(title.length)\n`;
  txt += `Exported: ${new Date().toLocaleString()}\n\n`;

  for (const p of paragraphs) {
    if (!p.text.trim()) continue;

    if (p.type === "h1") {
      txt += `\n\n=== ${p.text.toUpperCase()} ===\n\n`;
    } else if (p.type === "h2") {
      txt += `\n--- ${p.text} ---\n\n`;
    } else if (p.type === "h3") {
      txt += `\n[ ${p.text} ]\n`;
    } else if (p.type === "bullet") {
      txt += `  * ${p.text}\n`;
    } else {
      txt += `${p.text}\n\n`;
    }
  }

  const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
  const safeFilename = (title || "Document").replace(/[^a-z0-9_-]/gi, "_");
  triggerDownload(blob, `${safeFilename}.txt`);
}

/**
 * JSON AST Exporter
 */
export function exportToJson(
  title: string,
  paragraphs: ExportParagraph[],
  extraData?: any
): void {
  const data = {
    title,
    exportedAt: new Date().toISOString(),
    version: "2.0",
    paragraphs,
    ...extraData,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const safeFilename = (title || "Document").replace(/[^a-z0-9_-]/gi, "_");
  triggerDownload(blob, `${safeFilename}.json`);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
