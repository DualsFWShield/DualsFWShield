import fs from "node:fs";
import path from "node:path";

const QUOTES_PATH = path.resolve("quotes.json");
const OUTPUT_DIR = path.resolve("assets");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "quote.svg");

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(text, maxChars = 72) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    if ((current + " " + word).trim().length <= maxChars) {
      current = (current + " " + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

const quotes = JSON.parse(fs.readFileSync(QUOTES_PATH, "utf-8"));
const pick = quotes[Math.floor(Math.random() * quotes.length)];

const lines = wrapText(`"${pick.parody}"`, 72);
const lineHeight = 26;
const width = 860;
const height = 122 + lines.length * lineHeight;
const idLabel = String(pick.id).padStart(3, "0");
const totalLabel = String(quotes.length).padStart(3, "0");

const textElements = lines
  .map((line, index) => {
    const y = 80 + index * lineHeight;
    const isLast = index === lines.length - 1;
    const cursor = isLast ? `<tspan class="cursor"> &#9608;</tspan>` : "";
    return `    <text x="38" y="${y}" class="quote">${escapeXml(line)}${cursor}</text>`;
  })
  .join("\n");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="${width}" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#090D16" />
      <stop offset="50%" stop-color="#0D1117" />
      <stop offset="100%" stop-color="#111827" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#20C20E" />
      <stop offset="50%" stop-color="#00F0FF" />
      <stop offset="100%" stop-color="#FF2A85" />
    </linearGradient>
    <linearGradient id="topLine" x1="0" y1="0" x2="${width}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#20C20E" stop-opacity="0.8" />
      <stop offset="50%" stop-color="#00F0FF" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#FF2A85" stop-opacity="0.8" />
    </linearGradient>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1E293B" stroke-width="0.6" stroke-opacity="0.45" />
    </pattern>
  </defs>

  <style>
    .header { font: 600 12px 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, ui-monospace, SFMono-Regular, Menlo, monospace; fill: #8B949E; }
    .prompt { font: 700 12px 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, ui-monospace, SFMono-Regular, Menlo, monospace; fill: #20C20E; }
    .cmd    { font: 600 12px 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, ui-monospace, SFMono-Regular, Menlo, monospace; fill: #00F0FF; }
    .quote  { font: 600 15.5px 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, ui-monospace, SFMono-Regular, Menlo, monospace; fill: #F0F6FC; }
    .source { font: 700 12.5px 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, ui-monospace, SFMono-Regular, Menlo, monospace; fill: #00F0FF; letter-spacing: 0.6px; }
    .meta   { font: 500 11px 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, ui-monospace, SFMono-Regular, Menlo, monospace; fill: #6E7681; }
    .accent { fill: #20C20E; }
    .pink   { fill: #FF2A85; }
    .cursor { fill: #20C20E; animation: blink 1s steps(1, end) infinite; }
    .pulse  { animation: pulseOp 2.2s ease-in-out infinite; }
    @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
    @keyframes pulseOp { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
  </style>

  <!-- Outer Card & Grid -->
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="12" fill="url(#bgGrad)" stroke="#21262D" stroke-width="1.5" />
  <rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="11" fill="url(#grid)" />

  <!-- Top & Left Cyber Neon Bars -->
  <rect x="1" y="14" width="4" height="${height - 28}" rx="2" fill="url(#accentGrad)" />
  <line x1="16" y1="1.5" x2="${width - 16}" y2="1.5" stroke="url(#topLine)" stroke-width="1.5" />

  <!-- Terminal Header Bar -->
  <rect x="6" y="6" width="${width - 12}" height="36" rx="8" fill="#0D1117" fill-opacity="0.85" />
  <circle cx="26" cy="24" r="4.5" fill="#FF2A85" />
  <circle cx="42" cy="24" r="4.5" fill="#F59E0B" />
  <circle cx="58" cy="24" r="4.5" fill="#20C20E" />

  <text x="78" y="28" class="prompt">duals@fw-shield:~$</text>
  <text x="218" y="28" class="cmd">fortune --cyber-parody</text>

  <!-- Right Header Telemetry -->
  <circle cx="${width - 134}" cy="24" r="3.5" fill="#20C20E" class="pulse" />
  <text x="${width - 22}" y="28" text-anchor="end" class="header">QUOTE #${idLabel}/${totalLabel}</text>

  <!-- Divider -->
  <line x1="20" y1="44" x2="${width - 20}" y2="44" stroke="#21262D" stroke-width="1" />

  <!-- Quote Lines -->
${textElements}

  <!-- Bottom Footer Bar -->
  <line x1="20" y1="${height - 38}" x2="${width - 20}" y2="${height - 38}" stroke="#1E293B" stroke-width="1" stroke-dasharray="4 4" />
  <text x="38" y="${height - 16}" class="meta">[SYS.CRON: 6H_ROTATION] // [POOL: 100_PARODIES] // [EXIT: 0]</text>

  <!-- Source Attribution -->
  <text x="${width - 26}" y="${height - 16}" text-anchor="end" class="source">
    <tspan class="pink">// </tspan>SOURCE: ${escapeXml(pick.source.toUpperCase())}
  </text>
</svg>
`;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT_PATH, svg, "utf-8");
console.log(`Generated quote #${pick.id} (${pick.source}) -> ${OUTPUT_PATH}`);
