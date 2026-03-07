// transition.js — place this as LAST script before </body> on every page

(function () {
  const overlay = document.getElementById("page-transition");
  if (!overlay) return;

  const DURATION = 800; // ms — must match CSS animation duration

  // ── animate overlay in (covers screen bottom→top)
  function coverScreen(cb) {
    overlay.style.transition = `transform ${DURATION}ms cubic-bezier(0.83, 0, 0.17, 1)`;
    overlay.style.transform = "translateY(0%)";
    setTimeout(cb, DURATION);
  }

  // ── animate overlay out (reveals screen top→bottom going up)
  function revealScreen() {
    overlay.style.transition = `transform ${DURATION}ms cubic-bezier(0.83, 0, 0.17, 1)`;
    overlay.style.transform = "translateY(-100%)";
    // show body now — overlay slides away revealing the page
    document.body.classList.add("is-ready");
  }

  // ── on every page load: overlay comes in from below already gone,
  //    reset it to bottom, then slide it up and away
  window.addEventListener("DOMContentLoaded", () => {
    // if loader exists on this page, it handles reveal — just show body
    if (document.getElementById("loading-screen")) {
      overlay.style.transform = "translateY(100%)";
      document.body.classList.add("is-ready");
      return;
    }

    // reset overlay to cover position instantly (no transition)
    overlay.style.transition = "none";
    overlay.style.transform = "translateY(0%)";

    // one frame later — slide it away upward
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        revealScreen();
      });
    });
  });

  // ── intercept link clicks
  let isTransitioning = false;

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");

    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto") ||
      href.startsWith("tel") ||
      link.target === "_blank" ||
      link.hostname !== location.hostname ||
      link.href === location.href ||
      isTransitioning
    )
      return;

    e.preventDefault();
    isTransitioning = true;
    const dest = link.href;

    // reset overlay to below screen, then slide up to cover
    overlay.style.transition = "none";
    overlay.style.transform = "translateY(100%)";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        coverScreen(() => {
          window.location.href = dest;
        });
      });
    });
  });
})();
