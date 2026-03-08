const API_KEY = process.env.ANTHROPIC_API_KEY!;
const API_BASE = "https://api.anthropic.com/v1";
const MODEL = "claude-sonnet-4-20250514";

async function callClaude(
    systemPrompt: string | undefined,
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    maxTokens: number = 8192
) {
    const body: Record<string, unknown> = {
        model: MODEL,
        max_tokens: maxTokens,
        messages,
    };

    if (systemPrompt) {
        body.system = systemPrompt;
    }

    const res = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`Claude API error ${res.status}: ${JSON.stringify(err)}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text;
    if (!text) throw new Error("No content in Claude response");
    return text;
}

function cleanJson(text: string): string {
    let cleaned = text.trim();
    if (cleaned.startsWith("\`\`\`json")) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith("\`\`\`")) cleaned = cleaned.slice(3);
    if (cleaned.endsWith("\`\`\`")) cleaned = cleaned.slice(0, -3);
    return cleaned.trim();
}

// ═══════════════════════════════════════════
// WEBSITE GENERATION — Delimiter-based format
// ═══════════════════════════════════════════
// The AI outputs JSON metadata + raw HTML sections separated by markers.
// This avoids putting HTML inside JSON strings which causes parse errors.

const SYSTEM_PROMPT = `You are a world-class website designer. You create UNIQUE, STUNNING websites with fully custom HTML and CSS for every section. Every website you create must look completely different — unique layouts, unique color schemes, unique visual structure. You do NOT use templates or predefined components.

YOU MUST FOLLOW THIS EXACT OUTPUT FORMAT:

===JSON_START===
{
  "siteName": "Creative Brand Name",
  "category": "business|portfolio|restaurant|local-service|event|basic-store",
  "theme": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "accentColor": "#hex",
    "backgroundColor": "#hex",
    "textColor": "#hex",
    "fontFamily": "Inter|Outfit|DM Sans|Playfair Display|Space Grotesk|Sora|Crimson Pro|Raleway"
  },
  "sectionOrder": ["nav-1", "hero-1", "features-1", "about-1", "footer-1"]
}
===JSON_END===

===SECTION:nav-1:Navigation===
<nav style="padding: 20px 40px; display: flex; ...">
  ...full navbar HTML with inline styles...
</nav>
===END_SECTION===

===SECTION:hero-1:Hero===
<section style="padding: 100px 20px; ...">
  ...full hero HTML with inline styles...
</section>
===END_SECTION===

...continue for each section listed in sectionOrder...

CRITICAL RULES:
1. Output the ===JSON_START=== block first with site metadata and sectionOrder array.
2. Then output each section as ===SECTION:id:label=== ... ===END_SECTION===
3. Every section ID in sectionOrder MUST have a matching SECTION block.
4. Generate 6-10 sections. ALWAYS include navigation, hero, and footer.
5. Each section MUST be complete, self-contained HTML with ALL styles inline (style="...").
6. Use CSS variables for theming: var(--primary), var(--secondary), var(--accent), var(--bg), var(--text).
7. ALL content must be SPECIFIC to the user's prompt — no generic filler text ever.
8. Use modern CSS: flexbox, grid, gradients, box-shadows, border-radius, backdrop-filter, transforms.
9. For images: use placeholder divs with gradient backgrounds. NEVER use external URLs.
10. Buttons: <a href="#" style="...">. Forms: <form onsubmit="event.preventDefault()">

DESIGN VARIETY — THIS IS THE MOST IMPORTANT PART:

Every website must look COMPLETELY DIFFERENT from every other website. You must vary ALL of these:

NAVIGATION styles to vary:
- Transparent overlay on hero with white text
- Solid colored bar with contrasting links
- Centered logo with links on both sides
- Minimal: just logo + hamburger menu icon
- Sticky with backdrop-filter blur
- Dark nav on light page, light nav on dark page

HERO styles to vary:
- Full-screen centered text with gradient background
- Split 50/50: text left, image placeholder right
- Angled/diagonal background with overlapping elements
- Minimal: just a large bold headline with subtle animation feel
- Dark hero with neon glowing accent elements
- Hero with floating stats cards overlaid
- Video-placeholder hero with text overlay

CONTENT SECTION styles to vary:
- Card grid (2/3/4 columns)
- Alternating left-right blocks with images
- Numbered vertical timeline
- Icon rows with descriptions below
- Large feature spotlight (one big + small ones)
- Offset cards with shadow depth

