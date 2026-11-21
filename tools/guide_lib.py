"""Shared helpers for the two study guides: CSS, boxes, mind maps, charts, PDF build."""
import asyncio, html, math, re
from pathlib import Path
from playwright.async_api import async_playwright
from pypdf import PdfWriter

COL = dict(navy="#0b3954", teal="#04505a", green="#2f5a1c", rust="#8f3520", amber="#7a4412", plum="#5a2f38", violet="#3f3266", grey="#4a4a5a")
SOFT = dict(navy="#dbe9f3", teal="#d6eef0", green="#e1efd6", rust="#f6ddd4", amber="#f6e6cf", plum="#f0dde2", violet="#e4def5", grey="#e8e8ee")

CSS = """
@page { size: A4; }
* { box-sizing: border-box; }
body { font-family: Carlito, Calibri, sans-serif; font-size: 11.4pt; line-height: 1.42; color: #1c2430; margin: 0; }
h1, h2, h3, h4 { font-family: Poppins, sans-serif; line-height: 1.15; margin: 0; }
h2 { font-size: 17pt; margin: 0 0 6pt; }
h3 { font-size: 12.5pt; margin: 12pt 0 4pt; }
p { margin: 5pt 0; } ul, ol { margin: 4pt 0; padding-left: 18pt; } li { margin: 2pt 0; }
.math { font-family: "TeX Gyre Pagella", Palatino, serif; }
.section { page-break-before: always; }
.band { color: #fff; padding: 9pt 13pt; border-radius: 7pt; margin-bottom: 9pt; display: flex; justify-content: space-between; align-items: baseline; gap: 10pt; }
.band h2 { margin: 0; color: #fff; } .band .prog { white-space: nowrap; font: 600 9.5pt Poppins, sans-serif; opacity: .9; }
.box { border-radius: 7pt; padding: 8pt 11pt; margin: 8pt 0; page-break-inside: avoid; border: 1pt solid #c9d2da; }
.box .tag { font: 700 8.6pt Poppins, sans-serif; letter-spacing: .08em; display: block; margin-bottom: 2pt; }
.formula { text-align: center; font-family: "TeX Gyre Pagella", Palatino, serif; font-size: 13pt; margin: 7pt 0; padding: 6pt; background: #f3f5f8; border-radius: 6pt; page-break-inside: avoid; }
.formula .n { float: right; font: 9.5pt Carlito, sans-serif; color: #566578; }
figure { margin: 8pt 0; text-align: center; page-break-inside: avoid; }
figure svg { width: 92%; height: auto; margin: 0 auto; display: block; }
figure.full svg { width: 100%; }
figcaption { font-size: 9.8pt; color: #3c4858; margin-top: 3pt; text-align: left; }
table { border-collapse: collapse; width: 100%; font-size: 10.4pt; margin: 6pt 0; page-break-inside: avoid; }
th, td { border: .7pt solid #c3ccd6; padding: 4pt 6pt; text-align: left; vertical-align: top; }
th { background: #eef1f5; font-family: Poppins, sans-serif; font-size: 9.4pt; }
.nobreak { page-break-inside: avoid; }
.cols { column-count: 2; column-gap: 16pt; } .cols > * { break-inside: avoid; }
.q { page-break-inside: avoid; margin: 7pt 0; } .q b { font-family: Poppins, sans-serif; font-size: 10pt; }
.small { font-size: 10pt; } .muted { color: #566578; }
.chips { display: flex; flex-wrap: wrap; gap: 5pt; margin: 6pt 0; } .chips span { color: #fff; border-radius: 20pt; padding: 2pt 9pt; font: 600 9pt Poppins, sans-serif; }
.cheat { font-size: 9.9pt; line-height: 1.32; } .cheat .box { padding: 6pt 8pt; margin: 5pt 0; }
.key { font-size: 10.2pt; }
.cb { display: inline-block; width: 9pt; height: 9pt; border: 1pt solid #1c2430; margin-right: 5pt; vertical-align: -1pt; }
/* cover */
.cover { position: relative; width: 210mm; height: 297mm; overflow: hidden; color: #fff; }
.cover svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.cover .plate { position: absolute; left: 16mm; right: 16mm; background: rgba(8,16,28,.80); border-radius: 10pt; padding: 14pt 18pt; }
.cover .label { font: 600 11pt Poppins, sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #f1c232; }
.cover h1 { font-size: 31pt; margin: 6pt 0 6pt; }
.cover .sub { font-size: 13pt; }
.cover .foot { position: absolute; left: 16mm; right: 16mm; bottom: 10mm; font-size: 10pt; opacity: .9; }
"""

