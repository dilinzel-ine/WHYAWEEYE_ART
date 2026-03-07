/* ═══════════════════════════════════════════════
     CURSOR FOLLOW
  ═══════════════════════════════════════════════ */
const cursorLetter = document.createElement("div");
cursorLetter.classList.add("cursor-letter");
cursorLetter.setAttribute("aria-hidden", "true");
cursorLetter.textContent = "●";
document.body.appendChild(cursorLetter);
// <!-- <div class="cursor-letter">Refresh → New Image</div> -->
// const cursor = document.querySelector(".cursor-letter");

let mouseX = 0,
  mouseY = 0,
  x = 0,
  y = 0;
let initialized = false;
let rafId = null;

cursorLetter.style.opacity = "0";

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (!initialized) {
    x = mouseX;
    y = mouseY;
    initialized = true;
    cursorLetter.style.opacity = "1";
  }
});

function animateCursor() {
  x += (mouseX - x) * 0.3;
  y += (mouseY - y) * 0.3;
  cursorLetter.style.transform = `translate(${x}px, ${y}px) translate(-60%, -65%)`;
  rafId = requestAnimationFrame(animateCursor);
}

window.addEventListener("DOMContentLoaded", () => animateCursor());

window.addEventListener("pagetransitionstart", () => {
  cancelAnimationFrame(rafId);
  cursorLetter.style.opacity = "0";
});

/* ═══════════════════════════════════════════════
   CURSOR HOVER SCALE
═══════════════════════════════════════════════ */

// instead of querying elements directly, listen on document
// this catches ALL links and buttons — even ones injected by JS later
document.addEventListener("mouseover", (e) => {
  if (e.target.closest("a, button, [role='button']")) {
    cursorLetter.classList.add("cursor-shrink");
  }
});

document.addEventListener("mouseout", (e) => {
  if (e.target.closest("a, button, [role='button']")) {
    cursorLetter.classList.remove("cursor-shrink");
  }
});