COLOR approaches to vary:
- Dark theme (dark bg, light text, neon accents)
- Clean white with bold single-color accents
- Pastel/soft tones
- Monochrome with one pop color
- Rich gradient backgrounds
- Earth tones, ocean tones, sunset tones — match the industry

SPACING to vary:
- Some sections with 60px padding (tight), others with 140px (spacious)
- Mix centered and left-aligned content
- Some sections with max-width: 800px (narrow), others full-width

SECTION IDEAS (pick what fits the prompt):
Navigation, Hero, Features/Benefits, Services, About/Story, Testimonials/Reviews, Pricing/Plans, FAQ, Contact, Newsletter/CTA, Stats/Numbers, Team, Gallery/Portfolio, Menu (restaurants), Footer

CONTENT RULES:
- If prompt says "dental clinic" — write about dental services, teeth whitening prices, patient testimonials about dental care
- If prompt says "coding bootcamp" — write about programming courses, student success rates, tech stacks
- If prompt says "pizza restaurant" — write about pizza varieties, ingredients, delivery, reservations
- The siteName must be a CREATIVE brand name relevant to the prompt
- Stats must be specific: "2,847 patients served" not "1000+"
- Testimonials must have realistic full names and specific results`;

function parseWebsiteResponse(text: string): any {
    // Extract JSON metadata
    const jsonMatch = text.match(/===JSON_START===([\s\S]*?)===JSON_END===/);
    if (!jsonMatch) {
        throw new Error("No JSON metadata found in response");
    }

    let metadata: any;
    const jsonText = cleanJson(jsonMatch[1]);
    metadata = JSON.parse(jsonText);

    // Extract HTML sections
    const sectionRegex = /===SECTION:([\w-]+):(.*?)===\n?([\s\S]*?)===END_SECTION===/g;
    const sectionsMap: Record<string, { label: string; html: string }> = {};

    let match;
    while ((match = sectionRegex.exec(text)) !== null) {
        const id = match[1].trim();
        const label = match[2].trim();
        const html = match[3].trim();
        sectionsMap[id] = { label, html };
    }

    // Build sections array from sectionOrder
    const sectionOrder: string[] = metadata.sectionOrder || Object.keys(sectionsMap);
    const sections = sectionOrder
        .filter((id: string) => sectionsMap[id])
        .map((id: string) => ({
            id,
            type: "custom" as const,
            content: {
                html: sectionsMap[id].html,
                sectionLabel: sectionsMap[id].label,
            },
        }));

    if (sections.length === 0) {
        throw new Error("No sections were parsed from the response");
    }

    return {
        siteName: metadata.siteName || "My Website",
        category: metadata.category || "business",
        theme: metadata.theme || {
            primaryColor: "#6366f1",
            secondaryColor: "#0ea5e9",
            accentColor: "#f43f5e",
            backgroundColor: "#ffffff",
            textColor: "#1a1a2e",
            fontFamily: "Inter",
        },
        sections,
    };
}

// ═══════════════════════════════════════════
// QUESTIONS GENERATION
// ═══════════════════════════════════════════

const QUESTIONS_SYSTEM_PROMPT = `You are an expert website planning consultant. When a user describes the website they want to create, you analyze their description and generate smart, context-aware follow-up questions to better understand their needs.

Your questions should help gather the most important details that would make the website significantly better and more tailored.

RULES:
1. Generate exactly 4-5 questions — no more, no less.
2. Questions MUST be specific to the type of website described, not generic.
3. Each question should uncover a detail that would meaningfully improve the generated website.
4. Use a mix of question types: "select" (multiple choice), "text" (open answer), and "toggle" (yes/no).
5. For "select" type, provide 3-5 relevant options.
6. Questions should flow logically from most important to least important.
7. Return ONLY valid JSON — no markdown, no code blocks, no explanation.

RESPONSE FORMAT:
[
    {
        "id": "unique-kebab-id",
        "question": "Clear, specific question text?",
        "type": "select",
        "options": ["Option A", "Option B", "Option C"]
    },
    {
        "id": "unique-kebab-id",
        "question": "Yes/no question?",
        "type": "toggle"
    },
    {
        "id": "unique-kebab-id",
        "question": "Open-ended question?",
        "type": "text",
        "placeholder": "e.g., describe your..."
    }
]

EXAMPLES OF DOMAIN-SPECIFIC QUESTIONS:

For "doctor portal website":
- What medical specialties should be featured? (select: General Practice, Dentistry, Cardiology, Dermatology, Pediatrics)
- Do you need an online appointment booking section? (toggle)
- What's the primary goal for patients visiting this site? (select: Book appointments, Find information, Access patient portal, View services & pricing)
- Should the site include a doctor/staff team section? (toggle)

