// ==============================================
// QUICK FILTER — dropdown version
// ==============================================
(function () {
  const NEW_DAYS = 30;

  /* ── card type ── */
  function getCardType(card) {
    if (card.classList.contains("sold-out")) return "soldout";
    if (card.querySelector(".popular-badge")) return "popular";
    const dateRaw = card.getAttribute("data-date") || "";
    if (dateRaw) {
      const [dd, mm, yyyy] = dateRaw.split("-").map(Number);
      const diffDays =
        (Date.now() - new Date(yyyy, mm - 1, dd).getTime()) / 86400000;
      if (diffDays <= NEW_DAYS) return "new";
    }
    return "other";
  }

  /* ── apply filters ── */
  function applyFilters() {
    const cards = document.querySelectorAll(".article-card, .cards-item");
    const selected = document.getElementById("qfDropdown")?.value || "all";
    const activeNav =
      document.querySelector(".artpage-nav-link.active, .nav-link.active")
        ?.dataset.filter || "all";

    let visible = 0;

    cards.forEach((card) => {
      if (card.classList.contains("scheduled-hidden")) return;

      const tags = card.dataset.tags || "";
      const passesNav = activeNav === "all" || tags.includes(activeNav);

      let passesQF;
      if (selected === "all") {
        passesQF = true;
      } else if (selected === "gift") {
        passesQF = tags.toLowerCase().includes("gift");
      } else {
        passesQF = getCardType(card) === selected;
      }
      const show = passesNav && passesQF;
      card.classList.toggle("hidden", !show);
      if (show) visible++;
    });

    const countEl = document.getElementById("activeCount");
    if (countEl) countEl.textContent = visible;

    const noResults = document.getElementById("noResults");
    if (noResults) noResults.style.display = visible === 0 ? "block" : "none";

    document.dispatchEvent(new CustomEvent("qfApplied"));
  }

  /* ── init ── */
  document.addEventListener("DOMContentLoaded", () => {
    document
      .getElementById("qfDropdown")
      ?.addEventListener("change", applyFilters);

    // auto-apply gift filter from URL param
    const urlFilter = new URLSearchParams(window.location.search).get("filter");
    if (urlFilter) {
      const dropdown = document.getElementById("qfDropdown");
      if (dropdown) {
        dropdown.value = urlFilter;
        applyFilters();
      }
    }

    document.addEventListener("click", (e) => {
      if (e.target.closest(".artpage-nav-link, .nav-link")) {
        setTimeout(applyFilters, 0);
      }
    });

    document.addEventListener("cardsReady", applyFilters);
    applyFilters();
  });
})();
