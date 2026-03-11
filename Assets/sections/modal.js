// ============================================================
//  MODAL
// ===========================================================

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  if (!modal) return;

  const closeBtn = document.getElementById("closeBtn");
  const shareBtn = document.getElementById("shareBtn");
  const modalTitle = document.getElementById("modalTitle");
  const modalSubtitle = document.getElementById("modalSubtitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalDate = document.getElementById("modalDate");
  const modalCopyName = document.getElementById("modalCopyName");
  const modalTags = document.getElementById("modalTags");
  const modalLinks1 = document.getElementById("modalLinks-1");
  const modalLinks2 = document.getElementById("modalLinks-2");

  /* ── SCHEDULED HIDE ── */
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  document.querySelectorAll(".article-card,.cards-item").forEach((card) => {
    const raw = card.getAttribute("data-date");
    if (!raw) return;
    const [dd, mm, yyyy] = raw.split("-").map(Number);
    const cardDate = new Date(yyyy, mm - 1, dd);
    cardDate.setHours(0, 0, 0, 0);
    if (cardDate > today) card.classList.add("hidden", "scheduled-hidden");
  });

  /* ── MEDIA HELPERS ── */
  function getMediaType(src) {
    if (src.startsWith("youtube:")) return "youtube";
    if (src.startsWith("shorts:")) return "youtube";
    if (src.startsWith("instagram:")) return "instagram";
    if (/\.(mp4|webm|ogg)$/i.test(src)) return "localvideo";
    return "image";
  }

  function getYouTubeId(src) {
    return src.replace("youtube:", "").replace("shorts:", "").trim();
  }

  function getInstagramUrl(src) {
    return src.replace("instagram:", "").trim();
  }

  /* ── STOP MEDIA ── */
  function stopAllMedia() {
    const wrap = document.getElementById("mainMediaWrap");
    if (!wrap) return;
    const video = wrap.querySelector("video");
    if (video) {
      video.pause();
      video.src = "";
    }
    const iframe = wrap.querySelector("iframe");
    if (iframe) iframe.src = "";
  }

  /* ── RENDER MAIN MEDIA ── */
  function renderMainMedia(src) {
    const wrap = document.getElementById("mainMediaWrap");
    if (!wrap) return;
    const type = getMediaType(src);
    stopAllMedia();
    wrap.innerHTML = "";
    wrap.dataset.currentSrc = src; // ← always store current src for lightbox

    if (type === "image") {
      const img = document.createElement("img");
      img.id = "mainImage";
      img.className = "modal-main";
      img.src = src;
      img.dataset.src = src;
      img.alt = "Detailed View";
      wrap.appendChild(img);
    } else if (type === "localvideo") {
      const video = document.createElement("video");
      video.className = "modal-video";
      video.src = src;
      video.controls = true;
      video.playsInline = true;
      video.loop = true;
      wrap.appendChild(video);
    } else if (type === "youtube") {
      const id = getYouTubeId(src);
      const isShorts = src.startsWith("shorts:");
      const iframe = document.createElement("iframe");
      iframe.className =
        "modal-main modal-iframe" + (isShorts ? " modal-iframe--vertical" : "");
      iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&rel=0&modestbranding=1`;
      iframe.allow = "autoplay; fullscreen";
      iframe.allowFullscreen = true;
      wrap.appendChild(iframe);
    } else if (type === "instagram") {
      const url = getInstagramUrl(src);
      const iframe = document.createElement("iframe");
      iframe.className = "modal-main modal-iframe modal-iframe--vertical";
      iframe.src = `${url}embed/`;
      iframe.allow = "fullscreen";
      iframe.allowFullscreen = true;
      wrap.appendChild(iframe);
    }
  }

  /* ── BUILD THUMBNAILS ── */
  function buildThumbnails(images, mainSrc) {
    const thumbsEl = document.getElementById("thumbnails");
    if (!thumbsEl) return;
    thumbsEl.innerHTML = "";

    images.forEach((src, idx) => {
      const type = getMediaType(src);
      const thumb = document.createElement("div");
      thumb.className = "thumb-item" + (src === mainSrc ? " active" : "");
      thumb.setAttribute("role", "listitem");
      thumb.setAttribute("tabindex", "0");

      if (type === "image") {
        const img = document.createElement("img");
        img.src = src;
        img.alt = `View ${idx + 1}`;
        thumb.appendChild(img);
      } else if (type === "localvideo") {
        const video = document.createElement("video");
        video.src = src;
        video.muted = true;
        video.preload = "metadata";
        thumb.appendChild(video);
        thumb.classList.add("thumb-item--video");
      } else if (type === "youtube") {
        const id = getYouTubeId(src);
        const img = document.createElement("img");
        img.src = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
        img.alt = `YouTube video ${idx + 1}`;
        img.onerror = () => {
          img.style.display = "none";
          const fallback = document.createElement("div");
          fallback.className = "thumb-item__youtube-fallback";
          fallback.textContent = "YT";
          thumb.insertBefore(fallback, thumb.firstChild);
        };
        thumb.appendChild(img);
        thumb.classList.add("thumb-item--video");
      } else if (type === "instagram") {
        const div = document.createElement("div");
        div.className = "thumb-item__instagram";
        div.textContent = "IG";
        thumb.appendChild(div);
        thumb.classList.add("thumb-item--video");
      }

      if (type !== "image") {
        const play = document.createElement("div");
        play.className = "thumb-play-icon";
        play.innerHTML = `<svg viewBox="0 0 24 24" fill="white" width="16" height="16"><polygon points="5,3 19,12 5,21"/></svg>`;
        thumb.appendChild(play);
      }

      thumb.addEventListener("click", () => {
        renderMainMedia(src);
        thumbsEl
          .querySelectorAll(".thumb-item")
          .forEach((t) => t.classList.remove("active"));
        thumb.classList.add("active");
        document
          .querySelector(".modal-left")
          ?.scrollTo({ top: 0, behavior: "smooth" });
      });

      thumbsEl.appendChild(thumb);
    });
  }

  /* ── LIGHTBOX ── */
  let lightboxImages = [];
  let lightboxIndex = 0;

  function openLightbox(images, startIndex) {
    lightboxImages = images;
    lightboxIndex = startIndex;
    const lb = document.getElementById("lightbox");
    if (!lb || lightboxImages.length === 0) return;
    renderLightboxMedia(lightboxImages[lightboxIndex]);
    lb.classList.add("open");
  }

  function lightboxStep(dir) {
    lightboxIndex =
      (lightboxIndex + dir + lightboxImages.length) % lightboxImages.length;
    renderLightboxMedia(lightboxImages[lightboxIndex]);
  }

  function renderLightboxMedia(src) {
    const type = getMediaType(src);
    const container = document.getElementById("lightboxMedia");
    if (!container) return;
    container.innerHTML = "";

    if (type === "image") {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "Full view";
      container.appendChild(img);
    } else if (type === "localvideo") {
      const video = document.createElement("video");
      video.src = src;
      video.controls = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.style.maxWidth = "90vw";
      video.style.maxHeight = "90vh";
      container.appendChild(video);
    } else if (type === "youtube") {
      const id = getYouTubeId(src);
      const isShorts = src.startsWith("shorts:");
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&rel=0`;
      iframe.allow = "autoplay; fullscreen";
      iframe.allowFullscreen = true;
      iframe.style.border = "none";
      iframe.style.width = isShorts ? "50vw" : "80vw";
      iframe.style.height = isShorts ? "90vh" : "80vh";
      container.appendChild(iframe);
    } else if (type === "instagram") {
      const url = getInstagramUrl(src);
      const iframe = document.createElement("iframe");
      iframe.src = `${url}embed/`;
      iframe.allow = "fullscreen";
      iframe.allowFullscreen = true;
      iframe.style.border = "none";
      iframe.style.width = "50vw";
      iframe.style.height = "90vh";
      container.appendChild(iframe);
    }
  }

  function closeLightbox() {
    const container = document.getElementById("lightboxMedia");
    if (container) {
      const video = container.querySelector("video");
      if (video) {
        video.pause();
        video.src = "";
      }
      const iframe = container.querySelector("iframe");
      if (iframe) iframe.src = "";
      container.innerHTML = "";
    }
    document.getElementById("lightbox")?.classList.remove("open");
  }

  // open lightbox — works for ALL media types including iframes
  document.getElementById("mainMediaWrap")?.addEventListener("click", () => {
    const wrap = document.getElementById("mainMediaWrap");
    const allSrcs = JSON.parse(
      window._currentCard?.getAttribute("data-images") || "[]",
    );
    const currentSrc = wrap.dataset.currentSrc || ""; // ← always accurate

    const startIndex = allSrcs.findIndex((src) => {
      const a = new URL(src, location.origin).href;
      const b = new URL(currentSrc, location.origin).href;
      return a === b;
    });

    openLightbox(allSrcs, Math.max(0, startIndex));
  });

  document.getElementById("lightboxPrev")?.addEventListener("click", (e) => {
    e.stopPropagation();
    lightboxStep(-1);
  });

  document.getElementById("lightboxNext")?.addEventListener("click", (e) => {
    e.stopPropagation();
    lightboxStep(1);
  });

  document.getElementById("lightbox")?.addEventListener("click", (e) => {
    if (e.target === document.getElementById("lightbox")) closeLightbox();
  });

  document.getElementById("lightboxClose")?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  document.getElementById("lightbox")?.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      lightboxStep(e.deltaY > 0 ? 1 : -1);
    },
    { passive: false },
  );

  /* ── CLOSE MODAL ── */
  function closeModal() {
    stopAllMedia();
    closeLightbox();
    modal.classList.add("closing");
    history.replaceState(null, "", window.location.pathname);
    setTimeout(() => {
      modal.style.display = "none";
      modal.classList.remove("closing");
      const thumbsEl = document.getElementById("thumbnails");
      if (thumbsEl) thumbsEl.innerHTML = "";
    }, 500);
  }

  /* ── OPEN MODAL ── */
  window.openModal = function (card) {
    window._currentCard = card;

    const images = JSON.parse(card.getAttribute("data-images") || "[]");
    if (images.length > 0) renderMainMedia(images[0]);
    buildThumbnails(images, images[0]);

    if (modalTitle) {
      const title =
        card.querySelector(".card2-title")?.textContent?.trim() ||
        card.querySelector(".card-title")?.textContent?.trim() ||
        "";
      const tag = card.querySelector(".card-tag")?.textContent?.trim() || "";
      modalTitle.textContent = tag ? `${title} — ${tag}` : title;
    }

    // stock info
    const quantity = parseInt(card.getAttribute("data-quantity") || "1");
    const sold = parseInt(card.getAttribute("data-sold") || "0");
    const remaining = quantity - sold;
    const stockEl = document.getElementById("modalStock");
    if (stockEl) {
      if (quantity > 1) {
        stockEl.textContent =
          remaining > 0 ? `${remaining} / ${quantity} remaining` : "Sold Out";
        stockEl.style.display = "";
        stockEl.style.color =
          remaining > 0 ? "var(--color-text)" : "var(--color-danger)";
      } else {
        stockEl.style.display = "none";
      }
    }

    if (modalSubtitle)
      modalSubtitle.textContent = card.getAttribute("data-subtitle") || "";

    if (modalDescription) {
      const descEl = card.querySelector(".card-description");
      modalDescription.innerHTML = descEl
        ? descEl.innerHTML
        : card.getAttribute("data-description") || "";
    }

    if (modalDate) {
      const raw = card.getAttribute("data-date") || "";
      modalDate.textContent = raw ? `[PD:  ${raw}]` : "";
      modalDate.style.display = raw ? "" : "none";
    }

    if (modalCopyName) {
      const raw = card.getAttribute("data-copyname") || "";
      modalCopyName.textContent = raw ? `[@:  ${raw}]` : "";
      modalCopyName.style.display = raw ? "" : "none";
    }

    [modalLinks1, modalLinks2].forEach((el, i) => {
      if (!el) return;
      const val = card.getAttribute(`data-links-${i + 1}`) || "";
      const label = card.getAttribute(`data-links-${i + 1}-label`) || "";
      el.href = val;
      el.textContent = label || `[⤷ LINK ${i + 1}]`;
      el.style.display = val ? "" : "none";
    });

    const priceEl = document.getElementById("modalPrice");
    if (priceEl) {
      const price = card.getAttribute("data-price") || "";
      const isSoldOut = remaining <= 0 && quantity > 1;
      if (price) {
        priceEl.innerHTML = isSoldOut
          ? `<s>₹${Number(price).toLocaleString("en-IN")}</s>`
          : `₹${Number(price).toLocaleString("en-IN")}`;
        priceEl.style.display = "";
        priceEl.style.opacity = isSoldOut ? "0.4" : "1";
      } else {
        priceEl.style.display = "none";
      }
    }

    // buy button
    const buyBtn = document.getElementById("modalBuyBtn");
    if (buyBtn) {
      const buyLink = card.getAttribute("data-buy") || "";
      const isSoldOut = remaining <= 0 && quantity > 1;

      buyBtn.href = buyLink || "#";
      buyBtn.className = "modal-buy-btn"; // reset classes

      if (isSoldOut) {
        buyBtn.textContent = "⤷ SOLD OUT";
        buyBtn.classList.add("modal-buy-btn--soldout");
        buyBtn.onclick = (e) => e.preventDefault();
      } else if (!buyLink) {
        buyBtn.textContent = "⤷ NOT FOR SALE";
        buyBtn.classList.add("modal-buy-btn--disabled");
        buyBtn.onclick = (e) => e.preventDefault();
      } else {
        buyBtn.textContent = "⤷ BUY NOW";
        buyBtn.onclick = null;
      }
    }

    if (modalTags) {
      modalTags.innerHTML = "";
      const seen = new Set();
      card.querySelectorAll(".card2-tag, .card2-filter-tag").forEach((tag) => {
        const text = tag.textContent.trim(); // ← declare text first
        if (!text || seen.has(text)) return;
        seen.add(text);
        const span = document.createElement("span"); // ← then span
        span.textContent = text;
        modalTags.appendChild(span);
      });
    }

    modal.removeAttribute("hidden");
    modal.style.display = "flex";

    const id = card.getAttribute("data-id") || "";
    if (id) history.replaceState(null, "", `#${id}`);

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
  };

  /* ── EVENT LISTENERS ── */
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    const lb = document.getElementById("lightbox");
    if (lb?.classList.contains("open")) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") lightboxStep(1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") lightboxStep(-1);
      if (e.key === "Escape") closeLightbox();
      return;
    }
    if (e.key === "Escape" && modal.style.display === "flex") closeModal();
  });
});
