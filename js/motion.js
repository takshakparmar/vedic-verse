/* ═══ Vedic Verse — motion: embers, tilt, sheet physics, toast, haptics ═══ */
(function () {
  const VV = window.VV;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  VV.haptic = function (ms = 8) {
    if (navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {}
  };

  /* ─── ember particles: sparse, slow, reverent ─── */
  const canvas = document.getElementById("embers");
  const ctx = canvas.getContext("2d");
  let embers = [], W = 0, H = 0, emberBoost = 0;
  function sizeCanvas() {
    const r = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function spawnEmber() {
    return {
      x: Math.random() * W,
      y: H + 10 + Math.random() * 40,
      r: 0.6 + Math.random() * 1.3,
      vy: 0.10 + Math.random() * 0.22,
      vx: (Math.random() - 0.5) * 0.12,
      life: 0, max: 900 + Math.random() * 700,
      drift: Math.random() * Math.PI * 2
    };
  }
  function tickEmbers() {
    ctx.clearRect(0, 0, W, H);
    const target = reduced ? 0 : 7 + emberBoost;
    while (embers.length < target) embers.push(spawnEmber());
    embers = embers.filter(e => e.life < e.max && e.y > -20);
    for (const e of embers) {
      e.life++;
      e.y -= e.vy;
      e.x += e.vx + Math.sin(e.life / 90 + e.drift) * 0.10;
      const fade = Math.sin(Math.min(e.life / e.max, 1) * Math.PI);
      const a = 0.28 * fade;
      const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 3.2);
      g.addColorStop(0, `rgba(232,164,137,${a})`);
      g.addColorStop(0.5, `rgba(204,107,71,${a * 0.55})`);
      g.addColorStop(1, "rgba(204,107,71,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r * 3.2, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(tickEmbers);
  }
  window.addEventListener("resize", sizeCanvas);
  sizeCanvas();
  if (!reduced) requestAnimationFrame(tickEmbers);
  VV.setEmberBoost = n => { emberBoost = n; };

  /* ─── hero card tilt + pointer-tracked sheen ─── */
  VV.bindTilt = function (card) {
    if (reduced || !window.matchMedia("(hover: hover)").matches) return;
    let raf = null;
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(900px) rotateX(${(-py * 2.4).toFixed(2)}deg) rotateY(${(px * 2.8).toFixed(2)}deg)`;
        raf = null;
      });
    });
    card.addEventListener("pointerleave", () => {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      card.style.transform = "";
    });
  };

  /* ─── scroll-linked soft parallax for a hero element ─── */
  VV.bindParallax = function (scroller, el, factor = 0.18) {
    if (reduced) return;
    let raf = null;
    scroller.addEventListener("scroll", () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = scroller.scrollTop;
        el.style.translate = `0 ${Math.min(y * factor, 60)}px`;
        el.style.opacity = Math.max(1 - y / 480, 0.25);
        raf = null;
      });
    }, { passive: true });
  };

  /* ─── bottom sheet with drag-to-dismiss ─── */
  const sheet = document.getElementById("sheet");
  const backdrop = document.getElementById("backdrop");
  const sheetContent = document.getElementById("sheet-content");
  let sheetOpen = false, onSheetClose = null;

  VV.openSheet = function (html, { onClose } = {}) {
    sheetContent.innerHTML = html;
    onSheetClose = onClose || null;
    backdrop.classList.add("show");
    sheet.classList.remove("dragging");
    requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add("show")));
    sheetOpen = true;
    VV.haptic(6);
  };
  VV.closeSheet = function () {
    if (!sheetOpen) return;
    sheet.classList.remove("show");
    sheet.style.transform = "";
    backdrop.classList.remove("show");
    sheetOpen = false;
    const cb = onSheetClose; onSheetClose = null;
    if (cb) setTimeout(cb, 180);
  };
  backdrop.addEventListener("click", VV.closeSheet);

  // drag physics on the handle / sheet chrome
  let dragStartY = null, dragDelta = 0;
  sheet.addEventListener("pointerdown", e => {
    if (!e.target.closest("#sheet-handle")) return;
    dragStartY = e.clientY; dragDelta = 0;
    sheet.classList.add("dragging");
    sheet.setPointerCapture(e.pointerId);
  });
  sheet.addEventListener("pointermove", e => {
    if (dragStartY === null) return;
    dragDelta = Math.max(0, e.clientY - dragStartY);
    const damp = dragDelta < 0 ? 0 : dragDelta;
    sheet.style.transform = `translateY(${damp}px)`;
  });
  function endDrag() {
    if (dragStartY === null) return;
    sheet.classList.remove("dragging");
    if (dragDelta > 90) { sheet.style.transform = ""; VV.closeSheet(); }
    else sheet.style.transform = "";
    dragStartY = null;
  }
  sheet.addEventListener("pointerup", endDrag);
  sheet.addEventListener("pointercancel", endDrag);

  /* ─── toast ─── */
  const toast = document.getElementById("toast");
  let toastTimer = null;
  VV.toast = function (msg, ok = false) {
    toast.innerHTML = (ok ? '<span class="tick">✓</span>' : "") + msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2100);
  };

  /* ─── floating tab bar: hide on scroll down, spring back on scroll up ─── */
  const tabbar = document.getElementById("tabbar");
  let barHidden = false;
  VV.setBarHidden = function (hide) {
    if (hide === barHidden) return;
    barHidden = hide;
    tabbar.classList.toggle("bar-hidden", hide);
  };
  VV.autoHideBar = function (scroller) {
    let last = 0;
    scroller.addEventListener("scroll", () => {
      const y = scroller.scrollTop;
      const dy = y - last;
      last = y;
      if (y < 40) { VV.setBarHidden(false); return; }
      if (dy > 8) VV.setBarHidden(true);
      else if (dy < -8) VV.setBarHidden(false);
    }, { passive: true });
  };

  /* ─── animated number counter ─── */
  VV.countUp = function (el, to, dur = 800) {
    if (reduced || to <= 0) { el.textContent = to; return; }
    const t0 = performance.now();
    (function frame(t) {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased);
      if (p < 1) requestAnimationFrame(frame);
    })(t0);
  };
})();
