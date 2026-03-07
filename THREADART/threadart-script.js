/* ═══════════════════════════════════════════
   NAV + FILTER + SEARCH
═══════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".article-card"); // all project cards
  const noResults = document.getElementById("noResults"); // empty state message
  const searchInput = document.getElementById("searchInput"); // search input
  const searchClear = document.getElementById("searchClear"); // ✕ clear button
  const countNumber = document.getElementById("countNumber"); // count display

  // today's date — used by isCardScheduled
  const today = new Date();
  today.setHours(0, 0, 0, 0); // strip time for date-only comparison

  const nav = document.querySelector(".artpage-nav");
  if (!nav) return; // stop if no nav on this page

  const sections = nav.querySelectorAll(".artpage-nav-section"); // the two nav columns
  const allLinks = [...nav.querySelectorAll(".artpage-nav-link")]; // all filter links

  /* ── SORT NAV LINKS ──────────────────────── */
  const pinnedOrder = ["all", "featured"]; // always appear first
  const pinned = allLinks.filter((l) => pinnedOrder.includes(l.dataset.filter));
  const rest = allLinks.filter((l) => !pinnedOrder.includes(l.dataset.filter));
  rest.sort((a, b) => a.textContent.trim().localeCompare(b.textContent.trim())); // alphabetical

  // clear each section but keep its label
  sections.forEach((section) => {
    const label = section.querySelector(".artpage-nav-label");
    section.innerHTML = "";
    if (label) section.appendChild(label); // restore label first
  });

  // put pinned links in first section
  pinnedOrder.forEach((filter) => {
    const link = pinned.find((l) => l.dataset.filter === filter);
    if (link) sections[0]?.appendChild(link);
  });

  // split remaining links evenly across both columns
  const midpoint = Math.ceil(rest.length / 2);
  rest.forEach((link, i) =>
    (i < midpoint ? sections[0] : sections[1])?.appendChild(link),
  );

  /* ── SCHEDULED CHECK ─────────────────────── */
  // returns true if card's date is in the future
  function isCardScheduled(card) {
    const raw = card.getAttribute("data-date") || "";
    if (!raw) return false; // no date = not scheduled
    const [dd, mm, yyyy] = raw.split("-").map(Number); // parse dd-mm-yyyy
    const cardDate = new Date(yyyy, mm - 1, dd); // JS month is 0-indexed
    cardDate.setHours(0, 0, 0, 0);
    return cardDate > today; // true if future date
  }

  /* ── COUNT ───────────────────────────────── */
  // updates the visible card count display
  function updateCount() {
    const visible = [...cards].filter(
      (card) => !card.classList.contains("hidden"),
    ).length;
    if (countNumber) countNumber.textContent = visible;
  }

  /* ── HIDE SCHEDULED CARDS ON LOAD ───────── */
  cards.forEach((card) => {
    if (isCardScheduled(card)) card.classList.add("hidden");
  });

  /* ═══════════════════════════════════════════
     FILTER CLICKS
  ═══════════════════════════════════════════ */
  allLinks.forEach((link) => {
    link.addEventListener("click", () => {
      allLinks.forEach((l) => l.classList.remove("active")); // clear all active states
      link.classList.add("active"); // activate clicked link
      if (searchInput) searchInput.value = ""; // clear search on filter click

      const filter = link.dataset.filter; // e.g. "all", "ode"
      let visible = 0;

      cards.forEach((card) => {
        if (isCardScheduled(card)) {
          // never show future cards
          card.classList.add("hidden");
          return;
        }
        const show =
          filter === "all" || (card.dataset.tags || "").includes(filter);
        card.classList.toggle("hidden", !show);
        if (show) visible++;
      });

      if (noResults) noResults.style.display = visible === 0 ? "block" : "none";
      updateCount(); // update count after filter
    });
  });

  /* ═══════════════════════════════════════════
     SEARCH
  ═══════════════════════════════════════════ */
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase(); // get search term

      // show/hide clear button
      if (searchClear) searchClear.classList.toggle("visible", query !== "");

      // reset nav filter to "all" when typing
      allLinks.forEach((l) => l.classList.remove("active"));
      const allLink = allLinks.find((l) => l.dataset.filter === "all");
      if (allLink) allLink.classList.add("active");

      let visible = 0;

      cards.forEach((card) => {
        if (isCardScheduled(card)) {
          // never show future cards
          card.classList.add("hidden");
          return;
        }

        if (!query) {
          // empty search — show all
          card.classList.remove("hidden");
          visible++;
          return;
        }

        // search title and tags only
        const title =
          card.querySelector(".card-text")?.textContent?.toLowerCase() || "";
        const tags = card.dataset.tags?.toLowerCase() || "";
        const show = `${title} ${tags}`.includes(query);
        card.classList.toggle("hidden", !show);
        if (show) visible++;
      });

      if (noResults) noResults.style.display = visible === 0 ? "block" : "none";
      updateCount(); // update count after search
    });
  }

  /* ── CLEAR BUTTON ────────────────────────── */
  if (searchClear) {
    searchClear.addEventListener("click", () => {
      if (searchInput) searchInput.value = ""; // clear text input
      searchClear.classList.remove("visible"); // hide clear button

      // reset nav to "all"
      allLinks.forEach((l) => l.classList.remove("active"));
      const allLink = allLinks.find((l) => l.dataset.filter === "all");
      if (allLink) allLink.classList.add("active");

      // show all non-scheduled cards
      let visible = 0;
      cards.forEach((card) => {
        if (isCardScheduled(card)) {
          card.classList.add("hidden");
          return;
        }
        card.classList.remove("hidden");
        visible++;
      });

      if (noResults) noResults.style.display = visible === 0 ? "block" : "none";
      updateCount(); // update count after clear
    });
  }

  /* ── INITIAL COUNT ───────────────────────── */
  // runs once on load to show correct starting count
  updateCount();
});
