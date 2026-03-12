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
  // ── fetch featured threadart items and build slider ──
  fetch("/THREADART/threadart.json")
    .then((res) => res.json())
    .then((items) => {
      // filter featured, sort by top value 1-6
      const slides = items
        .filter((item) => item.featured && item.top >= 1 && item.top <= 6)
        .sort((a, b) => a.top - b.top);

      if (!slides.length) return;

      let current = 0;

      function showSlide(index) {
        const slide = slides[index];
        document.getElementById("custom-slide-image").src = slide.images[0];
        document.getElementById("custom-slide-image").alt = slide.title;
        document.getElementById("custom-title").textContent = slide.title;

        // price
        const priceEl = document.getElementById("custom-price");
        if (priceEl) {
          priceEl.textContent = slide.price
            ? `₹${Number(slide.price).toLocaleString("en-IN")}`
            : "";
        }
        // view details link
        const linkEl = document.getElementById("custom-view-link");
        if (linkEl) {
          linkEl.href = `/THREADART/threadart.html#${slide.id}`;
        }
      }

      document.getElementById("nextBtn").addEventListener("click", () => {
        current = (current + 1) % slides.length;
        showSlide(current);
      });

      document.getElementById("prevBtn").addEventListener("click", () => {
        current = (current - 1 + slides.length) % slides.length;
        showSlide(current);
      });

      showSlide(0);
    });

  // ── image cycling on hover ──
  function initCycler(wrapId) {
    const wrap = document.getElementById(wrapId);
    if (!wrap) return;

    const imgs = [...wrap.querySelectorAll("img")];
    let current = 0;
    let cycling = false;

    wrap.addEventListener("mouseenter", () => {
      if (cycling) return;
      cycling = true;

      // fade out current
      imgs[current].classList.remove("active");

      // advance to next
      current = (current + 1) % imgs.length;

      // fade in next
      imgs[current].classList.add("active");

      // reset lock after transition
      setTimeout(() => {
        cycling = false;
      }, 700);
    });
  }

  initCycler("imgLarge");
  initCycler("imgSmall");
});
