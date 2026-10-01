import pptxgen from "pptxgenjs";
import { PresentationTheme } from "@/data/presentationThemes";

interface SlideData {
  slideNumber: number;
  layout: string;
  title: string;
  subtitle: string;
  bullets: string[];
  speakerNotes: string;
  visualDescription?: string;
  imageUrl?: string;
}

export async function exportToPowerPoint(
  slides: SlideData[],
  theme: PresentationTheme,
  deckTitle: string = "AI Presentation"
): Promise<void> {
  const pptx = new pptxgen();

  pptx.layout = "LAYOUT_16x9";
  pptx.author = "KnowDeep Ultra Presentation Studio";
  pptx.company = "KnowDeep AI";
  pptx.title = deckTitle;
  pptx.subject = deckTitle;

  // Clean hex colors (strip leading # for pptxgenjs)
  const cleanHex = (hex: string, fallback: string = "000000") => {
    if (!hex) return fallback;
    return hex.replace("#", "").toUpperCase();
  };

  const bgHex = cleanHex(theme.hexBg, "0F172A");
  const accentHex = cleanHex(theme.hexAccent, "38BDF8");
  const textHex = cleanHex(theme.hexText, "FFFFFF");
  const mutedHex = cleanHex(theme.hexMuted, "94A3B8");

  // Determine fonts based on fontPairing
  const fonts = theme.fontPairing.split("+").map((s) => s.trim());
  const headerFont = fonts[0] || "Arial";
  const bodyFont = fonts[1] || "Calibri";

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const slide = pptx.addSlide();

    // 1. Background
    slide.background = { color: bgHex };

    // 2. Presenter Notes
    if (s.speakerNotes) {
      slide.notes = s.speakerNotes;
    }

    // 3. Top Category/Header Badge
    slide.addText(
      [
        {
          text: `KNOWDEEP  |  SLIDE ${i + 1} OF ${slides.length}  |  ${theme.profession.toUpperCase()}`,
          options: {
            fontSize: 9,
            color: mutedHex,
            fontFace: bodyFont,
            bold: true,
            charSpacing: 2,
          },
        },
      ],
      {
        x: 0.8,
        y: 0.5,
        w: 11.5,
        h: 0.3,
        align: "left",
      }
    );

    // 4. Accent Decorative Line under header
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 0.85,
      w: 2.5,
      h: 0.04,
      fill: { color: accentHex },
      line: { color: accentHex },
    });

    // 5. Title & Subtitle
    if (s.layout === "title" || i === 0) {
      // Big Title Slide Layout
      slide.addText(
        [
          {
            text: s.title,
            options: {
              fontSize: 34,
              color: textHex,
              fontFace: headerFont,
              bold: true,
              breakLine: true,
            },
          },
          {
            text: s.subtitle,
            options: {
              fontSize: 18,
              color: accentHex,
              fontFace: bodyFont,
              bold: true,
              italic: true,
            },
          },
        ],
        {
          x: 0.8,
          y: 1.5,
          w: 11.5,
          h: 2.2,
          align: "left",
          valign: "top",
        }
      );

      // Bullets box for Title slide (key premises)
      if (s.bullets && s.bullets.length > 0) {
        const bulletItems = s.bullets.map((bullet) => ({
          text: bullet,
          options: {
            fontSize: 14,
            color: textHex,
            fontFace: bodyFont,
            bullet: { type: "bullet" as const, code: "25BA", color: accentHex },
            paraSpaceAfter: 12,
          },
        }));

        slide.addText(bulletItems, {
          x: 0.8,
          y: 3.8,
          w: 11.0,
          h: 2.6,
          align: "left",
          valign: "top",
        });
      }
    } else {
      // Content Slide Layout
      slide.addText(s.title, {
        x: 0.8,
        y: 1.1,
        w: 11.5,
        h: 0.9,
        fontSize: 26,
        color: textHex,
        fontFace: headerFont,
        bold: true,
        align: "left",
        valign: "middle",
      });

      slide.addText(s.subtitle, {
        x: 0.8,
        y: 1.9,
        w: 11.5,
        h: 0.5,
        fontSize: 14,
        color: accentHex,
        fontFace: bodyFont,
        bold: true,
        align: "left",
      });

      // Bullets
      if (s.bullets && s.bullets.length > 0) {
        const bulletItems = s.bullets.map((bullet) => ({
          text: bullet,
          options: {
            fontSize: 14,
            color: textHex,
            fontFace: bodyFont,
            bullet: { type: "bullet" as const, code: "2022", color: accentHex },
            paraSpaceAfter: 14,
          },
        }));

        slide.addText(bulletItems, {
          x: 0.8,
          y: 2.6,
          w: 11.0,
          h: 3.8,
          align: "left",
          valign: "top",
        });
      }
    }

    // 6. Footer
    slide.addText(
      [
        {
          text: `Confidential | ${deckTitle} | Theme: ${theme.name}`,
          options: {
            fontSize: 8,
            color: mutedHex,
            fontFace: bodyFont,
          },
        },
      ],
      {
        x: 0.8,
        y: 7.0,
        w: 9.0,
        h: 0.3,
        align: "left",
      }
    );

    slide.addText(
      [
        {
          text: `${i + 1}`,
          options: {
            fontSize: 9,
            color: accentHex,
            fontFace: bodyFont,
            bold: true,
          },
        },
      ],
      {
        x: 11.5,
        y: 7.0,
        w: 1.0,
        h: 0.3,
        align: "right",
      }
    );
  }

  const safeFileName = (deckTitle || "Presentation")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .substring(0, 40);

  await pptx.writeFile({ fileName: `${safeFileName}.pptx` });
}
