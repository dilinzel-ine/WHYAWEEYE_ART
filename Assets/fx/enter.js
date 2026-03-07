// if transition.js already adds is-ready — this file is not needed
// but if you want enter.js to handle it independently on pages without transition:
document.addEventListener("DOMContentLoaded", () => {
  // small wait so transition overlay finishes first
  setTimeout(() => {
    document.body.classList.add("is-ready");
  }, 650); // slightly more than your transition duration (600ms)
});
