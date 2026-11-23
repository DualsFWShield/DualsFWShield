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

function wrapText(text, maxChars = 66) {
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

const lines = wrapText(`"${pick.parody}"`, 66);
const lineHeight = 26;
const width = 760;
const height = 108 + lines.length * lineHeight;
const idLabel = String(pick.id).padStart(3, "0");
const totalLabel = String(quotes.length).padStart(3, "0");

const textElements = lines
  .map((line, index) => {
    const y = 76 + index * lineHeight;
    const isLast = index === lines.length - 1;
    const cursor = isLast ? `<tspan class="cursor"> &#9608;</tspan>` : "";
    return `    <text x="36" y="${y}" class="quote">${escapeXml(line)}${cursor}</text>`;
  })
  .join("\n");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  <style>
    .header { font: 600 12px 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace; fill: #8B949E; }
    .prompt { font: 700 12px 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace; fill: #20C20E; }
    .quote  { font: 500 16px 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace; fill: #E6EDF3; }
    .source { font: 600 13px 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace; fill: #8B949E; }
    .accent { fill: #20C20E; }
    .cursor { fill: #20C20E; animation: blink 1.1s steps(1, end) infinite; }
    @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
  </style>

  <!-- Card Container -->
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10" fill="#0D1117" stroke="#21262D" />

  <!-- Left Phosphor Accent Bar -->
  <rect x="0.5" y="16" width="3" height="${height - 32}" rx="1.5" fill="#20C20E" />

  <!-- Terminal Header Bar -->
  <circle cx="26" cy="24" r="4.5" fill="#21262D" />
  <circle cx="42" cy="24" r="4.5" fill="#21262D" />
  <circle cx="58" cy="24" r="4.5" fill="#20C20E" />
  <text x="76" y="28" class="prompt">duals@shell:~$</text>
  <text x="184" y="28" class="header">fortune --parody</text>
  <text x="${width - 24}" y="28" text-anchor="end" class="header">LOG #${idLabel}/${totalLabel}</text>

  <!-- Subtle Divider -->
  <line x1="20" y1="42" x2="${width - 20}" y2="42" stroke="#21262D" stroke-width="1" />

  <!-- Quote Lines -->
${textElements}

  <!-- Source Attribution -->
  <text x="${width - 28}" y="${height - 22}" text-anchor="end" class="source">
    <tspan class="accent">// </tspan>${escapeXml(pick.source)}
  </text>
</svg>
`;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT_PATH, svg, "utf-8");
console.log(`Generated quote #${pick.id} (${pick.source}) -> ${OUTPUT_PATH}`);
