#!/usr/bin/env python3
"""Generate the Sola PR Strategy & Press Materials PDF."""

from fpdf import FPDF, XPos, YPos
import os

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))


def sanitize(text):
    """Replace Unicode characters unsupported by Helvetica with ASCII equivalents."""
    return (text
            .replace("\u2014", " -- ")   # em dash
            .replace("\u2013", " - ")    # en dash
            .replace("\u2018", "'")      # left single quote
            .replace("\u2019", "'")      # right single quote
            .replace("\u201c", '"')      # left double quote
            .replace("\u201d", '"')      # right double quote
            .replace("\u2026", "...")     # ellipsis
            .replace("\u2022", "-")      # bullet
            .replace("\u00e9", "e")      # e-acute
            )


class SolaPDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=25)

    def header(self):
        if self.page_no() > 1:
            self.set_font("Helvetica", "I", 8)
            self.set_text_color(150, 150, 150)
            self.cell(0, 10, sanitize("Sola -- PR Strategy & Press Materials -- March 8, 2026"), align="R", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            self.ln(2)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def cover_page(self):
        self.add_page()
        self.ln(60)
        self.set_font("Helvetica", "B", 32)
        self.set_text_color(30, 30, 30)
        self.cell(0, 15, "Sola", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(5)
        self.set_font("Helvetica", "", 16)
        self.set_text_color(80, 80, 80)
        self.cell(0, 10, "PR Strategy & Press Materials", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(5)
        self.set_font("Helvetica", "", 12)
        self.cell(0, 10, "International Women's Day - March 8, 2026", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(30)
        self.set_font("Helvetica", "I", 11)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, "The information women deserve.", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(40)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(120, 120, 120)
        self.cell(0, 7, "Prepared for internal use", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.cell(0, 7, "Bokang Sibolla  |  Aigerim Tabazhanova  |  Clemence Casali  |  Sergio Ruiz Moral", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    def section_title(self, title, subtitle=None):
        self.add_page()
        self.ln(10)
        self.set_font("Helvetica", "B", 22)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 12, sanitize(title), align="L", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        if subtitle:
            self.ln(3)
            self.set_font("Helvetica", "I", 11)
            self.set_text_color(100, 100, 100)
            self.multi_cell(0, 7, sanitize(subtitle), align="L", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(8)

    def heading(self, text, size=14):
        self.ln(6)
        self.set_font("Helvetica", "B", size)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 8, sanitize(text), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(3)

    def subheading(self, text):
        self.ln(4)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(60, 60, 60)
        self.multi_cell(0, 7, sanitize(text), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(2)

    def body(self, text):
        self.set_font("Helvetica", "", 10.5)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 6.5, sanitize(text), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(3)

    def body_italic(self, text):
        self.set_font("Helvetica", "I", 10.5)
        self.set_text_color(60, 60, 60)
        self.multi_cell(0, 6.5, sanitize(text), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(3)

    def bullet(self, bold_text, text):
        self.set_font("Helvetica", "", 10.5)
        self.set_text_color(40, 40, 40)
        self.cell(5, 6.5, "- ")
        self.set_font("Helvetica", "B", 10.5)
        self.write(6.5, sanitize(bold_text) + " ")
        self.set_font("Helvetica", "", 10.5)
        self.multi_cell(0, 6.5, sanitize(text), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(1.5)

    def simple_bullet(self, text):
        self.set_font("Helvetica", "", 10.5)
        self.set_text_color(40, 40, 40)
        self.cell(5, 6.5, "- ")
        self.multi_cell(0, 6.5, sanitize(text), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(1.5)

    def table_row(self, col1, col2, col3=None, header=False):
        if header:
            self.set_font("Helvetica", "B", 9)
            self.set_fill_color(240, 240, 240)
        else:
            self.set_font("Helvetica", "", 9)
            self.set_fill_color(255, 255, 255)
        self.set_text_color(40, 40, 40)

        if col3:
            w1, w2, w3 = 30, 65, 75
            h = 7
            self.cell(w1, h, col1, border=1, fill=header)
            self.cell(w2, h, col2, border=1, fill=header)
            self.cell(w3, h, col3, border=1, fill=header, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        else:
            w1, w2 = 55, 115
            h = 7
            self.cell(w1, h, col1, border=1, fill=header)
            self.cell(w2, h, col2, border=1, fill=header, new_x=XPos.LMARGIN, new_y=YPos.NEXT)


def build_pdf():
    pdf = SolaPDF()
    pdf.alias_nb_pages()

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    pdf.cover_page()

    # =========================================================================
    # INTERNAL NOTE
    # =========================================================================
    pdf.add_page()
    pdf.ln(15)
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 10, "A Note on the Founding Team", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(8)
    pdf.set_font("Helvetica", "", 10.5)
    pdf.set_text_color(40, 40, 40)
    pdf.multi_cell(0, 6.5, sanitize(
        "Sola has four cofounders: Bokang Sibolla, Aigerim Tabazhanova, Clemence Casali, "
        "and Sergio Ruiz Moral."
    ), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(3)
    pdf.multi_cell(0, 6.5, sanitize(
        "For the purposes of this PR campaign, the front-facing narrative features three "
        "cofounders: Bokang, Aigerim, and Clemence. This is a deliberate editorial decision "
        "to maintain balance in the story we are telling. The campaign centres the gender data "
        "gap and the experiences of women travelers. Presenting two men and two women in the "
        "founding narrative risks shifting attention away from that focus. One man in the story "
        "adds nuance. Two changes the frame."
    ), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(3)
    pdf.multi_cell(0, 6.5, sanitize(
        "Sergio is a cofounder of Sola. His contributions to building this company are real "
        "and valued. This decision is about narrative strategy for a specific campaign tied to "
        "International Women's Day, not about his role in the company. Sergio's story and "
        "contributions will be featured in future communications, profiles, and press as we "
        "grow beyond this initial moment."
    ), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(3)
    pdf.set_font("Helvetica", "I", 10.5)
    pdf.set_text_color(100, 100, 100)
    pdf.multi_cell(0, 6.5, "This page is for internal reference only and should not be shared externally.", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # =========================================================================
    # TABLE OF CONTENTS
    # =========================================================================
    pdf.add_page()
    pdf.ln(10)
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 12, "Contents", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(10)

    toc_items = [
        ("1", "Core Thesis & Positioning"),
        ("2", "Three-Layer Outreach Strategy"),
        ("3", "The Founding Manifesto: \"The Information Women Deserve\""),
        ("4", "Press Release"),
        ("5", "Open Letter to the Travel Industry"),
        ("6", "Tactical Outreach Playbook"),
    ]
    for num, title in toc_items:
        pdf.set_font("Helvetica", "", 12)
        pdf.set_text_color(60, 60, 60)
        pdf.cell(0, 10, f"  {num}.   {title}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # =========================================================================
    # SECTION 1: CORE THESIS & POSITIONING
    # =========================================================================
    pdf.section_title(
        "1. Core Thesis & Positioning",
        "The central argument that underpins all press materials and outreach."
    )

    pdf.heading("The Argument")
    pdf.body(
        "The travel industry has a gender data gap. Every year, millions of women spend "
        "uncounted hours performing research that the industry should have already provided. "
        "Safety information, harassment norms, dress code navigation, solo-friendly accommodation, "
        "healthcare access, cultural rules around women's movement. This is invisible labor. "
        "It is unpaid. And it subsidises an industry that was designed around a default traveler "
        "who doesn't need any of it."
    )
    pdf.body(
        "Sola reframes this gap as a systemic design failure and builds the infrastructure "
        "to close it permanently. The product was built on 400+ face-to-face conversations "
        "with solo female travelers. No surveys. No focus groups. Ethnographic-level primary research "
        "conducted over months in one of the world's busiest solo travel corridors."
    )

    pdf.heading("Positioning by Audience")

    pdf.subheading("Academics / Harvard Business Review")
    pdf.body(
        "A $9.5 trillion industry that never designed its core information product for half "
        "its users. The economics of a gender data gap."
    )
    pdf.subheading("Tech / Startup Press")
    pdf.body(
        "Zero funding, no engineers. Domain expertise meets democratised tools. "
        "What happens when the people who understand the problem get the ability to build the solution."
    )
    pdf.subheading("Travel Media")
    pdf.body(
        "400 conversations in Manila. The travel product none of them had ever been offered."
    )
    pdf.subheading("Women's / Culture Publications")
    pdf.body(
        "She was on sabbatical. She bought a laptop the next day."
    )
    pdf.subheading("LinkedIn / Viral")
    pdf.body(
        "The travel industry collects data on everything except what women actually need to know."
    )

    # =========================================================================
    # SECTION 2: THREE-LAYER OUTREACH STRATEGY
    # =========================================================================
    pdf.section_title(
        "2. Three-Layer Outreach Strategy",
        "Build the wave organically, then let press amplify it."
    )

    pdf.heading("Layer 1: Founder-Led Content (March 1-7)")
    pdf.body("Build organic momentum before press hits. Each founder publishes personal content on LinkedIn that establishes credibility, tells the human story, and creates a searchable trail for journalists doing due diligence.")
    pdf.ln(2)

    pdf.subheading("March 1 --Bokang Sibolla (LinkedIn)")
    pdf.body("Long-form post: \"I spent months outside Manila hostels talking to 400 solo female travelers. Here's what the travel industry is missing.\" Data-forward. No product mention until the last line.")

    pdf.subheading("March 3 --Clemence Casali (LinkedIn / Medium)")
    pdf.body("Personal essay: \"I was on sabbatical. I wasn't supposed to work. Then I heard an idea I couldn't walk away from.\" The laptop moment. The sabbatical extension. What made her abandon rest for this.")

    pdf.subheading("March 5 --Aigerim Tabazhanova (LinkedIn)")
    pdf.body("\"What I wish existed every time I traveled alone.\" Her experience as a solo female traveler from Kazakhstan navigating Southeast Asia. Raw. First-person. The daughter angle: building what she wants to exist for the next generation.")

    pdf.subheading("March 6 --Bokang Sibolla (LinkedIn)")
    pdf.body("The framework post: \"The Gender Data Gap in Travel: An Invisible Subsidy.\" The intellectual anchor. Cite Caroline Criado Perez. Reference the 400 conversations. Introduce the concept of information labor. This is the post academics and journalists bookmark.")

    pdf.subheading("March 7 --All Three Founders")
    pdf.body("Cross-share each other's posts. Unified message: \"Tomorrow, we're telling the full story.\"")

    pdf.heading("Layer 2: Targeted Press Pitches (Embargoed, Sent March 1-3, Breaking March 8)")
    pdf.body("Each publication gets a different story. Not the same press release repackaged. Each outlet should feel they have something unique.")

    pdf.subheading("Tier 1: The Intellectual Heavyweights (Op-Ed / Contributed Article)")
    pdf.ln(2)
    pdf.bullet("Harvard Business Review:", "\"The Gender Data Gap in Travel: How a $9.5 Trillion Industry Overlooked Half Its Users.\" Bokang writes a contributed piece framing the systemic failure, the methodology, and what user-centred design actually means when you decentre the default user.")
    pdf.bullet("MIT Technology Review:", "\"What Happens When the People With the Problem Get the Tools to Solve It.\" The democratised-tools angle. No engineers, domain expertise, what this means for who gets to build the future.")
    pdf.bullet("Stanford Social Innovation Review:", "\"Closing Information Gaps as a Form of Economic Justice.\" Sola as a case study in information equity. Community-sourced knowledge networks correcting systemic data gaps.")
    pdf.bullet("Fast Company:", "\"World Changing Ideas\" submission + feature pitch. Three people, three continents, zero funding.")

    pdf.subheading("Tier 2: Startup & Tech Press")
    pdf.ln(2)
    pdf.bullet("Forbes:", "Two angles: (1) Forbes Innovation --the bootstrapped platform story. (2) Forbes Next 1000 / Under 30 --apply for lists, use the PR moment to support the application.")
    pdf.bullet("TechCrunch:", "\"No funding, no engineers: how three founders built a travel platform from a Manila apartment.\"")
    pdf.bullet("Wired:", "\"The travel industry's data problem isn't about algorithms --it's about who the algorithms were built for.\"")
    pdf.bullet("Rest of World:", "The Southeast Asia angle, the Global South perspective, Manila as a launchpad.")

    pdf.subheading("Tier 3: Travel & Women's Media")
    pdf.ln(2)
    pdf.bullet("Conde Nast Traveler:", "\"400 solo female travelers told us what no guidebook covers.\"")
    pdf.bullet("Lonely Planet:", "\"The information gap every woman traveler knows but no platform addressed.\"")
    pdf.bullet("The Cut / Refinery29:", "Lead with Clemence. \"She was on sabbatical. She bought a laptop the next day.\"")
    pdf.bullet("Elle / Marie Claire:", "\"What solo female travel actually requires that the industry ignores.\"")
    pdf.bullet("Cosmopolitan:", "\"The app built on what 400 women wished they'd known before traveling alone.\"")

    pdf.subheading("Tier 4: Regional & African Press")
    pdf.ln(2)
    pdf.bullet("Mail & Guardian (South Africa):", "\"From Lesotho to Manila: the South African building a global travel platform with zero funding.\"")
    pdf.bullet("TechCabal / Disrupt Africa:", "The African founder in Southeast Asia tech story.")
    pdf.bullet("Channel NewsAsia:", "The Manila-based startup angle, Southeast Asia travel corridor.")
    pdf.bullet("Philippine Daily Inquirer:", "Local angle: built in Manila, serving travelers coming to the Philippines.")

    pdf.heading("Layer 3: The March 8 Moment")
    pdf.body("This is not a launch day. The product is already live. This is a declaration day.")
    pdf.ln(2)
    pdf.bullet("The Founding Manifesto:", "\"The Information Women Deserve\" --published on Sola's website. 800 words. The argument, the evidence, the mission, the invitation. This is what you link everywhere.")
    pdf.bullet("The Open Letter:", "Addressed to the travel industry. Respectful but unflinching. Three unfunded founders addressing a $9.5 trillion industry. Inherently newsworthy.")
    pdf.bullet("The Partnership Invitation:", "Formal call for women's travel organizations, academic researchers, solo female travel creators, impact investors, and the industry itself to join in closing the gap.")

    # =========================================================================
    # SECTION 3: THE FOUNDING MANIFESTO
    # =========================================================================
    pdf.section_title(
        "3. The Founding Manifesto",
        "\"The Information Women Deserve\" --Published on Sola's website, March 8, 2026."
    )

    pdf.heading("The Information Women Deserve", size=16)

    pdf.body(
        "She checks the lock twice. She screenshots the hotel address and sends it to a friend "
        "in another timezone with the message \"just in case.\" She changes out of the dress she "
        "wanted to wear because she read somewhere that it draws attention here, though she's not "
        "sure where she read it, and there's no one reliable to ask. She budgets an extra hour "
        "before every travel day. Not for packing. For the research no one did for her."
    )
    pdf.body(
        "She does this invisibly. Automatically. In every country. On every trip."
    )
    pdf.body(
        "The $9.5 trillion travel industry can tell her the optimal day to book a flight, "
        "the trending restaurants in Lisbon, the best time to see the Northern Lights. It has "
        "never once built a product that accounts for any of this."
    )
    pdf.body(
        "Women are the fastest-growing segment in travel. Solo female travel is expanding at a rate "
        "the industry loves to cite in trend reports and investor decks. They celebrate the growth. "
        "They market to it. Then they hand women the same information they hand everyone else, "
        "designed around a traveler who has never had to think about any of the things she thinks "
        "about every single day."
    )
    pdf.body(
        "Some have tried to address this. Communities have formed. WhatsApp groups. Reddit threads. "
        "Blog posts written at 2am by someone who wished she'd been warned. These efforts are real. "
        "But they are scattered, unsearchable, and entirely dependent on women volunteering their "
        "time for free. There is no living, structured, evolving dataset of what women actually need "
        "to know. Only the goodwill of strangers, passed from one woman to the next like an "
        "inheritance no one asked for."
    )
    pdf.body(
        "That is the invisible subsidy. Women performing unpaid information labor to compensate "
        "for an industry that never considered their experience worth designing for."
    )

    pdf.ln(3)
    pdf.heading("We didn't set out to build a company. We set out because it was personal.", size=12)

    pdf.body(
        "Aigerim is a solo traveler. She has been for years. She has navigated every version "
        "of this gap and found her way through it. But she has a daughter. The thought that her "
        "daughter might one day travel the world the way she has --and face the same absence, "
        "the same hours of invisible work, the same unanswered questions --was something she "
        "couldn't sit with. Not when she knew exactly what was missing."
    )
    pdf.body(
        "Clemence was on sabbatical in the Philippines. She was not supposed to be working. "
        "For months she'd been making travel guides for her mother and sister, both travelers, "
        "noting the places to stay, the things she wished they'd know before arriving. Doing it "
        "for love, the way women always have. Then she heard what we were building. She bought a "
        "laptop the next day. The sabbatical was over."
    )
    pdf.body(
        "Bokang grew up with a single mother. She was a diplomat who raised two children while "
        "moving across the world. He remembers her asking them --her children --to come along "
        "when she went out, because she felt safer with someone beside her. He remembers the "
        "places she avoided. The calculations she made quietly. Years later, living in Manila "
        "near two of the city's most popular hostels, he watched hundreds of women arrive carrying "
        "the same questions his mother once carried. He spoke to over 400 of them. The gap between "
        "what they needed and what existed was not subtle."
    )
    pdf.body(
        "Three people. Three continents. South Africa, France, Kazakhstan. We met in Manila "
        "with nothing in common except the certainty that this could not remain unsolved."
    )

    pdf.ln(3)
    pdf.heading("We built Sola with no funding, no institutional backing, and no permission.", size=12)

    pdf.body(
        "We received guidance from people who gave their time because they believed in what we "
        "were doing. Industry experts who sat with us for hours. Advisors who opened their networks. "
        "People who had every reason to be too busy and chose not to be. We built with what we had "
        "and the conviction that waiting for someone else was no longer an option."
    )
    pdf.body("Sola is live. But an information gap this large does not get closed by three people. It gets closed by a network.")

    pdf.ln(3)
    pdf.heading("This is an invitation.", size=12)

    pdf.body(
        "To women's travel organizations: help us build the most comprehensive living resource "
        "ever created for women who travel."
    )
    pdf.body(
        "To researchers and academics: the question of who information systems are designed for "
        "extends far beyond travel. We welcome the inquiry."
    )
    pdf.body(
        "To solo female travelers already doing this work for free in blog posts and group chats: "
        "your knowledge has value. We built a platform that treats it that way."
    )
    pdf.body(
        "To organizations that fund gender equity: information is infrastructure."
    )
    pdf.body(
        "And to the travel industry: you have the reach. We have the research. The question "
        "is whether you're ready to build for the users you've been overlooking."
    )

    pdf.ln(5)
    pdf.body_italic("Sola. The information women deserve.")

    # =========================================================================
    # SECTION 4: PRESS RELEASE
    # =========================================================================
    pdf.section_title(
        "4. Press Release",
        "For distribution to media outlets. Embargoed until March 8, 2026."
    )

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(0, 6, "FOR IMMEDIATE RELEASE - MARCH 8, 2026", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(5)

    pdf.heading("Three Founders From Three Continents Built the Travel Platform the $9.5 Trillion Industry Never Did", size=14)

    pdf.body_italic(
        "After 400 conversations with solo female travelers, Sola launches the first living "
        "knowledge platform designed around what women actually need to know."
    )

    pdf.body(
        "MANILA, PHILIPPINES -- Women are the fastest-growing segment in global travel. They are also the most "
        "underserved by the industry profiting from their growth. Sola, a travel knowledge platform "
        "built by three founders from South Africa, France, and Kazakhstan, launches its public "
        "mission today with a simple premise: the information women need to travel safely, freely, "
        "and confidently has never been systematically built. So they built it."
    )
    pdf.body(
        "Founded in Manila by Bokang Sibolla, Aigerim Tabazhanova, and Clemence Casali, Sola was "
        "developed through direct conversations with over 400 solo female travelers across Southeast "
        "Asia. The research revealed a consistent and measurable gap: mainstream travel resources fail "
        "to address the safety, cultural, logistical, and health information that women require and "
        "routinely spend hours compiling on their own."
    )
    pdf.body(
        "\"Every woman we spoke to described the same experience,\" said Sibolla. \"Hours of research "
        "before every trip that no guidebook, no platform, no app accounted for. Not because the "
        "information doesn't exist, but because no one thought to structure it. That's not a niche "
        "problem. It's a design failure at the centre of a $9.5 trillion industry.\""
    )
    pdf.body(
        "Sola addresses what the founding team describes as the \"gender data gap in travel,\" "
        "a term inspired by Caroline Criado Perez's research on gender bias in data systems. While "
        "existing travel platforms optimise for price, convenience, and discovery, Sola focuses on "
        "the layer of information women are currently forced to assemble themselves: neighbourhood "
        "safety, cultural dress norms, solo-friendly accommodation, local harassment dynamics, "
        "healthcare and pharmacy access, and transport considerations specific to women traveling alone."
    )
    pdf.body(
        "The platform was built without venture capital or institutional funding. The founding team "
        "developed Sola with the voluntary support of industry advisors, including experts from "
        "leading travel technology companies and serial entrepreneurs who contributed strategy, "
        "business guidance, and technical mentorship."
    )
    pdf.body(
        "\"I was on sabbatical,\" said Casali. \"I had been making travel guides for my mother and "
        "sister for months. When I heard what Bokang and Aigerim were building, I knew it was the "
        "structured version of what I'd been doing by hand out of love. I bought a laptop the next day.\""
    )
    pdf.body(
        "On March 8, International Women's Day, Sola is issuing an open invitation to women's "
        "travel organizations, academic researchers, solo female travel creators, impact investors, "
        "and the travel industry itself to join in closing the gender data gap in travel."
    )
    pdf.body(
        "\"This is bigger than an app,\" said Tabazhanova. \"I have a daughter. One day she'll travel "
        "the way I have. I want her to inherit better information than I had, not the same gaps.\""
    )

    pdf.ln(3)
    pdf.heading("About Sola", size=11)
    pdf.body(
        "Sola is a travel knowledge platform built to close the gender data gap in travel. "
        "Founded in Manila in 2025 by Bokang Sibolla (South Africa), Aigerim Tabazhanova (Kazakhstan), "
        "and Clemence Casali (France), the platform was developed through primary research with over "
        "400 solo female travelers. Sola provides women with the structured, destination-specific "
        "information the travel industry has historically failed to offer, covering safety, cultural "
        "norms, health access, solo-friendly accommodation, and local knowledge contributed by a "
        "growing community of women travelers."
    )

    pdf.ln(3)
    pdf.subheading("Media Contact")
    pdf.body("[Name / Email / Phone]")
    pdf.subheading("Press Kit")
    pdf.body("[Link to downloadable assets, founder photos, product screenshots, key data points]")

    # =========================================================================
    # SECTION 5: OPEN LETTER TO THE TRAVEL INDUSTRY
    # =========================================================================
    pdf.section_title(
        "5. Open Letter to the Travel Industry",
        "Published on Sola's website March 8, 2026. Shared across LinkedIn by all three founders. "
        "Sent directly to the press offices of the companies named."
    )

    pdf.heading("An Open Letter to the Travel Industry", size=16)

    pdf.body(
        "To the leadership of Booking.com, Airbnb, TripAdvisor, Google Travel, Lonely Planet, "
        "Hostelworld, and every platform that serves travelers at scale:"
    )
    pdf.body(
        "You know that women are the fastest-growing segment of your market. Your trend reports "
        "say so. Your marketing campaigns reflect it. You have built features for business travelers, "
        "budget travelers, luxury travelers, family travelers, adventure travelers, and digital "
        "nomads. You have personalised recommendations by price sensitivity, booking history, "
        "dietary preference, and accessibility needs."
    )
    pdf.body(
        "We would like to ask a straightforward question: what have you built specifically for the "
        "information needs of women who travel alone?"
    )
    pdf.body(
        "Not marketing aimed at women. Not a \"solo travel\" filter that returns the same results "
        "for everyone. Not a pink landing page in March. We mean structured, maintained, "
        "destination-specific information that addresses what women actually need to know and "
        "currently spend hours assembling on their own."
    )
    pdf.body(
        "Which neighbourhoods are safe after dark. How harassment presents in a specific city and "
        "what the local response looks like. Whether a hostel is genuinely solo-friendly or simply "
        "affordable. Where to find a pharmacy that stocks what she needs. What the dress expectations "
        "are, not in a guidebook generalisation, but street by street, context by context. How to "
        "get from the airport at midnight without worry."
    )
    pdf.body(
        "We spent months in Manila speaking to over 400 solo female travelers from dozens of "
        "countries. We did not survey them. We sat with them. We asked what they looked for before "
        "every trip, where they found it, where they didn't, and what they learned the hard way."
    )
    pdf.body(
        "Not one of them described a single mainstream travel platform that addressed these needs."
    )
    pdf.body("Four hundred women. Zero platforms.")
    pdf.body(
        "You have the data infrastructure. You have the engineering teams. You have the distribution. "
        "You have been collecting behavioral data on hundreds of millions of travelers for years. "
        "The question was never whether you had the capability. The question is why you never "
        "prioritised it."
    )
    pdf.body(
        "We are not writing this letter as competitors. We are three people who built a platform "
        "from Manila with no funding because we couldn't wait for you to do it. We are writing this "
        "because closing the gender data gap in travel is not a job for three people. It requires "
        "the industry itself to recognise that \"comprehensive\" travel information has never been "
        "comprehensive for half the people using it."
    )
    pdf.body(
        "We have the research. We have the framework. We have a product that works. We would "
        "welcome the conversation about how to do this at the scale your platforms make possible."
    )
    pdf.body("Women should not have to subsidise your information gaps with their time.")

    pdf.ln(5)
    pdf.body("Bokang Sibolla, Aigerim Tabazhanova, Clemence Casali")
    pdf.body("Founders, Sola")
    pdf.body("Manila, Philippines")
    pdf.body("March 8, 2026")

    # =========================================================================
    # SECTION 6: TACTICAL OUTREACH PLAYBOOK
    # =========================================================================
    pdf.section_title(
        "6. Tactical Outreach Playbook",
        "The week-by-week execution plan and outreach mechanics."
    )

    pdf.heading("Week of February 17-21: Preparation")
    pdf.simple_bullet("Finalise all three written pieces (manifesto, press release, open letter)")
    pdf.simple_bullet("Prepare press kit: founder photos, product screenshots, key statistics, one-page fact sheet")
    pdf.simple_bullet("Create a dedicated press page on the Sola website")
    pdf.simple_bullet("Draft all three founders' LinkedIn posts for March 1-7")
    pdf.simple_bullet("Build media list: identify specific journalists at each target publication")
    pdf.simple_bullet("Research HBR, SSIR, and Fast Company contributed article submission processes")

    pdf.heading("Week of February 24-28: Pre-Outreach")
    pdf.simple_bullet("Submit HBR contributed article draft (long lead time --submit early)")
    pdf.simple_bullet("Submit Fast Company World Changing Ideas application")
    pdf.simple_bullet("Begin warm outreach to journalists --follow them, engage with their work, build familiarity")
    pdf.simple_bullet("Connect with women's travel organizations and academic contacts for March 8 partnership announcement")
    pdf.simple_bullet("Set up email sequences for press pitches")

    pdf.heading("Week of March 1-7: Content Launch + Embargoed Pitches")
    pdf.simple_bullet("March 1: Bokang's LinkedIn post goes live. Embargoed press pitches sent to Tier 1 and Tier 2 outlets.")
    pdf.simple_bullet("March 3: Clemence's LinkedIn/Medium essay goes live.")
    pdf.simple_bullet("March 5: Aigerim's LinkedIn post goes live.")
    pdf.simple_bullet("March 6: Bokang's framework post (\"The Gender Data Gap in Travel\") goes live.")
    pdf.simple_bullet("March 7: All three founders cross-share. \"Tomorrow, we tell the full story.\"")
    pdf.simple_bullet("March 7: Final check-in with embargoed journalists. Confirm publication timing.")

    pdf.heading("March 8: Declaration Day")
    pdf.simple_bullet("Publish the manifesto on Sola's website")
    pdf.simple_bullet("Publish the open letter on Sola's website and LinkedIn")
    pdf.simple_bullet("Embargo lifts: press coverage goes live")
    pdf.simple_bullet("All three founders share manifesto and open letter across all channels")
    pdf.simple_bullet("Engage with every comment, share, and mention throughout the day")
    pdf.simple_bullet("Send the open letter directly to press offices of named companies")

    pdf.heading("Week of March 9-14: Amplification")
    pdf.simple_bullet("Pitch Tier 3 and Tier 4 outlets with links to existing coverage")
    pdf.simple_bullet("Follow up with academic contacts and women's organizations")
    pdf.simple_bullet("Pitch podcast appearances (travel podcasts, women in business podcasts, tech podcasts)")
    pdf.simple_bullet("Monitor and engage with all social media conversation")
    pdf.simple_bullet("Compile coverage and momentum metrics for potential investor conversations")

    pdf.heading("Email Pitch Structure")
    pdf.body("Every pitch email should follow this structure:")
    pdf.ln(2)
    pdf.bullet("Subject line:", "Specific to the outlet's angle. Never generic. Example for Forbes: \"400 women. Zero travel platforms built for them. A bootstrapped team in Manila changed that.\"")
    pdf.bullet("Opening line:", "One sentence that hooks. Personalised to the journalist's beat. Reference something they've written.")
    pdf.bullet("The story in three sentences:", "The problem. The 400 conversations. The product that exists.")
    pdf.bullet("Why now:", "International Women's Day. Fastest-growing travel segment. The tools to build now exist.")
    pdf.bullet("Why them:", "Specific reason this story belongs in their publication.")
    pdf.bullet("The ask:", "\"Would you be interested in an embargoed look at the full story?\"")
    pdf.bullet("Attached:", "Press release. Link to press kit. Founder availability for interview.")

    pdf.heading("Key Contacts to Research")
    pdf.body("Identify the specific journalist at each publication who covers the relevant beat:")
    pdf.ln(2)
    pdf.simple_bullet("HBR: Gender/workplace equity editors and contributors")
    pdf.simple_bullet("Forbes: Innovation section editors, Women @ Forbes contributors")
    pdf.simple_bullet("TechCrunch: Southeast Asia / bootstrapped startup reporters")
    pdf.simple_bullet("Conde Nast Traveler: Solo travel and women's travel editors")
    pdf.simple_bullet("Fast Company: World Changing Ideas editorial team")
    pdf.simple_bullet("Rest of World: Southeast Asia technology correspondents")
    pdf.simple_bullet("The Cut / Refinery29: Personal essay and women's issues editors")
    pdf.simple_bullet("Mail & Guardian: Technology and diaspora correspondents")

    # =========================================================================
    # SAVE
    # =========================================================================
    output_path = os.path.join(OUTPUT_DIR, "Sola_PR_Strategy_March_2026.pdf")
    pdf.output(output_path)
    print(f"PDF generated: {output_path}")
    return output_path


if __name__ == "__main__":
    build_pdf()
