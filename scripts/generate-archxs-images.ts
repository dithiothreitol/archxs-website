/**
 * Generates the site's illustrations with Gemini.
 *
 *   npx tsx scripts/generate-archxs-images.ts            # only missing files
 *   npx tsx scripts/generate-archxs-images.ts --force    # regenerate everything
 *   npx tsx scripts/generate-archxs-images.ts --only=hero-blueprint
 *   npx tsx scripts/generate-archxs-images.ts --prompts  # write prompts, call nothing
 *
 * Masters land in public/img/**\/*.png; run `npm run convert-webp` afterwards —
 * only .webp is committed and referenced by the site.
 *
 * Notes carried over from an earlier pipeline, both learned the hard way:
 *  - maxOutputTokens must be large. Image-preview models "think" before emitting
 *    the image; a small budget is consumed by reasoning and the response comes
 *    back with finishReason MAX_TOKENS and no image part at all.
 *  - never ask the model for text inside the artwork. Wordmarks and OG cards are
 *    composed with sharp instead (see compose-brand-assets.ts).
 */
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import sharp from "sharp";

dotenv.config({ path: ".env.local" });
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.1-flash-image-preview";
const API_URL = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

const RATE_LIMIT_MS = 12_000; // 5 requests/minute
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 15_000;

const PUBLIC_DIR = path.join(process.cwd(), "public");
const PROMPT_DIR = path.join(process.cwd(), "scripts", ".gen-prompts");
const LOG_DIR = path.join(process.cwd(), "scripts", ".gen-logs");

/* ── Brand style guide, appended to every prompt ───────────────────────────
   This block is the whole identity. It is a deliberate inversion of the
   default "AI landing page" look: paper instead of dark navy, drafting
   linework instead of glassmorphism, one accent colour, no glow. */
const ARCHXS_STYLE_GUIDE = `
BRAND ESSENCE: a technical blueprint drawing that has been redrawn as modern
editorial illustration. The calm confidence of an architect's drafting table —
considered, precise, quiet. Never sci-fi, never a futuristic dashboard.

COLOR PALETTE (strict):
- Ground: warm drafting paper #F7F5F0, with subtle paper tooth.
- Linework: ink #1A1C1E, consistent thin weight as if drawn with a 0.35mm pen.
- Accent: drafting red-orange #C8431F, used sparingly — annotations, a single
  highlighted element, dimension ticks. Never more than ~8% of the image.
- Secondary fills: muted steel blue #46647F and warm grey, flat and desaturated.
- ABSOLUTELY NO: purple, magenta, neon, cyan glow, lens flare, bloom,
  glassmorphism, dark gradient backgrounds, chrome, holograms.

ART STYLE: isometric or axonometric technical illustration. Thin consistent
contour lines, selective flat fills, generous whitespace, orthographic feel.
Small drafting annotations as decoration: dimension lines with end ticks,
registration marks, section arrows, hatching for cut surfaces. Composition is
balanced and calm, with clear negative space — the drawing breathes.

CONTENT RULES: no readable text, no letters, no numbers, no logos, no company
marks, no human faces, no photorealistic people. Objects and structures only.

TECHNICAL: crisp edges, print quality, high detail in linework, even lighting
with no dramatic shadows, flat or very shallow depth.`;

type ImageDef = {
  id: string;
  outputPath: string; // relative to public/
  width: number;
  height: number;
  aspectRatio: "16:9" | "4:3" | "1:1" | "3:4" ;
  prompt: string;
};