def esc(s): return html.escape(str(s), quote=False)

def band(title, k, n, color):
    return f'<div class="band" style="background:{COL[color]}"><h2>{title}</h2><span class="prog">Concept {k} of {n}</span></div>'

def box(tag, body, color="grey"):
    return f'<div class="box" style="background:{SOFT[color]};border-color:{COL[color]}55"><span class="tag" style="color:{COL[color]}">{tag}</span>{body}</div>'

def formula(body, n=None):
    return f'<div class="formula">{body}' + (f'<span class="n">({n})</span>' if n else '') + '</div>'

def fig(svg, caption, full=False):
    return f'<figure class="{"full" if full else ""}">{svg}<figcaption>{caption}</figcaption></figure>'

def tw(text, fs):  # text width estimate
    return len(text) * fs * 0.56

def wrap(text, maxchars):
    words, lines, cur = text.split(), [], ""
    for w in words:
        if len(cur) + len(w) + 1 > maxchars and cur: lines.append(cur); cur = w
        else: cur = (cur + " " + w).strip()
    if cur: lines.append(cur)
    return lines

def mindmap(centre, branches, color="navy", leaf_chars=20, fs=18):
    """Left/right tree. branches = [(label, [leaves])]. Width computed from text."""
    leaf_chars = min(leaf_chars, 20)
    right, left = branches[0::2], branches[1::2]
    lh = fs * 1.25
    def side_height(bs): return sum(max(40, len(sum((wrap(l, leaf_chars) for l in ls), [])) * lh + 14) + 10 for _, ls in bs)
    H = max(side_height(right), side_height(left), 70) + 20
    cw = tw(centre, fs + 2) + 30
    bw = max(tw(b, fs) + 24 for b, _ in branches)
    alll = [ln for _, ls in branches for l in ls for ln in wrap(l, leaf_chars)]
    lw = max(tw(ln, fs) for ln in alll) + 22 if alll else 0
    gap = 34
    half = cw / 2 + gap + bw + (12 + lw if lw else 0)
    W = 2 * half + 16; cx = W / 2; cy = H / 2
    out = [f'<svg viewBox="0 0 {W:.0f} {H:.0f}" xmlns="http://www.w3.org/2000/svg" font-family="Carlito, sans-serif">']
    def draw(bs, sign):
        y = (H - side_height(bs)) / 2 + 5
        for label, leaves in bs:
            lines = sum((wrap(l, leaf_chars) for l in leaves), [])
            h = max(40, len(lines) * lh + 14)
            by = y + h / 2
            bx = cx + sign * (cw / 2 + gap) if sign > 0 else cx - cw / 2 - gap - bw
            x1 = cx + sign * cw / 2; x2 = bx if sign > 0 else bx + bw
            out.append(f'<path d="M{x1:.0f},{cy:.0f} C{(x1 + x2) / 2:.0f},{cy:.0f} {(x1 + x2) / 2:.0f},{by:.0f} {x2:.0f},{by:.0f}" fill="none" stroke="{COL[color]}" stroke-width="2"/>')
            out.append(f'<rect x="{bx:.0f}" y="{by - 17:.0f}" width="{bw:.0f}" height="34" rx="17" fill="{SOFT[color]}" stroke="{COL[color]}" stroke-width="1.5"/>')
            out.append(f'<text x="{bx + bw / 2:.0f}" y="{by + fs * 0.35:.0f}" text-anchor="middle" font-size="{fs}" font-weight="700" fill="{COL[color]}">{esc(label)}</text>')
            ly = by - (len(lines) - 1) * lh / 2 + fs * 0.35
            li = 0
            for leaf in leaves:
                for j, ln in enumerate(wrap(leaf, leaf_chars)):
                    tx = bx + bw + 12 if sign > 0 else bx - 12
                    bullet = "• " if j == 0 else "  "
                    out.append(f'<text x="{tx:.0f}" y="{ly + li * lh:.0f}" text-anchor="{"start" if sign > 0 else "end"}" font-size="{fs}" fill="#1c2430">{esc(bullet + ln) if sign > 0 else esc(ln + (" •" if j == 0 else ""))}</text>')
                    li += 1
            y += h + 10
    draw(right, 1); draw(left, -1)
    out.append(f'<rect x="{cx - cw / 2:.0f}" y="{cy - 23:.0f}" width="{cw:.0f}" height="46" rx="23" fill="{COL[color]}"/>')
    out.append(f'<text x="{cx:.0f}" y="{cy + (fs + 2) * 0.35:.0f}" text-anchor="middle" font-size="{fs + 2}" font-weight="700" fill="#fff">{esc(centre)}</text></svg>')
    return "".join(out)

