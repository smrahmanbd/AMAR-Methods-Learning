// Shared layout + helpers for the two lecture decks (pptxgenjs, 13.33 x 7.5 in).
const pptxgen = require("pptxgenjs");
const SK = "/root/.claude/skills/synced/9f546bc9-8dbf-41ff-9cd7-426515b802c8_7324fcbe-41af-4cee-b386-5161b75f78d3/pptx";
const { applyTheme } = require(SK + "/scripts/apply_theme.js");

const THEME = { name: "AMAR Methods Learning", headFontFace: "Arial", bodyFontFace: "Calibri",
  colors: { dk1: "14213D", lt1: "FFFFFF", dk2: "46506A", lt2: "F1EFE7", accent1: "1F6F8B", accent2: "B26A00", accent3: "B8432F", accent4: "E9A63A", accent5: "6B4FA0", accent6: "2F8F5B", hlink: "1F6F8B", folHlink: "7A4FB5" } };
const HEX = THEME.colors;

function make(title, footer) {
  const pres = new pptxgen(); pres.layout = "LAYOUT_WIDE"; pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  pres.title = title; pres.author = "AMAR Methods Learning";
  const C = pres.SchemeColor;
  const lamps = (dark) => [0, 1, 2].map(i => ({ rect: { x: 12.1 + i * 0.27, y: 0.42, w: 0.2, h: 0.2, fill: { color: [C.accent3, C.accent4, C.accent6][i] }, line: { color: dark ? C.text1 : C.background1, width: 0 } } }));
  pres.defineSlideMaster({ title: "TITLE", background: { color: C.text1 },
    objects: [{ rect: { x: 0, y: 5.1, w: 13.33, h: 0.9, fill: { color: C.text2 } } }, { rect: { x: 8.9, y: 0, w: 0.9, h: 7.5, fill: { color: C.text2 } } },
      { placeholder: { options: { name: "title", type: "title", x: 0.7, y: 1.3, w: 7.8, h: 2.2, fontSize: 40, bold: true, color: C.background1, align: "left", valign: "top", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.7, y: 3.6, w: 7.8, h: 1.2, fontSize: 20, color: C.background2, align: "left", valign: "top", margin: 0 }, text: "" } }] });
  pres.defineSlideMaster({ title: "SECTION", background: { color: C.text1 },
    objects: [{ placeholder: { options: { name: "title", type: "title", x: 0.7, y: 2.6, w: 11.5, h: 1.3, fontSize: 40, bold: true, color: C.background1, align: "left", valign: "top", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.7, y: 4.0, w: 11.5, h: 1.2, fontSize: 20, color: C.background2, align: "left", valign: "top", margin: 0 }, text: "" } }] });
  pres.defineSlideMaster({ title: "CONTENT", background: { color: C.background1 },
    objects: [...lamps(false),
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.4, w: 11.2, h: 0.95, fontSize: 34, bold: true, color: C.text1, align: "left", valign: "middle", margin: 0 }, text: "" } },
      { text: { text: footer, options: { x: 0.6, y: 6.98, w: 10, h: 0.3, fontSize: 10, color: C.text2, margin: 0 } } }],
    slideNumber: { x: 12.2, y: 6.98, w: 0.6, h: 0.3, fontSize: 10, color: C.text2, align: "right" } });

  const H = {
    pres, C,
    slide(section, title, notes, master = "CONTENT") { const s = pres.addSlide({ masterName: master, sectionTitle: section }); s.addText(title, { placeholder: "title" }); if (notes) s.addNotes(notes); return s; },
    text(s, t, x, y, w, h, o = {}) { s.addText(t, Object.assign({ x, y, w, h, isTextBox: true, margin: 0, fontSize: 16, color: C.text1, valign: "top" }, o)); },
    card(s, x, y, w, h, title, body, color = C.accent1, o = {}) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.12, fill: { color: o.fill || C.background2 }, line: { color: o.fill || C.background2, width: 0 } });
      let ty = y + 0.2;
      if (title) { H.text(s, title, x + 0.25, ty, w - 0.5, 0.4, { fontSize: o.titleSize || 18, bold: true, color }); ty += 0.48; }
      if (body) H.text(s, body, x + 0.25, ty, w - 0.5, h - (ty - y) - 0.15, { fontSize: o.bodySize || 15 });
    },
    lamp(s, x, y, d, color, label, o = {}) { s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { color, width: 0 } }); if (label !== undefined) H.text(s, String(label), x, y, d, d, { align: "center", valign: "middle", bold: true, fontSize: o.fontSize || 16, color: o.color || C.background1 }); },
    stat(s, x, y, w, num, label, color = C.accent1) { H.text(s, num, x, y, w, 1.1, { fontSize: 54, bold: true, color, valign: "middle" }); H.text(s, label, x, y + 1.15, w, 0.9, { fontSize: 15, color: C.text2 }); },
    line(s, x1, y1, x2, y2, color = C.text2, width = 1, o = {}) { s.addShape(pres.shapes.LINE, Object.assign({ x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), flipV: (x2 - x1) * (y2 - y1) < 0, line: Object.assign({ color, width }, o) })); },
    bullets(s, items, x, y, w, h, o = {}) { s.addText(items.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < items.length - 1, paraSpaceAfter: 8 } })), Object.assign({ x, y, w, h, isTextBox: true, margin: 0, fontSize: 16, color: C.text1, valign: "top" }, o)); },
    chartBase: { catAxisLabelColor: HEX.dk2, valAxisLabelColor: HEX.dk2, catAxisLabelFontSize: 12, valAxisLabelFontSize: 12, catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", valGridLine: { color: "D5DBE2", size: 0.75 }, catGridLine: { style: "none" }, dataLabelColor: HEX.dk1, dataLabelFontSize: 11, dataLabelFontFace: "+mn-lt", legendFontFace: "+mn-lt", legendFontSize: 12, legendColor: HEX.dk1, titleFontFace: "+mn-lt" },
    async save(file) { await pres.writeFile({ fileName: file }); await applyTheme(file, THEME); console.log("wrote", file); },
  };
  return H;
}
module.exports = { make, HEX };
