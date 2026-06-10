const API_KEY = process.env.ANTHROPIC_API_KEY!;
const API_BASE = "https://api.anthropic.com/v1";
const DEFAULT_MODEL = "claude-opus-4-8";

export const AVAILABLE_MODELS = [
    { id: "claude-opus-4-8", label: "Claude Opus 4.8", description: "Most capable — best design" },
    { id: "claude-opus-4-6", label: "Claude Opus 4.6", description: "Capable — older Opus" },
    { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", description: "Fast & powerful" },
    { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", description: "Fastest & cheapest" },
];

// Opus 4.8 / Opus 4.6 / Sonnet 4.6 support adaptive thinking, which produces
// more thoughtful, less templated design output. Haiku 4.5 does not.
function supportsThinking(model: string): boolean {
    return model.startsWith("claude-opus-4-8")
        || model.startsWith("claude-opus-4-6")
        || model.startsWith("claude-sonnet-4-6");
}

async function callClaude(
    systemPrompt: string | undefined,
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    maxTokens: number = 8192,
    model: string = DEFAULT_MODEL,
    thinking: boolean = false
) {
    const body: Record<string, unknown> = {
        model,
        max_tokens: maxTokens,
        messages,
    };

    if (systemPrompt) {
        body.system = systemPrompt;
    }

    // Adaptive thinking improves quality but adds latency. Off by default for the
    // short structured calls (plan, per-section) so each stays well under 60s.
    if (thinking && supportsThinking(model)) {
        body.thinking = { type: "adaptive" };
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
    // With thinking enabled, content[0] may be a thinking block — find the text block.
    const text = Array.isArray(data.content)
        ? data.content.find((b: { type?: string }) => b.type === "text")?.text
        : undefined;
    if (!text) throw new Error("No content in Claude response");
    return text;
}

// ═══════════════════════════════════════════
// STREAMING CLAUDE CALL (real-time progress)
// ═══════════════════════════════════════════

export type ProgressEvent = {
    step: number;
    totalSteps: number;
    label: string;
    detail: string;
    percent: number;
};

async function callClaudeStream(
    systemPrompt: string | undefined,
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    maxTokens: number = 8192,
    model: string = DEFAULT_MODEL,
    onProgress?: (event: ProgressEvent) => void
): Promise<string> {
    const body: Record<string, unknown> = {
        model,
        max_tokens: maxTokens,
        messages,
        stream: true,
    };

    if (systemPrompt) {
        body.system = systemPrompt;
    }

    if (supportsThinking(model)) {
        body.thinking = { type: "adaptive" };
    }

    onProgress?.({
        step: 0, totalSteps: 5,
        label: "Connecting to AI",
        detail: "Sending your request to the AI model...",
        percent: 5,
    });

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
        const errText = await res.text().catch(() => "");
        let errMsg = `Claude API error ${res.status}`;
        try { const e = JSON.parse(errText); errMsg += `: ${e.error?.message || JSON.stringify(e)}`; } catch { errMsg += `: ${errText.slice(0, 200)}`; }
        throw new Error(errMsg);
    }

    onProgress?.({
        step: 1, totalSteps: 5,
        label: "AI is designing your website",
        detail: "Generating layout, colors, and structure...",
        percent: 15,
    });

    // Read the SSE stream from Claude
    const reader = res.body?.getReader();
    if (!reader) throw new Error("No readable stream from Claude");

    const decoder = new TextDecoder();
    let fullText = "";
    let buffer = "";
    let lastProgressPercent = 15;
    let foundJson = false;
    let sectionsFound = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer — Claude sends "event: type\ndata: JSON\n\n" format
        const events = buffer.split("\n\n");
        buffer = events.pop() || ""; // Keep incomplete event in buffer

        for (const eventBlock of events) {
            const lines = eventBlock.split("\n");
            let dataLine = "";
            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    dataLine = line.slice(6).trim();
                }
            }
            if (!dataLine || dataLine === "[DONE]") continue;

            try {
                const event = JSON.parse(dataLine);

                // Extract text deltas
                if (event.type === "content_block_delta" && event.delta?.text) {
                    fullText += event.delta.text;

                    // Detect real milestones in the streaming text
                    if (!foundJson && fullText.includes("===JSON_END===")) {
                        foundJson = true;
                        onProgress?.({
                            step: 2, totalSteps: 5,
                            label: "Layout & theme designed",
                            detail: "Now writing HTML sections with custom styles...",
                            percent: 35,
                        });
                    }

                    // Count completed sections
                    const newSections = (fullText.match(/===END_SECTION===/g) || []).length;
                    if (newSections > sectionsFound) {
                        sectionsFound = newSections;
                        const sectionProgress = Math.min(35 + (sectionsFound * 8), 85);
                        if (sectionProgress > lastProgressPercent) {
                            lastProgressPercent = sectionProgress;
                            onProgress?.({
                                step: 3, totalSteps: 5,
                                label: `Building sections (${sectionsFound} complete)`,
                                detail: `Writing section ${sectionsFound + 1}...`,
                                percent: sectionProgress,
                            });
                        }
                    }
                }

                // Check for stream errors
                if (event.type === "error") {
                    throw new Error(`Claude stream error: ${event.error?.message || JSON.stringify(event)}`);
                }
            } catch (e) {
                // Re-throw actual errors, ignore JSON parse issues
                if (e instanceof Error && e.message.startsWith("Claude")) throw e;
            }
        }
    }

    if (!fullText) throw new Error("No content in Claude streaming response");

    onProgress?.({
        step: 4, totalSteps: 5,
        label: "Finalizing your website",
        detail: "Parsing and assembling all sections...",
        percent: 92,
    });

    return fullText;
}

