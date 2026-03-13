// ==============================================
// THREADART RENDER
// Fetches threadart.json → renders cards → signals ready
// Depends on: page-state.js loaded before this
// ==============================================
document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("grid");
  if (!grid) return;

  // ── fetch data ──
  const res = await fetch("/THREADART/threadart.json");
  const items = await res.json();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  items.forEach((item, i) => {
    const num = String(i + 1).padStart(2, "0");
    const lazy =
      i < 2 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
    const quantity = item.quantity || 1;
    const sold = item.sold || 0;
    const remaining = quantity - sold;
    const isSoldOut = remaining <= 0 || item.tags.includes("sold-out");
    const isPopular = sold >= 2 && remaining > 0;

    // hidden tags for filtering
    const hiddenTags = item.tags
      .map((t) => `<div class="card2-tag" hidden>${t}</div>`)
      .join("");

    const li = document.createElement("li");
    li.className =
      "card cards-item article-card" + (isSoldOut ? " sold-out" : "");
    li.setAttribute("role", "listitem");
    li.setAttribute("tabindex", "0");
    li.setAttribute("data-date", item.date);
    li.setAttribute("data-copyname", item.copyname || "");
    li.setAttribute("data-id", item.id);
    li.setAttribute("data-tags", [item.category, ...item.tags].join(" "));
    li.setAttribute("data-subtitle", item.subtitle);
    li.setAttribute("data-quantity", quantity);
    li.setAttribute("data-sold", sold);
    li.setAttribute("data-description", item.description);
    li.setAttribute("data-links-1", item.links1 || "");
    li.setAttribute("data-links-1-label", item.links1Label || "⤷ EMAIL");
    li.setAttribute("data-links-2", item.links2 || "");
    li.setAttribute("data-links-2-label", item.links2Label || "⤷ PDF");
    li.setAttribute("data-price", item.price || "");
    li.setAttribute("data-buy", item.buy || "");
    li.setAttribute("data-size", item.size || "");
    li.setAttribute("data-shape", item.shape || "");
    li.setAttribute("data-images", JSON.stringify(item.images));
    li.setAttribute(
      "aria-label",
      `${item.title} — press Enter to view details.`,
    );

    li.innerHTML = `
      <div class="card-number">[${num}]</div>
      <div class="card-image thread">
        <div class="card-image-placeholder">
          <img src="${item.images[0]}" alt="${item.title}" width="600" height="350" ${lazy} />
        </div>
        ${isSoldOut ? '<div class="sold-out-badge">Sold Out</div>' : ""}
        ${isPopular ? '<div class="popular-badge">Popular</div>' : ""}
        ${quantity > 1 && !isSoldOut ? `<div class="quantity-badge">${remaining} left</div>` : ""}
      </div>
      <div class="card-info">
        <div class="card-text">
          <div class="card-tag">${item.category}</div>
          <div class="card-title">${item.title}</div>
          ${
            item.price
              ? `
            <div class="card-price ${isSoldOut ? "card-price--soldout" : ""}">
              ${
                isSoldOut
                  ? `<s>₹${Number(item.price).toLocaleString("en-IN")}</s>`
                  : `₹${Number(item.price).toLocaleString("en-IN")}`
              }
            </div>`
              : ""
          }
          <div class="card-subtitle" hidden>
            ${item.subtitle}${quantity > 1 ? ` (${remaining}/${quantity})` : ""}
          </div>
        </div>
        <div class="arrow-overlay">
          <div class="arrow-circle">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <line x1="5" y1="19" x2="19" y2="5"/>
              <polyline points="5 5 19 5 19 19"/>
            </svg>
          </div>
        </div>
        ${hiddenTags}
      </div>
    `;

    grid.appendChild(li);

    // open modal on click
    li.addEventListener("click", (e) => {
      if (e.target.closest(".card2-tag")) return;
      if (window.openModal) window.openModal(li);
    });
  });

  // ── signal all other scripts that cards are in the DOM ──
  document.dispatchEvent(new CustomEvent("cardsReady"));

  // ── auto-open modal from URL hash ──
  const hash = window.location.hash.slice(1);
  if (hash) {
    const target = document.querySelector(`[data-id="${hash}"]`);
    if (target && window.openModal) window.openModal(target);
  }
});