For "student website with todo":
- What features should the todo system include? (select: Priority levels, Due dates, Categories/subjects, Collaboration)
- Do you need a calendar/schedule view? (toggle)
- What's the primary audience? (select: High school students, College students, Graduate students, All students)

For "restaurant website":
- What type of cuisine do you serve? (text)
- Do you need online ordering or reservation booking? (select: Online ordering, Table reservations, Both, Neither)
- Should the site feature a full interactive menu? (toggle)`;

export async function generateQuestions(prompt: string) {
    const text = await callClaude(
        QUESTIONS_SYSTEM_PROMPT,
        [{ role: "user", content: `Generate smart follow-up questions for this website request: "${prompt}"` }]
    );

    return JSON.parse(cleanJson(text));
}

// ═══════════════════════════════════════════
// WEBSITE GENERATION
// ═══════════════════════════════════════════

export async function generateWebsite(prompt: string, category: string, answers?: Record<string, string>) {
    const isAuto = !category || category === "auto";

    // Build enriched prompt with user's answers
    let enrichedPrompt = prompt;
    if (answers && Object.keys(answers).length > 0) {
        const answerLines = Object.entries(answers)
            .map(([question, answer]) => `- ${question}: ${answer}`)
            .join("\n");
        enrichedPrompt = `${prompt}\n\nADDITIONAL DETAILS FROM USER:\n${answerLines}`;
    }

    const userMessage = isAuto
        ? `Create a website for: "${enrichedPrompt}"

IMPORTANT:
- Determine the best category for this website
- Design completely UNIQUE HTML/CSS for every section
- Write all content specifically about this exact topic
- Follow the ===JSON_START=== / ===SECTION=== output format exactly`
        : `Create a ${category} website for: "${enrichedPrompt}"

IMPORTANT:
- Design completely UNIQUE HTML/CSS for every section
- Write all content specifically about this exact topic
- Follow the ===JSON_START=== / ===SECTION=== output format exactly`;

    const text = await callClaude(
        SYSTEM_PROMPT,
        [{ role: "user", content: userMessage }],
        16384 // Higher token limit for full HTML generation
    );

    return parseWebsiteResponse(text);
}

// ═══════════════════════════════════════════
// CHAT / EDIT FUNCTIONS
// ═══════════════════════════════════════════

const CHAT_SYSTEM_PROMPT = `You are an AI website editor assistant. You modify websites based on user instructions.

You receive the current website with its HTML sections. You must return ONLY the sections you need to CHANGE — do NOT return unchanged sections.

YOUR RESPONSE FORMAT:

===MESSAGE===
Brief, friendly 1-2 sentence confirmation of what you did.
===END_MESSAGE===

===CHANGES===
{
  "updateSections": ["section-id-1", "section-id-2"],
  "removeSections": [],
  "addAfter": null
}
===END_CHANGES===

Then output ONLY the changed/new sections:

===SECTION:section-id-1:Label===
<updated HTML with inline CSS>
===END_SECTION===

