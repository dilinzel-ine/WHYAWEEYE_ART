// ==============================================
// THREADART SCRIPT
// Handles: nav filter, search, tag drawer
// Writes to PageState → calls window.applyFilters()
// Depends on: page-state.js, quick-filter.js
// ==============================================
document.addEventListener("cardsReady", () => {
  const cards = document.querySelectorAll(".article-card");
  const noResults = document.getElementById("noResults");
  const searchInput = document.getElementById("searchInput");
  const searchClear = document.getElementById("thr-searchClear");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ── mark future scheduled cards ──
  cards.forEach((card) => {
    const raw = card.getAttribute("data-date") || "";
    if (!raw) return;
    const [dd, mm, yyyy] = raw.split("-").map(Number);
    const date = new Date(yyyy, mm - 1, dd);
    date.setHours(0, 0, 0, 0);
    if (date > today) card.classList.add("scheduled-hidden", "hidden");
  });

  // ── run initial filter ──
  window.applyFilters();

  // ══════════════════════════════════════
  // NAV FILTER
  // ══════════════════════════════════════
  const nav = document.querySelector(".artpage-nav");
  if (nav) {
    const sections = nav.querySelectorAll(".artpage-nav-section");
    const allLinks = [...nav.querySelectorAll(".artpage-nav-link")];
    const pinnedOrder = ["all", "featured"];
    const pinned = allLinks.filter((l) =>
      pinnedOrder.includes(l.dataset.filter),
    );
    const rest = allLinks.filter(
      (l) => !pinnedOrder.includes(l.dataset.filter),
    );

    // sort non-pinned alphabetically
    rest.sort((a, b) =>
      a.textContent.trim().localeCompare(b.textContent.trim()),
    );

    // rebuild nav sections
    sections.forEach((section) => {
      const label = section.querySelector(".artpage-nav-label");
      section.innerHTML = "";
      if (label) section.appendChild(label);
    });

    pinnedOrder.forEach((filter) => {
      const link = pinned.find((l) => l.dataset.filter === filter);
      if (link) sections[0]?.appendChild(link);
    });

    const midpoint = Math.ceil(rest.length / 2);
    rest.forEach((link, i) =>
      (i < midpoint ? sections[0] : sections[1])?.appendChild(link),
    );

    // nav click → update PageState.nav → applyFilters
    allLinks.forEach((link) => {
      link.addEventListener("click", () => {
        allLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        window.PageState.nav = link.dataset.filter || "all";
        window.applyFilters();
      });
    });
  }

  // ══════════════════════════════════════
  // SEARCH
  // ══════════════════════════════════════
  function resetNavToAll() {
    const links = document.querySelectorAll(".artpage-nav-link");
    links.forEach((l) => l.classList.remove("active"));
    document
      .querySelector(".artpage-nav-link[data-filter='all']")
      ?.classList.add("active");
    window.PageState.nav = "all";
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();
      const hasPill = document.querySelector(".search-tag-pill");

      // show/hide clear button
      if (searchClear)
        searchClear.classList.toggle("visible", query.length > 0 && !hasPill);

      // reset nav to all when searching
      resetNavToAll();

      // update state → filter
      window.PageState.search = query;
      window.applyFilters();
    });
  }

  // ── clear search ──
  if (searchClear) {
    searchClear.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      searchClear.classList.remove("visible");
      window.PageState.search = "";
      resetNavToAll();
      window.applyFilters();
    });
  }
});
