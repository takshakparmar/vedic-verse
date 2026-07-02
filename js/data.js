/* ═══ Vedic Verse — corpus: chapters (embedded), verses + translation (fetched once, cached) ═══
   Data source: gita/gita open dataset (Unlicense), mirrored at ravisiyer.github.io/gita-data.
   English translation: Swami Sivananda (author_id 16 in the dataset).
   NOTE for shipping: swap to a verified public-domain translation (Telang 1882 / Besant 1905). */
(function () {
  const VV = (window.VV = window.VV || {});

  VV.CHAPTERS = [
    { n: 1,  dev: "अर्जुनविषादयोग", en: "Arjuna Visada Yoga", meaning: "Arjuna's Dilemma", iast: "Arjun Viṣhād Yog", count: 47, summary: "As both armies stand ready, Arjuna is overcome by grief at the sight of his own kin arrayed for war, and surrenders to Krishna seeking a way through his despair." },
    { n: 2,  dev: "सांख्ययोग", en: "Sankhya Yoga", meaning: "Transcendental Knowledge", iast: "Sānkhya Yog", count: 72, summary: "The essence of the whole Gita: the immortality of the Self, the discipline of selfless action, and the portrait of one whose mind is steady and serene." },
    { n: 3,  dev: "कर्मयोग", en: "Karma Yoga", meaning: "Path of Selfless Service", iast: "Karm Yog", count: 43, summary: "Krishna teaches that action is unavoidable and shows which actions bind and which liberate — duty performed without attachment to its fruits." },
    { n: 4,  dev: "ज्ञानकर्मसंन्यासयोग", en: "Jnana Karma Sanyasa Yoga", meaning: "Knowledge and the Disciplines of Action", iast: "Jñāna Karm Sanyās Yog", count: 42, summary: "Krishna reveals why he appears age after age, and how transcendental knowledge burns the bonds of action." },
    { n: 5,  dev: "कर्मसंन्यासयोग", en: "Karma Sanyasa Yoga", meaning: "Path of Renunciation", iast: "Karm Sanyās Yog", count: 29, summary: "Renunciation of action and action with detachment both lead to the goal; the wise act with dedication, unstained by sin." },
    { n: 6,  dev: "ध्यानयोग", en: "Dhyana Yoga", meaning: "Path of Meditation", iast: "Dhyān Yog", count: 47, summary: "How to practise meditation: preparing the mind, conquering its restlessness, and uniting the self with the Self." },
    { n: 7,  dev: "ज्ञानविज्ञानयोग", en: "Gyaan Vigyana Yoga", meaning: "Self-Knowledge and Enlightenment", iast: "Jñāna Vijñāna Yog", count: 30, summary: "Krishna as the Supreme Truth, the cause and sustaining force of all; the veil of Maya and those who cross beyond it." },
    { n: 8,  dev: "अक्षरब्रह्मयोग", en: "Akshara Brahma Yoga", meaning: "Path of the Eternal God", iast: "Akṣhar Brahma Yog", count: 28, summary: "The importance of the final thought, constant remembrance, and the path beyond material existence to the supreme abode." },
    { n: 9,  dev: "राजविद्याराजगुह्ययोग", en: "Raja Vidya Yoga", meaning: "The King of Sciences", iast: "Rāja Vidyā Yog", count: 34, summary: "The most confidential knowledge: devotion as the direct path, and the Lord as creator, maintainer and shelter of all beings." },
    { n: 10, dev: "विभूतियोग", en: "Vibhooti Yoga", meaning: "The Infinite Glories of God", iast: "Vibhūti Yog", count: 42, summary: "Krishna describes his divine manifestations — the cause of all causes — and Arjuna asks to hear more of the nectar of his glories." },
    { n: 11, dev: "विश्वरूपदर्शनयोग", en: "Vishwaroopa Darshana Yoga", meaning: "Beholding the Cosmic Form", iast: "Viśhwarūp Darśhan Yog", count: 55, summary: "Granted divine vision, Arjuna beholds the universal form — all worlds and beings contained in the body of the Lord." },
    { n: 12, dev: "भक्तियोग", en: "Bhakti Yoga", meaning: "The Yoga of Devotion", iast: "Bhakti Yog", count: 20, summary: "The superiority of the path of devotion, and the qualities of the devotees who are dear to the Lord." },
    { n: 13, dev: "क्षेत्र-क्षेत्रज्ञविभागयोग", en: "Ksetra Ksetrajna Vibhaaga Yoga", meaning: "The Field and its Knower", iast: "Kṣhetra Kṣhetrajña Vibhāg Yog", count: 35, summary: "The body as the field, the soul as its knower; discriminating between the perishable body, the eternal soul, and the Supreme." },
    { n: 14, dev: "गुणत्रयविभागयोग", en: "Gunatraya Vibhaga Yoga", meaning: "The Three Modes of Nature", iast: "Guṇa Traya Vibhāg Yog", count: 27, summary: "Goodness, passion and ignorance — the three gunas that bind all beings — and how devotion carries one beyond them." },
    { n: 15, dev: "पुरुषोत्तमयोग", en: "Purushottama Yoga", meaning: "The Supreme Divine Personality", iast: "Puruṣhottam Yog", count: 20, summary: "The imperishable banyan of existence, and knowledge of the Supreme Person that frees one from the bondage of the world." },
    { n: 16, dev: "दैवासुरसम्पद्विभागयोग", en: "Daivasura Sampad Vibhaga Yoga", meaning: "The Divine and Demoniac Natures", iast: "Daivāsura Sampad Vibhāg Yog", count: 24, summary: "The two natures among human beings — divine and demoniac — and the destinies to which each leads." },
    { n: 17, dev: "श्रद्धात्रयविभागयोग", en: "Sraddhatraya Vibhaga Yoga", meaning: "The Three Divisions of Faith", iast: "Śhraddhā Traya Vibhāg Yog", count: 28, summary: "The three kinds of faith, food, sacrifice, austerity and charity, corresponding to the three modes of nature." },
    { n: 18, dev: "मोक्षसंन्यासयोग", en: "Moksha Sanyaas Yoga", meaning: "Renunciation and Surrender", iast: "Mokṣha Sanyās Yog", count: 78, summary: "Renunciation and relinquishment distinguished, the summary of all paths, and the final word: take refuge in the Lord alone." }
  ];

  // landmark verses for the daily rotation (references only — text comes from the corpus)
  VV.DAILY_REFS = ["2.47","2.14","2.20","2.62","2.63","2.71","3.19","3.35","4.7","4.8","4.38","5.10","6.5","6.6","6.19","6.26","6.35","8.7","9.22","9.26","10.20","11.55","12.13","12.15","13.28","14.22","15.7","16.1","17.20","18.46","18.63","18.66"];

  const SOURCES = {
    verses: [
      "https://ravisiyer.github.io/gita-data/v1/verse.json",
      "https://cdn.jsdelivr.net/gh/gita/gita@main/data/verse.json"
    ],
    translations: [
      "https://ravisiyer.github.io/gita-data/v1/translation.json",
      "https://cdn.jsdelivr.net/gh/gita/gita@main/data/translation.json"
    ]
  };
  const ENGLISH_AUTHOR_IDS = [16, 19, 18, 20, 21]; // Sivananda first, then other English voices
  const HINDI_AUTHOR_IDS = [1, 2];                 // Ramsukhdas first, then Chinmayananda
  const AUTHOR_NAMES = { 1: "Swami Ramsukhdas", 2: "Swami Chinmayananda", 16: "Swami Sivananda", 18: "Swami Adidevananda", 19: "Swami Gambirananda", 20: "Dr. S. Sankaranarayan", 21: "Shri Purohit Swami" };
  const CACHE_KEY = "vv.corpus.v3";

  VV.corpus = { ready: false, verses: [], byRef: new Map(), index: null, attribution: "Swami Sivananda", attributionHi: "Swami Ramsukhdas", textId: "gita" };

  /* ═══ text registry — the Gita loads live; the rest are bundled curated corpora ═══ */
  VV.TEXTS = {
    gita:        { id: "gita",        abbr: "BG",   cat: "epics",   source: "remote",  en: "Bhagavad Gītā",  dev: "श्रीमद्भगवद्गीता", author: "Vyāsa",  unit: "Chapter" },
    ramayana:    { id: "ramayana",    abbr: "Rām",  cat: "epics",   source: "bundled", en: "The Ramayana",   dev: "रामायणम्",        author: "Vālmīki", unit: "Kāṇḍa" },
    mahabharata: { id: "mahabharata", abbr: "Mbh",  cat: "epics",   source: "bundled", en: "The Mahabharata", dev: "महाभारतम्",       author: "Vyāsa",   unit: "Parva" },
    vedas:       { id: "vedas",       abbr: "Veda", cat: "vedic",   source: "bundled", en: "The Four Vedas", dev: "वेदाः",           author: "Śruti",   unit: "Veda" },
    upanishads:  { id: "upanishads",  abbr: "Up",   cat: "vedic",   source: "bundled", en: "The Upanishads", dev: "उपनिषद्",         author: "Śruti",   unit: "Text" },
    puranas:     { id: "puranas",     abbr: "Pur",  cat: "purana",  source: "bundled", en: "The Puranas",    dev: "पुराणानि",        author: "Vyāsa",   unit: "Purāṇa" },
    yoga:        { id: "yoga",        abbr: "Yog",  cat: "darshana", source: "bundled", en: "Yoga Sūtras & Dharma", dev: "योगसूत्राणि", author: "Patañjali", unit: "Pāda" }
  };
  VV.TEXT_ORDER = ["gita", "ramayana", "mahabharata", "vedas", "upanishads", "puranas", "yoga"];

  /* every text's corpus lives here, keyed by id; gita is the live one */
  VV.corpora = { gita: VV.corpus };

  const corpusOf = v => (v && VV.corpora[v.text || v.textId || "gita"]) || VV.corpus;
  VV.corpusFor = id => VV.corpora[id] || null;
  VV.sectionsFor = id => (id === "gita" ? VV.CHAPTERS : (VV.CORPORA[id] && VV.CORPORA[id].sections) || []);
  VV.textReady = id => !!(VV.corpora[id] && VV.corpora[id].ready);

  /* namespaced ref helpers — gita stays bare ("2.47") for back-compat; others are "id:ch.v" */
  VV.refOf = v => (!v.text || v.text === "gita") ? `${v.ch}.${v.v}` : `${v.text}:${v.ch}.${v.v}`;
  VV.parseRef = function (ref) {
    if (!ref) return null;
    let textId = "gita", body = String(ref);
    const c = body.indexOf(":");
    if (c > -1) { textId = body.slice(0, c); body = body.slice(c + 1); }
    const m = body.match(/^(\d+)[.:](\d+)$/);
    if (!m) return null;
    return { textId, ch: +m[1], v: +m[2] };
  };
  /* citation abbreviation for a ref (used by chat rendering) */
  VV.abbrFor = id => (VV.TEXTS[id] && VV.TEXTS[id].abbr) || "BG";
  /* human-facing citation label for a verse: authentic `cite` if present, else abbr ch.v */
  VV.citeOf = function (v) {
    if (!v) return "";
    if (v.cite) return v.cite;
    return `${VV.abbrFor(v.text || "gita")} ${v.ch}.${v.v}`;
  };

  async function fetchFirst(urls, onStatus) {
    let lastErr;
    for (const url of urls) {
      try {
        const res = await fetch(url, { mode: "cors" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        return await res.json();
      } catch (e) { lastErr = e; if (onStatus) onStatus("Trying another source…"); }
    }
    throw lastErr || new Error("No source reachable");
  }

  function isMostlyLatin(s) {
    if (!s) return false;
    let latin = 0, other = 0;
    for (let i = 0; i < Math.min(s.length, 120); i++) {
      const c = s.charCodeAt(i);
      if (c < 0x250) latin++; else other++;
    }
    return latin > other * 3;
  }
  const hasDevanagari = s => /[ऀ-ॿ]/.test(s || "");

  function cleanTranslation(t) {
    if (!t) return "";
    return t.replace(/^\s*[\d१२३४५६७८९०]+[.।][\d१२३४५६७८९०]+[\s.:।—-]*\s*/, "").replace(/\s+/g, " ").trim();
  }

  function buildCorpus(rawVerses, rawTrans) {
    // verse records — defensive field mapping
    const verses = rawVerses.map(v => ({
      id: v.id,
      ch: v.chapter_number ?? v.chapter_id,
      v: v.verse_number ?? v.verse_order,
      dev: (v.text || "").trim(),
      iast: (v.transliteration || "").trim(),
      trans: "", author: "", hi: "", hiAuthor: ""
    })).filter(v => v.ch && v.v && v.dev);

    const byId = new Map(verses.map(v => [v.id, v]));

    // translations: best English + best Hindi per verse
    const pickEn = new Map(), pickHi = new Map(); // verse_id -> {rank, text, author}
    for (const t of rawTrans) {
      const vid = t.verse_id ?? t.verseNumber ?? t.verse;
      const aid = t.author_id ?? t.authorId;
      const desc = t.description || t.text || "";
      if (!vid || !desc) continue;
      let rank = ENGLISH_AUTHOR_IDS.indexOf(aid);
      if (rank !== -1 || isMostlyLatin(desc)) {
        if (rank === -1) rank = 50;
        const cur = pickEn.get(vid);
        if (!cur || rank < cur.rank) pickEn.set(vid, { rank, text: cleanTranslation(desc), author: AUTHOR_NAMES[aid] || t.author_name || t.authorName || "" });
        continue;
      }
      let hrank = HINDI_AUTHOR_IDS.indexOf(aid);
      if (hrank !== -1 || hasDevanagari(desc)) {
        if (hrank === -1) hrank = 50;
        const cur = pickHi.get(vid);
        if (!cur || hrank < cur.rank) pickHi.set(vid, { rank: hrank, text: cleanTranslation(desc), author: AUTHOR_NAMES[aid] || t.author_name || t.authorName || "" });
      }
    }
    let attrib = null, attribHi = null;
    for (const [vid, p] of pickEn) {
      const v = byId.get(vid);
      if (v) { v.trans = p.text; v.author = p.author; if (!attrib && p.author) attrib = p.author; }
    }
    for (const [vid, p] of pickHi) {
      const v = byId.get(vid);
      if (v) { v.hi = p.text; v.hiAuthor = p.author; if (!attribHi && p.author) attribHi = p.author; }
    }
    verses.sort((a, b) => a.ch - b.ch || a.v - b.v);
    return { verses, attribution: attrib || "the dataset's English rendering", attributionHi: attribHi || "the dataset's Hindi rendering" };
  }

  function hydrate(data) {
    VV.corpus.verses = data.verses;
    VV.corpus.attribution = data.attribution;
    VV.corpus.attributionHi = data.attributionHi || VV.corpus.attributionHi;
    for (const v of data.verses) v.text = "gita";
    VV.corpus.byRef = new Map(data.verses.map(v => [v.ch + "." + v.v, v]));
    VV.corpus.index = buildIndex(data.verses);
    VV.corpus.ready = true;
    buildBundled();
  }

  /* build the in-memory corpora for the bundled texts (cheap, synchronous) */
  function buildBundled() {
    if (!VV.CORPORA) return;
    for (const id of Object.keys(VV.CORPORA)) {
      if (VV.corpora[id] && VV.corpora[id].ready) continue;
      // a malformed entry in one text must never leave the others unbuilt
      try {
        const src = VV.CORPORA[id];
        if (!src || !Array.isArray(src.verses)) continue;
        const verses = src.verses.map(v => Object.assign({
          dev: "", iast: "", trans: "", hi: "", hiAuthor: "", author: "public-domain rendering"
        }, v, { text: id }));
        const corpus = {
          ready: true, textId: id, verses,
          byRef: new Map(verses.map(v => [v.ch + "." + v.v, v])),
          index: buildIndex(verses),
          attribution: "public-domain rendering", attributionHi: "public-domain rendering"
        };
        VV.corpora[id] = corpus;
      } catch (e) { console.warn("buildBundled: skipped", id, e); }
    }
  }

  /* language-aware verse translation */
  VV.vtrans = v => (VV.settings && VV.settings.lang === "hi" && v.hi) ? v.hi : v.trans;
  VV.vauthor = v => (VV.settings && VV.settings.lang === "hi" && v.hi) ? (v.hiAuthor || corpusOf(v).attributionHi) : (v.author || corpusOf(v).attribution);

  VV.loadCorpus = async function (onProgress) {
    const t = k => (VV.t ? VV.t(k) : k);
    try { localStorage.removeItem("vv.corpus.v1"); localStorage.removeItem("vv.corpus.v2"); } catch (e) {}
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        hydrate(JSON.parse(cached));
        onProgress && onProgress(1, t("from_library"));
        return true;
      }
    } catch (e) { /* fall through to network */ }

    onProgress && onProgress(0.08, t("archive_reach"));
    const rawVerses = await fetchFirst(SOURCES.verses, s => onProgress && onProgress(0.15, s));
    onProgress && onProgress(0.45, t("verses_received"));
    const rawTrans = await fetchFirst(SOURCES.translations, s => onProgress && onProgress(0.5, s));
    onProgress && onProgress(0.85, t("aligning"));
    const data = buildCorpus(rawVerses, rawTrans);
    hydrate(data);
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) { /* storage full — stay in memory */ }
    onProgress && onProgress(1, t("corpus_ready"));
    return true;
  };

  VV.clearCorpusCache = function () { try { localStorage.removeItem(CACHE_KEY); } catch (e) {} };

  /* ─── daily verse ─── */
  VV.dailyRef = function (offset = 0) {
    const days = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
    return VV.DAILY_REFS[(days + offset) % VV.DAILY_REFS.length];
  };
  VV.getVerse = function (ref) {
    const p = VV.parseRef(ref);
    if (!p) return null;
    const corpus = VV.corpora[p.textId];
    return (corpus && corpus.byRef.get(p.ch + "." + p.v)) || null;
  };
  /* verses of a section; back-compat: chapterVerses(n) → gita chapter n */
  VV.chapterVerses = function (textId, ch) {
    if (ch === undefined) { ch = textId; textId = "gita"; }
    const corpus = VV.corpora[textId];
    return corpus ? corpus.verses.filter(v => v.ch === ch) : [];
  };

  /* ─── lightweight lexical retrieval (grounding) ─── */
  const STOP = new Set("the a an and or of to in is are was were be been i you he she it we they my your his her its this that these those with for on at by from as not no do does did what who whom which when where why how shall will would should can could o thou thy thee me am".split(" "));
  const SYN = {
    duty: ["duty", "action", "work", "karma", "perform", "prescribed"],
    work: ["work", "action", "duty", "karma"],
    fear: ["fear", "afraid", "anxiety", "tremble", "dread"],
    anxiety: ["anxiety", "fear", "grief", "worry", "distress"],
    grief: ["grief", "grieve", "sorrow", "lament", "mourn"],
    sad: ["sorrow", "grief", "despond", "deject"],
    death: ["death", "dies", "slain", "perish", "body", "eternal"],
    anger: ["anger", "wrath", "desire", "attachment"],
    desire: ["desire", "craving", "attachment", "senses", "lust"],
    attachment: ["attachment", "attached", "fruits", "desire"],
    peace: ["peace", "serenity", "tranquil", "steady", "calm"],
    mind: ["mind", "restless", "control", "senses", "steady"],
    meditation: ["meditation", "yoga", "meditate", "concentrat", "abstraction"],
    love: ["devotion", "devotee", "worship", "dear", "bhakti", "love"],
    devotion: ["devotion", "devotee", "worship", "faith", "dear"],
    purpose: ["duty", "action", "goal", "supreme", "path"],
    soul: ["soul", "self", "eternal", "unborn", "imperishable"],
    god: ["me", "lord", "supreme", "divine", "refuge", "worship"],
    surrender: ["refuge", "surrender", "abandon", "grace"],
    knowledge: ["knowledge", "wisdom", "know", "learned", "sage"],
    happiness: ["happiness", "joy", "bliss", "content", "delight"],
    failure: ["failure", "success", "even", "equanimity", "loss"],
    doubt: ["doubt", "doubting", "knowledge", "faith"],
    war: ["battle", "fight", "warrior", "kshatriya", "war"],
    family: ["kinsmen", "family", "relatives", "sons"],
    food: ["food", "eat", "sacrifice", "offering"],
    habit: ["practice", "abhyasa", "perseverance", "steady"],
    practice: ["practice", "abhyasa", "constant", "discipline"]
  };
  const SYN_HI = {
    "कर्तव्य": ["duty"], "कर्म": ["duty", "work"], "भय": ["fear"], "डर": ["fear"], "दुख": ["grief"], "दुःख": ["grief"], "शोक": ["grief"],
    "मृत्यु": ["death"], "आत्मा": ["soul"], "मन": ["mind"], "शांति": ["peace"], "शान्ति": ["peace"], "क्रोध": ["anger"],
    "इच्छा": ["desire"], "मोह": ["attachment"], "आसक्ति": ["attachment"], "ध्यान": ["meditation"], "योग": ["meditation"],
    "भक्ति": ["devotion"], "प्रेम": ["love"], "ज्ञान": ["knowledge"], "सुख": ["happiness"], "असफलता": ["failure"],
    "संदेह": ["doubt"], "युद्ध": ["war"], "परिवार": ["family"], "अभ्यास": ["practice"], "उद्देश्य": ["purpose"], "समर्पण": ["surrender"], "ईश्वर": ["god"], "भगवान": ["god"]
  };
  /* expand a Devanagari query with its English concept-words (used by retrieval + theme detection) */
  VV.expandHindi = function (query) {
    if (!/[ऀ-ॿ]/.test(query)) return query;
    const extra = [];
    for (const [hw, ens] of Object.entries(SYN_HI)) if (query.includes(hw)) extra.push(...ens);
    return (query + " " + extra.join(" ")).trim();
  };

  function tokenize(s) {
    return (s || "").toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));
  }
  /* build a stem → verses index for one set of verses (translation words + theme tags + book) */
  function buildIndex(verses) {
    const index = new Map();
    for (const v of verses) {
      const words = tokenize(v.trans + " " + (v.book || "") + " " + (v.themes ? v.themes.join(" ") : ""));
      const seen = new Set();
      for (const w of words) {
        const stem = w.slice(0, 6);
        if (seen.has(stem)) continue;
        seen.add(stem);
        if (!index.has(stem)) index.set(stem, []);
        index.get(stem).push(v);
      }
    }
    return index;
  }

  /* which corpora a scope covers: a text id, or "all" for every ready corpus */
  function scopeCorpora(scope) {
    if (!scope || scope === "all") return VV.TEXT_ORDER.map(id => VV.corpora[id]).filter(c => c && c.ready);
    const c = VV.corpora[scope];
    return c && c.ready ? [c] : [];
  }

  /* lexical retrieval, scoped to one text or across all (scope = textId | "all") */
  VV.retrieve = function (query, k = 6, scope = "gita") {
    const corpora = scopeCorpora(scope);
    if (!corpora.length) return [];
    if (/[ऀ-ॿ]/.test(query)) {
      query = VV.expandHindi(query).replace(/[ऀ-ॿ।]+/g, " ").trim();
      if (!query) return [];
    }
    const words = tokenize(query);
    const expanded = new Set(words);
    for (const w of words) if (SYN[w]) SYN[w].forEach(s => expanded.add(s));
    const scores = new Map();
    for (const corpus of corpora) {
      const N = corpus.verses.length || 1;
      for (const w of expanded) {
        const stem = w.slice(0, 6);
        const hits = corpus.index && corpus.index.get(stem);
        if (!hits) continue;
        const idf = Math.log(1 + N / hits.length);
        const boost = words.includes(w) ? 1.6 : 1.0;
        for (const v of hits) scores.set(v, (scores.get(v) || 0) + idf * boost);
      }
    }
    return [...scores.entries()].sort((a, b) => b[1] - a[1]).slice(0, k).map(e => e[0]);
  };

  /* Build the offline bundled canon eagerly, once at load — it lives entirely in
     js/corpora.js and must never depend on the Gita's remote fetch succeeding. This
     runs after STOP/buildIndex are initialized; hydrate() calls buildBundled() again
     but skips texts already built. Effect: the wider texts (Ramayana … Yoga) and the
     offline voice are ready even if the Gita fetch is slow, flaky, or unreachable. */
  buildBundled();
})();
