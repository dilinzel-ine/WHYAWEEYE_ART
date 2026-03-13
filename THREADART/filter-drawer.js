// ==============================================
// FILTER DRAWER
// Depends on: page-state.js loaded before this
// ==============================================

const PRICE_MIN = 0;
const PRICE_MAX = 50000;
const NEW_DAYS = 30;

// ── pending state — applied only on Apply click ──
let pending = {
  status: "all",
  sizes: [],
  shapes: [],
  tag: "all",
  maxPrice: PRICE_MAX,
};

// ── cache DOM refs used in multiple functions ──
let slider, priceDisp;

// ══════════════════════════════════════
// CARD HELPERS
// ══════════════════════════════════════
function isNew(card) {
  const raw = card.getAttribute("data-date") || "";
  if (!raw) return false;
  const [dd, mm, yyyy] = raw.split("-").map(Number);
  return (
    (Date.now() - new Date(yyyy, mm - 1, dd).getTime()) / 86400000 <= NEW_DAYS
  );
}
const isSoldOut = (card) => card.classList.contains("sold-out");
const isPopular = (card) => !!card.querySelector(".popular-badge");
const isAvailable = (card) => !isSoldOut(card);
const isGift = (card) =>
  (card.dataset.tags || "").toLowerCase().includes("gift");

// ══════════════════════════════════════
// CENTRAL FILTER
// ══════════════════════════════════════
window.applyFilters = function () {
  const cards = document.querySelectorAll(".article-card, .cards-item");
  const {
    nav,
    filter,
    search,
    sizes = [],
    shapes = [],
    maxPrice = PRICE_MAX,
  } = window.PageState;
  let visible = 0;

  cards.forEach((card) => {
    if (card.classList.contains("scheduled-hidden")) return;

    const tags = (card.dataset.tags || "").toLowerCase();
    const title = (
      card.querySelector(".card-title, .card-text")?.textContent || ""
    ).toLowerCase();

    // nav / tag
    const passesNav = nav === "all" || tags.includes(nav.toLowerCase());

    // status
    const passesStatus =
      filter === "all"
        ? true
        : filter === "available"
          ? isAvailable(card)
          : filter === "new"
            ? isNew(card)
            : filter === "popular"
              ? isPopular(card)
              : filter === "soldout"
                ? isSoldOut(card)
                : filter === "gift"
                  ? isGift(card)
                  : true;

    // size + shape (multi)
    const passesSize =
      !sizes.length || sizes.includes((card.dataset.size || "").toLowerCase());
    const passesShape =
      !shapes.length ||
      shapes.includes((card.dataset.shape || "").toLowerCase());

    // price
    const cardPrice = Number(card.dataset.price || 0);
    const passesPrice = cardPrice === 0 || cardPrice <= maxPrice;

    // search
    const passesSearch = !search || `${title} ${tags}`.includes(search);

    const show =
      passesNav &&
      passesStatus &&
      passesSize &&
      passesShape &&
      passesPrice &&
      passesSearch;
    card.classList.toggle("hidden", !show);
    if (show) visible++;
  });

  // count
  const countEl =
    document.getElementById("countNumber") ||
    document.getElementById("activeCount");
  if (countEl) countEl.textContent = visible;

  // no results
  const noResults = document.getElementById("noResults");
  if (noResults) noResults.style.display = visible === 0 ? "block" : "none";

  updateBadge();
};

// ══════════════════════════════════════
// BADGE
// ══════════════════════════════════════
function updateBadge() {
  const badge = document.getElementById("filterBadge");
  if (!badge) return;
  const {
    filter,
    nav,
    sizes = [],
    shapes = [],
    maxPrice = PRICE_MAX,
  } = window.PageState;
  const count = [
    filter !== "all",
    nav !== "all",
    sizes.length > 0,
    shapes.length > 0,
    maxPrice < PRICE_MAX,
  ].filter(Boolean).length;
  badge.textContent = count;
  badge.hidden = count === 0;
}

// ══════════════════════════════════════
// DRAWER OPEN / CLOSE
// ══════════════════════════════════════
function openDrawer() {
  document.getElementById("filterDrawer")?.classList.add("open");
  document.getElementById("filterOverlay")?.classList.add("open");
  document.body.style.overflow = "hidden";
  syncUI();
}

function closeDrawer() {
  document.getElementById("filterDrawer")?.classList.remove("open");
  document.getElementById("filterOverlay")?.classList.remove("open");
  document.body.style.overflow = "";
}

// ── sync pill UI to current PageState ──
function syncUI() {
  const {
    filter,
    sizes = [],
    shapes = [],
    maxPrice = PRICE_MAX,
  } = window.PageState;

  document
    .querySelectorAll('[data-group="status"] .filter-pill')
    .forEach((p) => p.classList.toggle("active", p.dataset.value === filter));

  document
    .querySelectorAll('[data-group="size"] .filter-pill')
    .forEach((p) =>
      p.classList.toggle("active", sizes.includes(p.dataset.value)),
    );

  document
    .querySelectorAll('[data-group="shape"] .filter-pill')
    .forEach((p) =>
      p.classList.toggle("active", shapes.includes(p.dataset.value)),
    );

  if (slider) {
    slider.value = maxPrice;
    const pct = ((maxPrice / PRICE_MAX) * 100).toFixed(1);
    slider.style.setProperty("--slider-pct", `${pct}%`);
    if (priceDisp)
      priceDisp.textContent = `₹${maxPrice.toLocaleString("en-IN")}`;
  }
}

