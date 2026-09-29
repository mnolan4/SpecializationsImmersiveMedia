import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docsDir = path.join(root, "docs");

const papers = [
  {
    file: "IMD_Game_Design_Specialization_Case_Example.md",
    out: "case-game-design.html",
    group: "case",
    tab: "Game design",
    kicker: "Case study · September 2026",
    blurb: "A pilot reading of game design. The courses, facilities, and expertise are present. The path a student can follow is not yet supplied by the curriculum.",
  },
  {
    file: "IMD_AI_Specialization_Case_Example.md",
    out: "case-ai.html",
    group: "case",
    tab: "Artificial intelligence",
    kicker: "Case study · September 2026",
    blurb: "A second pilot, across both degree tracks, for students who want to build, critique, and shape intelligent media.",
  },
  {
    file: "editorial.md",
    out: "paper-editorial.html",
    group: "paper",
    tab: "Editorial",
    kicker: "Editorial · September 2026",
    blurb: "Specializations as navigation. A specialization should function as a map through immersive practice, so a student who finds a direction can go further.",
  },
  {
    file: "IMD_Faculty_Syllabus_Continuity_Guide.md",
    out: "paper-syllabus.html",
    group: "paper",
    tab: "Syllabus continuity",
    kicker: "Working paper · September 2026",
    blurb: "Shared syllabus language for where a course sits, what students bring, what they leave with, and what can travel forward.",
  },
  {
    file: "IMD_Projected_Role_of_the_Specializations_Committee.md",
    out: "paper-role.html",
    group: "paper",
    tab: "Committee role",
    kicker: "Working paper · September 2026",
    blurb: "The committee’s charge, the work it leads, and the work it shares with Coding, Portfolio, Labs, IMDM101, and Vision.",
  },
  {
    file: "IMD_Defining_Specialization.md",
    out: "paper-definition.html",
    group: "paper",
    tab: "Specialization",
    kicker: "Working paper · September 2026",
    blurb: "The full definition: six conditions, what stays outside a specialization, and what the definition does not decide.",
  },
  {
    file: "IMD_Current-State_Curriculum_Map_Faculty_Draft.md",
    out: "paper-map.html",
    group: "paper",
    tab: "Current-state map",
    kicker: "Working paper · September 2026",
    blurb: "The published curriculum as of September 2026: shared sequence, track depth, competencies, and where continuity is still open.",
  },
  {
    file: "IMD_290-390-Capstone_Continuity_Analysis.md",
    out: "paper-continuity.html",
    group: "paper",
    tab: "Studio sequence",
    kicker: "Working paper · September 2026",
    blurb: "The full account of IMDM290, IMDM390, and Capstone, including the last-semester overlap with the showcase.",
  },
  {
    file: "IMD_Specializations_Cross_Committee_Coordination_Framework.md",
    out: "paper-coordination.html",
    group: "paper",
    tab: "Coordination",
    kicker: "Working paper · September 2026",
    blurb: "How Specializations shares decisions with Coding, Portfolio, Labs, IMDM101, and Vision.",
  },
  {
    file: "Community_as_Continuity.md",
    out: "paper-community.html",
    group: "paper",
    tab: "Community",
    kicker: "Essay · September 2026",
    blurb: "Community as the social infrastructure through which coursework acquires memory, permeability, and duration.",
  },
  {
    file: "IMD_Known_Gaps.md",
    out: "paper-gaps.html",
    group: "paper",
    tab: "Known gaps",
    kicker: "Working paper · September 2026",
    blurb: "Gaps on an ordinary path through the major, and gaps the rules still allow on a less common route.",
  },
];

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(s) {
  let t = esc(s.trim());
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  return t;
}

function isHeading(line) { return /^#{1,3}\s+/.test(line); }
function isQuote(line) { return /^>\s?/.test(line); }
function isTable(line) { return /^\|/.test(line); }
function isRule(line) { return /^(-{3,}|\*{3,})$/.test(line.trim()); }
function isList(line) { return /^([-*]\s+|\d+\.\s+)/.test(line); }
function isAlign(line) {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line.trim());
}