const IMAGES: ImageDef[] = [
  // ── Hero ────────────────────────────────────────────────────────────────
  {
    id: "hero-blueprint",
    outputPath: "img/hero/hero-blueprint.png",
    width: 1600,
    height: 1200,
    aspectRatio: "4:3",
    prompt: `SCENE: An isometric technical drawing of a layered structure resting on
a drafting table, seen slightly from above. The structure is built of four
clearly separated horizontal strata, stacked like floors of a building shown in
exploded axonometric view, with thin vertical guide lines connecting them:
- the lowest stratum is a dense foundation grid of small server-like blocks and
  conduits (infrastructure),
- above it a stratum of interlocking gears and pipeline channels routing between
  nodes (processes),
- above that a stratum of connected nodes and branching decision paths,
- the topmost stratum is a single clean plane with one small element outlined in
  drafting red-orange, as if it were the decision being approved.
IMPORTANT: dimension lines with end ticks run along the left edge measuring the
height of each stratum, as on a real elevation drawing.
BACKGROUND: warm drafting paper with a faint millimetre grid, mostly empty.
TECHNICAL: 4:3, isometric, thin ink linework, one red-orange accent only.
${ARCHXS_STYLE_GUIDE}`,
  },

  // ── Practice areas ──────────────────────────────────────────────────────
  {
    id: "enterprise-architecture",
    outputPath: "img/practice/enterprise-architecture.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An axonometric city-like plan of an enterprise system landscape
drawn as a technical site plan: rectangular building blocks of varying heights
arranged on a grid, connected by clean orthogonal routes. A transparent overlay
plane hovers slightly above part of the plan, showing the same blocks as an
abstracted model — the map above the territory. Two or three blocks are marked
with small red-orange registration brackets, as if flagged in a review.
IMPORTANT: include drafting annotations — section arrows, a north arrow, small
tick marks along the edges.
BACKGROUND: drafting paper, faint grid, generous empty margin.
TECHNICAL: 16:9, axonometric, thin ink linework.
${ARCHXS_STYLE_GUIDE}`,
  },
  {
    id: "business-process-automation",
    outputPath: "img/practice/business-process-automation.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: A technical drawing of a process line rendered as industrial
piping and conveyor mechanism seen in axonometric projection. Documents move
along the line as flat rectangular plates; at three points the line passes
through a gate mechanism drawn in section, with hatching on the cut faces. One
gate is drawn in red-orange, standing slightly open, with a small lever beside
it — the point where a human decides. Two side branches loop back upstream.
IMPORTANT: dimension lines measuring the span between gates, drawn as on an
engineering drawing.
BACKGROUND: drafting paper, faint grid.
TECHNICAL: 16:9, axonometric, thin ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },
  {
    id: "cybersecurity-identity",
    outputPath: "img/practice/cybersecurity-identity.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An architectural cross-section drawing of a fortified structure,
cut vertically so the interior layers are visible, in the style of a building
section. Concentric wall layers separate an outer zone from an inner vault; the
cut faces are hatched. A single narrow gateway passes through all layers, and at
its centre sits a small precise mechanism resembling a lock cylinder, outlined in
drafting red-orange. Thin leader lines point from each wall layer to empty
annotation space at the right, as if labels were about to be written.
BACKGROUND: drafting paper, faint grid, empty right margin for annotations.
TECHNICAL: 16:9, orthographic section, hatched cut surfaces, thin ink linework.
${ARCHXS_STYLE_GUIDE}`,
  },
  {
    id: "applied-ai",
    outputPath: "img/practice/applied-ai.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: A technical diagram of a decision mechanism drawn in axonometric
projection. On the left, a dense cloud-like lattice of fine interconnected lines
produces several candidate objects on a small tray — proposals. The tray feeds
into a rigid mechanical gate assembly drawn with precise engineering detail:
calipers, a measuring gauge, a stop block. Only some candidates pass through. On
the right, a single object rests on a clean pedestal beneath a small red-orange
approval mark. The contrast is deliberate: the generator is soft and organic, the
gate is hard and mechanical.
IMPORTANT: the mechanical gate must look measurably precise; the lattice must
look probabilistic and loose.
BACKGROUND: drafting paper, faint grid.
TECHNICAL: 16:9, axonometric, thin ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },
  {
    id: "software-delivery",
    outputPath: "img/practice/software-delivery.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An exploded axonometric assembly drawing of a small machine,
its components separated along thin dashed guide lines and floating in their
assembly order — as in a technical manual. Components include stacked plates,
a housing shown in section with hatching, connectors and fasteners. Beside the
assembly lies a flat drawn sheet showing the same machine as an orthographic
plan, and a small bound booklet — the documentation that ships with it, drawn as
a plain closed object with no readable text. One fastener is red-orange.
BACKGROUND: drafting paper, faint grid, wide empty margins.
TECHNICAL: 16:9, exploded axonometric, dashed assembly guide lines, thin ink.
${ARCHXS_STYLE_GUIDE}`,
  },

  // ── Case studies ────────────────────────────────────────────────────────
  {
    id: "work-krypto-znaczek",
    outputPath: "img/work/krypto-znaczek-poczta-polska.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An axonometric technical drawing of a postage stamp rendered as an
engineered object: a rectangular plate with perforated edges, drawn in exploded
view so that two layers separate — the physical printed plate above, and beneath
it a thin lattice plane of linked hexagonal cells representing a distributed
ledger, connected by fine vertical guide lines. A small red-orange registration
bracket marks one cell of the lattice. Around the object, drafting annotations:
dimension lines measuring the plate, a section arrow.
BACKGROUND: drafting paper, faint grid, wide empty margins.
TECHNICAL: 16:9, exploded axonometric, thin ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },
  {
    id: "work-core-banking",
    outputPath: "img/work/core-banking-replacement.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An architectural section drawing of a large classical building
being underpinned: the superstructure stays standing and intact while its
foundation is shown mid-replacement — temporary shoring columns and jacks hold
the building up, the old footing is drawn in fine dashed line, the new footing
in solid line beneath it. Hatching marks the cut faces. One shoring element is
drafting red-orange. Numerous thin leader lines fan out to empty annotation
space.
IMPORTANT: the building above must read as fully operational and undisturbed;
all the complexity is underneath.
BACKGROUND: drafting paper, faint grid.
TECHNICAL: 16:9, orthographic section, hatched cut surfaces, thin ink linework.
${ARCHXS_STYLE_GUIDE}`,
  },
  {
    id: "work-regulated-fintech",
    outputPath: "img/work/regulated-fintech-platform.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An axonometric drawing of a small precise structure being built
on an empty plot: a foundation slab already poured, a partial frame rising, and
a surveyor's tripod with plumb line set up beside it checking alignment. Around
the plot runs a boundary line drawn as a formal survey border with tick marks
and corner monuments — the regulatory perimeter. One corner monument is
red-orange. The structure is small but the setting-out around it is elaborate.
BACKGROUND: drafting paper, faint grid, generous empty space.
TECHNICAL: 16:9, axonometric, thin ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },
  {
    id: "work-identity",
    outputPath: "img/work/identity-web3-keycloak.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: A mechanical engineering drawing of a lock cylinder shown in
exploded axonometric view: the housing in section with hatching, the pin stack
separated above it, a key blank, and a second alternative key of a completely
different geometry entering the same housing from another side — two different
credentials, one mechanism. A small counter-wheel marked with a tick sits beside
the housing, suggesting a single-use token. One pin is drafting red-orange.
BACKGROUND: drafting paper, faint grid, dashed assembly guide lines.
TECHNICAL: 16:9, exploded axonometric, hatched section, thin ink linework.
${ARCHXS_STYLE_GUIDE}`,
  },
  {
    id: "work-governance",
    outputPath: "img/work/architecture-governance-toolchain.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: A drafting table seen from directly above, orthographic plan
view. On it lies a technical drawing of a system diagram — boxes and connecting
lines. Over the drawing sits a precise measuring apparatus: a set square, a
caliper and a stamping mechanism poised above one corner, as if the drawing must
pass inspection before it is stamped. Two small stamp impressions are visible on
the sheet edge, one of them drafting red-orange. Fine tick marks run along the
sheet border.
BACKGROUND: drafting paper, faint grid, top-down flat composition.
TECHNICAL: 16:9, orthographic plan view, thin ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },
  {
    id: "work-manufacturing",
    outputPath: "img/work/ai-first-manufacturing-platform.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An axonometric plant layout drawing: a production hall shown as
a technical floor plan with machine blocks, conveyor routes and silos, drawn
with engineering precision. Above the hall, connected by thin vertical guide
lines, floats a second plane containing a compact cluster of small linked
modules — the internal systems layer — all sharing one common spine that runs
through the cluster. One module in the cluster is outlined in drafting
red-orange. Dimension lines run along the hall's edges.
BACKGROUND: drafting paper, faint grid.
TECHNICAL: 16:9, axonometric, thin ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },

  // ── Method ──────────────────────────────────────────────────────────────
  {
    id: "method-loop",
    outputPath: "img/method/method-loop.png",
    width: 1200,
    height: 1200,
    aspectRatio: "1:1",
    prompt: `SCENE: A closed control loop drawn as a precise mechanical schematic in
orthographic projection: a circular path of linked rods and pivots, interrupted
at one point by a gate mechanism and at another by a small stamping press. The
loop reads as a machine that must pass through both obstacles on every cycle. The
gate is drawn in drafting red-orange. Small dimension ticks mark the segments of
the circle.
BACKGROUND: drafting paper, faint grid, centred composition with wide margins.
TECHNICAL: 1:1, orthographic, thin ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },
];

