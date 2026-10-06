from fpdf import FPDF
from fpdf.enums import XPos, YPos

class PDF(FPDF):
    def header(self):
        self.set_font("helvetica", "B", 16)
        self.cell(0, 10, "HappyGen Studio - Discord Server Setup Guide", border=False, new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font("helvetica", "I", 8)
        self.cell(0, 10, f"Page {self.page_no()}", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

pdf = PDF()
pdf.add_page()
pdf.set_font("helvetica", size=12)

def add_section(title, content):
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 10, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("helvetica", "", 11)
    pdf.multi_cell(0, 7, content)
    pdf.ln(5)

def add_code_block(title, code):
    pdf.set_font("helvetica", "B", 11)
    pdf.cell(0, 8, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("courier", "", 10)
    pdf.multi_cell(0, 6, code, border=1)
    pdf.ln(5)

add_section("Overview", 
    "This document outlines the recommended channel structure for the HappyGen Studio Discord server, "
    "along with copy-paste templates for your most important channels."
)

add_section("1. Welcome & Info (Public, Read-Only)", 
    "These channels are the first thing users see. Only Admins should be able to post messages here.\n"
    "- #welcome-and-rules: Explains the server and outlines the rules.\n"
    "- #getting-started: The most important channel for explaining how to use HappyGen Studio.\n"
    "- #announcements: For dropping update notes and new features."
)

add_code_block("Copy & Paste for #welcome-and-rules:", 
    "Welcome to HappyGen Studio!\n\n"
    "We are a community dedicated to creating beautiful, uncensored, "
    "and highly-controllable AI art using the HappyGen Studio platform.\n\n"
    "Server Rules:\n"
    "1. Be respectful and kind to others.\n"
    "2. No illegal content of any kind.\n"
    "3. Keep NSFW content strictly out of SFW channels.\n"
    "4. Help each other out -- we're all learning!\n\n"
    "To get started, please check out the #getting-started channel!"
)

add_code_block("Copy & Paste for #getting-started:", 
    "How to Use HappyGen Studio\n\n"
    "HappyGen Studio is a free, open-source AI image generator. "
    "Because it is completely free, you need to run your own backend server.\n\n"
    "Step 1: Open the Frontend\n"
    "Go to [Insert Your Vercel/Netlify Link Here]\n\n"
    "Step 2: Start the Backend\n"
    "Open our Google Colab Notebook: [Insert Colab Link Here]\n"
    "- Click 'Runtime' -> 'Run All'\n"
    "- Wait a few minutes for the setup to finish.\n"
    "- Scroll to the bottom and copy the '.trycloudflare.com' link.\n\n"
    "Step 3: Connect\n"
    "Paste the Cloudflare link into the 'Backend Settings' menu in HappyGen Studio. "
    "You are now ready to generate!"
)

add_section("2. Community Hub (Public)", 
    "These are the main channels where your community will interact.\n"
    "- #general: For casual chat and discussions.\n"
    "- #art-showcase: A place for users to post the amazing images they generate.\n"
    "- #prompt-sharing: For sharing successful prompts, negative prompts, and LoRA combos."
)

add_code_block("Copy & Paste for #prompt-sharing (Pinned Message):", 
    "Welcome to Prompt Sharing!\n\n"
    "When sharing a cool generation, please try to include:\n"
    "1. The Base Model used (e.g., CyberRealistic, Pony, NoobAI)\n"
    "2. The Positive Prompt\n"
    "3. The Negative Prompt\n"
    "4. Any LoRAs you used\n\n"
    "This helps everyone learn and improve their AI art skills!"
)

add_section("3. Support & Feedback (Public)", 
    "Channels for users to get help from you or other community members.\n"
    "- #help-and-support: For technical questions or troubleshooting.\n"
    "- #bug-reports: For reporting issues with the UI or the Colab server."
)

add_code_block("Copy & Paste for #bug-reports (Pinned Message):", 
    "Found a Bug?\n\n"
    "Please provide the following when reporting a bug:\n"
    "- What were you trying to do?\n"
    "- What model were you using?\n"
    "- What error message did you see (if any)?\n"
    "- Are you using the latest Colab Notebook?"
)

add_section("4. Developer Zone (Private / Admin Only)", 
    "These channels must be marked as PRIVATE. Regular users should not see them.\n"
    "- #app-feedback: The channel where your Discord Webhook lives. In-app feedback goes here.\n"
    "- #admin-chat: A private workspace for you and your moderators."
)

add_section("5. International Community (Public)", 
    "These channels provide a dedicated space for non-English speakers to interact and share.\n"
    "- #international-hub: A forum channel where users can create posts in their native languages.\n"
    "- #general-es: For casual chat and discussions in Spanish.\n"
    "- #general-fr: For casual chat and discussions in French.\n"
    "- #general-jp: For casual chat and discussions in Japanese."
)

add_code_block("Copy & Paste for #international-hub (Pinned Message):", 
    "Welcome to the International Hub!\n\n"
    "Feel free to create a thread or forum post in your native language to connect with others.\n"
    "If you need official support, please try to use English in the #help-and-support channel so our admins can assist you.\n\n"
    "--- \n\n"
    "¡Bienvenidos!\n"
    "Bienvenue!"
)

pdf.output("HappyGen_Studio_Discord_Setup.pdf")
print("PDF generated successfully.")
