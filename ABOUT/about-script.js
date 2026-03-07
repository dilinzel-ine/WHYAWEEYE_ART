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
}
