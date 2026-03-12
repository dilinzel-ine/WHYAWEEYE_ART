// =================================================
// ABOUT
// =================================================
// hover background swap — desktop only
if (window.matchMedia("(hover: hover)").matches) {
  // elements that trigger bg swap on hover
  const triggers = document.querySelectorAll("[data-trigger]");
  const hoverBgs = document.querySelectorAll(".bg-img--hover");
  const defaultBg = document.querySelector(".bg-img--default");

  triggers.forEach((el) => {
    // on enter — hide default, show matching bg
    el.addEventListener("mouseenter", () => {
      defaultBg.style.opacity = "0";
      hoverBgs.forEach((bg) => (bg.style.opacity = "0"));
      document
        .querySelector(`.bg-img--hover[data-bg="${el.dataset.trigger}"]`)
        ?.style.setProperty("opacity", "1");
    });

    // on leave — restore default bg
    el.addEventListener("mouseleave", () => {
      hoverBgs.forEach((bg) => (bg.style.opacity = "0"));
      defaultBg.style.opacity = "1";
    });
  });
}