class Chart:
    def __init__(self, W=560, H=250, xr=(0, 1), yr=(0, 1), ml=52, mr=18, mt=14, mb=40, xlabel="", ylabel=""):
        self.W, self.H, self.xr, self.yr = W, H, xr, yr; self.ml, self.mr, self.mt, self.mb = ml, mr, mt, mb
        self.o = [f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" font-family="Carlito, sans-serif" font-size="13">']
        if xlabel: self.o.append(f'<text x="{ml + (W - ml - mr) / 2}" y="{H - 6}" text-anchor="middle" fill="#1c2430">{esc(xlabel)}</text>')
        if ylabel: self.o.append(f'<text transform="translate(13,{mt + (H - mt - mb) / 2}) rotate(-90)" text-anchor="middle" fill="#1c2430">{esc(ylabel)}</text>')
    def X(self, x): return self.ml + (x - self.xr[0]) / (self.xr[1] - self.xr[0]) * (self.W - self.ml - self.mr)
    def Y(self, y): return self.H - self.mb - (y - self.yr[0]) / (self.yr[1] - self.yr[0]) * (self.H - self.mt - self.mb)
    def axes(self, xt, yt, xf=str, yf=str):
        for y in yt:
            self.o.append(f'<line x1="{self.ml}" x2="{self.W - self.mr}" y1="{self.Y(y):.1f}" y2="{self.Y(y):.1f}" stroke="#d5dbe2"/>')
            self.o.append(f'<text x="{self.ml - 6}" y="{self.Y(y) + 4:.1f}" text-anchor="end" fill="#1c2430">{yf(y)}</text>')
        for x in xt:
            self.o.append(f'<text x="{self.X(x):.1f}" y="{self.H - self.mb + 16}" text-anchor="middle" fill="#1c2430">{xf(x)}</text>')
        self.o.append(f'<line x1="{self.ml}" x2="{self.W - self.mr}" y1="{self.Y(self.yr[0])}" y2="{self.Y(self.yr[0])}" stroke="#1c2430"/>')
        return self
    def line(self, pts, color, dash="", w=2.6):
        d = " ".join(f'{"M" if i == 0 else "L"}{self.X(x):.1f},{self.Y(y):.1f}' for i, (x, y) in enumerate(pts))
        self.o.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{w}" stroke-dasharray="{dash}" stroke-linejoin="round"/>'); return self
    def bar(self, x, y, w, color):
        self.o.append(f'<rect x="{self.X(x) - w / 2:.1f}" y="{self.Y(y):.1f}" width="{w}" height="{self.Y(self.yr[0]) - self.Y(y):.1f}" fill="{color}"/>'); return self
    def dot(self, x, y, color, r=4.5):
        self.o.append(f'<circle cx="{self.X(x):.1f}" cy="{self.Y(y):.1f}" r="{r}" fill="{color}"/>'); return self
    def label(self, x, y, text, color="#1c2430", anchor="start", dx=0, dy=0, bold=False):
        px, py = self.X(x) + dx, self.Y(y) + dy; w = tw(text, 13) + 8
        rx = px - 4 if anchor == "start" else px - w + 4 if anchor == "end" else px - w / 2
        self.o.append(f'<rect x="{rx:.1f}" y="{py - 13:.1f}" width="{w:.1f}" height="17" fill="#fff" opacity=".9"/>')
        self.o.append(f'<text x="{px:.1f}" y="{py:.1f}" text-anchor="{anchor}" fill="{color}" font-weight="{700 if bold else 400}">{esc(text)}</text>'); return self
    def raw(self, s): self.o.append(s); return self
    def svg(self): return "".join(self.o) + "</svg>"

def route_map(stops, title, blank=False, color="navy"):
    """Dashed route with numbered stops. stops = [label]."""
    W, H = 640, 330; n = len(stops)
    pts = []
    for i in range(n):
        t = i / (n - 1); x = 60 + t * (W - 120); y = H / 2 + (70 if i % 2 else -55) + 18 * math.sin(i * 1.7)
        pts.append((x, y))
    o = [f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" font-family="Carlito, sans-serif">',
         f'<rect width="{W}" height="{H}" rx="10" fill="#eef3ee"/>',
         f'<text x="16" y="24" font-size="14" font-weight="700" fill="{COL[color]}">{esc(title)}</text>']
    d = " ".join(f'{"M" if i == 0 else "L"}{x:.0f},{y:.0f}' for i, (x, y) in enumerate(pts))
    o.append(f'<path d="{d}" fill="none" stroke="#4a5562" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>')
    o.append(f'<path d="{d}" fill="none" stroke="#f1c232" stroke-width="1.6" stroke-dasharray="9 8"/>')
    for i, ((x, y), lab) in enumerate(zip(pts, stops)):
        o.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="15" fill="{COL[color]}" stroke="#fff" stroke-width="2.5"/>')
        o.append(f'<text x="{x:.0f}" y="{y + 5:.0f}" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">{i + 1}</text>')
        lines = wrap(lab, 15); w = max(tw(l, 12.5) for l in lines) + 12; hh = len(lines) * 15 + 6
        lx = min(max(x, w / 2 + 8), W - w / 2 - 8); ly = y + 22 if i % 2 else y - 22 - hh
        if blank:
            o.append(f'<rect x="{lx - 46:.0f}" y="{ly:.0f}" width="92" height="30" rx="4" fill="#fff" stroke="#1c2430" stroke-dasharray="4 3"/>')
        else:
            o.append(f'<rect x="{lx - w / 2:.0f}" y="{ly:.0f}" width="{w:.0f}" height="{hh}" rx="4" fill="#fff" stroke="{COL[color]}"/>')
            for j, l in enumerate(lines):
                o.append(f'<text x="{lx:.0f}" y="{ly + 15 + j * 15:.0f}" text-anchor="middle" font-size="12.5" fill="#1c2430">{esc(l)}</text>')
    return "".join(o) + "</svg>"

def page(body): return f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>{body}</body></html>'

async def _render(cover_html, body_html, out, footer):
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        await pg.set_content(page(cover_html)); await pg.pdf(path="_cover.pdf", format="A4", print_background=True, margin=dict(top="0", bottom="0", left="0", right="0"))
        await pg.set_content(page(body_html))
        await pg.pdf(path="_body.pdf", format="A4", print_background=True, display_header_footer=True, header_template="<span></span>",
                     footer_template=f'<div style="font-size:8pt;font-family:sans-serif;color:#566578;width:100%;padding:0 17mm;display:flex;justify-content:space-between"><span>{footer}</span><span class="pageNumber"></span></div>',
                     margin=dict(top="18mm", bottom="20mm", left="17mm", right="17mm"))
        await b.close()
    w = PdfWriter(); w.append("_cover.pdf"); w.append("_body.pdf"); w.write(out); w.close()

def build(cover_html, body_html, out, footer):
    left = re.findall(r"\{\{[A-Z_0-9]+\}\}", body_html); assert not left, left
    asyncio.run(_render(cover_html, body_html, out, footer)); print("wrote", out)