/* ── Runner ───────────────────────────────────────────────────────────────── */

const args = process.argv.slice(2);
const force = args.includes("--force");
const promptsOnly = args.includes("--prompts");
const onlyArg = args.find((a) => a.startsWith("--only="))?.split("=")[1];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function ensureDir(file: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

async function generateOne(def: ImageDef): Promise<Buffer> {
  if (!API_KEY) throw new Error("GEMINI_API_KEY is not set");

  let lastError = "";
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(API_URL(API_KEY), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: def.prompt }] }],
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
          temperature: 0.7,
          candidateCount: 1,
          // Large on purpose — see the note at the top of this file.
          maxOutputTokens: 32768,
          imageConfig: { aspectRatio: def.aspectRatio, imageSize: "2K" },
        },
        safetySettings: [
          "HARM_CATEGORY_HARASSMENT",
          "HARM_CATEGORY_HATE_SPEECH",
          "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          "HARM_CATEGORY_DANGEROUS_CONTENT",
        ].map((category) => ({ category, threshold: "BLOCK_NONE" })),
      }),
    });

    if (!res.ok) {
      lastError = `HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`;
    } else {
      const json = await res.json();
      const candidate = json.candidates?.[0];
      const parts = candidate?.content?.parts ?? [];
      const imagePart = parts.find((p: { inlineData?: { mimeType?: string } }) =>
        p.inlineData?.mimeType?.startsWith("image/"),
      );

      if (imagePart) return Buffer.from(imagePart.inlineData.data, "base64");

      // Diagnose the common failure modes explicitly — a bare "no image"
      // message costs far more debugging time than it saves.
      if (json.promptFeedback?.blockReason) {
        lastError = `blocked: ${json.promptFeedback.blockReason}`;
      } else if (candidate?.finishReason === "MAX_TOKENS") {
        lastError =
          "finishReason MAX_TOKENS — the model spent its budget reasoning; raise maxOutputTokens";
      } else if (candidate?.finishReason) {
        lastError = `finishReason ${candidate.finishReason}${
          candidate.finishMessage ? `: ${candidate.finishMessage}` : ""
        }`;
      } else {
        const text = parts.find((p: { text?: string }) => p.text)?.text;
        lastError = text
          ? `model returned text instead of an image: ${text.slice(0, 200)}`
          : "response contained no image part";
      }
    }

    if (attempt < MAX_RETRIES) {
      console.log(`   retry ${attempt}/${MAX_RETRIES - 1} — ${lastError}`);
      await sleep(RETRY_DELAY_MS);
    }
  }
  throw new Error(lastError);
}