// Builds the user message for website generation, folding in the user's answers
// and design choices so the AI produces a site tailored to those exact picks.
function buildGenerationMessage(
    prompt: string,
    category: string,
    answers?: Record<string, string>,
    designBrief?: string
): string {
    const isAuto = !category || category === "auto";

    let enrichedPrompt = prompt;
    if (answers && Object.keys(answers).length > 0) {
        const answerLines = Object.entries(answers)
            .map(([question, answer]) => `- ${question}: ${answer}`)
            .join("\n");
        enrichedPrompt = `${prompt}\n\nADDITIONAL DETAILS FROM USER:\n${answerLines}`;
    }

    const designSection = designBrief && designBrief.trim()
        ? `\n\n${designBrief.trim()}\n`
        : "";

    const intro = isAuto
        ? `Create a website for: "${enrichedPrompt}"`
        : `Create a ${category} website for: "${enrichedPrompt}"`;

    return `${intro}${designSection}

IMPORTANT:
${isAuto ? "- Determine the best category for this website\n" : ""}- Design completely UNIQUE, modern HTML/CSS for every section — this MUST look like a $50k agency website, not a template
- HONOR the DESIGN DIRECTION above exactly (style, color mood, hero layout, personality, and fancy effects). If a choice is omitted, make a bold, tasteful decision yourself — and make it DIFFERENT from a generic default.
- Use REAL images from picsum.photos (e.g. https://picsum.photos/seed/keyword/800/600) with unique seed keywords per image
- Include a <style> tag with Google Fonts @import and CSS @keyframes animations in the first section
- Use modern UI/UX: generous spacing, strong typographic hierarchy, depth/layering, smooth hover and entrance animations
- Write all content specifically about this exact topic — no generic filler
- Follow the ===JSON_START=== / ===SECTION=== output format exactly`;
}

