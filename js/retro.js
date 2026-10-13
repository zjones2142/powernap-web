/* Little Web 1.0 touches: hit counter, camcorder date, footer year. */
(function () {
  // Hit counter (per-browser, just for fun). Starts at a flattering number.
  const el = document.getElementById("hit-counter");
  if (el) {
    let n = 417;
    try {
      n = (parseInt(localStorage.getItem("powernap-hits") || "416", 10) || 416) + 1;
      localStorage.setItem("powernap-hits", String(n));
    } catch (_) { /* private mode etc. */ }
    el.textContent = String(n).padStart(6, "0");
  }

  // Squigglevision: swap between three wobble filters ~6 times a second.
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0, timer = null;
  function startSquiggle() {
    if (timer || reduce.matches) return;
    timer = setInterval(() => {
      frame = (frame + 1) % 3;
      document.documentElement.dataset.sq = String(frame);
    }, 160);
  }
  function stopSquiggle() { clearInterval(timer); timer = null; }
  document.addEventListener("visibilitychange", () => (document.hidden ? stopSquiggle() : startSquiggle()));
  reduce.addEventListener?.("change", () => (reduce.matches ? stopSquiggle() : startSquiggle()));
  startSquiggle();

  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