function render(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let i = 0;
  let skippedTitle = false;

  function paragraph(buf) {
    const text = buf
      .map((line) => (line.endsWith("  ") ? inline(line) + "<br>" : inline(line)))
      .join(buf.some((line) => line.endsWith("  ")) ? "" : " ");
    html.push(`<p>${text.replace(/(?:<br>)+$/g, "")}</p>`);
  }

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") { i += 1; continue; }

    if (isHeading(line)) {
      const level = line.match(/^#+/)[0].length;
      const text = inline(line.replace(/^#{1,3}\s+/, ""));
      if (level === 1 && !skippedTitle) {
        skippedTitle = true;
        i += 1;
        continue;
      }
      html.push(`<h${level}>${text}</h${level}>`);
      i += 1;
      continue;
    }

    if (isRule(line)) {
      html.push('<hr class="rule">');
      i += 1;
      continue;
    }

    if (isQuote(line)) {
      const buf = [];
      while (i < lines.length && isQuote(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      html.push(`<blockquote><p>${inline(buf.join(" "))}</p></blockquote>`);
      continue;
    }

    if (isTable(line)) {
      const rows = [];
      while (i < lines.length && isTable(lines[i])) {
        if (!isAlign(lines[i])) {
          const cells = lines[i].trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(inline);
          rows.push(cells);
        }
        i += 1;
      }
      const head = rows[0] || [];
      const body = rows.slice(1);
      const thead = `<thead><tr>${head.map((c) => `<th>${c}</th>`).join("")}</tr></thead>`;
      const tbody = `<tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>`;
      html.push(`<div class="table-scroll"><table>${thead}${tbody}</table></div>`);
      continue;
    }

    if (isList(line)) {
      const ordered = /^\d+\.\s+/.test(line);
      const items = [];
      while (i < lines.length && isList(lines[i])) {
        items.push(inline(lines[i].replace(/^([-*]\s+|\d+\.\s+)/, "")));
        i += 1;
      }
      const tag = ordered ? "ol" : "ul";
      html.push(`<${tag}>${items.map((item) => `<li>${item}</li>`).join("")}</${tag}>`);
      continue;
    }

    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !isHeading(lines[i]) &&
      !isQuote(lines[i]) &&
      !isTable(lines[i]) &&
      !isRule(lines[i]) &&
      !isList(lines[i])
    ) {
      buf.push(lines[i]);
      i += 1;
    }
    paragraph(buf);
  }

  return html.join("\n");
}

function titleOf(markdown) {
  const m = markdown.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : "Document";
}

function primaryNav(current) {
  const items = [
    { href: "index.html", label: "Overview" },
    { href: "specialization.html", label: "Definition" },
    ...papers.map((paper) => ({ href: paper.out, label: paper.tab })),
    { href: "continuity.html", label: "Continuity" },
  ];
  return items.map((item) => {
    const currentAttr = item.href === current ? ' aria-current="page"' : "";
    return `<a href="${item.href}"${currentAttr}>${item.label}</a>`;
  }).join("\n        ");
}

function shell({ title, kicker, heading, body, current }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,480;6..72,560&family=Public+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/site.css">
</head>
<body class="doc-page">
  <a class="skip" href="#main">Skip to content</a>
  <header class="top">
    <a class="mark" href="index.html">Immersive Media Design <span>Specializations Committee</span></a>
    <nav aria-label="Primary">
        ${primaryNav(current)}
    </nav>
  </header>
  <main id="main">
    <section class="hero">
      <p class="kicker">${kicker}</p>
      <h1>${esc(heading)}</h1>
    </section>
    <article class="section doc-body">
${body}
    </article>
  </main>
  <footer class="footer">
    <hr class="rule">
    <p>Immersive Media Design, University of Maryland. Specializations Committee, September 2026. A working draft for faculty discussion. It does not adopt a course, a prerequisite, or a transcript label.</p>
  </footer>
</body>
</html>
`;
}

const indexBody = `<p class="lede">The case studies test the definition against two areas already present in the curriculum. The papers are the committee’s working drafts for September 2026.</p>
      <h2>Case studies</h2>
      <ul class="doc-list">
        ${papers.filter((p) => p.group === "case").map((p) => `<li><a href="${p.out}">${esc(p.tab)}</a><p>${esc(p.blurb)}</p></li>`).join("\n        ")}
      </ul>
      <h2>Documents</h2>
      <ul class="doc-list">
        ${papers.filter((p) => p.group === "paper").map((p) => `<li><a href="${p.out}">${esc(p.tab)}</a><p>${esc(p.blurb)}</p></li>`).join("\n        ")}
      </ul>`;

fs.writeFileSync(
  path.join(docsDir, "documents.html"),
  shell({
    title: "Documents · IMD Specializations",
    kicker: "Working drafts · September 2026",
    heading: "Case studies and committee papers.",
    body: indexBody,
    current: "documents.html",
  }),
);

for (const paper of papers) {
  const markdown = fs.readFileSync(path.join(root, paper.file), "utf8");
  const heading = titleOf(markdown);
  const body = render(markdown);
  fs.writeFileSync(
    path.join(docsDir, paper.out),
    shell({
      title: `${paper.tab} · IMD Specializations`,
      kicker: paper.kicker,
      heading,
      body,
      current: paper.out,
    }),
  );
}

console.log(`wrote documents.html and ${papers.length} document pages`);
