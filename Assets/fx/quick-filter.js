(function () {
  const NEW_DAYS = 30;

  /* ── DETERMINE CARD TYPE ── */
  function getCardQFTypes(card) {
    const types = new Set();
    const dateRaw = card.getAttribute("data-date") || "";
    const isSoldOut = card.classList.contains("sold-out");
    const isPopular = !!card.querySelector(".popular-badge");

    let isNew = false;
    if (dateRaw) {
      const [dd, mm, yyyy] = dateRaw.split("-").map(Number);
      const cardDate = new Date(yyyy, mm - 1, dd);
      const diffDays =
        (Date.now() - cardDate.getTime()) / (1000 * 60 * 60 * 24);
      isNew = diffDays <= NEW_DAYS;
    }

    // priority — soldout wins over everything
    if (isSoldOut) types.add("soldout");
    else if (isPopular) types.add("popular");
    else if (isNew) types.add("new");
    else types.add("other");

    return types;
  }

  /* ── APPLY ALL FILTERS ── */
  function applyFilters() {
    const cards = document.querySelectorAll(".article-card, .cards-item");
    const checks = document.querySelectorAll(".qf-check");

    // update reset button visibility
    const resetBtn = document.getElementById("qfReset");
    if (resetBtn) {
      const anyUnchecked = [...checks].some((c) => !c.checked);
      resetBtn.style.display = anyUnchecked ? "" : "none";
    }

    // build active quick filter set
    const activeQF = new Set();
    checks.forEach((c) => {
      if (c.checked) activeQF.add(c.dataset.qf);
    });

    // active nav filter — works for threadart + gallery
    const activeNav =
      document.querySelector(".artpage-nav-link.active, .nav-link.active")
        ?.dataset.filter || "all";

    let visible = 0;
    cards.forEach((card) => {
      if (card.classList.contains("scheduled-hidden")) return;

      const tags = card.dataset.tags || "";
      const passesNav = activeNav === "all" || tags.includes(activeNav);

      const cardTypes = getCardQFTypes(card);
      const passesQF = [...cardTypes].some((t) => activeQF.has(t));

      const show = passesNav && passesQF;
      card.classList.toggle("hidden", !show);
      if (show) visible++;
    });

    // update visible count
    const countEl = document.getElementById("activeCount");
    if (countEl) countEl.textContent = visible;

    // no results message
    const noResults = document.getElementById("noResults");
    if (noResults) noResults.style.display = visible === 0 ? "block" : "none";
  }

  /* ── INIT ── */
  document.addEventListener("DOMContentLoaded", () => {
    // quick filter checkboxes
    document.querySelectorAll(".qf-check").forEach((c) => {
      c.addEventListener("change", applyFilters);
    });

    // reset button — check all and reapply
    const resetBtn = document.getElementById("qfReset");
    if (resetBtn) {
      resetBtn.style.display = "none"; // hidden on load (all checked)
      resetBtn.addEventListener("click", () => {
        document
          .querySelectorAll(".qf-check")
          .forEach((c) => (c.checked = true));
        applyFilters();
      });
    }

    // nav link clicks — works for both class names
    document.addEventListener("click", (e) => {
      if (e.target.closest(".artpage-nav-link, .nav-link")) {
        setTimeout(applyFilters, 0);
      }
    });

    // wait for async card render
    document.addEventListener("cardsReady", applyFilters);

    // run immediately if cards already rendered
    applyFilters();
  });
})();
