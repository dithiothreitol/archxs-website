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
    id: "physical-ai",
    outputPath: "img/practice/physical-ai.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An axonometric drawing of a closed working loop laid out on a
drafting table. At the upper left, a hand-operated leader linkage with a simple
grip — an articulated arm, no hand and no figure drawn — is coupled by a thin
dashed line to a follower arm of identical geometry that repeats its pose. That
follower stands inside a sectioned enclosure with hatched cut faces and is drawn
entirely in fine dashed line, a rehearsal rather than a real machine. To the
right, an arm of exactly the same geometry appears again, this time in solid
line, mounted on a plain bench beside a small stack of flat parts. A caliper is
set between the dashed pose and the solid pose, measuring the difference between
them; the caliper is the single drafting red-orange element. A closed track of
linked rods and pivots runs around all the stations and returns to the leader
linkage, so the whole drawing reads as one repeating cycle, with a small
recording spool mounted on the track between the enclosure and the bench.
IMPORTANT: the dashed arm must read as a rehearsal of the solid arm, identical in
geometry. No humanoid robots, no faces, no factory scenery, nothing sci-fi.
CRITICAL: the drawing carries no labels, no callouts and no lettering of any kind.
BACKGROUND: drafting paper, faint grid, generous empty space.
TECHNICAL: 16:9, axonometric, hatched cut faces on the enclosure, dashed guide
lines, thin ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },
  {
    id: "blockchain-web3",
    outputPath: "img/practice/blockchain-web3.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An axonometric drawing of a registry mechanism composed of two
parts that must read as opposites, placed side by side and filling the frame
evenly.
On the right, the immutable part: one heavy monolithic bar cast as a single
continuous piece, its top face divided only by shallow pressed seal impressions,
with no seams, no fasteners and no openings anywhere on it. Its near end is shown
cut in section with hatching, proving it is solid all the way through.
On the left, sitting directly against it and joined by a single hinged coupling,
the changeable part: an open frame holding a row of clearly separate rectangular
modules of visibly differing depths, each retained by a quarter-turn fastener,
one module drawn lifted out along thin dashed guide lines above the empty slot it
came from. That hinged coupling between the solid bar and the module frame is the
single drafting red-orange element in the drawing.
In the foreground below, drawn at generous size, a plain counter hatch seen from
the customer's side: a flat blank plate rests on a shallow tray being pushed
through the opening, and on the far side of the hatch, clearly beyond the tray's
reach, a small key hangs on a hook — custody stays behind the counter. Dimension
lines with end ticks run beneath the bar and the frame.
IMPORTANT: the monolithic bar must read as impossible to open and the module
frame as designed to be taken apart; they must not look like two rows of the same
thing. No coins, no currency symbols, no chain links, no padlocks, no crystals.
CRITICAL: the drawing carries no labels, no callouts and no lettering of any kind.
BACKGROUND: drafting paper, faint grid, balanced composition with even margins on
both sides.
TECHNICAL: 16:9, axonometric, hatching on the cut end of the solid bar, dashed
assembly guide lines, thin ink linework, one accent colour.
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

  {
    id: "work-henomorphs",
    outputPath: "img/work/henomorphs-onchain-economy.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An exploded axonometric drawing of a faceted polyhedral core
mechanism: a many-sided central hub with flat interchangeable plates detaching
outward along thin dashed guide lines, each plate a distinct machined module that
clearly fits back into the same hub — one body, many replaceable faces. One plate
is drawn part-way removed and outlined in drafting red-orange, as if being
swapped. To the right, smaller and quieter, a balance beam on a pivot carries two
weights of different geometry: one a solid fixed block, the other a stack of thin
loose discs. Fine leader lines connect a few plates to empty annotation space.
IMPORTANT: the plates must read as interchangeable parts of one shared body, not
as separate objects.
BACKGROUND: drafting paper, faint grid, wide empty margins.
TECHNICAL: 16:9, exploded axonometric, dashed assembly guide lines, thin ink
linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },
  {
    id: "work-bindaro",
    outputPath: "img/work/bindaro-collector-platform.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An axonometric drawing of a collector's plate album opened flat on
a drafting table: a rigid case with a grid of shallow recessed slots, each slot
holding a small thin square plate seen edge-on and in plan. One plate has been
lifted out of its slot and rests on a small measuring stage beside the album,
where a caliper and a graduated gauge are set against it — the plate being
assessed. Its empty slot in the grid is outlined in drafting red-orange. Behind
the album, drawn smaller, a compact intake mechanism feeds plates in from a
distant line into an indexed card drawer, suggesting where the contents are
catalogued before they reach the album.
IMPORTANT: the album grid must read as ordered and curated, the intake mechanism
as a supply line, not as decoration.
BACKGROUND: drafting paper, faint grid, generous empty space.
TECHNICAL: 16:9, axonometric, thin ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },
  {
    id: "work-jdg-ksiegowy",
    outputPath: "img/work/jdg-ksiegowy-ai-accounting.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An axonometric technical drawing of a document-handling machine.
Loose sheets, drawn as flat blank plates in an untidy fanned stack, are drawn in
at the left. They pass through a rigid template plate cut with one precise
aperture — a gauge that only an exactly shaped sheet can pass — and the mismatched
sheets are deflected into a small tray below. Beyond the gauge the sheets become
uniform and stacked square, entering a sealed cylindrical chute that rises and
exits the frame. A separate short chute returns from it, delivering one small
embossed disc into a shallow tray, and that disc is the single drafting
red-orange element in the drawing.
IMPORTANT: the contrast must be legible — loose and irregular before the gauge,
identical and squared after it.
CRITICAL: the drawing carries no labels, no callouts and no lettering of any
kind. Leader lines and arrows are permitted only if they end in empty paper.
BACKGROUND: drafting paper, faint grid, empty margins.
TECHNICAL: 16:9, axonometric, hatching on the cut faces of the template plate,
thin ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },
  {
    id: "work-llm-arena",
    outputPath: "img/work/llm-game-arena.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An axonometric drawing of a verification bench. On the left, a
small game board of squares sits on an open table where a sequence of identical
tokens has been laid out in a track, loosely and openly — anyone can reach it. The
track feeds into a rigid comparator mechanism at the centre: two identical
matched movements drawn side by side, one above the other, running the same
sequence of tokens in step, with a stop block between them. On the right, only
the tokens that passed the comparator are stacked in a neat graduated column on a
pedestal, like a measured scale. The stop block is drafting red-orange. A few
rejected tokens lie fallen beneath the comparator.
IMPORTANT: the two movements in the comparator must look mechanically identical;
that duplication is the subject of the drawing.
BACKGROUND: drafting paper, faint grid, generous empty space.
TECHNICAL: 16:9, axonometric, thin ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },

  {
    id: "work-trainctl",
    outputPath: "img/work/trainctl-plan-as-code.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An axonometric drawing of a planning rail: a long horizontal
track carrying a row of small identical plates standing upright in sequence, like
cards in a filing rail. From several plates, thin leader lines drop down to a neat
stack of closed bound volumes resting on the table below, tying each plate to a
source. One plate stands slightly proud of the row and is outlined in drafting
red-orange. To the right, mounted on a small upright panel, sit three circular
instrument dials: one has a needle and a graduated scale, the other two have no
needle at all and are covered by plain blank cover plates fixed with small screws
— instruments deliberately not fitted.
IMPORTANT: the two capped dials must read as intentionally blanked, not broken;
the volumes must read as closed reference books, plain objects with no cover art.
CRITICAL: the drawing carries no labels, no callouts and no lettering of any
kind, including on the dial faces, the plates and the book spines.
BACKGROUND: drafting paper, faint grid, generous empty space.
TECHNICAL: 16:9, axonometric, thin ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },

  {
    id: "work-grzybiarz",
    outputPath: "img/work/mushroom-foraging-offline-cv.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: A botanical plate redrawn as an engineering comparison. Two
mushroom specimens stand side by side on a shared baseline, drawn as precise
technical objects rather than as naturalistic illustration: thin contour lines,
one shown in vertical section with hatched cut faces so the stem base and the cup
at its foot are visible. Between them, a comparison caliper spans from one
specimen to the other, and three small paired detail circles below magnify the
features that separate them — the stem base, the gills, the cap surface. On the
left of the composition, a compact framed viewport with corner registration
brackets encloses one specimen, as a measuring instrument would frame a subject;
its frame is drafting red-orange. Dimension lines with end ticks run beneath the
baseline.
IMPORTANT: the specimens must read as measured objects on a drafting sheet, calm
and clinical, never as decorative botanical art and never as a warning sign.
CRITICAL: the drawing carries no labels, no callouts and no lettering of any
kind, including inside the detail circles.
BACKGROUND: drafting paper, faint grid, generous empty space.
TECHNICAL: 16:9, orthographic elevation with hatched section, thin ink linework,
one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },
  {
    id: "work-formatka",
    outputPath: "img/work/furniture-cutlist-engine.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An exploded axonometric drawing of a simple rectangular cabinet
carcass: side panels, top, bottom, back and a single door front, separated along
thin dashed assembly guide lines in the order they would go together. Around one
panel, a rectangular bounding box is drawn as a light dashed cage enclosing it
completely, with dimension lines and end ticks running along all three of its
edges — the panel measured inside its envelope. That bounding cage is the single
drafting red-orange element. Below the exploded carcass lies a flat rectangular
sheet drawn in plan, divided by straight edge-to-edge cuts into the same panel
shapes nested efficiently, every cut running the full width or full height of the
sheet.
IMPORTANT: the cuts on the flat sheet must all run edge to edge, never stopping
in the middle; the bounding cage must clearly enclose exactly one panel.
CRITICAL: the drawing carries no labels, no callouts and no lettering of any kind.
BACKGROUND: drafting paper, faint grid, wide empty margins.
TECHNICAL: 16:9, exploded axonometric above, orthographic plan below, dashed
guide lines, thin ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },

  {
    id: "work-planning",
    outputPath: "img/work/reproducible-production-planning.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An axonometric drawing of a sealed archive canister lying open on a
drafting table, with a rolled drawing sheet half withdrawn from it. To the right,
the same sheet lies unrolled and flat, showing a horizontal schedule of solid
rectangular bars arranged in rows on a ruled baseline. Thin registration lines
with small cross marks run between the rolled sheet and the flat one, aligning
them edge to edge as a copy check would. One bar in the schedule is filled in
drafting red-orange. A small wax-style seal disc rests on the canister lid.
IMPORTANT: the two sheets must read as the same drawing verified against itself,
calm and archival; the canister must read as a sealed container, not as a pipe.
CRITICAL: the drawing carries no labels, no callouts, no lettering and no digits
of any kind, including on the schedule bars and the seal.
BACKGROUND: drafting paper, faint grid, generous empty space.
TECHNICAL: 16:9, axonometric, thin ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },

  {
    id: "work-packing",
    outputPath: "img/work/carton-packing-operator-approval.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An axonometric cutaway of a rectangular shipping carton with its
near wall removed, revealing solid rectangular blocks of several sizes packed
inside in a precise, deliberate arrangement, each block drawn with its own
contour and resting on the one beneath it. Around one block a light dashed
bounding cage is drawn with dimension lines and end ticks along its three edges,
and that cage is the single drafting red-orange element. To the right, a small
upright rectangular panel the proportions of a handheld device shows the same
stack redrawn in plain outline, as a preview would. Dimension lines with end
ticks run beneath the carton.
IMPORTANT: the packing must read as measured and validated, with blocks clearly
supported and never floating or overlapping; the upright panel must read as a
plain screen with no icons.
CRITICAL: the drawing carries no labels, no callouts, no lettering and no digits
of any kind, including on the panel.
BACKGROUND: drafting paper, faint grid, generous empty space.
TECHNICAL: 16:9, axonometric cutaway, thin ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },

  {
    id: "work-recruitment",
    outputPath: "img/work/high-risk-ai-recruitment.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: A single document sheet lies flat in orthographic plan, ruled with
plain horizontal lines standing in for text. One rectangular window has been cut
clean out of the sheet, leaving a crisp aperture with hatched cut edges. The
removed rectangle rests on a small card beside the sheet, and a thin leader line
with end ticks connects the card back to the aperture it came from, matching them
exactly. The card outline is drafting red-orange. Below, a short horizontal chain
of small identical flat plates is drawn linked edge to edge, each overlapping the
next by a fixed amount.
IMPORTANT: the cut fragment and the aperture must read as an exact match in size
and proportion; the chain below must read as rigid and evenly linked.
CRITICAL: the drawing carries no labels, no callouts, no lettering and no digits
of any kind — the ruled lines are plain rules, never readable text.
BACKGROUND: drafting paper, faint grid, generous empty space.
TECHNICAL: 16:9, orthographic plan with hatched cut edges, thin ink linework, one
accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },

  {
    id: "work-designsystem",
    outputPath: "img/work/cross-platform-design-system.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: A two-by-two matrix of four identical square tiles set out on a
drafting sheet with even gaps, drawn flat in orthographic plan. Each tile is a
plain square panel carrying a smaller concentric square centred on it, and each
of the four pairs is rendered in a different flat tonal combination drawn from
muted steel blue and warm grey, light fill with dark inner square or the reverse.
In one tile alone the inner square is left as an open outline in drafting
red-orange, standing out from the other three. A slim vertical comparison scale
with graduated tick marks runs down the right-hand side of the matrix, and a
bracket with end ticks spans one tile from its outer edge to its inner square.
IMPORTANT: the four tiles must be identical in geometry and differ only in tonal
pairing; the composition must read as a systematic variant sheet.
CRITICAL: the drawing carries no labels, no callouts, no lettering and no digits
of any kind, including on the scale.
BACKGROUND: drafting paper, faint grid, wide empty margins.
TECHNICAL: 16:9, orthographic plan, thin ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },

  {
    id: "work-feedcompliance",
    outputPath: "img/work/feed-compliance-deterministic-core.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An exploded axonometric of three horizontal layers separated
along thin dashed vertical guide lines. The lowest layer is a flat plate with
several small connector spigots along its underside. The middle layer is a solid
machined block, heavier than the others, drawn in vertical section with hatched
cut faces so its mass is visible. The top layer is an open lattice frame, light
and airy, clearly not solid. A funnel sits above the stack, its spout aimed at
the solid middle block rather than at the lattice. To the right, mounted on a
small upright panel, a single circular instrument dial with a needle and a
graduated scale sits at a definite reading. The funnel is drafting red-orange.
IMPORTANT: the middle block must read as dense and machined, the top layer as
open latticework; the funnel must clearly feed the solid block.
CRITICAL: the drawing carries no labels, no callouts, no lettering and no digits
of any kind, including on the dial face.
BACKGROUND: drafting paper, faint grid, generous empty space.
TECHNICAL: 16:9, exploded axonometric with hatched section, thin ink linework,
one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },

  {
    id: "work-maintenance",
    outputPath: "img/work/maintenance-cmms-shopfloor.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An axonometric technical drawing of an industrial machine
assembly, compact and boxy, shown with one quarter cut away in section with
hatched cut faces so a geared shaft inside is visible. Mounted on its outer
casing is a circular counter dial with a needle and a graduated scale. A thin
leader line with an end tick runs from that dial down to a neat fanned stack of
small rectangular cards resting on the table below. The topmost card is outlined
in drafting red-orange. Dimension lines with end ticks run along the base of the
machine.
IMPORTANT: the machine must read as a measured technical object on a drafting
sheet, never as a futuristic robot; the cards must read as plain blank cards.
CRITICAL: the drawing carries no labels, no callouts, no lettering and no digits
of any kind, including on the dial face and the cards.
BACKGROUND: drafting paper, faint grid, generous empty space.
TECHNICAL: 16:9, axonometric with hatched section, thin ink linework, one accent
colour.
${ARCHXS_STYLE_GUIDE}`,
  },

  {
    id: "work-accounting",
    outputPath: "img/work/group-accounting-ksef.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: A flat document sheet drawn in orthographic plan, ruled into a
regular grid of small rectangular cells, a few of them filled solid. A thin
leader line runs from one filled cell across to a small solid rectangular slug
resting on the table, and from there into a gate valve drawn in section, its
plate lowered across the channel so the path is closed. Beyond the valve stand
three identical upright blocks of equal size, set apart with even gaps, each
carrying a small plain plate on its face. The valve plate is drafting red-orange.
IMPORTANT: the valve must clearly read as shut, and the three blocks as separate
and evenly spaced, never touching.
CRITICAL: the drawing carries no labels, no callouts, no lettering and no digits
of any kind — the grid cells are plain rectangles, never readable figures.
BACKGROUND: drafting paper, faint grid, generous empty space.
TECHNICAL: 16:9, orthographic plan with a sectioned valve, thin ink linework, one
accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },

  {
    id: "work-fleet",
    outputPath: "img/work/fleet-reminders-that-persist.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: A delivery van drawn in plain orthographic side elevation as a
precise technical object with thin contour lines and flat panels, resting on a
ruled baseline with dimension lines and end ticks beneath it. Set beside it on a
small upright panel is a circular odometer dial with a needle and a graduated
scale. A continuous loop arrow, drawn as a smooth closed circuit with a single
arrowhead, runs from the dial out to a small flat tray holding a plain sealed
envelope and back again to the dial. Below the baseline a horizontal rule carries
three evenly spaced upright threshold markers of decreasing height. The nearest
marker is drafting red-orange.
IMPORTANT: the loop must read as a repeating circuit that returns on itself; the
van must read as a measured drawing, never as an advertisement.
CRITICAL: the drawing carries no labels, no callouts, no lettering, no digits and
no badges of any kind, including on the van body and the dial face.
BACKGROUND: drafting paper, faint grid, generous empty space.
TECHNICAL: 16:9, orthographic elevation, thin ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },

  {
    id: "work-fieldsales",
    outputPath: "img/work/field-sales-offline-first.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An axonometric drawing of a small upright rectangular panel with
the proportions of a handheld device, standing on a shelf. Directly beneath it,
connected by a short solid coupling drawn with a firm double line, sits a compact
closed cabinet with a single drawer, clearly local and attached. Rising away to
the upper right, a long lattice mast stands at a distance, and the line running
toward it is drawn as a thin dashed leader that stops short and does not connect.
In the foreground two flat identical plates lie side by side, joined edge to edge
by a bracket with end ticks. That bracket is drafting red-orange.
IMPORTANT: the coupling to the cabinet must read as solid and complete, the run
to the mast as deliberately broken; the two plates must read as a matched pair.
CRITICAL: the drawing carries no labels, no callouts, no lettering, no digits and
no icons of any kind, including on the panel face.
BACKGROUND: drafting paper, faint grid, generous empty space.
TECHNICAL: 16:9, axonometric, thin ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },

  {
    id: "work-eventdesk",
    outputPath: "img/work/event-ordering-over-whatsapp.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: A plain rounded rectangular panel with a small tail on its lower
left, drawn flat as a message form and ruled with blank horizontal lines. Thin
leader lines with end ticks fan out from it to a horizontal shelf rail on which
four closed rectangular cartons stand in a row. Above each carton hangs a small
circular dial with a needle and a graduated scale, each needle at a different
reading. A light rectangular frame with corner registration brackets encloses the
whole shelf rail, as a measuring instrument frames a subject. One carton is
outlined in drafting red-orange.
IMPORTANT: the cartons must read as plain closed boxes with no packaging artwork;
the enclosing frame must read as a registration frame, not as a picture border.
CRITICAL: the drawing carries no labels, no callouts, no lettering and no digits
of any kind, including on the message panel, the cartons and the dial faces.
BACKGROUND: drafting paper, faint grid, generous empty space.
TECHNICAL: 16:9, orthographic with slight axonometric depth on the cartons, thin
ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },

  {
    id: "work-export",
    outputPath: "img/work/export-expansion-engine.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An exploded axonometric assembly. At the centre a rectangular
open frame waits to be filled, drawn as a light outline with empty bays inside
it. From three separate compact modules standing apart at the left, upper right
and lower right, solid blocks travel inward along thin dashed assembly guide
lines toward the bays that match them, each block clearly originating from one of
the modules. A single small block sits already seated inside the central frame
and is the one part drawn as new, filled in drafting red-orange. In the
foreground a plain sealed envelope lies flat with a single horizontal bar drawn
across it, holding it closed.
IMPORTANT: the borrowed blocks must clearly belong to the outer modules and the
central frame must read as mostly empty and receiving; the bar must read as a
deliberate hold.
CRITICAL: the drawing carries no labels, no callouts, no lettering and no digits
of any kind.
BACKGROUND: drafting paper, faint grid, wide empty margins.
TECHNICAL: 16:9, exploded axonometric, dashed guide lines, thin ink linework, one
accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },

  {
    id: "work-marketing",
    outputPath: "img/work/multi-brand-marketing-automation.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An axonometric drawing of a single machined manifold block with
one inlet pipe entering it from the left. From the manifold, four identical
outlet pipes branch away, each terminating in its own closed sealed chamber drawn
as a compact box with a bolted lid and a small hand valve on top. The four
chambers are set well apart with even gaps and no connection between them. One
valve is drafting red-orange. Dimension lines with end ticks run beneath the
manifold.
IMPORTANT: the four chambers must read as fully separate and sealed, with no pipe
or line running between them; the manifold must read as a single machined part.
CRITICAL: the drawing carries no labels, no callouts, no lettering and no digits
of any kind, including on the valves and lids.
BACKGROUND: drafting paper, faint grid, generous empty space.
TECHNICAL: 16:9, axonometric, thin ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },

  {
    id: "work-wms",
    outputPath: "img/work/warehouse-system-second-warehouse.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: An axonometric drawing of a warehouse racking bay, drawn as a
clean open frame of uprights and horizontal beams dividing it into a regular grid
of individual bays, a few of them holding plain rectangular pallets. Immediately
beside it, aligned on the same baseline, stands a second racking bay of identical
geometry drawn entirely as a light dashed outline, clearly planned rather than
built. In the foreground rests a small ratchet wheel with a pawl engaged against
its teeth, permitting motion in one direction only. The pawl is drafting
red-orange. Dimension lines with end ticks span both bays.
IMPORTANT: the second bay must read as a dashed projection of the first, not as a
faded copy; the ratchet must read as a precise mechanical detail.
CRITICAL: the drawing carries no labels, no callouts, no lettering and no digits
of any kind.
BACKGROUND: drafting paper, faint grid, generous empty space.
TECHNICAL: 16:9, axonometric, dashed guide lines, thin ink linework, one accent
colour.
${ARCHXS_STYLE_GUIDE}`,
  },

  {
    id: "work-projectcrm",
    outputPath: "img/work/project-crm-build-vs-adopt.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: A drafting sheet seen flat in orthographic plan, laid out as a
single vertical column of identical rectangular slots with even gaps. The upper
slots are filled solid, the middle slots are drawn as light dashed outlines still
waiting, and the three lowest slots are drawn as plain outlines each struck
through by a single firm diagonal bar. Those three diagonal bars are the only
drafting red-orange elements. Below the column, a horizontal rail runs across the
sheet carrying evenly spaced upright tick marks, with a small solid marker
travelling along it.
IMPORTANT: the three states must be immediately distinguishable — solid, dashed
and struck through; the struck slots must read as settled decisions, never as
errors or deletions.
CRITICAL: the drawing carries no labels, no callouts, no lettering and no digits
of any kind, and the slots contain no text.
BACKGROUND: drafting paper, faint grid, wide empty margins.
TECHNICAL: 16:9, orthographic plan, thin ink linework, one accent colour.
${ARCHXS_STYLE_GUIDE}`,
  },

  {
    id: "work-commerce",
    outputPath: "img/work/commerce-platform-erp-boundary.png",
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    prompt: `SCENE: A single building drawn in vertical cross section with hatched
cut faces, standing on one continuous foundation slab. Inside, a solid dividing
wall runs from the slab clean up to the roof, splitting the interior into two
separate wings with no door, opening or passage anywhere through it. Each wing
carries its own bolt lock plate mounted on its outer face, and each wing has its
own separate entrance at ground level. Running horizontally along the foundation
beneath both wings is a single continuous service pipe that passes under the
dividing wall and serves both sides. The dividing wall is drafting red-orange.
IMPORTANT: the dividing wall must be unmistakably unbroken from slab to roof,
while the pipe beneath clearly runs the full width; the building must read as an
architectural section, calm and measured.
CRITICAL: the drawing carries no labels, no callouts, no lettering and no digits
of any kind.
BACKGROUND: drafting paper, faint grid, generous empty space.
TECHNICAL: 16:9, orthographic cross section with hatched cut faces, thin ink
linework, one accent colour.
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
