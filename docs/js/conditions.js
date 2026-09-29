(function () {
  const holder = document.getElementById("conditions-canvas");
  const note = document.getElementById("conditions-note");
  if (!holder || typeof p5 === "undefined") return;

  const items = [
    ["Findable", "A student can see how to enter, continue, and leave."],
    ["Developmental", "Introduction, repeated practice, and advanced work are in an order a student can follow."],
    ["Open", "The program states who can complete the path, and changing direction still leaves a route to Capstone."],
    ["Continuous", "Later work can use what the student already knows and has already made, and it requires new learning."],
    ["Shown", "The path prepares a body of work the student can show."],
    ["Part of IMD", "The shared studio sequence can carry the work, and faculty teach the advanced level on purpose."],
  ];
  const missing = new Set();
  const ink = "#1c1915";
  const red = "#8e1d2c";
  const paper = "#ebe4d8";
  const gold = "#7d6840";

  function describe() {
    if (!note) return;
    if (missing.size === 0) {
      note.textContent = "All six conditions hold. On this definition, the area is a specialization. Select a condition to see what remains when it is absent.";
      return;
    }
    const names = items.filter((_, i) => missing.has(i)).map((item) => item[0]);
    note.textContent = names.join(", ") + (names.length > 1 ? " are" : " is") + " absent. Related courses may still exist. The definition calls that a cluster until every condition holds.";
  }
  describe();

  new p5((p) => {
    let radius = 150;
    let center;

    p.setup = () => {
      const c = p.createCanvas(holder.clientWidth || 640, 520);
      c.parent(holder);
      p.textFont("Public Sans");
    };
    p.windowResized = () => p.resizeCanvas(holder.clientWidth || 640, 520);

    function point(i) {
      const a = -p.HALF_PI + (i / items.length) * p.TWO_PI;
      return { x: center.x + Math.cos(a) * radius, y: center.y + Math.sin(a) * radius, a };
    }

    p.draw = () => {
      p.background(paper);
      center = p.createVector(p.width / 2, p.height / 2 + 8);
      radius = Math.min(p.width, p.height) * 0.3;
      const whole = missing.size === 0;

      for (let i = 0; i < items.length; i++) {
        const a = point(i);
        const b = point((i + 1) % items.length);
        const open = missing.has(i) || missing.has((i + 1) % items.length);
        p.stroke(open ? "#c8bfb2" : ink);
        p.strokeWeight(whole ? 2 : 1.5);
        if (!missing.has(i)) p.line(a.x, a.y, b.x, b.y);
      }

      items.forEach((item, i) => {
        const pos = point(i);
        const off = missing.has(i);
        p.noStroke();
        p.fill(off ? red : "#faf8f4");
        p.stroke(off ? red : ink);
        p.strokeWeight(1.5);
        p.circle(pos.x, pos.y, 16);
        p.noStroke();
        p.fill(off ? red : ink);
        p.textSize(13);
        p.textAlign(p.CENTER, pos.y < center.y ? p.BOTTOM : p.TOP);
        const labelY = pos.y + (pos.y < center.y ? -16 : 16);
        p.text(item[0], pos.x, labelY);
      });

      p.noStroke();
      p.fill(whole ? ink : gold);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(whole ? 22 : 18);
      p.text(whole ? "Specialization" : "Cluster", center.x, center.y - 8);
      p.textSize(12);
      p.fill("#5e584f");
      p.text(whole ? "All six conditions" : "A condition is missing", center.x, center.y + 16);
    };

    p.mousePressed = () => {
      center = p.createVector(p.width / 2, p.height / 2 + 8);
      radius = Math.min(p.width, p.height) * 0.3;
      items.forEach((_, i) => {
        const pos = point(i);
        if (p.dist(p.mouseX, p.mouseY, pos.x, pos.y) < 22) {
          if (missing.has(i)) missing.delete(i);
          else missing.add(i);
          describe();
        }
      });
    };
  }, holder);
})();
