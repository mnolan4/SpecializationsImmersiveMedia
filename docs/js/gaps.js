(function () {
  const holder = document.getElementById("gaps-canvas");
  const note = document.getElementById("gaps-note");
  if (!holder || typeof p5 === "undefined") return;

  const marks = [
    { at: 0.08, name: "IMDM101", gap: null },
    { at: 0.24, name: "IMDM227", gap: "Portfolio review, then a thin middle" },
    { at: 0.42, name: "IMDM290", gap: "Handoff is not required" },
    {
      at: 0.62,
      name: "IMDM390",
      gap: "May share the showcase semester",
      detail: "IMDM390 is not required before Capstone. When it waits until the last spring, it runs concurrent with IMDM491 and the public showcase. Skills learned then have no later course in which to enter the senior project.",
    },
    { at: 0.78, name: "IMDM490", gap: "Order can skip 390" },
    {
      at: 0.92,
      name: "IMDM491",
      gap: "A concurrent 390 arrives too late",
      detail: "IMDM491 is the showcase semester. The senior project was defined in IMDM490. Studio II taken in this same semester cannot transfer its skills into that project or into the demonstration of advanced understanding.",
    },
  ];
  const ink = "#1c1915";
  const red = "#8e1d2c";
  const paper = "#ebe4d8";
  let active = 4;

  function show(index) {
    active = index;
    const mark = marks[index];
    if (note) {
      note.textContent = mark.detail
        ? mark.detail
        : mark.gap
          ? mark.name + ". " + mark.gap + ". This is visible on an ordinary path through the published major."
          : mark.name + ". Shared introduction. The known breaks sit later in the sequence.";
    }
  }
  show(active);

  new p5((p) => {
    p.setup = () => {
      const c = p.createCanvas(holder.clientWidth || 640, 280);
      c.parent(holder);
      p.textFont("Public Sans");
    };
    p.windowResized = () => p.resizeCanvas(holder.clientWidth || 640, 280);

    p.draw = () => {
      p.background(paper);
      const y = 120;
      const x0 = 36;
      const x1 = p.width - 36;
      p.stroke(ink);
      p.strokeWeight(1.5);
      p.line(x0, y, x1, y);
      p.noStroke();
      p.fill("#5e584f");
      p.textSize(12);
      p.textAlign(p.LEFT, p.BOTTOM);
      p.text("Ordinary four-year path", x0, y - 48);

      marks.forEach((mark, i) => {
        const x = p.lerp(x0, x1, mark.at);
        const on = i === active;
        p.stroke(mark.gap && on ? red : ink);
        p.strokeWeight(on ? 2 : 1);
        p.fill(mark.gap ? (on ? red : "#faf8f4") : "#faf8f4");
        p.circle(x, y, on ? 16 : 12);
        p.noStroke();
        p.fill(on ? red : ink);
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(11);
        p.text(mark.name.replace("IMDM", ""), x, y + 16);
      });

      const mark = marks[active];
      const x = p.lerp(x0, x1, mark.at);
      if (mark.gap) {
        p.stroke(red);
        p.line(x, y + 8, x, y + 46);
        p.noStroke();
        p.fill(red);
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(13);
        const wide = Math.min(220, p.width * 0.34);
        const labelX = p.constrain(x, x0 + wide / 2, x1 - wide / 2);
        p.text(mark.gap, labelX - wide / 2, y + 52, wide);
      }
    };

    p.mousePressed = () => {
      const y = 120;
      const x0 = 36;
      const x1 = p.width - 36;
      marks.forEach((mark, i) => {
        const x = p.lerp(x0, x1, mark.at);
        if (p.dist(p.mouseX, p.mouseY, x, y) < 22) show(i);
      });
    };
  }, holder);
})();