async function main() {
  const targets = IMAGES.filter((d) => !onlyArg || d.id === onlyArg);
  if (targets.length === 0) {
    console.error(`No image matches --only=${onlyArg}`);
    process.exit(1);
  }

  fs.mkdirSync(PROMPT_DIR, { recursive: true });
  for (const def of targets) {
    fs.writeFileSync(path.join(PROMPT_DIR, `${def.id}.txt`), def.prompt, "utf8");
  }
  if (promptsOnly) {
    console.log(`Wrote ${targets.length} prompts to scripts/.gen-prompts/`);
    return;
  }

  if (!API_KEY) {
    console.error(
      "GEMINI_API_KEY is not set. Prompts were written to scripts/.gen-prompts/ —\n" +
        "set the key in .env.local and run again, or generate the images elsewhere.",
    );
    process.exit(1);
  }

  const log: Record<string, unknown>[] = [];
  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const [i, def] of targets.entries()) {
    const outFile = path.join(PUBLIC_DIR, def.outputPath);
    const webpTwin = outFile.replace(/\.png$/, ".webp");

    if (!force && (fs.existsSync(outFile) || fs.existsSync(webpTwin))) {
      console.log(`SKIP  ${def.id} (already present)`);
      skipped++;
      continue;
    }

    console.log(`GEN   ${def.id} → ${def.outputPath}`);
    const startedAt = Date.now();
    try {
      const raw = await generateOne(def);
      ensureDir(outFile);
      try {
        await sharp(raw)
          .resize(def.width, def.height, { fit: "cover" })
          .png({ compressionLevel: 9 })
          .toFile(outFile);
      } catch {
        fs.writeFileSync(outFile, raw); // keep the bytes even if resize fails
      }
      const kb = Math.round(fs.statSync(outFile).size / 1024);
      console.log(`  ok  ${kb} KB in ${Math.round((Date.now() - startedAt) / 1000)}s`);
      generated++;
      log.push({ id: def.id, status: "ok", kb });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  FAIL ${def.id}: ${message}`);
      failed++;
      log.push({ id: def.id, status: "failed", error: message });
    }

    if (i < targets.length - 1) await sleep(RATE_LIMIT_MS);
  }

  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(LOG_DIR, `generation-${process.pid}.json`),
    JSON.stringify({ model: MODEL, log }, null, 2),
    "utf8",
  );

  console.log(
    `\nDone — ${generated} generated, ${skipped} skipped, ${failed} failed.` +
      (generated ? "\nNext: npm run convert-webp" : ""),
  );
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