RULES:
- Output ONLY sections that need to change. Do NOT copy unchanged sections.
- "updateSections" lists the section IDs you are updating (must match ===SECTION:id:...).
- "removeSections" lists section IDs to delete (optional, usually empty).
- "addAfter" — if adding a new section, set this to the section ID it should appear after (or "start" for beginning).
- For style changes (colors, backgrounds, fonts), modify the inline CSS in the affected sections.
- Keep existing content unless the user asks to change it.
- Use inline CSS for all styling. Use CSS variables: var(--primary), var(--secondary), var(--accent).
- Each section must be a complete, self-contained HTML block.`;

function serializeWebsiteForChat(website: any): string {
    let output = "===CURRENT_WEBSITE===\n";

    if (website.siteName) output += `Site Name: ${website.siteName}\n`;
    if (website.category) output += `Category: ${website.category}\n`;
    if (website.theme) output += `Theme: ${JSON.stringify(website.theme)}\n`;

    output += "\nSections:\n";

    if (website.sections) {
        for (const section of website.sections) {
            if (section.type === "custom" && section.content?.html) {
                const label = section.content.sectionLabel || section.type;
                output += `\n===SECTION:${section.id}:${label}===\n`;
                output += section.content.html;
                output += `\n===END_SECTION===\n`;
            } else {
                output += `\n[Section: ${section.id} | type: ${section.type}]\n`;
                output += JSON.stringify(section.content, null, 2);
                output += "\n";
            }
        }
    }

    output += "===END_CURRENT_WEBSITE===";
    return output;
}

function parseChatResponse(text: string, currentWebsite: any): { message: string; website: any } {
    // Extract the message
    let message = "Done! I've updated the website.";
    const msgMatch = text.match(/===MESSAGE===([\s\S]*?)===END_MESSAGE===/);
    if (msgMatch) {
        message = msgMatch[1].trim();
    }

    // Extract changes metadata
    let changes: any = { updateSections: [], removeSections: [], addAfter: null };
    const changesMatch = text.match(/===CHANGES===([\s\S]*?)===END_CHANGES===/);
    if (changesMatch) {
        try {
            changes = JSON.parse(changesMatch[1].trim());
        } catch (e) {
            console.error("Failed to parse changes JSON:", e);
        }
    }

    // Extract the updated/new section HTML
    const sectionRegex = /===SECTION:([\w-]+):([^=]*)===\s*([\s\S]*?)===END_SECTION===/g;
    const updatedSections: Record<string, { label: string; html: string }> = {};
    let match;
    while ((match = sectionRegex.exec(text)) !== null) {
        const id = match[1].trim();
        const label = match[2].trim();
        const html = match[3].trim();
        updatedSections[id] = { label, html };
    }

    // Start with existing sections
    let sections = [...(currentWebsite.sections || [])];

    // Remove sections if requested
    if (changes.removeSections?.length > 0) {
        sections = sections.filter((s: any) => !changes.removeSections.includes(s.id));
    }

    // Update existing sections with new HTML
    sections = sections.map((s: any) => {
        if (updatedSections[s.id]) {
            return {
                ...s,
                type: "custom",
                content: {
                    html: updatedSections[s.id].html,
                    sectionLabel: updatedSections[s.id].label,
                },
            };
        }
        return s;
    });

    // Add new sections (ones that don't exist in current website)
    const existingIds = new Set(sections.map((s: any) => s.id));
    const newSections = Object.entries(updatedSections)
        .filter(([id]) => !existingIds.has(id))
        .map(([id, data]) => ({
            id,
            type: "custom" as const,
            content: { html: data.html, sectionLabel: data.label },
        }));

    if (newSections.length > 0) {
        if (changes.addAfter && changes.addAfter !== "start") {
            // Insert after specified section
            const afterIdx = sections.findIndex((s: any) => s.id === changes.addAfter);
            if (afterIdx !== -1) {
                sections.splice(afterIdx + 1, 0, ...newSections);
            } else {
                sections.push(...newSections);
            }
        } else if (changes.addAfter === "start") {
            sections.unshift(...newSections);
        } else {
            sections.push(...newSections);
        }
    }

    return {
        message,
        website: {
            ...currentWebsite,
            sections,
        },
    };
}

export async function chatWithWebsite(
    currentWebsite: any,
    history: Array<{ role: "user" | "assistant"; content: string }>,
    instruction: string
) {
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    for (const msg of history) {
        messages.push(msg);
    }

    const websiteContext = serializeWebsiteForChat(currentWebsite);

    messages.push({
        role: "user",
        content: `${websiteContext}\n\nUser instruction: "${instruction}"\n\nApply this change. Return ONLY the ===MESSAGE===, ===CHANGES===, and the modified ===SECTION=== blocks. Do NOT return unchanged sections.`
    });

    const text = await callClaude(CHAT_SYSTEM_PROMPT, messages, 16384);
    return parseChatResponse(text, currentWebsite);
}

export async function rewriteSection(section: any, instruction: string) {
    const text = await callClaude(
        undefined,
        [
            { role: "user", content: `You are a website content editor. You will receive a website section JSON and an instruction to modify it. Return ONLY the modified section JSON (same structure), nothing else. No markdown, no code blocks.\n\nCurrent section: ${JSON.stringify(section)}\n\nInstruction: ${instruction}` },
        ]
    );

    return JSON.parse(cleanJson(text));
}

export async function improveContent(content: any) {
    const text = await callClaude(
        undefined,
        [
            { role: "user", content: `You are a professional copywriter. Improve the text content of this website section to be more engaging, professional, and conversion-oriented. Keep the exact same JSON structure, only improve the text values. Return ONLY the improved JSON. No markdown, no code blocks.\n\nSection to improve: ${JSON.stringify(content)}` },
        ]
    );

    return JSON.parse(cleanJson(text));
}

export async function chatWithAI(messages: Array<{ role: "user" | "model"; text: string }>) {
    const claudeMessages = messages.map((m) => ({
        role: (m.role === "model" ? "assistant" : "user") as "user" | "assistant",
        content: m.text,
    }));

    const text = await callClaude(undefined, claudeMessages);
    return text;
}
