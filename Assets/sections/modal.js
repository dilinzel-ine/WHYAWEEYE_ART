/* ═══════════════════════════════════════════
   MODAL
═══════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  /* ═══════════════════════════════════════════
     GRAB ELEMENTS
  ═══════════════════════════════════════════ */
  const modal = document.getElementById("modal");
  if (!modal) return; // stop if no modal on this page

  const cards = document.querySelectorAll(".article-card,.cards-item"); // all project cards
  const mainImage = document.getElementById("mainImage"); // large image in modal
  const thumbnailsContainer = document.getElementById("thumbnails"); // thumbnail row
  const closeBtn = document.getElementById("closeBtn"); // × button
  const shareBtn = document.getElementById("shareBtn"); // share button
  const modalTitle = document.getElementById("modalTitle"); // project title
  const modalSubtitle = document.getElementById("modalSubtitle"); // subtitle / code
  const modalDescription = document.getElementById("modalDescription"); // description text
  const modalDate = document.getElementById("modalDate"); // posted date
  const modalTags = document.getElementById("modalTags"); // tags row
  const modalLinks1 = document.getElementById("modalLinks-1"); // first link
  const modalLinks2 = document.getElementById("modalLinks-2"); // second link

  let currentActiveThumb = null; // tracks highlighted thumbnail

  /* ═══════════════════════════════════════════
     HIDE FUTURE SCHEDULED CARDS
  ═══════════════════════════════════════════ */
  const today = new Date();
  today.setHours(0, 0, 0, 0); // strip time — date only

  cards.forEach((card) => {
    const raw = card.getAttribute("data-date");
    if (!raw) return; // skip cards with no date
    const [dd, mm, yyyy] = raw.split("-").map(Number); // parse dd-mm-yyyy
    const cardDate = new Date(yyyy, mm - 1, dd); // JS Date (month is 0-indexed)
    cardDate.setHours(0, 0, 0, 0); // strip time for fair comparison
    if (cardDate > today) card.classList.add("hidden"); // hide future cards
  });

  /* ═══════════════════════════════════════════
     CLOSE MODAL
  ═══════════════════════════════════════════ */
  function closeModal() {
    modal.classList.add("closing"); // trigger CSS fade-out
    history.replaceState(null, "", window.location.pathname); // clean URL bar
    setTimeout(() => {
      modal.style.display = "none"; // hide after animation
      modal.classList.remove("closing"); // reset for next open
      if (mainImage) mainImage.src = ""; // clear image
      if (thumbnailsContainer) thumbnailsContainer.innerHTML = ""; // clear thumbnails
      currentActiveThumb = null; // reset tracker
    }, 500); // matches CSS transition
  }

  /* ═══════════════════════════════════════════
     OPEN MODAL
  ═══════════════════════════════════════════ */
  function openModal(card) {
    if (!mainImage || !thumbnailsContainer) return; // stop if elements missing

    // parse images from card
    let images = [];
    try {
      images = JSON.parse(card.getAttribute("data-images") || "[]");
    } catch {
      console.error("Invalid JSON in data-images:", card);
      return;
    }
    if (!images.length) return; // stop if no images

    // fill text fields
    if (modalTitle) {
      const title =
        card.querySelector(".card-title")?.textContent?.trim() || "";
      const tag = card.querySelector(".card-tag")?.textContent?.trim() || "";
      modalTitle.textContent = tag ? `${title} — ${tag}` : title; // only adds tag if it exists
    }
    if (modalSubtitle)
      modalSubtitle.textContent = card.getAttribute("data-subtitle") || "";
    if (modalDescription)
      modalDescription.textContent =
        card.getAttribute("data-description") || "";

    // fill date — only this card's date, never affects others
    if (modalDate) {
      const raw = card.getAttribute("data-date") || "";
      modalDate.textContent = raw ? `Posted On:  ${raw}` : "";
      modalDate.style.display = raw ? "" : "none";
    }

    // fill links from card's data attributes
    [modalLinks1, modalLinks2].forEach((el, i) => {
      if (!el) return;
      const val = card.getAttribute(`data-links-${i + 1}`) || "";
      const label = card.getAttribute(`data-links-${i + 1}-label`) || "";
      if (el.tagName === "A") {
        el.href = val;
        el.textContent = label || `[⤷ LINK ${i + 1}]`;
        el.style.display = val ? "" : "none"; // hide if no URL
      } else {
        el.textContent = val;
      }
    });

    // rebuild tags from card's tag elements
    if (modalTags) {
      modalTags.innerHTML = ""; // clear old tags
      card.querySelectorAll(".card2-tag").forEach((tag) => {
        const span = document.createElement("span");
        span.textContent = tag.textContent.trim();
        modalTags.appendChild(span);
      });
    }

    // build thumbnails
    thumbnailsContainer.innerHTML = ""; // clear old thumbnails
    mainImage.src = images[0]; // show first image
    currentActiveThumb = null;

    images.forEach((src, i) => {
      const thumb = document.createElement("img");
      thumb.src = src;
      thumb.alt = `Project image ${i + 1}`; // accessibility
      thumb.loading = "lazy"; // lazy load

      if (i === 0) {
        thumb.classList.add("active"); // first thumb active
        currentActiveThumb = thumb;
      }

      thumb.addEventListener("click", () => {
        mainImage.src = src; // swap main image
        if (currentActiveThumb) currentActiveThumb.classList.remove("active");
        thumb.classList.add("active");
        currentActiveThumb = thumb;
      });

      thumbnailsContainer.appendChild(thumb);
    });

    // show modal
    modal.removeAttribute("hidden"); // accessibility
    modal.style.display = "flex";

    // update URL with card's hash for sharing
    const id = card.getAttribute("data-id") || "";
    if (id) history.replaceState(null, "", `#${id}`);

    // share button copies current URL
    if (shareBtn) {
      shareBtn.textContent = "[ ↗ SHARE ]";
      shareBtn.onclick = () => {
        navigator.clipboard
          .writeText(window.location.href)
          .then(() => {
            shareBtn.textContent = "[ ✓ LINK COPIED ]";
            setTimeout(() => {
              shareBtn.textContent = "[ ↗ SHARE ]";
            }, 2000);
          })
          .catch(() => {
            shareBtn.textContent = "[ ✗ FAILED ]";
            setTimeout(() => {
              shareBtn.textContent = "[ ↗ SHARE ]";
            }, 2000);
          });
      };
    }
  }

  /* ═══════════════════════════════════════════
     EVENT LISTENERS
  ═══════════════════════════════════════════ */
  cards.forEach((card) =>
    card.addEventListener("click", (e) => {
      if (e.target.closest(".card2-tag")) return; // tag pill clicked — ignore, let gallery-search.js handle it
      openModal(card); // anything else — open modal
    }),
  ); // open on click
  if (closeBtn) closeBtn.addEventListener("click", closeModal); // close on ×
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  }); // close on backdrop
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") closeModal();
  }); // close on Escape

  // auto-open from URL hash on page load
  const hash = window.location.hash.slice(1);
  if (hash) {
    const target = document.querySelector(`.article-card[data-id="${hash}"]`);
    if (target) openModal(target);
  }
});
