document.addEventListener("DOMContentLoaded", async () => {
  // fetch nav HTML and inject into placeholder
  const res = await fetch("/Assets/footer/site-nav.html");
  const html = await res.text();
  document.getElementById("site-nav-placeholder").innerHTML = html;

  // grab elements after injection
  const nav = document.querySelector(".site-nav");
  const burger = document.querySelector(".site-nav-burger");
  const mobileMenu = document.querySelector(".site-nav-mobile");
  const closeBtn = document.querySelector(".mobile-menu-close");

  // ── AUTO HIDE ON SCROLL ──────────────────────
  let lastY = window.scrollY;
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      // hide when scrolling down past 80px, show when scrolling up
      nav.classList.toggle("nav-hidden", y > lastY && y > 80);
      lastY = y;
    },
    { passive: true },
  );

  // ── MOBILE MENU OPEN ─────────────────────────
  burger?.addEventListener("click", () => {
    mobileMenu.classList.add("menu-open");
    document.body.style.overflow = "hidden"; // prevent page scroll behind menu
  });

  // ── MOBILE MENU CLOSE ────────────────────────
  function closeMenu() {
    mobileMenu.classList.remove("menu-open");
    document.body.style.overflow = ""; // restore page scroll
  }

  closeBtn?.addEventListener("click", closeMenu);
  window.addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());
  document.querySelectorAll(".mobile-menu-links a").forEach(
    (a) => a.addEventListener("click", closeMenu), // close when a link is tapped
  );

  // ── ACTIVE PAGE HIGHLIGHT ────────────────────
  const path = window.location.pathname;
  document
    .querySelectorAll(".site-nav-links a, .mobile-menu-links a")
    .forEach((a) => {
      // mark the link whose path matches the current page
      if (new URL(a.href, location.origin).pathname === path)
        a.setAttribute("aria-current", "page");
    });
});
