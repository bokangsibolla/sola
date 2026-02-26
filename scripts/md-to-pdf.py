#!/usr/bin/env python3
"""Convert the-framework.md to a clean, well-formatted PDF using fpdf2."""

import re
import os
from fpdf import FPDF

INPUT = os.path.join(os.path.dirname(__file__), "..", "docs", "the-framework.md")
OUTPUT = os.path.join(os.path.dirname(__file__), "..", "docs", "the-framework.pdf")

# -- Fonts --
FONT_PATH = "/Library/Fonts/Arial Unicode.ttf"
FONT_FAMILY = "ArialUnicode"

# -- Colours --
BLACK = (30, 30, 30)
DARK_GREY = (60, 60, 60)
MID_GREY = (100, 100, 100)
LIGHT_GREY = (200, 200, 200)
RULE_GREY = (220, 220, 220)
TABLE_HEADER_BG = (242, 242, 242)
CODE_BG = (246, 246, 246)


class FrameworkPDF(FPDF):
    def __init__(self):
        super().__init__(format="A4")
        self.set_auto_page_break(auto=True, margin=25)
        self.set_margins(25, 25, 25)
        self.alias_nb_pages()

        # Register Unicode font
        self.add_font(FONT_FAMILY, "", FONT_PATH)
        self.add_font(FONT_FAMILY, "B", FONT_PATH)
        self.add_font(FONT_FAMILY, "I", FONT_PATH)
        self.add_font(FONT_FAMILY, "BI", FONT_PATH)

    def header(self):
        if self.page_no() > 1:
            self.set_font(FONT_FAMILY, "I", 8)
            self.set_text_color(*MID_GREY)
            self.cell(0, 8, "The Agent-Native Firm", align="L")
            self.ln(10)

    def footer(self):
        self.set_y(-20)
        self.set_font(FONT_FAMILY, "", 8)
        self.set_text_color(*MID_GREY)
        self.cell(0, 10, f"{self.page_no()}/{{nb}}", align="C")

    def h_rule(self):
        self.ln(4)
        y = self.get_y()
        self.set_draw_color(*RULE_GREY)
        self.line(25, y, self.w - 25, y)
        self.ln(6)

    def write_title(self, text):
        self.set_font(FONT_FAMILY, "B", 26)
        self.set_text_color(*BLACK)
        self.multi_cell(0, 12, text)
        self.ln(4)

    def write_subtitle(self, text):
        self.set_font(FONT_FAMILY, "I", 11)
        self.set_text_color(*MID_GREY)
        self.multi_cell(0, 6, text)
        self.ln(8)

    def write_h2(self, text):
        self.ln(6)
        self.set_font(FONT_FAMILY, "B", 17)
        self.set_text_color(*BLACK)
        self.multi_cell(0, 9, text)
        self.ln(3)

    def write_h3(self, text):
        self.ln(4)
        self.set_font(FONT_FAMILY, "B", 13)
        self.set_text_color(*DARK_GREY)
        self.multi_cell(0, 7, text)
        self.ln(2)

    def write_h4(self, text):
        self.ln(3)
        self.set_font(FONT_FAMILY, "B", 11)
        self.set_text_color(*DARK_GREY)
        self.multi_cell(0, 6, text)
        self.ln(1)

    def write_paragraph(self, text):
        self.set_font(FONT_FAMILY, "", 10)
        self.set_text_color(*DARK_GREY)
        self._write_rich_text(text, 10)
        self.ln(4)

    def write_bullet(self, text, indent=8):
        x = self.get_x()
        self.set_x(x + indent)
        self.set_font(FONT_FAMILY, "", 10)
        self.set_text_color(*DARK_GREY)

        bullet_str = "\u2022  "
        bullet_w = self.get_string_width(bullet_str)
        self.cell(bullet_w, 5, bullet_str)

        available_w = self.w - self.r_margin - self.get_x()
        self._write_rich_text(text.strip(), 10, w=available_w)
        self.set_x(25)
        self.ln(2)

    def write_numbered(self, number, text, indent=8):
        x = self.get_x()
        self.set_x(x + indent)
        self.set_font(FONT_FAMILY, "B", 10)
        self.set_text_color(*DARK_GREY)
        num_str = f"{number}. "
        num_w = self.get_string_width(num_str)
        self.cell(num_w, 5, num_str)
        self.set_font(FONT_FAMILY, "", 10)
        available_w = self.w - self.r_margin - self.get_x()
        self._write_rich_text(text.strip(), 10, w=available_w)
        self.set_x(25)
        self.ln(2)

    def write_code_block(self, lines):
        self.ln(2)
        self.set_fill_color(*CODE_BG)
        self.set_draw_color(*LIGHT_GREY)
        self.set_font(FONT_FAMILY, "", 8)
        self.set_text_color(*DARK_GREY)

        line_h = 4.2
        block_h = len(lines) * line_h + 8
        x_start = 25
        block_w = self.w - 50

        # Page break check
        if self.get_y() + block_h > self.h - 25:
            self.add_page()

        y_start = self.get_y()
        self.rect(x_start, y_start, block_w, block_h, style="DF")

        self.set_xy(x_start + 6, y_start + 4)
        for line in lines:
            self.set_x(x_start + 6)
            self.cell(block_w - 12, line_h, line.rstrip(), new_x="LMARGIN", new_y="NEXT")

        self.set_y(y_start + block_h + 2)
        self.ln(2)

    def write_table(self, headers, rows):
        self.ln(2)
        available_w = self.w - 50
        n_cols = len(headers)

        # Distribute column widths
        if n_cols == 2:
            col_ws = [available_w * 0.35, available_w * 0.65]
        elif n_cols == 3:
            col_ws = [available_w * 0.28, available_w * 0.36, available_w * 0.36]
        else:
            col_ws = [available_w / n_cols] * n_cols

        line_h = 5.5

        # Header row
        self.set_fill_color(*TABLE_HEADER_BG)
        self.set_draw_color(*LIGHT_GREY)
        self.set_font(FONT_FAMILY, "B", 8.5)
        self.set_text_color(*BLACK)
        x_start = 25
        self.set_x(x_start)

        # Measure header height
        header_texts = [self._strip_formatting(h) for h in headers]
        self._draw_row(x_start, col_ws, header_texts, line_h, fill=True, bold=True)

        # Data rows
        self.set_font(FONT_FAMILY, "", 8.5)
        self.set_text_color(*DARK_GREY)
        for row in rows:
            cell_texts = [self._strip_formatting(c).strip() for c in row]
            # Pad if needed
            while len(cell_texts) < n_cols:
                cell_texts.append("")
            self._draw_row(x_start, col_ws, cell_texts, line_h, fill=False, bold=False)

        self.ln(4)

    def _draw_row(self, x_start, col_ws, texts, line_h, fill=False, bold=False):
        """Draw a table row with proper multi-line cell handling."""
        # Calculate max lines needed
        max_h = line_h + 2
        for i, text in enumerate(texts):
            self.set_font(FONT_FAMILY, "B" if bold else "", 8.5)
            txt_w = self.get_string_width(text) + 4
            lines_needed = max(1, int(txt_w / col_ws[i]) + 1)
            cell_h = lines_needed * line_h + 2
            max_h = max(max_h, cell_h)

        # Page break
        if self.get_y() + max_h > self.h - 25:
            self.add_page()

        y_before = self.get_y()

        for i, text in enumerate(texts):
            self.set_xy(x_start + sum(col_ws[:i]), y_before)
            self.set_font(FONT_FAMILY, "B" if bold else "", 8.5)

            if fill:
                self.set_fill_color(*TABLE_HEADER_BG)

            # Draw cell border and fill
            self.rect(
                x_start + sum(col_ws[:i]), y_before,
                col_ws[i], max_h,
                style="DF" if fill else "D"
            )

            # Write text inside
            self.set_xy(x_start + sum(col_ws[:i]) + 2, y_before + 1)
            self.multi_cell(col_ws[i] - 4, line_h, text)

        self.set_y(y_before + max_h)

    def _strip_formatting(self, text):
        """Remove markdown bold/italic markers."""
        text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
        text = re.sub(r'\*(.+?)\*', r'\1', text)
        text = re.sub(r'`(.+?)`', r'\1', text)
        return text

    def _write_rich_text(self, text, size, w=None):
        """Write text with bold segments handled manually."""
        if w is None:
            w = self.w - self.r_margin - self.get_x()

        # fpdf2 markdown=True handles **bold** with Unicode fonts
        self.set_font(FONT_FAMILY, "", size)
        self.set_text_color(*DARK_GREY)
        self.multi_cell(w, 5, text, markdown=True)


