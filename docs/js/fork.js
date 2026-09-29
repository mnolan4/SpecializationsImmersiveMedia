(function () {
  const roots = document.querySelectorAll("[data-fork]");
  if (!roots.length || typeof p5 === "undefined") return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ink = "#1c1915";
  const muted = "#5e584f";
  const red = "#8e1d2c";
  const gold = "#7d6840";
  const paper = "#ebe4d8";

  const catalog = {
    n101: ["IMDM101", "Introduction. Shared studio and lecture."],
    n227: ["IMDM227", "Computational media. Both tracks arrive through different prerequisite doors."],
    n290: ["IMDM290", "Collaborative Studio I. The last shared studio Capstone registration is allowed to assume."],
    n390: ["IMDM390", "Collaborative Studio II. Required for the degree. Not required before Capstone. In the last semester, concurrent with the showcase, its skills have no later course in which to enter the senior project."],
    n490: ["IMDM490", "Capstone I. Requires IMDM290, major standing, and 86 credits. This is where the senior project is defined."],
    n491: ["IMDM491", "Capstone II and the public showcase. Continues the project defined in IMDM490. Studio II taken in this semester cannot transfer into that demonstration."],
  };

  function edgesFor(mode) {
    const advised = [
      ["n101", "n227", ink],
      ["n227", "n290", ink],
      ["n290", "n390", ink],
      ["n390", "n490", ink],
      ["n490", "n491", ink],
    ];
    const registration = [
      ["n101", "n227", ink],
      ["n227", "n290", ink],
      ["n290", "n390", muted],
      ["n290", "n490", red],
      ["n490", "n491", ink],
    ];
    const bypass = [
      ["n101", "n227", ink],
      ["n227", "n290", ink],
      ["n290", "n490", red],
      ["n490", "n491", ink],
      ["n290", "n390late", gold],
    ];
    if (mode === "registration") return registration;
    if (mode === "bypass") return bypass;
    if (mode === "overview") return advised.concat([["n290", "n490", red]]);
    return advised;
  }

  roots.forEach((root) => {
    const holder = root.querySelector(".fork-canvas");
    const note = root.querySelector(".viz-note");
    const interactive = root.dataset.fork === "interactive";
    let mode = interactive ? "advised" : "overview";
    let hover = null;
    const particles = Array.from({ length: 18 }, (_, i) => ({ t: i / 18, edge: i % 5 }));

    const notes = {
      advised: "The four-year plans place Collaborative Studio II before Capstone. The line runs 101, 227, 290, 390, then the two Capstone semesters.",
      registration: "Registration draws a shorter line. IMDM490 requires IMDM290, not IMDM390. The degree still requires 390, but not before the project is defined.",
      bypass: "A student who reaches 86 credits after IMDM290 can begin Capstone first. IMDM390 is spring-only and IMDM490 is fall-only, so Studio II often falls in the last semester, concurrent with IMDM491 and the public showcase. Skills learned in 390 that semester have no later course in which to enter the senior project or to be shown as advanced understanding.",
      overview: "The dark line is the advised studio sequence. The red line is the registration shortcut from IMDM290 into Capstone. On that path, IMDM390 often shares the last semester with Capstone II and the showcase, after the senior project has been defined.",
    };

    function setNote(text) {
      if (note) note.textContent = text;
    }
    setNote(notes[mode]);

    root.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        mode = button.dataset.mode;
        hover = null;
        root.querySelectorAll("[data-mode]").forEach((b) => {
          const on = b === button;
          b.classList.toggle("is-on", on);
          b.setAttribute("aria-pressed", on ? "true" : "false");
        });
        setNote(notes[mode]);
      });
    });

    new p5((p) => {
      let nodes = {};

      p.setup = () => {
        const c = p.createCanvas(holder.clientWidth || 640, interactive ? 460 : 380);
        c.parent(holder);
        p.textFont("Public Sans");
      };

      p.windowResized = () => {
        p.resizeCanvas(holder.clientWidth || 640, interactive ? 460 : 380);
      };

      function place() {
        const w = p.width;
        const h = p.height;
        const y = h * 0.46;
        const left = Math.max(52, w * 0.1);
        const right = w - left;
        nodes = {
          n101: { x: left, y, id: "n101" },
          n227: { x: p.lerp(left, right, 0.2), y, id: "n227" },
          n290: { x: p.lerp(left, right, 0.4), y, id: "n290" },
          n390: { x: p.lerp(left, right, 0.68), y: h * 0.24, id: "n390" },
          n490: { x: p.lerp(left, right, 0.68), y: h * 0.72, id: "n490" },
          n491: { x: right, y: h * 0.72, id: "n491" },
          n390late: { x: right, y: h * 0.24, id: "n390" },
        };
      }

      function drawEdge(a, b, col) {
        p.noFill();
        p.stroke(col);
        p.strokeWeight(1.6);
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2 - Math.abs(b.y - a.y) * 0.08;
        p.bezier(a.x, a.y, midX, a.y, midX, b.y, b.x, b.y);
        return { a, b, midX };
      }

      p.draw = () => {
        place();
        p.background(paper);
        const edges = edgesFor(mode);
        const showLate = mode === "bypass";

        edges.forEach(([from, to, col]) => {
          if (!nodes[from] || !nodes[to]) return;
          drawEdge(nodes[from], nodes[to], col);
        });

        if (!reduce) {
          edges.forEach(([from, to, col], index) => {
            const a = nodes[from];
            const b = nodes[to];
            if (!a || !b) return;
            particles.forEach((particle) => {
              if (particle.edge !== index % 5) return;
              const t = (particle.t + p.frameCount * 0.0022) % 1;
              const x = p.bezierPoint(a.x, (a.x + b.x) / 2, (a.x + b.x) / 2, b.x, t);
              const y = p.bezierPoint(a.y, a.y, b.y, b.y, t);
              p.noStroke();
              p.fill(col);
              p.circle(x, y, 4);
            });
          });
        }

        Object.entries(nodes).forEach(([key, node]) => {
          if (key === "n390late" && !showLate) return;
          if (key === "n390" && showLate) return;
          const active = hover === node.id;
          p.stroke(active ? red : ink);
          p.strokeWeight(active ? 2 : 1);
          p.fill("#faf8f4");
          p.circle(node.x, node.y, active ? 18 : 14);
          const above = node.y < p.height * 0.4;
          p.noStroke();
          p.fill(ink);
          p.textSize(12);
          p.textAlign(p.CENTER, above ? p.BOTTOM : p.TOP);
          const label = key === "n390late" ? "IMDM390" : catalog[node.id][0];
          p.text(label, node.x, above ? node.y - 16 : node.y + 16);
        });

        if (showLate) {
          p.noStroke();
          p.fill(gold);
          p.textSize(11);
          p.textAlign(p.CENTER, p.TOP);
          p.text("last semester, with the showcase", nodes.n390late.x, nodes.n390late.y + 32);
        }
      };

      p.mouseMoved = () => {
        if (!interactive) return;
        let found = null;
        let best = 26;
        Object.entries(nodes).forEach(([key, node]) => {
          if (key === "n390late" && mode !== "bypass") return;
          if (key === "n390" && mode === "bypass") return;
          const d = p.dist(p.mouseX, p.mouseY, node.x, node.y);
          if (d < best) {
            best = d;
            found = node.id;
          }
        });
        hover = found;
        if (found) setNote(catalog[found][0] + ". " + catalog[found][1]);
        else setNote(notes[mode]);
      };
    }, holder);
  });
})();
