/* ═══ Vedic Verse — onboarding v2: full-bleed plates + rising clay sheet ═══
   Layout per reference: illustration bleeding from the top, a clay-toned glass
   sheet with drag handle over it, two-line display title, body copy, and a
   single cream pill CTA in tracked uppercase (Learn / Discover / Explore / Begin). */
(function () {
  const VV = window.VV;
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const para = s => esc(s).split("\n\n").map(p => `<p>${p.replace(/\n/g, "<br/>")}</p>`).join("");

  function slides() {
    return [0, 1, 2, 3].map(i => ({
      art: VV.art.onboard(i),
      t: VV.t(`ob${i + 1}_t`), s: VV.t(`ob${i + 1}_s`), cta: VV.t(`ob${i + 1}_cta`),
      lang: i === 3
    }));
  }

  VV.startOnboarding = function (replay) {
    let idx = 0;
    const old = document.getElementById("onboard");
    if (old) old.remove();

    const el = document.createElement("div");
    el.id = "onboard";
    document.getElementById("frame").appendChild(el);

    function render() {
      const S = slides();
      el.innerHTML = `
        <button class="ob-skip glass-r" data-ob="skip">${VV.t("ob_skip")}</button>
        <div class="ob-track" style="transform:translateX(${-idx * 100}%)">
          ${S.map((s, i) => `
            <div class="ob-slide ${i === idx ? "current" : ""}">
              <div class="ob-hero">${s.art}<div class="ob-hero-fade"></div></div>
              <div class="ob-sheet">
                <div class="ob-handle"><span></span></div>
                <h2 class="ob-title">${esc(s.t).replace(/\n/g, "<br/>")}</h2>
                <div class="ob-sub">${para(s.s)}</div>
                ${s.lang ? `
                  <div class="ob-langs">
                    <button class="ob-lang ${!VV.isHindi() ? "on" : ""}" data-lang="en">English</button>
                    <button class="ob-lang ${VV.isHindi() ? "on" : ""}" data-lang="hi">हिन्दी</button>
                  </div>` : ""}
                <div class="ob-dots">${S.map((_, d) => `<span class="${d === idx ? "on" : ""}"></span>`).join("")}</div>
                <button class="ob-cta pressable" data-ob="next">${esc(s.cta)}</button>
              </div>
            </div>`).join("")}
        </div>`;
    }

    function go(n) {
      idx = Math.max(0, Math.min(slides().length - 1, n));
      render();
      VV.haptic(6);
    }

    function finish() {
      VV.settings.onboarded = true;
      VV.saveSettings();
      el.classList.add("bye");
      setTimeout(() => el.remove(), 620);
      VV.haptic(10);
      if (!replay) VV.switchTab("home", true);
    }

    el.addEventListener("click", e => {
      const lang = e.target.closest("[data-lang]");
      if (lang) {
        VV.settings.lang = lang.dataset.lang;
        VV.saveSettings();
        VV.syncTabbar();
        render();
        VV.haptic(6);
        return;
      }
      const b = e.target.closest("[data-ob]");
      if (!b) return;
      if (b.dataset.ob === "skip") return finish();
      if (b.dataset.ob === "next") {
        if (idx === slides().length - 1) return finish();
        go(idx + 1);
      }
    });

    let sx = null, sy = null;
    el.addEventListener("pointerdown", e => { sx = e.clientX; sy = e.clientY; });
    el.addEventListener("pointerup", e => {
      if (sx === null) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      sx = null;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        if (dx < 0) { if (idx < slides().length - 1) go(idx + 1); }
        else if (idx > 0) go(idx - 1);
      }
    });

    render();
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("in")));
  };
})();