def parse_markdown(filepath):
    """Parse markdown into structured blocks."""
    with open(filepath, "r") as f:
        content = f.read()

    lines = content.split("\n")
    blocks = []
    i = 0
    in_code = False
    code_lines = []
    in_table = False
    table_headers = []
    table_rows = []

    while i < len(lines):
        line = lines[i]

        # Code block toggle
        if line.strip().startswith("```"):
            if in_code:
                blocks.append(("code", code_lines))
                code_lines = []
                in_code = False
            else:
                if in_table:
                    blocks.append(("table", (table_headers, table_rows)))
                    table_headers, table_rows = [], []
                    in_table = False
                in_code = True
            i += 1
            continue

        if in_code:
            code_lines.append(line)
            i += 1
            continue

        # Table
        if "|" in line and line.strip().startswith("|"):
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if all(re.match(r'^[-:]+$', c) for c in cells):
                i += 1
                continue
            if not in_table:
                table_headers = cells
                in_table = True
            else:
                table_rows.append(cells)
            i += 1
            continue
        else:
            if in_table:
                blocks.append(("table", (table_headers, table_rows)))
                table_headers, table_rows = [], []
                in_table = False

        stripped = line.strip()

        if stripped == "---":
            blocks.append(("hr", None))
        elif stripped.startswith("# ") and not stripped.startswith("## "):
            blocks.append(("h1", stripped[2:].strip()))
        elif stripped.startswith("## "):
            blocks.append(("h2", stripped[3:].strip()))
        elif stripped.startswith("### "):
            blocks.append(("h3", stripped[4:].strip()))
        elif stripped.startswith("#### "):
            blocks.append(("h4", stripped[5:].strip()))
        elif re.match(r'^(\d+)\.\s+(.+)', stripped):
            m = re.match(r'^(\d+)\.\s+(.+)', stripped)
            blocks.append(("numbered", (m.group(1), m.group(2))))
        elif stripped.startswith("- ") or stripped.startswith("* "):
            blocks.append(("bullet", stripped[2:]))
        elif stripped == "":
            blocks.append(("empty", None))
        elif stripped.startswith("*") and stripped.endswith("*") and not stripped.startswith("**"):
            blocks.append(("italic_para", stripped[1:-1]))
        else:
            blocks.append(("para", stripped))

        i += 1

    if in_table:
        blocks.append(("table", (table_headers, table_rows)))
    if in_code:
        blocks.append(("code", code_lines))

    return blocks


