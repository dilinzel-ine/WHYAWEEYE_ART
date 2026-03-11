document.addEventListener("DOMContentLoaded", () => {
  /* ═══════════════════════════════════════════════
     NAV + FILTER
  ═══════════════════════════════════════════════ */

  const nav = document.querySelector(".artpage-nav");
  const sections = nav.querySelectorAll(".artpage-nav-section");
  const allLinks = [...nav.querySelectorAll(".artpage-nav-link")];

  // Separate "all" from the rest
  const pinnedAll = allLinks.find((l) => l.dataset.filter === "all");
  const rest = allLinks.filter((l) => l.dataset.filter !== "all");

  // Sort everything else alphabetically
  rest.sort((a, b) => a.textContent.trim().localeCompare(b.textContent.trim()));

  // Clear both sections but keep labels
  sections.forEach((section) => {
    const label = section.querySelector(".artpage-nav-label");
    section.innerHTML = "";
    if (label) section.appendChild(label);
  });

  // Put "all" first in section 1
  if (pinnedAll) sections[0].appendChild(pinnedAll);

  rest.forEach((link) => {
    sections[0].appendChild(link);
  });

  // Filter functionality
  const links = nav.querySelectorAll(".artpage-nav-link");
  const cards = document.querySelectorAll(".article-card");
  const noResults = document.getElementById("noResults");

  links.forEach((link) => {
    link.addEventListener("click", () => {
      links.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      const filter = link.dataset.filter;
      let visible = 0;

      cards.forEach((card) => {
        const tags = card.dataset.tags || "";
        const show = filter === "all" || tags.includes(filter);
        card.classList.toggle("hidden", !show);
        if (show) visible++;
      });

      noResults.style.display = visible === 0 ? "block" : "none";
    });
  });
});

// const nav = document.querySelector(".writings-nav");
// const sections = nav.querySelectorAll(".nav-section");

// // Get ALL nav links across both sections
// const allLinks = [...nav.querySelectorAll(".nav-link")];

// const pinnedOrder = ["all", "featured"];

// // Separate pinned and others
// const pinned = allLinks.filter((l) => pinnedOrder.includes(l.dataset.filter));

// const rest = allLinks.filter((l) => !pinnedOrder.includes(l.dataset.filter));

// // Sort everything else alphabetically
// rest.sort((a, b) => a.textContent.trim().localeCompare(b.textContent.trim()));

// // Clear both sections (but keep labels)
// sections.forEach((section) => {
//   const label = section.querySelector(".nav-label");
//   section.innerHTML = "";
//   if (label) section.appendChild(label);
// });

// // Insert pinned first into first section
// pinnedOrder.forEach((filter) => {
//   const link = pinned.find((l) => l.dataset.filter === filter);
//   if (link) sections[0].appendChild(link);
// });

// // Now distribute sorted links across sections
// const midpoint = Math.ceil(rest.length / 2);

// rest.forEach((link, index) => {
//   if (index < midpoint) {
//     sections[0].appendChild(link);
//   } else {
//     sections[1].appendChild(link);
//   }
// });
// const links = document.querySelectorAll(".nav-link");
// const cards = document.querySelectorAll(".article-card");
// const noResults = document.getElementById("noResults");

// links.forEach((link) => {
//   link.addEventListener("click", () => {
//     // update active state
//     links.forEach((l) => l.classList.remove("active"));
//     link.classList.add("active");

//     const filter = link.dataset.filter;
//     let visible = 0;

//     cards.forEach((card) => {
//       const tags = card.dataset.tags || "";
//       const show = filter === "all" || tags.includes(filter);
//       card.classList.toggle("hidden", !show);
//       if (show) visible++;
//     });

//     noResults.style.display = visible === 0 ? "block" : "none";
//   });
// });
