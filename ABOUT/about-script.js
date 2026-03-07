// Only on real pointer/hover devices — not touch
if (window.matchMedia("(hover: hover)").matches) {
  const blocks = document.querySelectorAll(".about-block-text[data-trigger]");
  const nameSpans = document.querySelectorAll(".about-name span[data-trigger]");
  const hoverBgs = document.querySelectorAll(".bg-img--hover");
  const defaultBg = document.querySelector(".bg-img--default");

  [...blocks, ...nameSpans].forEach((el) => {
    const key = el.dataset.trigger;

    el.addEventListener("mouseenter", () => {
      defaultBg.style.opacity = "0";
      hoverBgs.forEach((bg) => (bg.style.opacity = "0"));
      const target = document.querySelector(`.bg-img--hover[data-bg="${key}"]`);
      if (target) target.style.opacity = "1";
    });

    el.addEventListener("mouseleave", () => {
      hoverBgs.forEach((bg) => (bg.style.opacity = "0"));
      defaultBg.style.opacity = "1";
    });
  });

  /* ═══════════════════════════════════════════════
     CURSOR FOLLOW
  ═══════════════════════════════════════════════ */
  // script.js — cursor only, no click listener
  const cursor = document.querySelector(".cursor-letter");
  if (cursor) {
    let mouseX = 0,
      mouseY = 0,
      x = 0,
      y = 0;
    let initialized = false;
    let rafId = null;

    cursor.style.opacity = "0";

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!initialized) {
        x = mouseX;
        y = mouseY;
        initialized = true;
        cursor.style.opacity = "1";
      }
    });

    function animateCursor() {
      x += (mouseX - x) * 0.3;
      y += (mouseY - y) * 0.3;
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-60%, -65%)`;
      rafId = requestAnimationFrame(animateCursor);
    }

    window.addEventListener("DOMContentLoaded", () => animateCursor());

    // listen for transition start — exposed by transition.js
    window.addEventListener("pagetransitionstart", () => {
      cancelAnimationFrame(rafId);
      cursor.style.opacity = "0";
    });
  }
}