// ══════════════════════════════════════
// APPLY + CLEAR
// ══════════════════════════════════════
function applyPending() {
  window.PageState.filter = pending.status;
  window.PageState.nav = pending.tag;
  window.PageState.sizes = [...pending.sizes];
  window.PageState.shapes = [...pending.shapes];
  window.PageState.maxPrice = pending.maxPrice;
  window.applyFilters();
  closeDrawer();
}

function clearAll() {
  // reset pending
  pending = {
    status: "all",
    sizes: [],
    shapes: [],
    tag: "all",
    maxPrice: PRICE_MAX,
  };

  // reset PageState
  Object.assign(window.PageState, {
    filter: "all",
    nav: "all",
    sizes: [],
    shapes: [],
    search: "",
    maxPrice: PRICE_MAX,
  });

  // reset search
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";
  document.getElementById("thr-searchClear")?.classList.remove("visible");

  // reset UI
  document
    .querySelectorAll(".filter-pill")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelector('[data-group="status"] .filter-pill[data-value="all"]')
    ?.classList.add("active");
  document
    .querySelector('[data-group="tag"] .filter-pill[data-value="all"]')
    ?.classList.add("active");

  // reset slider
  if (slider) {
    slider.value = PRICE_MAX;
    slider.style.setProperty("--slider-pct", "100%");
    if (priceDisp)
      priceDisp.textContent = `₹${PRICE_MAX.toLocaleString("en-IN")}`;
  }

  window.applyFilters();
}

// ══════════════════════════════════════
// ACCORDION
// ══════════════════════════════════════
function initAccordions() {
  document.querySelectorAll(".filter-section-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", !expanded);
      const body = toggle.nextElementSibling;
      expanded
        ? body.setAttribute("hidden", "")
        : body.removeAttribute("hidden");
    });
  });
}

// ══════════════════════════════════════
// PILL CLICKS — event delegation
// ══════════════════════════════════════
document.addEventListener("click", (e) => {
  const pill = e.target.closest(".filter-pill");
  if (!pill) return;
  const group = pill.closest(".filter-pills");
  if (!group) return;

  const { mode, group: grp } = group.dataset;
  const val = pill.dataset.value;

  if (mode === "single") {
    group
      .querySelectorAll(".filter-pill")
      .forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    if (grp === "status") pending.status = val;
    else if (grp === "tag") pending.tag = val;
  } else {
    pill.classList.toggle("active");
    pending[grp === "size" ? "sizes" : "shapes"] = [
      ...group.querySelectorAll(".filter-pill.active"),
    ].map((p) => p.dataset.value);
  }
});

// ══════════════════════════════════════
// BUILD TAG PILLS from rendered cards
// ══════════════════════════════════════
function buildTagSection() {
  const tagBody = document.getElementById("tagDrawerBody");
  if (!tagBody) return;

  const tags = new Set();
  document.querySelectorAll(".article-card .card2-tag").forEach((t) => {
    const tag = t.textContent.trim();
    if (tag) tags.add(tag);
  });

  tagBody.innerHTML = `<button class="filter-pill active" data-value="all">All</button>`;
  [...tags].sort().forEach((tag) => {
    const btn = document.createElement("button");
    btn.className = "filter-pill";
    btn.dataset.value = tag.toLowerCase();
    btn.textContent = tag;
    tagBody.appendChild(btn);
  });
}

// ══════════════════════════════════════
// INIT
// ══════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  // extend PageState with new fields
  Object.assign(window.PageState, {
    sizes: [],
    shapes: [],
    maxPrice: PRICE_MAX,
  });

  // cache slider refs
  slider = document.getElementById("priceSlider");
  priceDisp = document.getElementById("priceDisplay");

  // drawer open/close
  document
    .getElementById("filterDrawerBtn")
    ?.addEventListener("click", openDrawer);
  document
    .getElementById("filterDrawerClose")
    ?.addEventListener("click", closeDrawer);
  document
    .getElementById("filterOverlay")
    ?.addEventListener("click", closeDrawer);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  // apply + clear
  document
    .getElementById("filterApplyBtn")
    ?.addEventListener("click", applyPending);
  document
    .getElementById("filterClearBtn")
    ?.addEventListener("click", clearAll);

  // accordions
  initAccordions();

  // price slider
  if (slider) {
    slider.addEventListener("input", () => {
      const val = Number(slider.value);
      slider.style.setProperty(
        "--slider-pct",
        `${((val / PRICE_MAX) * 100).toFixed(1)}%`,
      );
      if (priceDisp) priceDisp.textContent = `₹${val.toLocaleString("en-IN")}`;
      pending.maxPrice = val;
    });
  }

  // URL param auto-apply
  const urlFilter = new URLSearchParams(window.location.search).get("filter");
  if (urlFilter) {
    pending.status = urlFilter;
    window.PageState.filter = urlFilter;
    document
      .querySelector(
        `[data-group="status"] .filter-pill[data-value="${urlFilter}"]`,
      )
      ?.classList.add("active");
    document
      .querySelector(`[data-group="status"] .filter-pill[data-value="all"]`)
      ?.classList.remove("active");
  }

  // build tags + run filters after cards render
  document.addEventListener("cardsReady", () => {
    buildTagSection();
    window.applyFilters();
  });
});
