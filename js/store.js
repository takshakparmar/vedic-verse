/* ═══ Vedic Verse — local state: settings, streak (sadhana), journal, recents ═══ */
(function () {
  const VV = window.VV;

  function load(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  const listeners = {};
  VV.on = (evt, fn) => { (listeners[evt] = listeners[evt] || []).push(fn); };
  VV.emit = (evt, data) => { (listeners[evt] || []).forEach(fn => fn(data)); };

  /* settings */
  VV.settings = Object.assign({
    script: "dev",              // dev | iast | en  (verse display preference)
    lang: "en",                 // en | hi  (app + translation language)
    provider: "none",           // none | anthropic | gemini
    apiKey: "",
    model: "",
    fidelity: "dialogue",       // whisper | dialogue | darshan
    persona: "gita",
    onboarded: false,
    activeSession: null
  }, load("vv.settings", {}));
  VV.saveSettings = () => { save("vv.settings", VV.settings); VV.emit("settings"); };

  /* streak — framed as daily practice, gentle, never punitive */
  const todayKey = () => new Date().toISOString().slice(0, 10);
  VV.streak = Object.assign({ count: 0, last: null, best: 0, total: 0 }, load("vv.streak", {}));
  VV.practiceDoneToday = () => VV.streak.last === todayKey();
  VV.recordPractice = function () {
    const today = todayKey();
    if (VV.streak.last === today) return false;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    VV.streak.count = VV.streak.last === yesterday ? VV.streak.count + 1 : 1;
    VV.streak.last = today;
    VV.streak.best = Math.max(VV.streak.best || 0, VV.streak.count);
    VV.streak.total = (VV.streak.total || 0) + 1;
    save("vv.streak", VV.streak);
    VV.emit("practice");
    return true;
  };

  /* journal — bookmarked verses with optional reflection notes */
  VV.journal = load("vv.journal", []); // [{ref, note, at}]
  VV.isSaved = ref => VV.journal.some(j => j.ref === ref);
  VV.toggleSave = function (ref) {
    const i = VV.journal.findIndex(j => j.ref === ref);
    let added;
    if (i >= 0) { VV.journal.splice(i, 1); added = false; }
    else { VV.journal.unshift({ ref, note: "", at: Date.now() }); added = true; }
    save("vv.journal", VV.journal);
    VV.emit("journal");
    return added;
  };
  VV.setNote = function (ref, note) {
    const j = VV.journal.find(j => j.ref === ref);
    if (j) { j.note = note; save("vv.journal", VV.journal); VV.emit("journal"); }
  };

  /* recently read */
  VV.recent = load("vv.recent", []); // [ref]
  VV.touchRecent = function (ref) {
    VV.recent = [ref, ...VV.recent.filter(r => r !== ref)].slice(0, 8);
    save("vv.recent", VV.recent);
  };

  /* ─── chat sessions (modern chatbot paradigm: resumable conversations) ─── */
  VV.sessions = load("vv.sessions", []); // [{id, persona, title, msgs:[{role,text,refs,persona}], at}]

  // migrate v1 per-persona chats into sessions
  (function migrate() {
    const old = load("vv.chats", null);
    if (!old) return;
    for (const [pid, msgs] of Object.entries(old)) {
      if (Array.isArray(msgs) && msgs.length) {
        const first = msgs.find(m => m.role === "user");
        VV.sessions.push({
          id: "s" + Date.now() + Math.random().toString(36).slice(2, 6),
          persona: pid, msgs,
          title: first ? first.text.slice(0, 60) : "…",
          at: Date.now()
        });
      }
    }
    try { localStorage.removeItem("vv.chats"); } catch (e) {}
    save("vv.sessions", VV.sessions);
  })();

  VV.saveSessions = () => {
    VV.sessions.sort((a, b) => b.at - a.at);
    // keep the most recent 40 sessions, 60 messages each
    VV.sessions = VV.sessions.slice(0, 40);
    for (const s of VV.sessions) s.msgs = s.msgs.slice(-60);
    save("vv.sessions", VV.sessions);
  };
  VV.newSession = function (persona) {
    const s = {
      id: "s" + Date.now() + Math.random().toString(36).slice(2, 6),
      persona: persona || VV.settings.persona,
      title: "", msgs: [], at: Date.now()
    };
    VV.sessions.unshift(s);
    VV.settings.activeSession = s.id;
    VV.settings.persona = s.persona;
    VV.saveSettings();
    return s;
  };
  VV.getSession = id => VV.sessions.find(s => s.id === id) || null;
  VV.activeSession = function () {
    let s = VV.getSession(VV.settings.activeSession);
    if (!s) s = VV.sessions[0] || null; // resume the most recent conversation
    if (!s) s = VV.newSession(VV.settings.persona);
    if (VV.settings.activeSession !== s.id) { VV.settings.activeSession = s.id; VV.settings.persona = s.persona; VV.saveSettings(); }
    return s;
  };
  VV.deleteSession = function (id) {
    VV.sessions = VV.sessions.filter(s => s.id !== id);
    if (VV.settings.activeSession === id) VV.settings.activeSession = null;
    VV.saveSessions(); VV.saveSettings();
  };
})();