export async function generateWebsiteStream(
    prompt: string,
    category: string,
    answers?: Record<string, string>,
    model?: string,
    onProgress?: (event: ProgressEvent) => void,
    designBrief?: string
) {
    const userMessage = buildGenerationMessage(prompt, category, answers, designBrief);

    const text = await callClaudeStream(
        SYSTEM_PROMPT,
        [{ role: "user", content: userMessage }],
        16384,
        model || DEFAULT_MODEL,
        onProgress,
    );

    onProgress?.({
        step: 4, totalSteps: 5,
        label: "Assembling final website",
        detail: "Parsing sections and building your site...",
        percent: 95,
    });

    const result = parseWebsiteResponse(text);

    onProgress?.({
        step: 5, totalSteps: 5,
        label: "Website ready!",
        detail: `Created ${result.sections.length} sections`,
        percent: 100,
    });

    return result;
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

const SYSTEM_PROMPT = `You are an ELITE, award-winning website designer known for creating breathtaking, one-of-a-kind web experiences. Every website you create is a masterpiece — visually stunning, premium, and utterly unique. You design like a top agency charging $50,000+ per project.

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
    "fontFamily": "Inter|Outfit|DM Sans|Playfair Display|Space Grotesk|Sora|Crimson Pro|Raleway|Poppins|Montserrat"
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
9. Buttons: <a href="#" style="...">. Forms: <form onsubmit="event.preventDefault()">

═══════════════════════════════════════════
REAL IMAGES — USE ACTUAL STOCK PHOTOS (MANDATORY):
═══════════════════════════════════════════

DO NOT use gradient placeholder divs for images. Use REAL photos from picsum.photos:

URL format: https://picsum.photos/seed/{keyword}/width/height

Examples:
- Hero background: https://picsum.photos/seed/realestate-hero/1920/1080
- Property card: https://picsum.photos/seed/modern-house/800/600
- Team member: https://picsum.photos/seed/business-woman/400/400
- Restaurant food: https://picsum.photos/seed/pasta-dish/600/400
- Office: https://picsum.photos/seed/modern-office/800/500

Rules for images:
- Use <img> tags with relevant seed keywords: <img src="https://picsum.photos/seed/keyword/800/600" alt="description" style="width:100%; height:300px; object-fit:cover; border-radius:16px;">
- ALWAYS include alt text that describes the image
- Use object-fit: cover for consistent sizing
- Add border-radius for modern look (12-20px)
- Use responsive widths (width: 100%)
- For hero backgrounds: use as background-image: url('https://picsum.photos/seed/keyword/1920/1080') with overlay
- For avatar/team photos: use circular crops with border-radius: 50%
- Use UNIQUE seed keywords for each image so they look different — vary the keyword for every image even within same section
- Add subtle box-shadow: 0 8px 30px rgba(0,0,0,0.12) to image containers

═══════════════════════════════════════════
GOOGLE FONTS & TYPOGRAPHY (MANDATORY):
═══════════════════════════════════════════

In the FIRST section (navigation), include a <style> tag at the very top with:
1. Google Fonts @import for the chosen font AND a display font
2. CSS animation @keyframes used throughout the site

Example (put this INSIDE the first ===SECTION block, BEFORE the <nav>):

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;600;700;800;900&display=swap');

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.3); }
  50% { box-shadow: 0 0 40px rgba(99,102,241,0.6); }
}
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>

Typography rules:
- Use TWO fonts: one for body (sans-serif like Inter, DM Sans, Poppins) and one for display/headings (Playfair Display, Crimson Pro, or bold sans like Outfit, Space Grotesk)
- Headlines: font-weight 700-900, font-size 48-72px for hero, 36-48px for section titles
- Body: font-weight 300-400, font-size 16-18px, line-height 1.7
- Use letter-spacing: -0.02em on large headlines for tightness
- Use letter-spacing: 0.1em + text-transform: uppercase on small labels/tags

═══════════════════════════════════════════
CSS ANIMATIONS (MANDATORY):
═══════════════════════════════════════════

Apply animations to elements throughout every section:
- Hero headline: animation: fadeInUp 0.8s ease
- Hero subtitle: animation: fadeInUp 0.8s ease 0.2s both
- Hero buttons: animation: fadeInUp 0.8s ease 0.4s both
- Hero image/card: animation: fadeInRight 1s ease 0.3s both
- Cards in grids: animation: fadeInUp 0.6s ease both (with staggered animation-delay: 0.1s, 0.2s, 0.3s per card)
- Decorative floating elements: animation: float 6s ease-in-out infinite
- Stats numbers: animation: scaleIn 0.5s ease both
- Background decorative orbs: animation: float 8s ease-in-out infinite
- Buttons on hover: transition: all 0.3s ease; transform: translateY(-3px); box-shadow increases
- Cards on hover: transition: all 0.4s ease; transform: translateY(-8px) scale(1.02); box-shadow increases

═══════════════════════════════════════════
PREMIUM NAVIGATION (MANDATORY):
═══════════════════════════════════════════

The navbar MUST be premium and fancy. Pick ONE of these styles:

1. GLASS NAV: backdrop-filter: blur(20px); background: rgba(255,255,255,0.08); border-bottom: 1px solid rgba(255,255,255,0.1); position: fixed; width: 100%; z-index: 1000; with links that have hover underline animation
2. FLOATING NAV: position: fixed; top: 20px; left: 50%; transform: translateX(-50%); max-width: 900px; border-radius: 100px; padding: 12px 32px; background: rgba(15,15,35,0.8); backdrop-filter: blur(20px); box-shadow: 0 8px 32px rgba(0,0,0,0.3)
3. GRADIENT BORDER NAV: solid nav with a thin animated gradient line at the bottom (background-size: 200% 100%; animation: shimmer 3s linear infinite)
4. SPLIT LUXURY NAV: logo centered, links evenly split on both sides, with gold/accent underline on hover, border-bottom: 1px solid rgba(255,255,255,0.06)

Nav MUST include:
- A stylish logo with icon/emoji + brand name (font-weight: 800)
- 4-5 navigation links with smooth hover effects (color transition, underline grow animation, or background pill)
- A CTA button (e.g., "Get Started", "Contact Us") with gradient background and hover glow
- Links should have: transition: all 0.3s ease; and a visible hover effect

═══════════════════════════════════════════
DECORATIVE ELEMENTS (add 3-5 per website):
═══════════════════════════════════════════

- Floating gradient orbs: position:absolute divs with border-radius:50%, opacity:0.12, filter: blur(60px), width/height 200-500px, animation: float 8s ease-in-out infinite
- Subtle grid/dot patterns: background-image with repeating-linear-gradient or radial-gradient for texture
- Glowing accent lines: height:3px divs with gradient background between sections
- Geometric shapes: rotated 45deg squares in corners with low opacity
- Abstract blobs: border-radius: 30% 70% 70% 30% / 30% 30% 70% 70% with gradient fills
- ALL decorative elements should have pointer-events: none

═══════════════════════════════════════════
PREMIUM DESIGN REQUIREMENTS (MANDATORY):
═══════════════════════════════════════════

1. GLASSMORPHISM: Use backdrop-filter: blur(20px) with semi-transparent backgrounds on cards and overlays
2. DEPTH & LAYERS: Overlap elements, use z-index layering, offset cards with large shadows (box-shadow: 0 20px 60px rgba(0,0,0,0.15))
3. HOVER ANIMATIONS: Every interactive element must have smooth hover transitions — transform, box-shadow, and color changes
4. GRADIENT TEXT: Use background: linear-gradient(...); -webkit-background-clip: text; -webkit-text-fill-color: transparent on key headlines — BUT only with DARK, HIGH-CONTRAST gradient colors (never use light/pastel gradients on light backgrounds)
5. ACCENT LINES: Add thin gradient lines (height: 2-3px) as section dividers
6. CARD HOVER EFFECTS: transform: translateY(-8px); box-shadow: 0 20px 60px rgba(0,0,0,0.15) on hover
7. BADGE/TAG ELEMENTS: Small pill-shaped tags (border-radius: 100px; padding: 6px 16px) above section titles with subtle gradient background
8. ICON CONTAINERS: Wrap icons in styled containers (width:56px; height:56px; border-radius:14px; display:flex; align-items:center; justify-content:center; background:linear-gradient(...))
9. WHITESPACE: Generous asymmetric padding — vary between 80px and 140px per section
10. IMAGE OVERLAYS: When using hero bg images, add gradient overlay: background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('...')

═══════════════════════════════════════════
TEXT CONTRAST & READABILITY (CRITICAL — NEVER VIOLATE):
═══════════════════════════════════════════

EVERY piece of text MUST be clearly readable against its background. This is NON-NEGOTIABLE:

1. On LIGHT backgrounds (#fff, #fafafa, #f5f5f5, pastels): headlines MUST use DARK text colors (#0a0a0a to #333). NEVER use light, pastel, or faded colors for text on light backgrounds.
2. On DARK backgrounds (#0a0a0a to #333): text MUST be white (#fff) or very light (#e5e7eb+).
3. GRADIENT TEXT: Only use gradient text (-webkit-background-clip: text) with DARK, saturated colors on light backgrounds (e.g. linear-gradient(135deg, #1e1b4b, #4c1d95)) or LIGHT colors on dark backgrounds. NEVER use light/faded gradient colors (like #c4b5fd, #a78bfa) on light backgrounds.
4. Subheadlines and body text: minimum color contrast — use #374151 to #64748b on white, or rgba(255,255,255,0.8)+ on dark.
5. Card text: if card background is light/white, text must be dark (#1a1a2e to #4b5563). If card background is dark, text must be light.
6. Badge/label text inside colored backgrounds must always be white or very light.
7. DO NOT use text colors with less than 4.5:1 contrast ratio against their background — this makes text unreadable.

═══════════════════════════════════════════
DESIGN VARIETY — EVERY WEBSITE MUST BE UNIQUE:
═══════════════════════════════════════════

★ If the user message contains a "DESIGN DIRECTION" block, treat it as binding: match the chosen visual style, color mood, hero layout, personality, and fancy effects precisely. The chosen style dictates the colors, fonts, shapes, and overall mood — commit to it fully and consistently across ALL sections. Do NOT fall back to a generic indigo/purple-on-white look unless that is what was chosen.

★ When a design dimension is left to you (no choice given, or "Surprise me"), deliberately AVOID the obvious default. Each site should feel hand-crafted and distinct from the last — vary fonts, color palettes, section layouts, and decorative treatments boldly. Never reuse the same hero or card pattern every time.

Otherwise, pick ONE aesthetic theme AND one color palette per website:

AESTHETIC THEMES:
- DARK LUXURY: Deep blacks (#0a0a0a, #111), gold/amber accents (#d4a574, #c9a050), serif display fonts, dramatic large shadows
- NEON CYBER: Dark bg (#0a0a1a), neon glows (cyan #00f0ff, magenta #ff00aa, lime #00ff88), tech feel, monospace accents
- SOFT MINIMAL: Off-white bg (#fafaf9, #f5f5f0), pastel accents, lots of whitespace, thin 1px borders, subtle shadows
- BOLD VIBRANT: Saturated primary colors, extra-large bold typography (72-96px headlines), energetic gradients
- EARTH ORGANIC: Warm browns (#8B7355), sage greens (#87A878), cream (#FFF8F0), natural rounded shapes
- OCEAN FRESH: Deep blue (#1a365d), teal (#0d9488), white, wave-like clip-paths at section borders
- SUNSET WARM: Orange (#f97316), pink (#ec4899), purple (#8b5cf6), warm multi-color gradients
- MONOCHROME SHARP: Single hue in 6+ shades, high contrast, geometric shapes, sharp corners

HERO styles to vary:
- Full-screen with background image + dark gradient overlay + centered text
- Split 50/50: text left, real photo right with decorative frame/border elements
- Diagonal clip-path background with overlapping glass stat cards
- Large headline with animated underline + floating orbs + background image
- Dark hero with neon-bordered glass cards, glowing accent lines
- Asymmetric: text on 60%, stacked image cards on 40% with overlap effect

CONTENT SECTION styles to vary:
- Card grid (3 columns) with real photos, hover-lift effects, gradient borders
- Alternating left-right: text + real image blocks with decorative elements between
- Numbered vertical timeline with connecting gradient line and icons
- Bento grid with mixed card sizes (span 2 columns, different heights)
- Feature spotlight: one large image + multiple small text cards overlapping
- Testimonials with avatar photos, star ratings, quote marks, glass cards

SECTION IDEAS (pick what fits):
Navigation, Hero, Features/Benefits, Services, About/Story, Testimonials/Reviews, Pricing/Plans, FAQ, Contact, Newsletter/CTA, Stats/Numbers, Team, Gallery/Portfolio, Menu (restaurants), Footer

CONTENT RULES:
- ALL content must be SPECIFIC to the user's prompt — not generic
- If prompt says "dental clinic" → dental services, teeth whitening prices, patient testimonials
- If prompt says "coding bootcamp" → programming courses, student success rates, tech stacks
- The siteName must be a CREATIVE brand name relevant to the prompt
- Stats must be specific: "2,847 patients served" not "1000+"
- Testimonials: realistic full names, specific results, avatar images
- Use real-sounding prices, phone numbers, addresses and opening hours
- Image seeds must be relevant to the content (seed name should describe the image subject)`;



// ═══════════════════════════════════════════
// ASYNC GENERATION — plan + per-section
// ═══════════════════════════════════════════
// Generating a whole site in one request takes ~120s, which exceeds Vercel's
// 60s serverless limit. Instead we split it: one fast "plan" call returns the
// metadata + section list, then the client generates each section in its own
// short request. Every request stays well under 60s.

export interface SitePlan {
    siteName: string;
    category: string;
    theme: {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
        backgroundColor: string;
        textColor: string;
        fontFamily: string;
    };
    sections: { id: string; label: string }[];
    brief: string; // condensed design+content brief passed to each section call
}

const PLAN_SYSTEM_PROMPT = `You are an elite website designer. Plan a website's structure and visual identity. Output ONLY valid JSON (no markdown, no code fences) in EXACTLY this shape:

{
  "siteName": "Creative Brand Name",
  "category": "business|portfolio|restaurant|local-service|event|basic-store",
  "theme": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "accentColor": "#hex",
    "backgroundColor": "#hex",
    "textColor": "#hex",
    "fontFamily": "Inter|Outfit|DM Sans|Playfair Display|Space Grotesk|Sora|Crimson Pro|Raleway|Poppins|Montserrat"
  },
  "sections": [
    { "id": "nav-1", "label": "Navigation" },
    { "id": "hero-1", "label": "Hero" },
    { "id": "features-1", "label": "Features" },
    { "id": "footer-1", "label": "Footer" }
  ],
  "brief": "A 2-4 sentence shared style+content brief: the chosen aesthetic, exact palette, fonts, mood, and key facts about the business. Every section will be built to match this brief."
}

RULES:
- Choose a CREATIVE siteName specific to the user's prompt.
- If the user provided a DESIGN DIRECTION, the theme + brief MUST match it precisely (style, color mood, personality). Otherwise pick a bold, distinctive aesthetic — never a generic indigo-on-white default.
- 6-9 sections. ALWAYS include navigation first and footer last. Use varied ids like nav-1, hero-1, features-1, about-1, services-1, testimonials-1, pricing-1, gallery-1, contact-1, cta-1, footer-1.
- The "brief" is critical: it is the ONLY shared context each section build receives, so pack in the palette (with hex), fonts, mood, and the most important business facts.
- Output ONLY the JSON object.`;

function sectionSystemPrompt(plan: SitePlan): string {
    return `You are an elite website designer building ONE section of a larger website. Output ONLY the raw HTML for this single section — no JSON, no markdown, no code fences, no explanation.

SHARED SITE CONTEXT (every section must match this exactly):
- Site name: ${plan.siteName}
- Category: ${plan.category}
- Theme: ${JSON.stringify(plan.theme)}
- Design & content brief: ${plan.brief}

OUTPUT FORMAT:
Return a single complete, self-contained HTML block for this section with ALL styles inline (style="..."). If this is the FIRST section (navigation), begin with a <style> tag containing a Google Fonts @import for the theme fonts and CSS @keyframes (fadeInUp, fadeInLeft, fadeInRight, float, scaleIn, shimmer, pulseGlow, gradientShift), then the <nav>.

DESIGN REQUIREMENTS (mandatory):
- Make it look like a $50k agency website — premium, modern, unique. NOT a template.
- Use the exact theme colors above. Use CSS variables where helpful: var(--primary), var(--secondary), var(--accent), var(--bg), var(--text).
- Use REAL images from picsum.photos: https://picsum.photos/seed/{unique-keyword}/{w}/{h} with relevant, UNIQUE seed keywords. Always include alt text and object-fit:cover.
- Modern CSS: flexbox/grid, gradients, glassmorphism (backdrop-filter), large soft shadows, border-radius, smooth hover transitions, entrance animations on elements.
- Generous spacing (vary 80-140px section padding), strong typographic hierarchy.
- ALL text must be high-contrast and readable against its background (dark text on light bg, light text on dark bg). Never light/pastel text on light backgrounds.
- ALL content must be SPECIFIC to this business — realistic names, prices, stats, copy. No generic filler.
- Buttons: <a href="#" style="...">. Forms: <form onsubmit="event.preventDefault()">.
- Decorative absolute-positioned elements must have pointer-events:none.`;
}

export async function planWebsite(
    prompt: string,
    category: string,
    answers?: Record<string, string>,
    model?: string,
    designBrief?: string
): Promise<SitePlan> {
    const userMessage = buildGenerationMessage(prompt, category, answers, designBrief);
    const text = await callClaude(
        PLAN_SYSTEM_PROMPT,
        [{ role: "user", content: userMessage }],
        2048,
        model || DEFAULT_MODEL
    );
    const plan = JSON.parse(cleanJson(text));
    if (!plan.sections || !Array.isArray(plan.sections) || plan.sections.length === 0) {
        throw new Error("Plan returned no sections");
    }
    return plan as SitePlan;
}

export async function generateSection(
    plan: SitePlan,
    section: { id: string; label: string },
    model?: string
): Promise<{ id: string; type: "custom"; content: { html: string; sectionLabel: string } }> {
    const isFirst = plan.sections[0]?.id === section.id;
    const text = await callClaude(
        sectionSystemPrompt(plan),
        [{
            role: "user",
            content: `Build the "${section.label}" section (id: ${section.id})${isFirst ? " — this is the FIRST section, include the <style> tag with fonts and keyframes before the nav" : ""}. Output ONLY the HTML.`,
        }],
        4096,
        model || DEFAULT_MODEL
    );

    // Strip any stray code fences or section markers the model might add.
    let html = text.trim();
    html = html.replace(/^```html?\s*/i, "").replace(/```\s*$/i, "").trim();
    html = html.replace(/^={3,}\s*SECTION:[^=]*={3,}\s*/i, "").replace(/={3,}\s*END_SECTION\s*={3,}\s*$/i, "").trim();

    return {
        id: section.id,
        type: "custom" as const,
        content: { html, sectionLabel: section.label },
    };
}

function parseWebsiteResponse(text: string): any {
    // Extract JSON metadata — handle whitespace variations around markers
    let jsonMatch = text.match(/={3,}\s*JSON_START\s*={3,}([\s\S]*?)={3,}\s*JSON_END\s*={3,}/);

    // Fallback: try to find JSON block between markers with any formatting
    if (!jsonMatch) {
        jsonMatch = text.match(/JSON_START.*?\n([\s\S]*?)JSON_END/);
    }

    if (!jsonMatch) {
        // Log for debugging
        console.error("Failed to parse AI response. First 500 chars:", text.substring(0, 500));
        throw new Error("No JSON metadata found in response");
    }

    let metadata: any;
    const jsonText = cleanJson(jsonMatch[1]);
    metadata = JSON.parse(jsonText);

    // Extract HTML sections — handle whitespace variations
    const sectionRegex = /={3,}\s*SECTION:([\w-]+):(.*?)\s*={3,}\n?([\s\S]*?)={3,}\s*END_SECTION\s*={3,}/g;
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

export async function generateWebsite(prompt: string, category: string, answers?: Record<string, string>, model?: string, designBrief?: string) {
    const userMessage = buildGenerationMessage(prompt, category, answers, designBrief);

    const text = await callClaude(
        SYSTEM_PROMPT,
        [{ role: "user", content: userMessage }],
        16384, // Higher token limit for full HTML generation
        model || DEFAULT_MODEL
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
