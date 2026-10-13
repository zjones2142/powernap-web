/* Snap assist.
   CSS scroll-snap does the everyday work. This script covers the gaps:
   - iOS Safari sometimes parks the page between panels, or jitters when
     CSS `scroll-behavior: smooth` is combined with snapping. So smooth
     scrolling is done here in JS instead, and after any scroll settles
     we glide to the nearest panel if the page is stuck in between.
   - Nav links to #home / #shows use the same glide. */
(function () {
  const panels = [...document.querySelectorAll(".panel")];
  if (panels.length < 2) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const root = document.documentElement;
  let raf = 0, settleTimer = 0, touching = false, animating = false;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  // CSS snap is switched off while we animate: otherwise iOS Safari treats
  // every frame's scrollTo as a finished scroll and snaps back to where you
  // were, which made the nav buttons look dead.
  function beginGlide() { animating = true; root.style.scrollSnapType = "none"; }
  function endGlide() { cancelAnimationFrame(raf); animating = false; root.style.scrollSnapType = ""; }

  function glideTo(targetY, duration = 420) {
    endGlide();
    const startY = window.scrollY, dist = targetY - startY;
    if (Math.abs(dist) < 1) return;
    if (reduce.matches) { window.scrollTo(0, targetY); return; }
    beginGlide();
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      window.scrollTo(0, startY + dist * easeOut(p));
      if (p < 1) raf = requestAnimationFrame(step);
      else endGlide();
    };
    raf = requestAnimationFrame(step);
  }

  // Resting spots: each panel's top, plus the bottom of any panel taller
  // than the viewport. Anywhere inside such a tall panel is also fine.
  function restingTarget() {
    const y = window.scrollY, vh = window.innerHeight;
    const maxY = document.documentElement.scrollHeight - vh;
    if (y <= 0 || y >= maxY) return null;

    let best = null, bestDist = Infinity;
    for (const p of panels) {
      const top = p.offsetTop, tallBottom = top + p.offsetHeight - vh;
      if (tallBottom > top && y >= top && y <= tallBottom) return null;   // free zone
      for (const spot of [top, tallBottom > top ? tallBottom : null]) {
        if (spot == null) continue;
        const d = Math.abs(spot - y);
        if (d < bestDist) { bestDist = d; best = spot; }
      }
    }
    return bestDist <= 2 ? null : best;
  }

  function onSettled() {
    if (touching || animating) return;
    const target = restingTarget();
    if (target != null) glideTo(target, 320);
  }

  window.addEventListener("scroll", () => {
    if (animating) return;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(onSettled, 160);
  }, { passive: true });

  window.addEventListener("touchstart", () => { touching = true; endGlide(); }, { passive: true });
  window.addEventListener("touchend", () => { touching = false; clearTimeout(settleTimer); settleTimer = setTimeout(onSettled, 220); }, { passive: true });
  window.addEventListener("touchcancel", () => { touching = false; }, { passive: true });

  // Same-page anchor links glide instead of jumping / CSS-smooth-scrolling.
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const target = document.getElementById(url.hash.slice(1));
    if (!target) return;
    e.preventDefault();
    history.replaceState(null, "", url.hash);
    glideTo(target.offsetTop);
  });
})();
