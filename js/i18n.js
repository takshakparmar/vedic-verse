/* ═══ Vedic Verse — bilingual chrome: English / हिन्दी ═══ */
(function () {
  const VV = window.VV;

  const STRINGS = {
    en: {
      // tabs
      tab_home: "Home", tab_library: "Library", tab_chat: "Converse", tab_journal: "Journal", tab_profile: "Profile",
      // home
      todays_practice: "[ Today's practice ]",
      greet_dawn: "A quiet hour", greet_morning: "Good morning", greet_afternoon: "Good afternoon", greet_evening: "Good evening",
      verse_of_day: "Verse of the day",
      read_todays: "Read today's verse",
      daily_sadhana: "Daily sādhana",
      practice_done: "Practice complete for today",
      practice_hint: "Read today's verse, or sit with the text in conversation.",
      day: "day", days: "days",
      recently_read: "[ Recently read ]",
      recent_empty: "Verses you read will gather here,<br/>like a path worn smooth by walking.",
      library_link: "Library",
      // library
      the_library: "[ The library ]", texts: "Texts",
      gita_sub: "The Song of the Lord",
      gita_meta: "18 chapters · 700 verses · a dialogue on the field of dharma between Krishna and Arjuna, at the still point before a war.",
      complete: "Complete", coming_soon: "Coming soon",
      ramayana_en: "The Ramayana", ramayana_meta: "Seven kandas · the life of Rama",
      mahabharata_en: "The Mahabharata", mahabharata_meta: "Eighteen parvas · the great epic",
      vedas_en: "The Four Vedas", vedas_meta: "Rig · Sama · Yajur · Atharva",
      upanishads_en: "The Upanishads", upanishads_meta: "The teaching beneath the tree",
      puranas_en: "The Puranas", puranas_meta: "The ancient stories",
      chip_all: "All", chip_epics: "Epics", chip_vedic: "Vedic", chip_purana: "Purana",
      by_author: "by",
      chapter: "Chapter", verses_n: "verses",
      // reader
      sit_with_verse: "Sit with this verse", copy: "Copy", translation_by: "translation",
      previous: "Previous", next: "Next",
      first_verse: "This is the first verse", final_verse: "That is the final verse",
      verse_copied: "Verse copied", copy_failed: "Couldn't copy",
      verse_not_loaded: "That verse isn't loaded yet",
      // chat
      the_conversation: "[ The conversation ]",
      new_chat: "New", history: "History",
      grounding_note_gita: "Answers are grounded in retrieved verses and cited. The text speaks; nothing is invented.",
      grounding_note_persona: "A voice drawn from the text — not the deity. Grounded in the verses, cited, and honest about its limits.",
      offline_note: "Offline voice — grounded in the corpus. Add a key in Profile for open conversation.",
      ph_gita: "Ask the Gita anything…", ph_krishna: "Speak with the voice of Krishna…", ph_arjuna: "Ask a fellow seeker…",
      listening_gita: "The text is listening.", listening: "{name} is listening.",
      empty_sub: "{tagline} · every answer cites the verses it stands on.",
      grounded_in: "Grounded in {n} verse", grounded_in_pl: "Grounded in {n} verses",
      sessions_title: "Conversations",
      session_now: "now", session_today: "today", session_yesterday: "yesterday",
      no_sessions: "No conversations yet.",
      delete: "Delete",
      err_engine: "Check your key in Profile → Intelligence, or switch to the offline voice.",
      silence: "…silence. Try once more.",
      darshan_hint: "Darshan shines brightest with an API key — Profile → Intelligence",
      sadhana_toast: "Sādhana complete — the ember stays lit",
      // journal
      journal_eyebrow: "[ Saved verses & reflections ]", journal: "Journal",
      journal_empty: "Nothing saved yet.<br/>Bookmark a verse and it will wait for you here.",
      saved_to_journal: "Saved to journal", removed_from_journal: "Removed from journal", removed: "Removed",
      saved_on: "saved", reflection_on: "Reflection on",
      note_ph: "What did this verse open in you?",
      not_now: "Not now", keep_it: "Keep it", reflection_kept: "Reflection kept",
      // profile
      practitioner: "[ The practitioner ]",
      streak: "Streak", best: "Best", saved: "Saved",
      intelligence: "[ Intelligence ]", engine: "Conversation engine",
      key_on_device: "Your key stays on this device", no_key: "No key — grounded offline voice",
      offline_voice: "Offline voice", reading: "[ Reading ]",
      verse_script: "Verse script", language: "App language",
      refresh_corpus: "Refresh corpus", refresh_sub: "Re-download all 700 verses",
      replay_intro: "Replay introduction", replay_sub: "The four opening screens",
      about: "[ About ]",
      about_text: `Sanskrit text and translations from the open <b>gita</b> dataset (Unlicense); English rendering by {en}, Hindi by {hi}. Conversations are grounded in retrieved verses and cited — the app will not invent scripture. A voice "speaking as" a divine figure is a voice drawn from the text, offered with reverence, never a substitute for a teacher or tradition.<br/><br/>The words of the Gita are free, and will always remain so here.`,
      engine_sheet: "Conversation engine",
      engine_none_t: "Offline voice", engine_none_s: "No key needed. Grounded, cited answers composed from the corpus itself.",
      engine_claude_s: "Streams real conversation. Key begins sk-ant-… and never leaves this device.",
      engine_gemini_s: "Streams real conversation + Darshan imagery. Free-tier keys work.",
      api_key: "API key", model_opt: "Model · optional", paste_key: "Paste your key", done: "Done",
      engine_connected: "Engine connected", using_offline: "Using the offline voice",
      script_sheet: "Verse script",
      script_dev_s: "देवनागरी — the script of the source", script_iast_s: "Roman transliteration with diacritics", script_en_s: "Translation alone, quiet and plain",
      english_only: "English only",
      lang_sheet: "App language",
      lang_en_s: "Interface and translations in English", lang_hi_s: "इंटरफ़ेस और अनुवाद हिन्दी में",
      // onboarding
      ob_skip: "Skip",
      ob1_t: "Modern life is loud.\nYour spirit seeks quiet.", ob1_s: "The need to reconnect with the old wisdom is stronger than ever, but the sheer volume of it can feel intimidating.\n\nVedic Verse cuts through the noise — not a repository of static text, but a guide that helps you conversationally understand the Bhagavad Gita, verse by verse.",
      ob2_t: "A verse each morning.\nA practice that holds.", ob2_s: "One verse a day — Devanagari, transliteration, translation — and a streak kept as sādhana: gentle practice, never guilt.\n\nRead it, sit with it, save it to your journal with your own reflection.",
      ob3_t: "Ask, and the\ntext answers.", ob3_s: "Move beyond passive reading. Converse with the Gita itself, or with voices drawn from it — Krishna, Arjuna.\n\nEvery answer stands on retrieved verses, cited beneath it. Nothing is ever invented.",
      ob4_t: "Choose your depth.\nWalk your pace.", ob4_s: "Whisper for a quiet word. Dialogue for a teaching. Darshan for the full cinematic unfolding, with imagery.\n\nRead in English or हिन्दी — your practice, your pace.",
      ob1_cta: "Learn", ob2_cta: "Discover", ob3_cta: "Explore", ob4_cta: "Begin",
      // veil
      preparing: "Preparing the corpus…", archive_reach: "Reaching the archive…", verses_received: "700 verses received…",
      aligning: "Aligning translations…", corpus_ready: "The corpus is ready", from_library: "From your library",
      archive_unreachable: "The archive is out of reach",
      first_launch_hint: "First launch needs a connection to gather the 700 verses (then it's yours offline).",
      try_again: "Try again"
    },
    hi: {
      tab_home: "मुख्य", tab_library: "ग्रंथ", tab_chat: "संवाद", tab_journal: "पत्रिका", tab_profile: "प्रोफ़ाइल",
      todays_practice: "[ आज की साधना ]",
      greet_dawn: "ब्रह्म मुहूर्त", greet_morning: "सुप्रभात", greet_afternoon: "नमस्ते", greet_evening: "शुभ संध्या",
      verse_of_day: "आज का श्लोक",
      read_todays: "आज का श्लोक पढ़ें",
      daily_sadhana: "दैनिक साधना",
      practice_done: "आज की साधना पूर्ण",
      practice_hint: "आज का श्लोक पढ़ें, या ग्रंथ से संवाद करें।",
      day: "दिन", days: "दिन",
      recently_read: "[ हाल में पढ़े ]",
      recent_empty: "आपके पढ़े हुए श्लोक यहाँ एकत्र होंगे,<br/>जैसे चलने से बनता हुआ मार्ग।",
      library_link: "ग्रंथालय",
      the_library: "[ ग्रंथालय ]", texts: "ग्रंथ",
      gita_sub: "भगवान का गीत",
      gita_meta: "१८ अध्याय · ७०० श्लोक · धर्मक्षेत्र में युद्ध से ठीक पहले, कृष्ण और अर्जुन का संवाद।",
      complete: "सम्पूर्ण", coming_soon: "शीघ्र आगमन",
      ramayana_en: "रामायण", ramayana_meta: "सात काण्ड · श्रीराम का चरित",
      mahabharata_en: "महाभारत", mahabharata_meta: "अठारह पर्व · महाकाव्य",
      vedas_en: "चारों वेद", vedas_meta: "ऋग् · साम · यजुर् · अथर्व",
      upanishads_en: "उपनिषद्", upanishads_meta: "वृक्ष तले की शिक्षा",
      puranas_en: "पुराण", puranas_meta: "प्राचीन कथाएँ",
      chip_all: "सभी", chip_epics: "महाकाव्य", chip_vedic: "वैदिक", chip_purana: "पुराण",
      by_author: "—",
      chapter: "अध्याय", verses_n: "श्लोक",
      sit_with_verse: "इस श्लोक के संग बैठें", copy: "कॉपी", translation_by: "अनुवाद",
      previous: "पिछला", next: "अगला",
      first_verse: "यह प्रथम श्लोक है", final_verse: "यह अंतिम श्लोक है",
      verse_copied: "श्लोक कॉपी हुआ", copy_failed: "कॉपी नहीं हो सका",
      verse_not_loaded: "वह श्लोक अभी उपलब्ध नहीं",
      the_conversation: "[ संवाद ]",
      new_chat: "नया", history: "इतिहास",
      grounding_note_gita: "हर उत्तर ग्रंथ के श्लोकों पर आधारित और उद्धृत है। कुछ भी गढ़ा नहीं जाता।",
      grounding_note_persona: "यह ग्रंथ से उभरी वाणी है — स्वयं भगवान नहीं। श्लोकों पर आधारित, उद्धरण सहित।",
      offline_note: "ऑफ़लाइन वाणी — ग्रंथ पर आधारित। खुले संवाद हेतु प्रोफ़ाइल में key जोड़ें।",
      ph_gita: "गीता से कुछ भी पूछें…", ph_krishna: "कृष्ण-वाणी से संवाद करें…", ph_arjuna: "एक साथी साधक से पूछें…",
      listening_gita: "ग्रंथ सुन रहा है।", listening: "{name} सुन रहे हैं।",
      empty_sub: "{tagline} · हर उत्तर अपने आधार-श्लोकों का उल्लेख करता है।",
      grounded_in: "{n} श्लोक पर आधारित", grounded_in_pl: "{n} श्लोकों पर आधारित",
      sessions_title: "संवाद-सूची",
      session_now: "अभी", session_today: "आज", session_yesterday: "कल",
      no_sessions: "अभी कोई संवाद नहीं।",
      delete: "हटाएँ",
      err_engine: "प्रोफ़ाइल → बुद्धि में अपनी key जाँचें, या ऑफ़लाइन वाणी चुनें।",
      silence: "…मौन। एक बार फिर।",
      darshan_hint: "दर्शन के लिए API key सर्वोत्तम है — प्रोफ़ाइल → बुद्धि",
      sadhana_toast: "साधना पूर्ण — दीप जलता रहे",
      journal_eyebrow: "[ संचित श्लोक और चिंतन ]", journal: "पत्रिका",
      journal_empty: "अभी कुछ संचित नहीं।<br/>कोई श्लोक सहेजें, वह यहाँ आपकी प्रतीक्षा करेगा।",
      saved_to_journal: "पत्रिका में संचित", removed_from_journal: "पत्रिका से हटाया", removed: "हटाया गया",
      saved_on: "संचित", reflection_on: "चिंतन —",
      note_ph: "इस श्लोक ने आपमें क्या खोला?",
      not_now: "अभी नहीं", keep_it: "सहेजें", reflection_kept: "चिंतन सहेजा गया",
      practitioner: "[ साधक ]",
      streak: "क्रम", best: "सर्वोत्तम", saved: "संचित",
      intelligence: "[ बुद्धि ]", engine: "संवाद इंजन",
      key_on_device: "आपकी key इसी डिवाइस पर रहती है", no_key: "बिना key — आधारित ऑफ़लाइन वाणी",
      offline_voice: "ऑफ़लाइन वाणी", reading: "[ पठन ]",
      verse_script: "श्लोक लिपि", language: "ऐप भाषा",
      refresh_corpus: "ग्रंथ पुनः लाएँ", refresh_sub: "७०० श्लोक फिर से डाउनलोड करें",
      replay_intro: "परिचय फिर देखें", replay_sub: "चार आरंभिक स्क्रीन",
      about: "[ परिचय ]",
      about_text: `संस्कृत पाठ एवं अनुवाद मुक्त <b>gita</b> डेटासेट से; अंग्रेज़ी अनुवाद {en}, हिन्दी {hi}। हर उत्तर श्लोकों पर आधारित और उद्धृत है — ऐप शास्त्र नहीं गढ़ेगा। किसी दिव्य विभूति के रूप में बोलती वाणी ग्रंथ से उभरी वाणी है, श्रद्धा से प्रस्तुत — गुरु या परंपरा का विकल्प नहीं।<br/><br/>गीता के शब्द निःशुल्क हैं, और यहाँ सदा रहेंगे।`,
      engine_sheet: "संवाद इंजन",
      engine_none_t: "ऑफ़लाइन वाणी", engine_none_s: "बिना key। ग्रंथ से ही रचित, उद्धरण सहित उत्तर।",
      engine_claude_s: "सजीव संवाद। Key sk-ant-… से आरंभ, डिवाइस से बाहर नहीं जाती।",
      engine_gemini_s: "सजीव संवाद + दर्शन चित्र। निःशुल्क keys चलती हैं।",
      api_key: "API key", model_opt: "मॉडल · वैकल्पिक", paste_key: "अपनी key यहाँ रखें", done: "हो गया",
      engine_connected: "इंजन जुड़ गया", using_offline: "ऑफ़लाइन वाणी चालू",
      script_sheet: "श्लोक लिपि",
      script_dev_s: "देवनागरी — मूल की लिपि", script_iast_s: "रोमन लिपि, उच्चारण-चिह्नों सहित", script_en_s: "केवल अनुवाद, सरल और शांत",
      english_only: "केवल अनुवाद",
      lang_sheet: "ऐप भाषा",
      lang_en_s: "Interface and translations in English", lang_hi_s: "इंटरफ़ेस और अनुवाद हिन्दी में",
      ob_skip: "छोड़ें",
      ob1_t: "आधुनिक जीवन कोलाहल है।\nआत्मा मौन खोजती है।", ob1_s: "पुरानी विद्या से जुड़ने की आवश्यकता आज सबसे प्रबल है, पर उसका विस्तार भयभीत कर सकता है।\n\nVedic Verse इस कोलाहल को चीरता है — स्थिर पाठ का संग्रह नहीं, बल्कि ऐसा मार्गदर्शक जो भगवद्गीता को श्लोक-दर-श्लोक संवाद से समझाता है।",
      ob2_t: "प्रतिदिन एक श्लोक।\nएक टिकाऊ साधना।", ob2_s: "रोज़ एक श्लोक — देवनागरी, रोमन लिपि, अनुवाद — और साधना-रूप में क्रम: कोमल अभ्यास, अपराध-बोध नहीं।\n\nपढ़िए, साथ बैठिए, अपने चिंतन के संग पत्रिका में सहेजिए।",
      ob3_t: "पूछिए — ग्रंथ\nउत्तर देगा।", ob3_s: "निष्क्रिय पठन से आगे बढ़िए। गीता से, या उससे उभरी वाणियों से — कृष्ण, अर्जुन — संवाद कीजिए।\n\nहर उत्तर श्लोकों पर खड़ा है, उद्धरण नीचे। कुछ भी गढ़ा नहीं जाता।",
      ob4_t: "गहराई चुनिए।\nअपनी गति चलिए।", ob4_s: "मंद्र — एक शांत शब्द। संवाद — एक शिक्षा। दर्शन — चित्रों सहित पूर्ण अनुभव।\n\nअंग्रेज़ी या हिन्दी में पढ़िए — आपकी साधना, आपकी गति।",
      ob1_cta: "जानें", ob2_cta: "खोजें", ob3_cta: "अनुभव करें", ob4_cta: "आरंभ करें",
      preparing: "ग्रंथ सज रहा है…", archive_reach: "संग्रह से संपर्क…", verses_received: "७०० श्लोक प्राप्त…",
      aligning: "अनुवाद संयोजित…", corpus_ready: "ग्रंथ तैयार है", from_library: "आपके संग्रह से",
      archive_unreachable: "संग्रह तक पहुँच नहीं",
      first_launch_hint: "पहली बार ७०० श्लोक लाने हेतु इंटरनेट चाहिए (फिर सदा ऑफ़लाइन)।",
      try_again: "पुनः प्रयास"
    }
  };

  VV.t = function (key, params) {
    const lang = (VV.settings && VV.settings.lang) || "en";
    let s = (STRINGS[lang] && STRINGS[lang][key]) ?? STRINGS.en[key] ?? key;
    if (params) for (const k of Object.keys(params)) s = s.replaceAll(`{${k}}`, params[k]);
    return s;
  };
  VV.isHindi = () => (VV.settings && VV.settings.lang) === "hi";

  // persona display names per language
  VV.personaName = function (pid) {
    const hi = { gita: "गीता", krishna: "कृष्ण", arjuna: "अर्जुन" };
    const p = VV.PERSONAS[pid];
    return VV.isHindi() ? (hi[pid] || p.name) : p.name;
  };
  VV.personaTagline = function (pid) {
    const en = { gita: "Ask the text itself", krishna: "A voice drawn from his words in the text", arjuna: "The seeker who asked first" };
    const hi = { gita: "स्वयं ग्रंथ से पूछिए", krishna: "ग्रंथ में उनके वचनों से उभरी वाणी", arjuna: "वह साधक जिसने सबसे पहले पूछा" };
    return (VV.isHindi() ? hi : en)[pid] || "";
  };
})();
