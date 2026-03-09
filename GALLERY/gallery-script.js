/* ═══════════════════════════════════════════
   GALLERY SEARCH + TAG FILTER
═══════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".cards-item, .article-card"); // all gallery cards
  const searchInput = document.getElementById("searchInput"); // text input
  const searchClear = document.getElementById("searchClear"); // ✕ clear button
  const searchTagsRow = document.getElementById("searchTagsRow"); // active pill row
  const noResults = document.getElementById("noResults"); // empty state message
  const countNumber = document.getElementById("countNumber"); // count display

  if (!searchInput) return; // stop if no search on this page

  // today's date — used for scheduled card check
  const today = new Date();
  today.setHours(0, 0, 0, 0); // strip time for date-only comparison

  /* ── SCHEDULED CHECK ─────────────────────── */
  // returns true if card's date is in the future
  function isCardScheduled(card) {
    const raw = card.getAttribute("data-date") || "";
    if (!raw) return false; // no date = not scheduled
    const [dd, mm, yyyy] = raw.split("-").map(Number); // parse dd-mm-yyyy
    const cardDate = new Date(yyyy, mm - 1, dd); // JS month is 0-indexed
    cardDate.setHours(0, 0, 0, 0);
    return cardDate > today; // true if future
  }

  /* ── COUNT ───────────────────────────────── */
  // updates the visible card count display
  function updateCount() {
    const visible = [...cards].filter(
      (card) => !card.classList.contains("hidden"),
    ).length;
    if (countNumber) countNumber.textContent = visible;
  }

  let activeTags = []; // currently active tag filters

  /* ── ADD TAG ─────────────────────────────── */
  function addTag(tag) {
    const normalised = tag.trim().toLowerCase();
    if (activeTags.includes(normalised)) return; // skip duplicates
    activeTags.push(normalised); // add to active list
    renderTagPills(); // update search bar pills
    applyFilters(); // re-filter gallery
  }

  /* ── REMOVE TAG ──────────────────────────── */
  function removeTag(tag) {
    activeTags = activeTags.filter((t) => t !== tag); // remove from list
    renderTagPills(); // update pills
    applyFilters(); // re-filter gallery
  }

  /* ── RENDER TAG PILLS IN SEARCH BAR ─────── */
  function renderTagPills() {
    searchTagsRow.innerHTML = ""; // clear old pills

    activeTags.forEach((tag) => {
      const pill = document.createElement("span");
      pill.classList.add("search-active-tag");
      pill.innerHTML = `${tag} <span class="remove-tag">✕</span>`; // pill with remove button
      pill.addEventListener("click", () => removeTag(tag)); // click removes this tag
      searchTagsRow.appendChild(pill);
    });

    // hide placeholder when pills are active
    searchInput.placeholder =
      activeTags.length > 0 ? "" : "SEARCH TITLE, TAGS...";

    // show clear button only when there is something to clear
    const hasContent = activeTags.length > 0 || searchInput.value.trim() !== "";
    searchClear.classList.toggle("visible", hasContent);
  }

  /* ── APPLY FILTERS ───────────────────────── */
  // runs on every tag change, text input, and clear
  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase(); // current search text
    let visible = 0; // count of visible cards

    cards.forEach((card) => {
      // scheduled cards are always hidden regardless of filter
      if (isCardScheduled(card)) {
        card.classList.add("hidden");
        return;
      }

      // no query and no tags — show everything
      if (!query && activeTags.length === 0) {
        card.classList.remove("hidden");
        visible++;
        return;
      }

      // read title from card-title or fall back to card-text
      const title =
        card.querySelector(".card-title")?.textContent?.toLowerCase() ||
        card.querySelector(".card-text")?.textContent?.toLowerCase() ||
        "";

      // read all tag elements — used for both tag filter and text search
      const tagEls = [
        ...card.querySelectorAll(".card2-tag, .card2-filter-tag"),
      ];
      const tagTexts = tagEls.map((t) => t.textContent.trim().toLowerCase());

      // card must match ALL active tag filters
      const tagsMatch = activeTags.every((activeTag) =>
        tagTexts.some((t) => t.includes(activeTag)),
      );

      // text query must match title or any tag
      const queryMatch =
        !query ||
        title.includes(query) ||
        tagTexts.some((t) => t.includes(query));

      const show = tagsMatch && queryMatch; // must pass both checks
      card.classList.toggle("hidden", !show);
      if (show) visible++;
    });

    // show empty state if no cards visible
    if (noResults) noResults.style.display = visible === 0 ? "block" : "none";

    // update count display
    updateCount();
  }

  /* ── TAG PILL CLICKS ON CARDS ────────────── */
  // event delegation — catches clicks on any .card2-tag anywhere on the page
  document.addEventListener("click", (e) => {
    const tag = e.target.closest(".card2-tag");
    if (!tag) return; // not a tag click
    e.stopPropagation(); // prevent modal opening
    addTag(tag.textContent.trim()); // add as active filter
  });

  /* ── TEXT SEARCH INPUT ───────────────────── */
  searchInput.addEventListener("input", () => {
    const hasContent = activeTags.length > 0 || searchInput.value.length > 0;
    searchClear.classList.toggle("visible", hasContent); // show/hide clear button
    applyFilters(); // re-filter on every keystroke
  });

  /* ── CLEAR BUTTON ────────────────────────── */
  // event delegation — more reliable than direct listener on the element
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#searchClear")) return; // only fires for clear button
    activeTags = []; // clear all tag filters
    searchInput.value = ""; // clear text input
    searchTagsRow.innerHTML = ""; // clear pill row
    searchInput.placeholder = "SEARCH TITLE, TAGS..."; // ← restore placeholder
    e.target.closest("#searchClear").classList.remove("visible"); // hide clear button
    history.replaceState(null, "", window.location.pathname); // remove hash from URL
    applyFilters(); // restore all cards + update count
  });

  /* ── AUTO-FILTER FROM URL HASH ───────────── */
  // runs once on page load
  // handles links from tag-index like gallery.html#filter=3D Printed
  const hashFilter = window.location.hash.slice(1); // read hash, strip #
  if (hashFilter.startsWith("filter=")) {
    const tag = decodeURIComponent(hashFilter.replace("filter=", "")); // decode spaces etc.
    if (tag) {
      history.replaceState(null, "", window.location.pathname); // clean URL immediately so refresh doesn't re-trigger
      window.scrollTo({ top: 0, behavior: "instant" }); // scroll to top before filtering
      addTag(tag); // add tag — triggers renderTagPills + applyFilters
    }
  }

  /* ── INITIAL COUNT ───────────────────────── */
  // runs once on load to show correct count before any interaction
  applyFilters();
});
