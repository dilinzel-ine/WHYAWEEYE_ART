document.addEventListener("DOMContentLoaded", () => {
  /* ═══════════════════════════════════════════════
   LOADER
═══════════════════════════════════════════════ */

  const loader = document.getElementById("loading-screen");
  const content = document.getElementById("content");
  const percentageText = document.getElementById("percentage");

  if (loader && content && percentageText) {
    //  Skip loader if:
    // 1. Coming with #section
    // 2. Homepage already loaded in this session

    if (window.location.hash || sessionStorage.getItem("homeLoaded")) {
      loader.style.display = "none";
      content.style.display = "block";
    } else {
      // Mark homepage as loaded
      sessionStorage.setItem("homeLoaded", "true");

      let count = 0;

      const interval = setInterval(() => {
        if (count <= 100) {
          percentageText.textContent = `[${count}%]`;
          count++;
        } else {
          clearInterval(interval);
          loader.style.display = "none";
          content.style.display = "block";
          // tell transition.js loader already handled the reveal
          window.__loaderDone = true;
        }
      }, 10);
    }
  }

  /* ═══════════════════════════════════════════════
     LATEST WORKS
  ═══════════════════════════════════════════════ */

  const slides = [
    {
      image: "images/slider-image-1.png",
      title: "Pastel Paradigm",
      description: "[Feb 26]",
    },
    {
      image: "images/slider-image-2.png",
      title: "Golden Horizon",
      description: "A serene blend of warm tones.",
    },
    {
      image: "images/slider-image-3.png",
      title: "Midnight Bloom",
      description: "Dark elegance with vibrant contrast.",
    },
    {
      image: "images/slider-image-4.png",
      title: "Midnight Bloom",
      description: "Dark elegance with vibrant contrast.",
    },
    {
      image: "images/slider-image-5.png",
      title: "Midnight Bloom",
      description: "Dark elegance with vibrant contrast.",
    },
    {
      image: "images/slider-image-6.png",
      title: "Midnight Bloom",
      description: "Dark elegance with vibrant contrast.",
    },
  ];

  let current = 0;

  function showSlide(index) {
    const slide = slides[index];
    document.getElementById("custom-slide-image").src = slide.image;
    document.getElementById("custom-title").textContent = slide.title;
    document.getElementById("custom-description").textContent =
      slide.description;
  }

  function nextSlide() {
    current = (current + 1) % slides.length;
    showSlide(current);
  }

  function prevSlide() {
    current = (current - 1 + slides.length) % slides.length;
    showSlide(current);
  }

  document.getElementById("nextBtn").addEventListener("click", nextSlide);
  document.getElementById("prevBtn").addEventListener("click", prevSlide);

  showSlide(current);

  /* ═══════════════════════════════════════════════
     MODAL
  ═══════════════════════════════════════════════ */

  const cards = document.querySelectorAll(".card");
  const modal = document.getElementById("modal");
  const mainImage = document.getElementById("mainImage");
  const thumbnailsContainer = document.getElementById("thumbnails");
  const closeBtn = document.getElementById("closeBtn");
  const modalTitle = document.getElementById("modalTitle");
  const modalTags = document.getElementById("modalTags");
  const modalSubtitle = document.getElementById("modalSubtitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalLinks = document.getElementById("modalLinks");

  let currentActiveThumb = null;

  function closeModal() {
    if (!modal) return;
    modal.style.display = "none";
    if (mainImage) mainImage.src = "";
    if (thumbnailsContainer) thumbnailsContainer.innerHTML = "";
    currentActiveThumb = null;
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (!modal || !mainImage || !thumbnailsContainer) return;

      let images = [];
      try {
        images = JSON.parse(card.getAttribute("data-images") || "[]");
      } catch (err) {
        console.error("Invalid JSON in data-images");
        return;
      }

      if (!images.length) return;

      if (modalTitle)
        modalTitle.textContent =
          card.querySelector(".card-text")?.textContent || "";

      if (modalSubtitle)
        modalSubtitle.textContent = card.getAttribute("data-subtitle") || "";

      if (modalDescription)
        modalDescription.textContent =
          card.getAttribute("data-description") || "";

      if (modalLinks)
        modalLinks.textContent = card.getAttribute("data-links") || "";

      if (modalTags) {
        modalTags.innerHTML = "";
        card.querySelectorAll(".card2-tag").forEach((tag) => {
          const span = document.createElement("span");
          span.textContent = tag.textContent;
          modalTags.appendChild(span);
        });
      }

      modal.style.display = "flex";
      mainImage.src = images[0];
      thumbnailsContainer.innerHTML = "";

      images.forEach((src, i) => {
        const thumb = document.createElement("img");
        thumb.src = src;

        if (i === 0) {
          thumb.classList.add("active");
          currentActiveThumb = thumb;
        }

        thumb.addEventListener("click", (e) => {
          e.stopPropagation();
          mainImage.src = src;

          if (currentActiveThumb) currentActiveThumb.classList.remove("active");

          thumb.classList.add("active");
          currentActiveThumb = thumb;
        });

        thumbnailsContainer.appendChild(thumb);
      });
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  window.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.style.display === "flex") {
      closeModal();
    }
  });

  /* ═══════════════════════════════════════════════
     RANDOM ABSTRACT IMAGE
  ═══════════════════════════════════════════════ */

  const abstractEl = document.querySelector(".abstract");

  const allImages = [
    "images/webp/why-a-we-eye1.webp",
    "images/webp/3d-ren-1.webp",
    "images/webp/3d-ren-2.webp",
    "images/webp/3d-ren-3.webp",
    "images/webp/3d-ren-4.webp",
    "images/webp/3d-ren-5.webp",
    "images/webp/3d-ren-6.webp",
    "images/webp/3d-ren-7.webp",
    "images/webp/3d-ren-8.webp",
    "images/webp/3d-ren-9.webp",
    "images/webp/3d-ren-10.webp",
    "images/webp/3d-ren-11.webp",
    "images/webp/3d-ren-12.webp",
    "images/webp/3d-ren-15.webp",
    "images/webp/3d-ren-16.webp",
    "images/webp/3d-ren-17.webp",
    "images/webp/3d-ren-18.webp",
    "images/webp/3d-ren-21.webp",
    "images/webp/3d-ren-22.webp",
    "images/webp/3d-ren-24.webp",
    "images/webp/3d-ren-25.webp",
    "images/webp/3d-ren-26.webp",
    "images/webp/3d-ren-27.webp",
    "images/webp/3d-ren-28.webp",
    "images/webp/3d-ren-29.webp",
    "images/webp/3d-ren-30.webp",
    "images/webp/3d-ren-31.webp",
    "images/webp/3d-ren-32.webp",
    "images/webp/3d-ren-33.webp",
    "images/webp/3d-ren-34.webp",
    "images/webp/3d-ren-35.webp",
    "images/webp/3d-ren-36.webp",
    "images/webp/3d-ren-37.webp",
    "images/webp/3d-ren-38.webp",
    "images/webp/3d-ren-39.webp",
    "images/webp/3d-ren-40.webp",
    "images/webp/3d-ren-41.webp",
    "images/webp/3d-ren-42.webp",
    "images/webp/3d-ren-43.webp",
    "images/webp/3d-ren-44.webp",
    "images/webp/3d-ren-46.webp",
    "images/webp/3d-ren-47.webp",
    "images/webp/3d-ren-48.webp",
    "images/webp/3d-ren-49.webp",
    "images/webp/3d-ren-50.webp",
    "images/webp/3d-ren-51.webp",
    "images/webp/3d-ren-52.webp",
    "images/webp/3d-ren-53.webp",
  ];

  if (abstractEl && allImages.length) {
    const randomImage = allImages[Math.floor(Math.random() * allImages.length)];
    abstractEl.style.backgroundImage = `url('${randomImage}')`;
  }
});
