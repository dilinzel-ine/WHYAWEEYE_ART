document.addEventListener("cardsReady", () => {
  const cards = document.querySelectorAll(".article-card");
  const noResults = document.getElementById("noResults");
  const searchInput = document.getElementById("searchInput");
  const searchClear = document.getElementById("thr-searchClear");
  const countNumber = document.getElementById("countNumber");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ── is card scheduled for future? ──
  function isScheduled(card) {
    const raw = card.getAttribute("data-date") || "";
    if (!raw) return false;
    const [dd, mm, yyyy] = raw.split("-").map(Number);
    const date = new Date(yyyy, mm - 1, dd);
    date.setHours(0, 0, 0, 0);
    return date > today;
  }

  // ── update visible card count ──
  function updateCount() {
    const visible = [...cards].filter(
      (c) => !c.classList.contains("hidden"),
    ).length;
    if (countNumber) countNumber.textContent = visible;
  }

  // ── hide scheduled cards on load ──
  cards.forEach((card) => {
    if (isScheduled(card)) card.classList.add("hidden");
  });

  // ── recount when quick-filter dropdown changes ──
  document.addEventListener("qfApplied", updateCount);

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

    // sort non-pinned links alphabetically
    rest.sort((a, b) =>
      a.textContent.trim().localeCompare(b.textContent.trim()),
    );

    // clear sections before rebuilding
    sections.forEach((section) => {
      const label = section.querySelector(".artpage-nav-label");
      section.innerHTML = "";
      if (label) section.appendChild(label);
    });

    // add pinned links to first section
    pinnedOrder.forEach((filter) => {
      const link = pinned.find((l) => l.dataset.filter === filter);
      if (link) sections[0]?.appendChild(link);
    });

    // split rest across two sections
    const midpoint = Math.ceil(rest.length / 2);
    rest.forEach((link, i) =>
      (i < midpoint ? sections[0] : sections[1])?.appendChild(link),
    );

    // active state on nav click — filtering handled by quick-filter.js
    allLinks.forEach((link) => {
      link.addEventListener("click", () => {
        allLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
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
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();
      const hasPill = document.querySelector(".search-tag-pill");

      // show clear button when typing without a tag pill active
      if (searchClear)
        searchClear.classList.toggle(
          "visible",
          searchInput.value.length > 0 && !hasPill,
        );

      // reset nav to "all" when searching
      resetNavToAll();

      let visible = 0;
      cards.forEach((card) => {
        if (isScheduled(card)) {
          card.classList.add("hidden");
          return;
        }
        if (!query) {
          card.classList.remove("hidden");
          visible++;
          return;
        }
        const title =
          card.querySelector(".card-text")?.textContent?.toLowerCase() || "";
        const tags = card.dataset.tags?.toLowerCase() || "";
        const show = `${title} ${tags}`.includes(query);
        card.classList.toggle("hidden", !show);
        if (show) visible++;
      });

      if (noResults) noResults.style.display = visible === 0 ? "block" : "none";
      updateCount();
    });
  }

  // ── clear search ──
  if (searchClear) {
    searchClear.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      searchClear.classList.remove("visible");
      resetNavToAll();

      let visible = 0;
      cards.forEach((card) => {
        if (isScheduled(card)) {
          card.classList.add("hidden");
          return;
        }
        card.classList.remove("hidden");
        visible++;
      });

      if (noResults) noResults.style.display = visible === 0 ? "block" : "none";
      updateCount();
    });
  }

  updateCount();

  // ══════════════════════════════════════
  // TAG DRAWER
  // ══════════════════════════════════════
  const tagDrawer = document.getElementById("tagDrawer");
  const tagDrawerOverlay = document.getElementById("tagDrawerOverlay");
  const tagDrawerClose = document.getElementById("tagDrawerClose");
  const tagIndexBtn = document.getElementById("tagIndexBtn");
  const tagDrawerBody = document.getElementById("tagDrawerBody");
  const searchTagsRow = document.getElementById("searchTagsRow");

  // ── open / close drawer ──
  function openDrawer() {
    tagDrawer?.classList.add("open");
    tagDrawerOverlay?.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    tagDrawer?.classList.remove("open");
    tagDrawerOverlay?.classList.remove("open");
    document.body.style.overflow = "";
  }

  tagIndexBtn?.addEventListener("click", openDrawer);
  tagDrawerClose?.addEventListener("click", closeDrawer);
  tagDrawerOverlay?.addEventListener("click", closeDrawer);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  // ── build tag drawer from card tags ──
  function buildDrawer() {
    if (!tagDrawerBody) return;

    // collect all unique tags
    const tagMap = {};
    document.querySelectorAll(".article-card").forEach((card) => {
      card.querySelectorAll(".card2-tag").forEach((t) => {
        const tag = t.textContent.trim();
        if (tag) tagMap[tag] = true;
      });
    });

    // group tags by first letter
    const groups = {};
    Object.keys(tagMap)
      .sort()
      .forEach((tag) => {
        const letter = tag[0].toUpperCase();
        if (!groups[letter]) groups[letter] = [];
        groups[letter].push(tag);
      });

    tagDrawerBody.innerHTML = "";

    // "ALL" pill always first
    const allSection = document.createElement("div");
    allSection.className = "tag-drawer-section";
    allSection.innerHTML = `<div class="tag-drawer-pills"><button class="tag-drawer-pill active" data-filter="all">ALL</button></div>`;
    tagDrawerBody.appendChild(allSection);

    // alphabetical sections
    Object.keys(groups)
      .sort()
      .forEach((letter) => {
        const section = document.createElement("div");
        section.className = "tag-drawer-section";
        section.innerHTML = `
        <div class="tag-drawer-label">${letter}</div>
        <div class="tag-drawer-pills">
          ${groups[letter].map((t) => `<button class="tag-drawer-pill" data-filter="${t}">${t}</button>`).join("")}
        </div>
      `;
        tagDrawerBody.appendChild(section);
      });

    // ── pill click — filter cards by tag ──
    tagDrawerBody.querySelectorAll(".tag-drawer-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        // set active pill
        tagDrawerBody
          .querySelectorAll(".tag-drawer-pill")
          .forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");

        const filter = pill.dataset.filter;
        let visible = 0;

        document.querySelectorAll(".article-card").forEach((card) => {
          const show =
            filter === "all" || (card.dataset.tags || "").includes(filter);
          card.classList.toggle("hidden", !show);
          if (show) visible++;
        });

        if (noResults)
          noResults.style.display = visible === 0 ? "block" : "none";
        updateCount();
        closeDrawer();

        // show active tag pill in search row
        if (searchTagsRow) {
          searchTagsRow.innerHTML = "";
          if (filter !== "all") {
            const tag = document.createElement("span");
            tag.className = "search-tag-pill";
            tag.textContent = pill.textContent;

            // remove pill → reset to all
            const x = document.createElement("button");
            x.className = "search-tag-remove";
            x.textContent = "✕";
            x.setAttribute("aria-label", `Remove ${pill.textContent} filter`);
            x.addEventListener("click", () => {
              searchTagsRow.innerHTML = "";
              if (searchInput)
                searchInput.placeholder = "SEARCH TITLE, TAGS...";
              if (searchClear) searchClear.classList.remove("visible");
              cards.forEach((c) => {
                isScheduled(c)
                  ? c.classList.add("hidden")
                  : c.classList.remove("hidden");
              });
              updateCount();
              tagDrawerBody
                .querySelectorAll(".tag-drawer-pill")
                .forEach((p) => p.classList.remove("active"));
              tagDrawerBody
                .querySelector(".tag-drawer-pill[data-filter='all']")
                ?.classList.add("active");
            });

            tag.appendChild(x);
            searchTagsRow.appendChild(tag);
            if (searchInput) searchInput.placeholder = "";
          } else {
            if (searchInput) searchInput.placeholder = "SEARCH TITLE, TAGS...";
          }
        }
      });
    });
  }

  buildDrawer();

  // ── auto-apply filter from URL param ──
  const urlFilter = new URLSearchParams(window.location.search).get("filter");
  if (urlFilter) {
    const dropdown = document.getElementById("qfDropdown");
    if (dropdown) {
      dropdown.value = urlFilter;
      dropdown.dispatchEvent(new Event("change"));
    }
  }
});
