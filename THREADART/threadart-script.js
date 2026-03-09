document.addEventListener("cardsReady", () => {
  const cards = document.querySelectorAll(".article-card");
  const noResults = document.getElementById("noResults");
  const searchInput = document.getElementById("searchInput");
  const searchClear = document.getElementById("thr-searchClear");
  const countNumber = document.getElementById("countNumber");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  /* ── SCHEDULED CHECK ── */
  function isCardScheduled(card) {
    const raw = card.getAttribute("data-date") || "";
    if (!raw) return false;
    const [dd, mm, yyyy] = raw.split("-").map(Number);
    const cardDate = new Date(yyyy, mm - 1, dd);
    cardDate.setHours(0, 0, 0, 0);
    return cardDate > today;
  }

  /* ── COUNT ── */
  function updateCount() {
    const visible = [...cards].filter(
      (c) => !c.classList.contains("hidden"),
    ).length;
    if (countNumber) countNumber.textContent = visible;
  }

  /* ── HIDE SCHEDULED ── */
  cards.forEach((card) => {
    if (isCardScheduled(card)) card.classList.add("hidden");
  });

  /* ── NAV FILTER ── */
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
    rest.sort((a, b) =>
      a.textContent.trim().localeCompare(b.textContent.trim()),
    );

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

    allLinks.forEach((link) => {
      link.addEventListener("click", () => {
        allLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        if (searchInput) searchInput.value = "";

        const filter = link.dataset.filter;
        let visible = 0;

        cards.forEach((card) => {
          if (isCardScheduled(card)) {
            card.classList.add("hidden");
            return;
          }
          const show =
            filter === "all" || (card.dataset.tags || "").includes(filter);
          card.classList.toggle("hidden", !show);
          if (show) visible++;
        });

        if (noResults)
          noResults.style.display = visible === 0 ? "block" : "none";
        updateCount();
      });
    });
  }

  /* ── SEARCH ── */
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();
      const hasPill = document.querySelector(".search-tag-pill");
      if (searchClear)
        searchClear.classList.toggle(
          "visible",
          searchInput.value.length > 0 && !hasPill,
        );

      const nav = document.querySelector(".artpage-nav");
      const allLinks = nav
        ? [...nav.querySelectorAll(".artpage-nav-link")]
        : [];
      allLinks.forEach((l) => l.classList.remove("active"));
      const allLink = allLinks.find((l) => l.dataset.filter === "all");
      if (allLink) allLink.classList.add("active");

      let visible = 0;
      cards.forEach((card) => {
        if (isCardScheduled(card)) {
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

  /* ── CLEAR ── */
  if (searchClear) {
    searchClear.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      searchClear.classList.remove("visible");

      const nav = document.querySelector(".artpage-nav");
      const allLinks = nav
        ? [...nav.querySelectorAll(".artpage-nav-link")]
        : [];
      allLinks.forEach((l) => l.classList.remove("active"));
      const allLink = allLinks.find((l) => l.dataset.filter === "all");
      if (allLink) allLink.classList.add("active");

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
      updateCount();
    });
  }

  updateCount();

  /* ── TAG DRAWER ── */ // ← now outside nav guard, always runs
  const tagDrawer = document.getElementById("tagDrawer");
  const tagDrawerOverlay = document.getElementById("tagDrawerOverlay");
  const tagDrawerClose = document.getElementById("tagDrawerClose");
  const tagIndexBtn = document.getElementById("tagIndexBtn");
  const tagDrawerBody = document.getElementById("tagDrawerBody");

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

  function buildDrawer() {
    if (!tagDrawerBody) return;
    const tagMap = {};
    document.querySelectorAll(".article-card").forEach((card) => {
      card.querySelectorAll(".card2-tag").forEach((t) => {
        const tag = t.textContent.trim();
        if (tag) tagMap[tag] = true;
      });
    });

    const allTags = Object.keys(tagMap).sort();
    const groups = {};
    allTags.forEach((tag) => {
      const letter = tag[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(tag);
    });

    tagDrawerBody.innerHTML = "";

    const allSection = document.createElement("div");
    allSection.className = "tag-drawer-section";
    allSection.innerHTML = `<div class="tag-drawer-pills"><button class="tag-drawer-pill active" data-filter="all">ALL</button></div>`;
    tagDrawerBody.appendChild(allSection);

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

    tagDrawerBody.querySelectorAll(".tag-drawer-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
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

        const searchInput = document.getElementById("searchInput");
        const searchTagsRow = document.getElementById("searchTagsRow");

        if (searchTagsRow) {
          searchTagsRow.innerHTML = "";
          if (filter !== "all") {
            const tag = document.createElement("span");
            tag.className = "search-tag-pill";
            tag.textContent = pill.textContent;

            const x = document.createElement("button");
            x.className = "search-tag-remove";
            x.textContent = "✕";
            x.setAttribute("aria-label", `Remove ${pill.textContent} filter`);
            x.addEventListener("click", () => {
              searchTagsRow.innerHTML = "";
              if (searchInput)
                searchInput.placeholder = "SEARCH TITLE, TAGS...";
              if (searchClear) searchClear.classList.remove("visible");
              // reset to all
              // reset respecting scheduled cards
              document.querySelectorAll(".article-card").forEach((c) => {
                if (isCardScheduled(c)) {
                  // ← check scheduled
                  c.classList.add("hidden");
                } else {
                  c.classList.remove("hidden");
                }
              });
              updateCount();
              // reset active pill in drawer
              document
                .querySelectorAll(".tag-drawer-pill")
                .forEach((p) => p.classList.remove("active"));
              document
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
});
