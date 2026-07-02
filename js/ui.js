/* ═══ Vedic Verse — screens, navigation, chat choreography (v2) ═══ */
(function () {
  const VV = window.VV;
  const $ = sel => document.querySelector(sel);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const ICONS = {
    chev: '<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>',
    bookmark: '<svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>',
    stop: '<svg viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>',
    spark: '<svg viewBox="0 0 24 24"><path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z"/></svg>',
    down: '<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    open: '<svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>',
    tick: '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
    left: '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>',
    right: '<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    compose: '<svg viewBox="0 0 24 24"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.4 2.6a2.1 2.1 0 0 1 3 3L10 17l-4 1 1-4z"/></svg>',
    history: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 3"/></svg>'
  };

  /* ═══════════ tab router ═══════════ */
  let currentTab = "home";
  const renderers = {};

  VV.syncTabbar = function () {
    const labels = { home: "tab_home", library: "tab_library", chat: "tab_chat", journal: "tab_journal", profile: "tab_profile" };
    document.querySelectorAll(".tab").forEach(b => {
      const span = b.querySelector("span");
      if (span) span.textContent = VV.t(labels[b.dataset.tab]);
    });
  };

  VV.switchTab = function (tab, force) {
    if (tab === currentTab && !force) {
      if (stack.length) { VV.popAll(); VV.haptic(5); }
      return;
    }
    VV.popAll();
    const oldEl = $(`#screen-${currentTab}`);
    const newEl = $(`#screen-${tab}`);
    document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    if (oldEl !== newEl) {
      oldEl.classList.remove("active", "enter");
      oldEl.classList.add("exit");
      setTimeout(() => oldEl.classList.remove("exit"), 170);
    }
    currentTab = tab;
    VV.setBarHidden(false);
    renderers[tab] && renderers[tab]();
    newEl.classList.add("active");
    newEl.classList.remove("enter");
    void newEl.offsetWidth;
    newEl.classList.add("enter");
    VV.haptic(5);
  };
  document.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => VV.switchTab(b.dataset.tab)));
  document.querySelectorAll(".screen").forEach(s => VV.autoHideBar(s));

  /* ═══════════ push stack ═══════════ */
  const stackEl = $("#pushstack");
  const stack = [];
  VV.push = function (renderFn) {
    const el = document.createElement("div");
    el.className = "push-screen";
    stackEl.appendChild(el);
    stack.push(el);
    renderFn(el);
    // keep the tab bar visible + tappable while a push view (reader/section index)
    // is open — auto-hiding it here traps the user, since bar-hidden is pointer-events:none
    VV.setBarHidden(false);
    VV.haptic(5);
    return el;
  };
  VV.pop = function () {
    const el = stack.pop();
    if (!el) return;
    el.classList.add("pop");
    setTimeout(() => el.remove(), 250);
    if (!stack.length) VV.setBarHidden(false);
  };
  VV.popAll = function () { while (stack.length) { const el = stack.pop(); el.remove(); } VV.setBarHidden(false); };

  function pushHead(title) {
    return `<div class="push-head">
      <button class="back-btn" data-act="back">${ICONS.back}</button>
      <div class="ttl">${esc(title)}</div>
    </div>`;
  }

  /* ═══════════ HOME ═══════════ */
  renderers.home = function () {
    const el = $("#screen-home");
    const ref = VV.dailyRef();
    const v = VV.getVerse(ref);
    const hour = new Date().getHours();
    const gKey = hour < 5 ? "greet_dawn" : hour < 12 ? "greet_morning" : hour < 17 ? "greet_afternoon" : "greet_evening";
    const dateStr = new Date().toLocaleDateString(VV.isHindi() ? "hi-IN" : undefined, { weekday: "long", month: "long", day: "numeric" });
    const done = VV.practiceDoneToday();
    const streakFrac = Math.min((VV.streak.count || 0) / 7, 1);
    const C = 2 * Math.PI * 34;

    el.innerHTML = `
      <div class="stagger">
        <header class="home-head" style="--i:0">
          <div class="eyebrow">${VV.t("todays_practice")}</div>
          <div class="home-greeting">${VV.t(gKey)}, Takshak</div>
          <div class="home-date">${esc(dateStr)}</div>
        </header>

        <div class="hero-card glass-e pressable" id="hero-card" style="--i:1">
          <div class="sweep"></div>
          <div class="hero-eyebrow-row">
            <span class="eyebrow">[ BG ${esc(ref)} ]</span>
            <span class="eyebrow" style="color:var(--color-stone)">${VV.t("verse_of_day")}</span>
          </div>
          ${v ? `
            ${VV.settings.script !== "en" && VV.settings.script !== "iast" ? `<div class="verse-dev hero-dev">${esc(v.dev)}</div>` : ""}
            ${VV.settings.script === "iast" ? `<div class="verse-iast hero-iast">${esc(v.iast)}</div>` : ""}
            <div class="verse-trans hero-trans">${esc(VV.vtrans(v))}</div>
          ` : `<div class="verse-trans hero-trans" style="color:var(--color-ash-gray)">…</div>`}
          <div class="hero-footer">
            <button class="btn-primary pressable" data-act="read-daily">${VV.t("read_todays")}</button>
            <div class="hero-actions">
              <button class="icon-btn ${VV.isSaved(ref) ? "saved" : ""}" data-act="save" data-ref="${esc(ref)}" aria-label="Save">${ICONS.bookmark}</button>
            </div>
          </div>
        </div>

        <div class="script-pill glass-r" style="--i:2">
          <div class="thumb"></div>
          <button data-script="dev">देवनागरी</button>
          <button data-script="iast">IAST</button>
          <button data-script="en">${VV.isHindi() ? "अनुवाद" : "English"}</button>
        </div>

        <div class="practice-row glass-r" style="--i:3">
          <div class="ring-wrap ${done && VV.streak.count >= 1 ? "complete" : ""}">
            <svg width="78" height="78" viewBox="0 0 78 78">
              <circle class="ring-track" cx="39" cy="39" r="34" fill="none" stroke-width="4"/>
              <circle class="ring-fill" cx="39" cy="39" r="34" fill="none" stroke-width="4"
                stroke-dasharray="${C}" stroke-dashoffset="${C}" data-target="${C * (1 - streakFrac)}"/>
            </svg>
            <div class="ring-center">
              <div class="ring-num" id="streak-num">0</div>
              <div class="cap">${VV.streak.count === 1 ? VV.t("day") : VV.t("days")}</div>
            </div>
          </div>
          <div class="practice-copy">
            <div class="t">${VV.t("daily_sadhana")}</div>
            <div class="s">${done
              ? `<span class="done">${ICONS.tick.replace("<svg", '<svg width="13" height="13"')} ${VV.t("practice_done")}</span>`
              : VV.t("practice_hint")}</div>
          </div>
        </div>

        <div style="--i:4">
          <div class="section-head">
            <span class="eyebrow">${VV.t("recently_read")}</span>
            ${VV.recent.length ? `<button class="link" data-act="go-library">${VV.t("library_link")}</button>` : ""}
          </div>
          <div id="recent-list">${renderRecent()}</div>
        </div>
      </div>`;

    requestAnimationFrame(() => requestAnimationFrame(() => {
      const fill = el.querySelector(".ring-fill");
      if (fill) fill.style.strokeDashoffset = fill.dataset.target;
      VV.countUp($("#streak-num"), VV.streak.count || 0, 900);
    }));
    setScriptPill(el);
    VV.bindTilt($("#hero-card"));

    el.onclick = e => {
      const scriptBtn = e.target.closest("[data-script]");
      if (scriptBtn) {
        VV.settings.script = scriptBtn.dataset.script;
        VV.saveSettings();
        setScriptPill(el);
        refreshHeroText(el);
        VV.haptic(6);
        return;
      }
      const act = e.target.closest("[data-act]");
      if (!act) {
        if (e.target.closest("#hero-card")) openReader(ref, { daily: true });
        return;
      }
      if (act.dataset.act === "read-daily") openReader(ref, { daily: true });
      if (act.dataset.act === "save") toggleSaveBtn(act, ref);
      if (act.dataset.act === "go-library") VV.switchTab("library");
      if (act.dataset.act === "open-ref") openReader(act.dataset.ref);
      e.stopPropagation();
    };
  };

  function setScriptPill(scope) {
    const pill = scope.querySelector(".script-pill");
    if (!pill) return;
    const opts = ["dev", "iast", "en"];
    const idx = Math.max(opts.indexOf(VV.settings.script), 0);
    pill.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.script === opts[idx]));
    pill.querySelector(".thumb").style.transform = `translateX(${idx * 100}%)`;
  }

  function refreshHeroText(el) {
    const ref = VV.dailyRef();
    const v = VV.getVerse(ref);
    if (!v) return;
    const card = el.querySelector("#hero-card");
    const old = card.querySelectorAll(".hero-dev, .hero-iast, .hero-trans");
    old.forEach(n => { n.style.transition = "opacity 160ms ease, filter 160ms ease"; n.style.opacity = 0; n.style.filter = "blur(4px)"; });
    setTimeout(() => {
      old.forEach(n => n.remove());
      const footer = card.querySelector(".hero-footer");
      let html = "";
      if (VV.settings.script === "dev") html += `<div class="verse-dev hero-dev">${esc(v.dev)}</div>`;
      if (VV.settings.script === "iast") html += `<div class="verse-iast hero-iast">${esc(v.iast)}</div>`;
      html += `<div class="verse-trans hero-trans">${esc(VV.vtrans(v))}</div>`;
      footer.insertAdjacentHTML("beforebegin", html);
      card.querySelectorAll(".hero-dev, .hero-iast, .hero-trans").forEach((n, i) => {
        n.style.opacity = 0; n.style.filter = "blur(4px)"; n.style.transition = "opacity 340ms ease, filter 340ms ease";
        setTimeout(() => { n.style.opacity = 1; n.style.filter = "blur(0)"; }, 30 + i * 70);
      });
    }, 170);
  }

  function renderRecent() {
    if (!VV.recent.length) return `<div class="empty-note">${VV.t("recent_empty")}</div>`;
    return VV.recent.slice(0, 5).map(ref => {
      const v = VV.getVerse(ref);
      if (!v) return "";
      return `<button class="vrow press-row pressable" data-act="open-ref" data-ref="${esc(ref)}">
        <span class="citation-badge">${esc(VV.citeOf(v))}</span>
        <span class="snippet">${esc(VV.vtrans(v).slice(0, 90))}</span>
        <span class="chev">${ICONS.chev}</span>
      </button>`;
    }).join("");
  }

  function toggleSaveBtn(btn, ref) {
    const added = VV.toggleSave(ref);
    btn.classList.toggle("saved", added);
    VV.toast(added ? VV.t("saved_to_journal") : VV.t("removed_from_journal"), added);
    VV.haptic(10);
  }

  /* ═══════════ LIBRARY — tiled cover grid + filter chips (per reference) ═══════════ */
  let libFilter = "all";
  function libBooks() {
    return [
      { id: "gita", cat: "epics", dev: "श्रीमद्भगवद्गीता", en: "Bhagavad Gītā", author: "Vyāsa" },
      { id: "ramayana", cat: "epics", dev: "रामायणम्", en: VV.t("ramayana_en"), author: "Vālmīki" },
      { id: "mahabharata", cat: "epics", dev: "महाभारतम्", en: VV.t("mahabharata_en"), author: "Vyāsa" },
      { id: "vedas", cat: "vedic", dev: "वेदाः", en: VV.t("vedas_en"), author: "Śruti" },
      { id: "upanishads", cat: "vedic", dev: "उपनिषद्", en: VV.t("upanishads_en"), author: "Śruti" },
      { id: "puranas", cat: "purana", dev: "पुराणानि", en: VV.t("puranas_en"), author: "Vyāsa" },
      { id: "yoga", cat: "darshana", dev: "योगसूत्राणि", en: VV.t("yoga_en"), author: "Patañjali" }
    ];
  }
  function libGridHTML() {
    const books = libBooks().filter(b => libFilter === "all" || b.cat === libFilter);
    return books.map((b, i) => {
      const seeded = (VV.corpusFor(b.id) && VV.corpusFor(b.id).ready) ? VV.corpusFor(b.id).verses.length : 0;
      const curated = b.id !== "gita";
      return `
      <button class="book-tile glass-r pressable" data-book="${b.id}" style="--i:${i}">
        <div class="tile-art">
          ${VV.art.cover(b.id)}
          <div class="card-art-fade"></div>
          ${curated && seeded ? `<span class="soon-chip tile-soon">${VV.t("curated_chip")}</span>` : ""}
        </div>
        <div class="tile-body">
          <div class="tile-dev">${esc(b.dev)}</div>
          <div class="tile-title">${esc(b.en)}</div>
          <div class="tile-author">${esc(b.author)}</div>
        </div>
      </button>`;
    }).join("");
  }
  renderers.library = function () {
    const el = $("#screen-library");
    const chips = [
      { id: "all", l: VV.t("chip_all") },
      { id: "epics", l: VV.t("chip_epics") },
      { id: "vedic", l: VV.t("chip_vedic") },
      { id: "purana", l: VV.t("chip_purana") },
      { id: "darshana", l: VV.t("chip_darshana") }
    ];
    el.innerHTML = `
      <div class="stagger">
        <div style="--i:0">
          <div class="eyebrow">${VV.t("the_library")}</div>
          <h1 class="screen-title">${VV.t("texts")}</h1>
        </div>
        <div class="lib-chips" style="--i:1">
          ${chips.map(c => `<button class="lib-chip ${libFilter === c.id ? "on" : ""}" data-chip="${c.id}">${c.l}</button>`).join("")}
        </div>
        <div class="lib-grid stagger" id="lib-grid" style="--i:2">${libGridHTML()}</div>
      </div>`;
    el.onclick = e => {
      const chip = e.target.closest("[data-chip]");
      if (chip) {
        libFilter = chip.dataset.chip;
        el.querySelectorAll(".lib-chip").forEach(c => c.classList.toggle("on", c === chip));
        const grid = $("#lib-grid");
        grid.style.opacity = 0; grid.style.transform = "translateY(6px)";
        setTimeout(() => {
          grid.innerHTML = libGridHTML();
          grid.style.transition = "opacity 300ms ease, transform 380ms var(--ease-spring)";
          grid.style.opacity = 1; grid.style.transform = "none";
        }, 120);
        VV.haptic(6);
        return;
      }
      const tile = e.target.closest("[data-book]");
      if (tile) openSections(tile.dataset.book);
    };
  };

  /* section index for any text (Gita chapters, Ramayana kandas, Rigveda mandalas, …) */
  function openSections(textId) {
    const meta = VV.TEXTS[textId] || { en: textId };
    const sections = VV.sectionsFor(textId);
    VV.push(el => {
      el.innerHTML = `
        ${pushHead(meta.en)}
        <div class="stagger">
          ${sections.map((c, i) => {
            const count = VV.chapterVerses(textId, c.n).length;
            const total = textId === "gita" ? c.count : count;
            const sub = `${esc(c.meaning || "")}${total ? ` · ${total} ${VV.t("verses_n")}` : ` · ${VV.t("coming_soon")}`}`;
            return `<button class="vrow press-row chap-row pressable${count ? "" : " row-dim"}" data-ch="${c.n}" style="--i:${Math.min(i, 14)}">
              <span class="chap-num">${String(c.n).padStart(2, "0")}</span>
              <span class="snippet">${esc(c.en)}<span class="sub">${sub}</span></span>
              <span class="chev">${ICONS.chev}</span>
            </button>`;
          }).join("")}
        </div>`;
      el.onclick = e => {
        if (e.target.closest("[data-act='back']")) return VV.pop();
        const row = e.target.closest("[data-ch]");
        if (row) openSection(textId, Number(row.dataset.ch));
      };
    });
  }

  function openSection(textId, n) {
    const sections = VV.sectionsFor(textId);
    const c = sections[n - 1];
    const verses = VV.chapterVerses(textId, n);
    if (!verses.length) { VV.toast(VV.t("coming_soon")); return; }
    VV.push(el => {
      el.innerHTML = `
        ${pushHead(`${c.en}`)}
        <div class="reader-block" style="padding-top:0">
          <div class="eyebrow" style="margin-bottom:8px">[ ${esc(c.en)} ]</div>
          <div class="verse-dev" style="font-size:24px;margin-bottom:6px">${esc(c.dev)}</div>
          <div style="font-size:13px;color:var(--color-ash-gray);line-height:1.6;margin-bottom:8px">${esc(c.summary || c.meaning || "")}</div>
        </div>
        <div class="stagger">
          ${verses.map((v, i) => `
            <button class="vrow press-row pressable" data-ref="${esc(VV.refOf(v))}" style="--i:${Math.min(i, 14)}">
              <span class="citation-badge">${esc(VV.citeOf(v))}</span>
              <span class="snippet">${esc(VV.vtrans(v).slice(0, 90))}</span>
              <span class="chev">${ICONS.chev}</span>
            </button>`).join("")}
        </div>`;
      el.onclick = e => {
        if (e.target.closest("[data-act='back']")) return VV.pop();
        const row = e.target.closest("[data-ref]");
        if (row) openReader(row.dataset.ref);
      };
    });
  }

  /* ═══════════ READER ═══════════ */
  function openReader(ref, opts = {}) {
    const v = VV.getVerse(ref);
    if (!v) { VV.toast(VV.t("verse_not_loaded")); return; }
    VV.touchRecent(ref);
    if (opts.daily && VV.recordPractice()) {
      setTimeout(() => VV.toast(VV.t("sadhana_toast"), true), 900);
    }
    VV.push(el => renderReader(el, ref));
  }

  function renderReader(el, ref) {
    const v = VV.getVerse(ref);
    if (!v) { VV.toast(VV.t("verse_not_loaded")); return; }
    const textId = v.text || "gita";
    const c = VV.sectionsFor(textId)[v.ch - 1] || { en: "" };
    const cite = VV.citeOf(v);
    const saved = VV.isSaved(ref);
    el.innerHTML = `
      ${pushHead(`${c.en}`)}
      <div class="reader-block stagger">
        <div class="reader-cite-row" style="--i:0">
          <span class="eyebrow">[ ${esc(cite)} ]</span>
          <button class="icon-btn ${saved ? "saved" : ""}" data-act="save">${ICONS.bookmark}</button>
        </div>
        ${v.dev ? `<div class="verse-dev reader-dev" style="--i:1">${esc(v.dev)}</div>` : ""}
        ${v.iast ? `<div class="verse-iast reader-iast" style="--i:2">${esc(v.iast)}</div>` : ""}
        <div class="reader-divider" style="--i:3"></div>
        <div class="verse-trans reader-trans" style="--i:4">${esc(VV.vtrans(v))}</div>
        <div class="reader-attrib" style="--i:5">${VV.t("translation_by")} · ${esc(VV.vauthor(v))}</div>
        <div class="reader-actions" style="--i:6">
          <button class="btn-primary pressable" data-act="ask" style="flex:1">${ICONS.spark.replace("<svg", '<svg width="16" height="16" style="fill:none;stroke:currentColor;stroke-width:1.8"')} ${VV.t("sit_with_verse")}</button>
          <button class="btn-ghost pressable" data-act="copy">${VV.t("copy")}</button>
        </div>
        <div class="reader-nav" style="--i:7">
          <button data-act="prev">${ICONS.left} ${VV.t("previous")}</button>
          <span class="citation-badge">${esc(cite)}</span>
          <button data-act="next">${VV.t("next")} ${ICONS.right}</button>
        </div>
      </div>`;
    el.onclick = e => {
      const act = e.target.closest("[data-act]");
      if (!act) return;
      const a = act.dataset.act;
      if (a === "back") return VV.pop();
      if (a === "save") return toggleSaveBtn(act, ref);
      if (a === "copy") {
        const txt = `${v.dev ? v.dev + "\n\n" : ""}${v.iast ? v.iast + "\n\n" : ""}"${VV.vtrans(v)}"\n— ${cite}`;
        navigator.clipboard?.writeText(txt).then(() => VV.toast(VV.t("verse_copied"), true)).catch(() => VV.toast(VV.t("copy_failed")));
        return;
      }
      if (a === "ask") {
        VV.popAll();
        VV.switchTab("chat");
        VV.setChatScope(textId);
        VV.prefillChat(VV.isHindi() ? `${cite} का आज के जीवन में क्या अर्थ है?` : `What does ${cite} mean for a life lived now?`);
        return;
      }
      if (a === "prev" || a === "next") {
        const all = (VV.corpusFor(textId) || VV.corpus).verses;
        const i = all.indexOf(v);
        const nv = all[a === "next" ? i + 1 : i - 1];
        if (!nv) return VV.toast(a === "next" ? VV.t("final_verse") : VV.t("first_verse"));
        const nref = VV.refOf(nv);
        VV.touchRecent(nref);
        el.scrollTop = 0;
        renderReader(el, nref);
        VV.haptic(5);
      }
    };
  }

  /* ═══════════ CHAT ═══════════ */
  let chatBusy = false, chatAbort = false;

  renderers.chat = function () {
    const el = $("#screen-chat");
    const sess = VV.activeSession();
    const pid = sess.persona;
    const scope = VV.scopeForPersona(pid);
    const scopeIds = [...VV.TEXT_ORDER, "all"];
    const subPersonas = VV.personasFor(scope);
    el.innerHTML = `
      <div class="chat-top">
        <div class="chat-top-row">
          <button class="nav-icon pressable" data-act="history" aria-label="${VV.t("history")}">${ICONS.history}</button>
          <div class="chat-title">
            <div class="eyebrow" style="text-align:center">${VV.t("the_conversation")}</div>
            <div class="chat-title-text">${sess.title ? esc(sess.title) : "&nbsp;"}</div>
          </div>
          <button class="nav-icon pressable" data-act="new-chat" aria-label="${VV.t("new_chat")}">${ICONS.compose}</button>
        </div>
        <div class="persona-scroll" id="scope-scroll">
          ${scopeIds.map(id => `
            <button class="persona-chip ${id === scope ? "active" : ""}" data-scope="${id}">
              <span class="dot"></span>${esc(VV.scopeLabel(id))}
            </button>`).join("")}
        </div>
        <div class="persona-scroll persona-sub" id="persona-scroll">
          ${subPersonas.map(id => `
            <button class="persona-chip sub ${id === pid ? "active" : ""} ${VV.PERSONAS[id] && VV.PERSONAS[id].custom ? "custom" : ""}" data-persona="${id}">
              ${esc(VV.personaName(id))}
            </button>`).join("")}
          <button class="persona-chip sub add-voice" data-act="new-persona" aria-label="${VV.t("new_voice")}">${ICONS.plus}<span>${VV.t("new_voice")}</span></button>
        </div>
        <div class="persona-note" id="persona-note">${personaNote(pid)}</div>
      </div>
      <div id="chat-scroll"></div>
      <div class="chat-bottom glass-chrome-soft">
        <div class="fidelity-row">
          <div class="fidelity-pill glass-r">
            ${Object.entries(VV.FIDELITY).map(([id, f]) => `
              <button class="${id === VV.settings.fidelity ? "active" : ""}" data-fid="${id}">${VV.isHindi() ? f.labelHi : f.label}</button>`).join("")}
          </div>
        </div>
        <div class="composer glass-chrome">
          <textarea id="chat-input" rows="1" placeholder="${esc(placeholderFor(pid))}"></textarea>
          <button class="send-btn" id="send-btn" disabled aria-label="Send">${ICONS.send}</button>
        </div>
      </div>`;

    renderChatLog();

    const input = $("#chat-input");
    const sendBtn = $("#send-btn");
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 108) + "px";
      if (!chatBusy) sendBtn.disabled = !input.value.trim();
    });
    input.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); trySend(); }
    });
    sendBtn.addEventListener("click", () => { chatBusy ? (chatAbort = true) : trySend(); });

    el.querySelector(".chat-top").addEventListener("click", e => {
      const actBtn = e.target.closest("[data-act]");
      if (actBtn) {
        if (actBtn.dataset.act === "history") return openSessionsSheet();
        if (actBtn.dataset.act === "new-persona") return openPersonaSheet(scope);
        if (actBtn.dataset.act === "new-chat") {
          if (chatBusy) return;
          VV.newSession(VV.activeSession().persona);
          VV.saveSessions();
          renderers.chat();
          VV.haptic(8);
          return;
        }
      }
      if (chatBusy) return;
      const scopeChip = e.target.closest("[data-scope]");
      if (scopeChip) {
        const newScope = scopeChip.dataset.scope;
        const sess = VV.activeSession();
        if (VV.scopeForPersona(sess.persona) !== newScope) {
          switchPersona(VV.personasFor(newScope)[0]);
          VV.haptic(7);
        }
        return;
      }
      const chip = e.target.closest("[data-persona]");
      if (!chip) return;
      switchPersona(chip.dataset.persona);
      VV.haptic(7);
    });
    el.querySelector(".fidelity-pill").addEventListener("click", e => {
      const b = e.target.closest("[data-fid]");
      if (!b) return;
      VV.settings.fidelity = b.dataset.fid;
      VV.saveSettings();
      el.querySelectorAll("[data-fid]").forEach(x => x.classList.toggle("active", x === b));
      VV.haptic(6);
      if (b.dataset.fid === "darshan" && !VV.settings.apiKey) VV.toast(VV.t("darshan_hint"));
    });
  };

  /* switch the active conversation's voice/scope (new session if the current one has messages) */
  function switchPersona(newPid) {
    const sess = VV.activeSession();
    if (sess.persona === newPid) return;
    if (sess.msgs.length) VV.newSession(newPid);
    else { sess.persona = newPid; VV.settings.persona = newPid; VV.saveSettings(); VV.saveSessions(); }
    renderers.chat();
  }
  /* character suggestions per text — a starting point, not a limit */
  const CHAR_SUGGEST = {
    gita: ["Krishna", "Arjuna", "Sanjaya"],
    ramayana: ["Rama", "Sita", "Hanuman", "Lakshmana", "Ravana"],
    mahabharata: ["Yudhishthira", "Bhishma", "Vidura", "Draupadi", "Karna"],
    vedas: ["A Vedic seer (ṛṣi)"],
    upanishads: ["Yajnavalkya", "Nachiketa", "Uddalaka"],
    puranas: ["Prahlada", "Narada", "Dhruva"],
    yoga: ["Patañjali"]
  };

  /* ── create-a-voice sheet: a character drawn from a chosen text ── */
  function openPersonaSheet(scope) {
    scope = (scope && scope !== "all") ? scope : VV.scopeForPersona(VV.activeSession().persona);
    if (scope === "all") scope = "gita";
    let book = scope;
    const mine = () => (VV.customPersonas || []).filter(p => (p.scope || "gita") === book);
    const bookChips = () => VV.TEXT_ORDER.map(id =>
      `<button class="chip-opt ${id === book ? "on" : ""}" data-book="${id}">${esc(VV.scopeLabel(id))}</button>`).join("");
    const suggestHTML = () => {
      const s = CHAR_SUGGEST[book] || [];
      return s.length ? `<div class="cp-suggest">${s.map(n => `<button class="cp-sug" data-char="${esc(n)}">${esc(n)}</button>`).join("")}</div>` : "";
    };
    const mineHTML = () => {
      const m = mine();
      return m.length ? `<label class="sheet-label">${VV.t("your_voices")}</label>
        <div class="cp-mine">${m.map(p => `<div class="cp-mine-row">
          <span><span class="avatar s-av">${esc(p.avatar)}</span>${esc(p.name)}${p.character && p.character !== p.name ? ` · <em>${esc(p.character)}</em>` : ""}</span>
          <button class="s-del" data-del-persona="${p.id}" aria-label="${VV.t("delete")}">${ICONS.trash.replace("<svg", '<svg width="14" height="14"')}</button>
        </div>`).join("")}</div>` : "";
    };
    VV.openSheet(`
      <div class="sheet-title">${VV.t("create_voice")}</div>
      <div class="sheet-hint">${VV.t("create_voice_hint")}</div>
      <label class="sheet-label">${VV.t("voice_book")}</label>
      <div class="chip-opts" id="cp-books">${bookChips()}</div>
      <label class="sheet-label">${VV.t("voice_name")}</label>
      <input class="sheet-input" id="cp-name" placeholder="${esc(VV.t("voice_name_ph"))}" autocomplete="off" spellcheck="false" />
      <div id="cp-suggest-zone">${suggestHTML()}</div>
      <label class="sheet-label">${VV.t("voice_character")}</label>
      <input class="sheet-input" id="cp-char" placeholder="${esc(VV.t("voice_character_ph"))}" autocomplete="off" spellcheck="false" />
      <label class="sheet-label">${VV.t("voice_tone")}</label>
      <input class="sheet-input" id="cp-tone" placeholder="${esc(VV.t("voice_tone_ph"))}" autocomplete="off" spellcheck="false" />
      <div id="cp-mine-zone">${mineHTML()}</div>
      <div class="sheet-actions">
        <button class="btn-ghost pressable" data-sheet-act="cancel">${VV.t("not_now")}</button>
        <button class="btn-primary pressable" data-sheet-act="create">${VV.t("create")}</button>
      </div>`);
    const content = $("#sheet-content");
    content.onclick = e => {
      const bk = e.target.closest("[data-book]");
      if (bk) {
        book = bk.dataset.book;
        content.querySelectorAll("[data-book]").forEach(x => x.classList.toggle("on", x === bk));
        $("#cp-suggest-zone").innerHTML = suggestHTML();
        $("#cp-mine-zone").innerHTML = mineHTML();
        VV.haptic(5);
        return;
      }
      const sg = e.target.closest("[data-char]");
      if (sg) {
        const name = $("#cp-name");
        if (!name.value.trim()) name.value = sg.dataset.char;
        else $("#cp-char").value = sg.dataset.char;
        VV.haptic(5);
        return;
      }
      const del = e.target.closest("[data-del-persona]");
      if (del) {
        const id = del.dataset.delPersona;
        VV.deleteCustomPersona(id);
        const sess = VV.activeSession();
        if (sess.persona === id) {
          sess.persona = VV.personasFor(book)[0];
          VV.settings.persona = sess.persona;
          VV.saveSettings(); VV.saveSessions();
        }
        $("#cp-mine-zone").innerHTML = mineHTML();
        renderers.chat();
        VV.haptic(8);
        return;
      }
      const act = e.target.closest("[data-sheet-act]");
      if (!act) return;
      if (act.dataset.sheetAct === "create") {
        const name = $("#cp-name").value.trim();
        const character = $("#cp-char").value.trim();
        if (!name && !character) { VV.toast(VV.t("voice_need_name")); VV.haptic(12); return; }
        const p = VV.addCustomPersona({ name, character, scope: book, tone: $("#cp-tone").value.trim() });
        VV.closeSheet();
        switchPersona(p.id);
        VV.toast(VV.t("voice_created"), true);
        VV.haptic(10);
        return;
      }
      VV.closeSheet();
    };
  }

  /* used from the reader's "sit with this verse" — enter chat in the verse's text scope */
  VV.setChatScope = function (textId) {
    const pid = VV.personasFor(textId)[0];
    const sess = VV.activeSession();
    if (sess.persona === pid) return;
    if (sess.msgs.length) VV.newSession(pid);
    else { sess.persona = pid; VV.settings.persona = pid; VV.saveSettings(); VV.saveSessions(); }
  };
  /* short label for a scope chip (a text id or "all") */
  VV.scopeLabel = function (id) {
    if (id === "all") return VV.t("scope_all");
    const key = { gita: "Gītā", ramayana: "ramayana_en", mahabharata: "mahabharata_en", vedas: "vedas_en", upanishads: "upanishads_en", puranas: "puranas_en", yoga: "yoga_en" }[id];
    if (id === "gita") return VV.isHindi() ? "गीता" : "Gītā";
    return VV.t(key);
  };

  function personaNote(pid) {
    const scope = VV.scopeForPersona(pid);
    let base;
    if (pid === "gita") base = VV.t("grounding_note_gita");
    else if (pid === "krishna" || pid === "arjuna") base = VV.t("grounding_note_persona");
    else if (scope === "all") base = VV.t("grounding_note_all");
    else base = VV.t("grounding_note_text");
    return VV.settings.apiKey ? base : `${base} <span class="offline-flag">· ${VV.t("offline_voice")}</span>`;
  }
  function placeholderFor(pid) {
    const map = { gita: VV.t("ph_gita"), krishna: VV.t("ph_krishna"), arjuna: VV.t("ph_arjuna") };
    if (map[pid]) return map[pid];
    if (pid === "vedic") return VV.t("ph_all");
    return VV.t("ph_text", { name: VV.personaName(pid) });
  }

  function renderChatLog() {
    const scroll = $("#chat-scroll");
    const sess = VV.activeSession();
    const log = sess.msgs;
    if (!log.length) {
      const pid = sess.persona;
      const sugEn = {
        gita: ["What does the Gita say about doing my duty when the outcome is uncertain?", "How do I quiet a restless mind?", "What happens to the soul at death?"],
        krishna: ["Why must I act at all, if the world is already yours?", "I am afraid of failing. What would you tell me?", "What do you ask of the one who loves you?"],
        arjuna: ["Did the fear ever leave you?", "How did it feel to see the universal form?", "What did you do the morning after the teaching?"]
      };
      const sugHi = {
        gita: ["जब परिणाम अनिश्चित हो, तो कर्तव्य के विषय में गीता क्या कहती है?", "चंचल मन को कैसे शांत करूँ?", "मृत्यु के समय आत्मा का क्या होता है?"],
        krishna: ["यदि संसार आपका ही है, तो मैं कर्म क्यों करूँ?", "मुझे असफलता का भय है। आप मुझसे क्या कहेंगे?", "जो आपसे प्रेम करता है, उससे आप क्या माँगते हैं?"],
        arjuna: ["क्या भय कभी पूरी तरह गया?", "विश्वरूप देखकर कैसा लगा?", "उपदेश के अगले प्रभात आपने क्या किया?"]
      };
      const fallback = VV.isHindi()
        ? ["इस ग्रंथ में आपकी क्या भूमिका थी?", "अपने सबसे कठिन क्षण में आपने क्या सीखा?", "धर्म के विषय में मुझे क्या समझना चाहिए?"]
        : ["What was your part in the story?", "What did you learn in your hardest hour?", "What should I understand about dharma?"];
      const sug = (VV.isHindi() ? sugHi : sugEn)[pid] || fallback;
      scroll.innerHTML = `
        <div class="chat-empty stagger">
          <div class="om" style="--i:0">ॐ</div>
          <h2 style="--i:1">${pid === "gita" ? VV.t("listening_gita") : VV.t("listening", { name: esc(VV.personaName(pid)) })}</h2>
          <p style="--i:2">${VV.t("empty_sub", { tagline: esc(VV.personaTagline(pid)) })}</p>
          <div class="suggests">
            ${sug.map((s, i) => `<button class="suggest glass-r pressable" data-suggest style="--i:${i + 3}">${esc(s)}</button>`).join("")}
          </div>
        </div>`;
      scroll.onclick = e => {
        const b = e.target.closest("[data-suggest]");
        if (b) { $("#chat-input").value = b.textContent.trim(); $("#chat-input").dispatchEvent(new Event("input")); trySend(); }
      };
    } else {
      scroll.innerHTML = log.map(m => m.role === "user" ? userMsgHTML(m.text) : aiMsgHTML(m)).join("");
      scroll.onclick = chatBodyClicks;
      scroll.querySelectorAll("[data-raw]").forEach(el => {
        el.innerHTML = staticBody(decodeURIComponent(el.dataset.raw));
      });
      scroll.scrollTop = scroll.scrollHeight;
    }
  }

  function chatBodyClicks(e) {
    const cite = e.target.closest(".cite-inline, .gcard");
    if (cite && cite.dataset.ref) { openReader(cite.dataset.ref); return; }
    const gt = e.target.closest(".grounding-toggle");
    if (gt) { gt.closest(".grounding").classList.toggle("open"); VV.haptic(5); }
  }

  function userMsgHTML(text) {
    return `<div class="msg msg-user"><div class="bubble">${esc(text)}</div></div>`;
  }
  function aiMsgHTML(m) {
    const p = VV.PERSONAS[m.persona] || VV.PERSONAS.gita;
    return `<div class="msg msg-ai">
      <div class="who"><span class="avatar">${p.avatar}</span><span class="name">${esc(VV.personaName(m.persona || "gita"))}</span></div>
      <div class="body" data-raw="${encodeURIComponent(m.text)}"></div>
      ${m.refs && m.refs.length ? groundingHTML(m.refs) : ""}
    </div>`;
  }

  function groundingHTML(refs) {
    const label = refs.length > 1 ? VV.t("grounded_in_pl", { n: refs.length }) : VV.t("grounded_in", { n: refs.length });
    return `<div class="grounding">
      <button class="grounding-toggle">${label} ${ICONS.down}</button>
      <div class="grounding-body"><div>
        ${refs.map(r => {
          const v = VV.getVerse(r);
          if (!v) return "";
          const t = VV.vtrans(v);
          return `<button class="gcard glass-r pressable" data-ref="${esc(r)}">
            <span class="citation-badge">${esc(VV.citeOf(v))}</span>
            <div class="g-trans">${esc(t.slice(0, 150))}${t.length > 150 ? "…" : ""}</div>
          </button>`;
        }).join("")}
      </div></div>
    </div>`;
  }

  /* ── scenes: curated art immediately; generated image swapped in when available ── */
  function sceneHTML(desc) {
    const d = desc.trim();
    let svg;
    if (/^[a-z]+$/.test(d)) svg = VV.art.sceneKeys.includes(d) ? VV.art.scene(d) : VV.art.sceneForTheme(d);
    else svg = VV.art.scene(VV.art.sceneFromText(d));
    return `<div class="beat-scene" data-desc="${esc(d)}"><div class="scene-art">${svg}</div></div>`;
  }
  function hydrateScene(el) {
    const desc = el.dataset.desc || "";
    if (!VV.ai.canGenerateImages() || /^[a-z]+$/.test(desc.trim())) return; // theme ids → curated art stays
    el.classList.add("generating");
    VV.ai.generateSceneImage(desc).then(url => {
      el.classList.remove("generating");
      if (!url || !el.isConnected) return;
      const img = new Image();
      img.onload = () => {
        img.className = "scene-img";
        el.appendChild(img);
        requestAnimationFrame(() => img.classList.add("in"));
      };
      img.src = url;
    }).catch(() => el.classList.remove("generating"));
  }

  function lineToHTML(text) {
    const parts = text.split(/(\[BG\s*\d+[.:]\d+\])/g);
    let html = "";
    for (const part of parts) {
      const m = part.match(/^\[BG\s*(\d+)[.:](\d+)\]$/);
      if (m) html += `<span class="cite-inline" data-ref="${m[1]}.${m[2]}">BG ${m[1]}.${m[2]}</span> `;
      else if (part) html += esc(part).replace(/\s+/g, " ") + " ";
    }
    return html;
  }
  function quoteHTML(ref) {
    const v = VV.getVerse(ref);
    if (!v) return "";
    const nref = VV.refOf(v);
    const script = v.dev || v.iast || "";
    return `<div class="beat-quote">
      ${script ? `<div class="q-dev">${esc(script)}</div>` : ""}
      <div class="q-tr">${esc(VV.vtrans(v))} <span class="cite-inline" data-ref="${esc(nref)}">${esc(VV.citeOf(v))}</span></div>
    </div>`;
  }
  function staticBody(raw) {
    return raw.split(/\n{2,}/).map(block => {
      block = block.trim();
      if (!block) return "";
      const qm = block.match(/^>>\s*VERSE\s+(\S+)/i);
      if (qm) return quoteHTML(qm[1]);
      const sm = block.match(/^>>\s*SCENE\s+(.+)/is);
      if (sm) return sceneHTML(sm[1].trim());
      return `<p>${lineToHTML(block)}</p>`;
    }).join("");
  }

  /* ── the streamed reveal ── */
  function makeStreamRenderer(bodyEl, scrollEl) {
    let raw = "";
    let done = false;
    let blocks = [];

    function tick() {
      const parts = raw.split(/\n{2,}/).map((text, i, arr) => ({ text, last: i === arr.length - 1 }));
      for (let i = 0; i < parts.length; i++) {
        const { text, last } = parts[i];
        const trimmed = text.trim();
        const qm = trimmed.match(/^>>\s*VERSE\s+([\w:]+[.:]\d+)/i);
        const sm = trimmed.match(/^>>\s*SCENE\s+(.+)/is);
        if (!blocks[i]) {
          const el = document.createElement("p");
          bodyEl.appendChild(el);
          blocks[i] = { el, rendered: 0, special: false };
        }
        const b = blocks[i];
        if ((qm || sm) && (!last || done)) {
          if (!b.special) {
            b.special = true;
            const wrap = document.createElement("div");
            wrap.innerHTML = qm ? quoteHTML(qm[1]) : sceneHTML(sm[1].trim());
            const node = wrap.firstElementChild;
            if (node) {
              node.style.opacity = 0; node.style.transform = "translateY(10px) scale(0.985)";
              b.el.replaceWith(node); b.el = node;
              requestAnimationFrame(() => {
                node.style.transition = "opacity 500ms ease, transform 600ms var(--ease-spring)";
                node.style.opacity = 1; node.style.transform = "none";
              });
              if (sm) hydrateScene(node);
              VV.haptic(4);
            } else b.el.remove();
          }
          continue;
        }
        if (qm || sm || b.special) continue;
        if (trimmed.startsWith(">>") && last && !done) continue; // marker still forming
        const words = trimmed ? trimmed.split(/\s+/) : [];
        let avail = words.length;
        if (!done && last && !/\s$/.test(text)) avail = Math.max(0, avail - 1);
        while (b.rendered < avail) {
          appendWord(b.el, words[b.rendered]);
          b.rendered++;
        }
      }
      scrollEl.scrollTop = scrollEl.scrollHeight;
    }

    function appendWord(el, w) {
      const prev = el.lastElementChild;
      if (prev && prev.dataset.half === "1") {
        const m = w.match(/^(\d+)[.:](\d+)\]([.,;:!?।]*)$/);
        if (m) {
          const span = document.createElement("span");
          span.className = "cite-inline";
          span.dataset.ref = `${m[1]}.${m[2]}`;
          span.textContent = `BG ${m[1]}.${m[2]}`;
          prev.replaceWith(span);
          el.append((m[3] || "") + " ");
          return;
        }
        prev.removeAttribute("data-half");
      }
      const full = w.match(/^\[BG\s*(\d+)[.:](\d+)\]([.,;:!?।]*)$/);
      if (full) {
        const span = document.createElement("span");
        span.className = "cite-inline";
        span.dataset.ref = `${full[1]}.${full[2]}`;
        span.textContent = `BG ${full[1]}.${full[2]}`;
        el.appendChild(span);
        el.append((full[3] || "") + " ");
        return;
      }
      const span = document.createElement("span");
      span.className = "w";
      if (/^\[BG$/i.test(w)) span.dataset.half = "1";
      span.textContent = w;
      el.appendChild(span);
      el.append(" ");
    }

    return {
      push(chunk) { raw += chunk; tick(); },
      finish() { done = true; tick(); return raw; }
    };
  }

  VV.prefillChat = function (text) {
    setTimeout(() => {
      const input = $("#chat-input");
      if (!input) return;
      input.value = text;
      input.dispatchEvent(new Event("input"));
      input.focus();
    }, 380);
  };

  async function trySend() {
    if (chatBusy) return;
    const input = $("#chat-input");
    const text = input.value.trim();
    if (!text) return;
    const sess = VV.activeSession();
    const pid = sess.persona;
    const fidelity = VV.settings.fidelity;
    const scroll = $("#chat-scroll");
    const log = sess.msgs;

    if (!log.length) scroll.innerHTML = "";
    if (!sess.title) sess.title = text.slice(0, 60);
    sess.at = Date.now();

    input.value = "";
    input.style.height = "auto";
    const sendBtn = $("#send-btn");
    chatBusy = true; chatAbort = false;
    sendBtn.disabled = false;
    sendBtn.classList.add("stop");
    sendBtn.innerHTML = ICONS.stop;
    VV.haptic(9);
    VV.setEmberBoost(fidelity === "darshan" ? 10 : 4);

    scroll.insertAdjacentHTML("beforeend", userMsgHTML(text));
    scroll.onclick = chatBodyClicks;
    scroll.scrollTop = scroll.scrollHeight;
    log.push({ role: "user", text });

    const scope = VV.scopeForPersona(pid);
    const refs = VV.ai.groundingFor(text, pid, scope);
    const refIds = refs.map(v => VV.refOf(v));
    const p = VV.PERSONAS[pid];

    scroll.insertAdjacentHTML("beforeend", `
      <div class="msg msg-ai" id="live-msg">
        <div class="who"><span class="avatar">${p.avatar}</span><span class="name">${esc(VV.personaName(pid))}</span></div>
        <div class="body"><span class="thinking"><i></i><i></i><i></i></span></div>
      </div>`);
    scroll.scrollTop = scroll.scrollHeight;

    const liveMsg = $("#live-msg");
    const bodyEl = liveMsg.querySelector(".body");
    let renderer = null;
    let errored = false;

    try {
      const history = log.slice(0, -1).map(m => ({ role: m.role, text: m.text }));
      const gen = VV.ai.ask(text, pid, fidelity, history, refs, scope);
      for await (const chunk of gen) {
        if (chatAbort) break;
        if (!renderer) {
          bodyEl.innerHTML = "";
          renderer = makeStreamRenderer(bodyEl, scroll);
        }
        renderer.push(chunk);
      }
    } catch (err) {
      errored = true;
      bodyEl.innerHTML = `<p style="font-family:var(--font-inter);font-size:13.5px;color:var(--color-clay);line-height:1.55">${esc(err.message || "…")}<br/><span style="color:var(--color-ash-gray)">${VV.t("err_engine")}</span></p>`;
    }

    let finalText = "";
    if (renderer) finalText = renderer.finish();
    if (!errored && !renderer && !chatAbort) {
      bodyEl.innerHTML = `<p style="color:var(--color-ash-gray)">${VV.t("silence")}</p>`;
    }

    if (finalText) {
      liveMsg.insertAdjacentHTML("beforeend", groundingHTML(refIds.slice(0, 4)));
      log.push({ role: "ai", text: finalText, refs: refIds.slice(0, 4), persona: pid });
      VV.saveSessions();
      if (VV.recordPractice()) setTimeout(() => VV.toast(VV.t("sadhana_toast"), true), 600);
    }
    liveMsg.removeAttribute("id");

    chatBusy = false; chatAbort = false;
    VV.setEmberBoost(0);
    sendBtn.classList.remove("stop");
    sendBtn.innerHTML = ICONS.send;
    sendBtn.disabled = !input.value.trim();
    scroll.scrollTop = scroll.scrollHeight;
  }

  /* ── sessions sheet (modern chatbot history) ── */
  function relTime(ts) {
    const d = Date.now() - ts;
    if (d < 90e3) return VV.t("session_now");
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (ts >= +today) return VV.t("session_today");
    if (ts >= +today - 864e5) return VV.t("session_yesterday");
    return new Date(ts).toLocaleDateString(VV.isHindi() ? "hi-IN" : undefined, { month: "short", day: "numeric" });
  }
  function openSessionsSheet() {
    const items = VV.sessions.filter(s => s.msgs.length);
    VV.openSheet(`
      <div class="sheet-title">${VV.t("sessions_title")}</div>
      <div class="session-list">
        ${items.length ? items.map(s => `
          <div class="session-row glass-r pressable" data-session="${s.id}">
            <span class="avatar s-av">${VV.PERSONAS[s.persona]?.avatar || "गी"}</span>
            <span class="s-body">
              <span class="s-title">${esc(s.title || "…")}</span>
              <span class="s-meta">${esc(VV.personaName(s.persona))} · ${relTime(s.at)}</span>
            </span>
            <button class="s-del" data-del="${s.id}" aria-label="${VV.t("delete")}">${ICONS.trash.replace("<svg", '<svg width="14" height="14"')}</button>
          </div>`).join("") : `<div class="empty-note">${VV.t("no_sessions")}</div>`}
      </div>`);
    $("#sheet-content").onclick = e => {
      const del = e.target.closest("[data-del]");
      if (del) {
        const row = del.closest(".session-row");
        row.style.transition = "opacity 220ms ease, transform 260ms var(--ease-spring)";
        row.style.opacity = 0; row.style.transform = "translateX(24px)";
        setTimeout(() => {
          VV.deleteSession(del.dataset.del);
          row.remove();
          if (!VV.sessions.filter(s => s.msgs.length).length) VV.closeSheet();
          renderers.chat();
        }, 240);
        VV.haptic(8);
        return;
      }
      const row = e.target.closest("[data-session]");
      if (row) {
        const s = VV.getSession(row.dataset.session);
        if (s) {
          VV.settings.activeSession = s.id;
          VV.settings.persona = s.persona;
          VV.saveSettings();
          VV.closeSheet();
          renderers.chat();
          VV.haptic(6);
        }
      }
    };
  }

  /* ═══════════ JOURNAL ═══════════ */
  renderers.journal = function () {
    const el = $("#screen-journal");
    const items = VV.journal;
    el.innerHTML = `
      <div class="stagger">
        <div style="--i:0">
          <div class="eyebrow">${VV.t("journal_eyebrow")}</div>
          <h1 class="screen-title">${VV.t("journal")}</h1>
        </div>
        ${items.length ? items.map((j, i) => {
          const v = VV.getVerse(j.ref);
          if (!v) return "";
          const t = VV.vtrans(v);
          const date = new Date(j.at).toLocaleDateString(VV.isHindi() ? "hi-IN" : undefined, { month: "short", day: "numeric" });
          return `<div class="jcard glass-r" style="--i:${i + 1}">
            <div class="j-head">
              <span class="citation-badge">${esc(VV.citeOf(v))}</span>
              <div class="j-actions">
                <button data-act="note" data-ref="${esc(j.ref)}" aria-label="Note">${ICONS.edit}</button>
                <button data-act="open" data-ref="${esc(j.ref)}" aria-label="Open">${ICONS.open}</button>
                <button data-act="remove" data-ref="${esc(j.ref)}" aria-label="Remove">${ICONS.trash}</button>
              </div>
            </div>
            <div class="j-trans">${esc(t.length > 180 ? t.slice(0, 180) + "…" : t)}</div>
            ${j.note ? `<div class="j-note">${esc(j.note)}</div>` : ""}
            <div style="margin-top:10px;font-size:11px;color:var(--color-stone)">${VV.t("saved_on")} ${esc(date)}</div>
          </div>`;
        }).join("") : `
          <div class="empty-note" style="--i:1;padding-top:12vh">
            <div style="font-family:var(--font-devanagari);font-size:34px;color:var(--color-graphite);margin-bottom:14px">॥</div>
            ${VV.t("journal_empty")}
          </div>`}
      </div>`;
    el.onclick = e => {
      const b = e.target.closest("[data-act]");
      if (!b) return;
      const ref = b.dataset.ref;
      if (b.dataset.act === "open") openReader(ref);
      if (b.dataset.act === "remove") { VV.toggleSave(ref); renderers.journal(); VV.toast(VV.t("removed")); VV.haptic(8); }
      if (b.dataset.act === "note") openNoteSheet(ref);
    };
  };

  function openNoteSheet(ref) {
    const j = VV.journal.find(x => x.ref === ref);
    const v = VV.getVerse(ref);
    const t = VV.vtrans(v);
    VV.openSheet(`
      <div class="sheet-title">${VV.t("reflection_on")} <span class="citation-badge" style="margin-left:2px">BG ${esc(ref)}</span></div>
      <div class="verse-trans" style="font-size:14px;color:var(--color-parchment);margin-bottom:16px;line-height:1.6">${esc(t.slice(0, 140))}${t.length > 140 ? "…" : ""}</div>
      <textarea class="sheet-input" id="note-input" placeholder="${esc(VV.t("note_ph"))}">${esc(j?.note || "")}</textarea>
      <div class="sheet-actions">
        <button class="btn-ghost pressable" data-sheet-act="cancel">${VV.t("not_now")}</button>
        <button class="btn-primary pressable" data-sheet-act="save-note">${VV.t("keep_it")}</button>
      </div>`);
    $("#sheet-content").onclick = e => {
      const b = e.target.closest("[data-sheet-act]");
      if (!b) return;
      if (b.dataset.sheetAct === "save-note") {
        VV.setNote(ref, $("#note-input").value.trim());
        renderers.journal();
        VV.toast(VV.t("reflection_kept"), true);
      }
      VV.closeSheet();
    };
  }

  /* ═══════════ PROFILE ═══════════ */
  renderers.profile = function () {
    const el = $("#screen-profile");
    const providerLabel = { none: VV.t("offline_voice"), anthropic: "Claude · Anthropic", gemini: "Gemini · Google" }[VV.settings.provider];
    const scriptLabel = { dev: "देवनागरी", iast: "IAST", en: VV.t("english_only") }[VV.settings.script] || "देवनागरी";
    el.innerHTML = `
      <div class="stagger">
        <div style="--i:0">
          <div class="eyebrow">${VV.t("practitioner")}</div>
          <h1 class="screen-title">Takshak</h1>
        </div>
        <div class="prof-stats" style="--i:1">
          <div class="stat-card glass-r"><div class="n" style="color:var(--color-terracotta)">${VV.streak.count || 0}</div><div class="l">${VV.t("streak")}</div></div>
          <div class="stat-card glass-r"><div class="n">${VV.streak.best || 0}</div><div class="l">${VV.t("best")}</div></div>
          <div class="stat-card glass-r"><div class="n">${VV.journal.length}</div><div class="l">${VV.t("saved")}</div></div>
        </div>

        <div class="eyebrow" style="--i:2;margin-bottom:10px">${VV.t("intelligence")}</div>
        <div class="set-group glass-r" style="--i:3">
          <button class="set-row press-row" data-act="provider">
            <span class="lab">${VV.t("engine")}<small>${VV.settings.apiKey ? VV.t("key_on_device") : VV.t("no_key")}</small></span>
            <span class="val ${VV.settings.apiKey ? "on" : ""}">${providerLabel}</span>
            <span class="chev" style="color:var(--color-stone);width:16px;height:16px">${ICONS.chev}</span>
          </button>
        </div>

        <div class="eyebrow" style="--i:4;margin-bottom:10px">${VV.t("reading")}</div>
        <div class="set-group glass-r" style="--i:5">
          <button class="set-row press-row" data-act="lang">
            <span class="lab">${VV.t("language")}</span>
            <span class="val">${VV.isHindi() ? "हिन्दी" : "English"}</span>
            <span class="chev" style="color:var(--color-stone);width:16px;height:16px">${ICONS.chev}</span>
          </button>
          <button class="set-row press-row" data-act="script">
            <span class="lab">${VV.t("verse_script")}</span>
            <span class="val">${scriptLabel}</span>
            <span class="chev" style="color:var(--color-stone);width:16px;height:16px">${ICONS.chev}</span>
          </button>
          <button class="set-row press-row" data-act="replay">
            <span class="lab">${VV.t("replay_intro")}<small>${VV.t("replay_sub")}</small></span>
            <span class="chev" style="color:var(--color-stone);width:16px;height:16px">${ICONS.chev}</span>
          </button>
          <button class="set-row press-row" data-act="refresh">
            <span class="lab">${VV.t("refresh_corpus")}<small>${VV.t("refresh_sub")}</small></span>
            <span class="chev" style="color:var(--color-stone);width:16px;height:16px">${ICONS.chev}</span>
          </button>
        </div>

        <div class="eyebrow" style="--i:6;margin-bottom:10px">${VV.t("about")}</div>
        <div class="about-note" style="--i:7">
          ${VV.t("about_text", { en: esc(VV.corpus.attribution), hi: esc(VV.corpus.attributionHi) })}
        </div>
      </div>`;
    el.onclick = e => {
      const b = e.target.closest("[data-act]");
      if (!b) return;
      if (b.dataset.act === "provider") openProviderSheet();
      if (b.dataset.act === "script") openScriptSheet();
      if (b.dataset.act === "lang") openLangSheet();
      if (b.dataset.act === "replay") VV.startOnboarding(true);
      if (b.dataset.act === "refresh") {
        VV.clearCorpusCache();
        location.reload();
      }
    };
  };

  function openProviderSheet() {
    const s = VV.settings;
    const choices = [
      { id: "none", t: VV.t("engine_none_t"), s: VV.t("engine_none_s") },
      { id: "anthropic", t: "Claude · Anthropic", s: VV.t("engine_claude_s") },
      { id: "gemini", t: "Gemini · Google", s: VV.t("engine_gemini_s") }
    ];
    VV.openSheet(`
      <div class="sheet-title">${VV.t("engine_sheet")}</div>
      <div class="choice-list">
        ${choices.map(c => `
          <button class="choice ${s.provider === c.id ? "selected" : ""}" data-choice="${c.id}">
            <span class="c-body"><span class="c-t">${c.t}</span><span class="c-s" style="display:block">${c.s}</span></span>
            <span class="c-tick">${ICONS.tick}</span>
          </button>`).join("")}
      </div>
      <div id="key-zone" style="${s.provider === "none" ? "display:none" : ""}">
        <label class="sheet-label">${VV.t("api_key")}</label>
        <input class="sheet-input" id="key-input" type="password" placeholder="${VV.t("paste_key")}" value="${esc(s.apiKey)}" autocomplete="off" spellcheck="false" />
        <label class="sheet-label">${VV.t("model_opt")}</label>
        <input class="sheet-input" id="model-input" placeholder="${s.provider === "gemini" ? "gemini-2.5-flash" : "claude-sonnet-4-5"}" value="${esc(s.model)}" autocomplete="off" spellcheck="false" />
      </div>
      <div class="sheet-actions">
        <button class="btn-primary pressable" data-sheet-act="save">${VV.t("done")}</button>
      </div>`);
    const content = $("#sheet-content");
    let chosen = s.provider;
    content.onclick = e => {
      const c = e.target.closest("[data-choice]");
      if (c) {
        chosen = c.dataset.choice;
        content.querySelectorAll(".choice").forEach(x => x.classList.toggle("selected", x === c));
        $("#key-zone").style.display = chosen === "none" ? "none" : "";
        $("#model-input").placeholder = chosen === "gemini" ? "gemini-2.5-flash" : "claude-sonnet-4-5";
        VV.haptic(6);
        return;
      }
      const b = e.target.closest("[data-sheet-act='save']");
      if (b) {
        s.provider = chosen;
        s.apiKey = chosen === "none" ? "" : $("#key-input").value.trim();
        s.model = chosen === "none" ? "" : $("#model-input").value.trim();
        VV.saveSettings();
        renderers.profile();
        VV.closeSheet();
        VV.toast(s.apiKey ? VV.t("engine_connected") : VV.t("using_offline"), true);
      }
    };
  }

  function openScriptSheet() {
    const opts = [
      { id: "dev", t: "Devanagari", s: VV.t("script_dev_s") },
      { id: "iast", t: "IAST", s: VV.t("script_iast_s") },
      { id: "en", t: VV.t("english_only"), s: VV.t("script_en_s") }
    ];
    VV.openSheet(`
      <div class="sheet-title">${VV.t("script_sheet")}</div>
      <div class="choice-list">
        ${opts.map(o => `
          <button class="choice ${VV.settings.script === o.id ? "selected" : ""}" data-choice="${o.id}">
            <span class="c-body"><span class="c-t">${o.t}</span><span class="c-s" style="display:block">${o.s}</span></span>
            <span class="c-tick">${ICONS.tick}</span>
          </button>`).join("")}
      </div>`);
    $("#sheet-content").onclick = e => {
      const c = e.target.closest("[data-choice]");
      if (!c) return;
      VV.settings.script = c.dataset.choice;
      VV.saveSettings();
      renderers.profile();
      VV.closeSheet();
      VV.haptic(6);
    };
  }

  function openLangSheet() {
    const opts = [
      { id: "en", t: "English", s: VV.t("lang_en_s") },
      { id: "hi", t: "हिन्दी", s: VV.t("lang_hi_s") }
    ];
    VV.openSheet(`
      <div class="sheet-title">${VV.t("lang_sheet")}</div>
      <div class="choice-list">
        ${opts.map(o => `
          <button class="choice ${VV.settings.lang === o.id ? "selected" : ""}" data-choice="${o.id}">
            <span class="c-body"><span class="c-t">${o.t}</span><span class="c-s" style="display:block">${o.s}</span></span>
            <span class="c-tick">${ICONS.tick}</span>
          </button>`).join("")}
      </div>`);
    $("#sheet-content").onclick = e => {
      const c = e.target.closest("[data-choice]");
      if (!c) return;
      VV.setLanguage(c.dataset.choice);
      VV.closeSheet();
      VV.haptic(6);
    };
  }

  VV.setLanguage = function (lang) {
    VV.settings.lang = lang;
    VV.saveSettings();
    VV.syncTabbar();
    VV.switchTab(currentTab, true);
  };

  VV.renderers = renderers;
})();