def build_pdf(blocks, output_path):
    pdf = FrameworkPDF()
    pdf.add_page()

    is_first = True

    for btype, data in blocks:
        if btype == "h1":
            if is_first:
                pdf.ln(25)
                pdf.write_title(data)
                is_first = False
            else:
                pdf.write_title(data)

        elif btype == "h2":
            pdf.write_h2(data)

        elif btype == "h3":
            pdf.write_h3(data)

        elif btype == "h4":
            pdf.write_h4(data)

        elif btype == "para":
            pdf.write_paragraph(data)

        elif btype == "italic_para":
            pdf.set_font(FONT_FAMILY, "I", 10)
            pdf.set_text_color(*MID_GREY)
            pdf.multi_cell(0, 5, data)
            pdf.ln(3)

        elif btype == "bullet":
            pdf.write_bullet(data)

        elif btype == "numbered":
            num, text = data
            pdf.write_numbered(num, text)

        elif btype == "code":
            pdf.write_code_block(data)

        elif btype == "table":
            headers, rows = data
            pdf.write_table(headers, rows)

        elif btype == "hr":
            pdf.h_rule()

    pdf.output(output_path)
    return output_path


if __name__ == "__main__":
    blocks = parse_markdown(INPUT)
    out = build_pdf(blocks, OUTPUT)
    size_kb = os.path.getsize(out) / 1024
    print(f"PDF generated: {out}")
    print(f"Size: {size_kb:.0f} KB")
