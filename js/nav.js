/* Highlights the nav tab for whichever full-screen panel is in view.
   Uses scroll position (section under the viewport's midpoint) — simple and
   consistent across browsers with scroll-snap. */
(function () {
  const tabs = [...document.querySelectorAll(".nav__btn[data-section]")];
  const pairs = tabs
    .map((tab) => ({ tab, section: document.getElementById(tab.dataset.section) }))
    .filter((p) => p.section);
  if (!pairs.length) return;

  function update() {
    const mid = window.innerHeight / 2;
    let current = pairs[0];
    for (const p of pairs) {
      const r = p.section.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) { current = p; break; }
    }
    for (const p of pairs) {
      const on = p === current;
      p.tab.classList.toggle("is-active", on);
      if (on) p.tab.setAttribute("aria-current", "location");
      else p.tab.removeAttribute("aria-current");
    }
  }

  // Browsers already coalesce scroll events to the frame rate, and the work
  // here is two rect reads, so no extra throttling is needed.
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
