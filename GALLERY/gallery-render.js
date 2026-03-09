document.addEventListener("DOMContentLoaded", async () => {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  const res = await fetch("/GALLERY/gallery.json");
  const items = await res.json();

  items.forEach((item, i) => {
    const num = String(i + 1).padStart(2, "0");
    const lazy =
      i < 2 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';

    // build tag li elements
    const tagLis = item.tags
      .map((t) => `<li class="card2-tag" role="listitem">${t}</li>`)
      .join("");

    // build hidden card2-tag divs for search/filter
    const hiddenTags = item.tags
      .map((t) => `<div class="card2-filter-tag" hidden>${t}</div>`)
      .join("");

    const li = document.createElement("li");
    li.className = "card cards-item article-card";
    li.setAttribute("role", "listitem");
    li.setAttribute("tabindex", "0");
    li.setAttribute("data-date", item.date);
    li.setAttribute("data-copyname", item.copyname || "");
    li.setAttribute("data-id", item.id);
    li.setAttribute("data-subtitle", item.subtitle);
    li.setAttribute("data-description", item.description);
    li.setAttribute("data-links-1", item.links1 || "");
    li.setAttribute("data-links-1-label", item.links1Label || "⤷ EMAIL");
    li.setAttribute("data-links-2", item.links2 || "");
    li.setAttribute("data-links-2-label", item.links2Label || "⤷ PDF");
    li.setAttribute("data-images", JSON.stringify(item.images));
    li.setAttribute("aria-label", `${item.title} — open for details`);

    li.innerHTML = `
      <img
        src="${item.images[0]}"
        alt="${item.title}"
        class="card2-image"
        width="600"
        height="350"
        ${lazy}
      />
      <div class="card-text" aria-hidden="true">${item.title}</div>
      <div class="card2-content">
        <h2 class="card2-title">
          <a href="#" class="card2-title-link">${item.title}</a>
        </h2>
        <ul class="card2-tags card-tags-grid" role="list" aria-label="Tags">
          ${tagLis}
        </ul>
        ${hiddenTags}
      </div>
    `;

    gallery.appendChild(li);

    // attach click after card exists in DOM
    li.addEventListener("click", (e) => {
      if (e.target.closest(".card2-tag")) return;
      if (window.openModal) window.openModal(li);
    });
  });

  // auto-open from shared URL hash
  const hash = window.location.hash.slice(1);
  if (hash) {
    const target = document.querySelector(`[data-id="${hash}"]`);
    if (target && window.openModal) window.openModal(target);
  }
});
