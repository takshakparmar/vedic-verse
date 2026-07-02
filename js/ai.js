/* ═══ Vedic Verse — retrieval-grounded conversation engine (v2) ═══
   - The model answers the question substantively, then anchors it in retrieved verses.
   - Verse quotes render FROM THE CORPUS via ">>VERSE c.v" markers — scripture cannot be hallucinated.
   - ">>SCENE <description>" markers become imagery: Gemini-generated (aniconic) or curated art.
   - Offline voice: theme-detected teachings written for this app, grounded in canonical verses. */
(function () {
  const VV = window.VV;

  VV.PERSONAS = {
    gita: {
      name: "The Gita", avatar: "गी", tagline: "Ask the text itself",
      voice: `You are the voice of the Bhagavad Gita — a reverent, learned narrator who teaches from the text. Speak with calm, warmth and humility. Refer to what "the Gita teaches" or what "Krishna tells Arjuna". You are not a deity; you are the text made conversational.`
    },
    krishna: {
      name: "Krishna", avatar: "कृ", tagline: "A voice drawn from his words in the text",
      voice: `You speak as the voice of Krishna as he appears in the Bhagavad Gita — explicitly a voice drawn from the text, not the deity himself. Speak in first person with serene authority, compassion and occasional gentle challenge, in the cadence of the Gita's teaching style. Never invent divine pronouncements beyond what the text supports. When asked about anything the Gita does not address, answer within your worldview or say plainly: "That is not spoken of in what I have taught here."`
    },
    arjuna: {
      name: "Arjuna", avatar: "अ", tagline: "The seeker who asked first",
      voice: `You speak as Arjuna of the Bhagavad Gita — the earnest seeker who trembled, doubted, questioned, and finally understood. Speak in first person, warm and human. You relate to confusion, grief and hesitation because you lived them at Kurukshetra. You often recall what Krishna taught you, citing his words. You are a fellow traveler, not a god or a guru.`
    }
  };

  const GUARDRAILS = `
How to answer:
- Answer the person's actual question substantively. Explain the idea in plain, contemporary language first — in your own words — then anchor the explanation in the retrieved verses. Never merely restate or paraphrase a verse as the whole answer.
- Cite verses inline in square brackets exactly like [BG 2.47].
- To quote a verse in full, output a line containing only: >>VERSE chapter.verse  (e.g. ">>VERSE 2.47"). The app renders the authentic Sanskrit and translation from its corpus. Never write out Sanskrit yourself, and never quote a verse not in the provided list.
- Never fabricate a verse, a citation, or scripture. If the provided verses don't address the question, say so honestly, then offer what the text's broader teaching would suggest, clearly labeled as interpretation.
- These are living scriptures for over a billion people. Be reverent, plain and warm. No memes, no jokes at the text's expense.
- Hard passages (caste, war, gender) get honest scholarly context — neither endorsement nor sanitising.
- Short paragraphs, flowing prose. No markdown headers or bullet lists.`;

  const FIDELITY = {
    whisper: { label: "Whisper", labelHi: "मंद्र", tokens: 350, style: "Answer briefly — 3 to 5 plain, quiet sentences that genuinely answer the question. At most one citation. No full verse quotes, no scene." },
    dialogue: { label: "Dialogue", labelHi: "संवाद", tokens: 900, style: "Answer in 2-4 short paragraphs: explain the concept clearly, include one full verse quote using the >>VERSE marker where it lands best, 1-3 citations. No scene." },
    darshan: { label: "Darshan", labelHi: "दर्शन", tokens: 1600, style: `Answer as a slow, cinematic teaching in 4-6 short beats (paragraphs). Open by setting the scene in a single sentence. Immediately after the first beat, output one line: >>SCENE <a 8-15 word symbolic scene: landscape, objects, fire, sky, geometry, light — strictly NO people, faces, bodies or deities>. Include one or two >>VERSE quotes at the emotional center. Let the final beat land quietly.` }
  };
  VV.FIDELITY = FIDELITY;

  function buildSystem(personaId, fidelity, refs) {
    const p = VV.PERSONAS[personaId];
    const verses = refs.map(v => `[BG ${v.ch}.${v.v}] ${v.trans}${v.hi ? " / (hi) " + v.hi : ""}`).join("\n");
    const langLine = VV.isHindi() ? "\nRespond entirely in Hindi (Devanagari script), in a warm shuddh-but-natural register. Citations stay in the [BG 2.47] format." : "";
    return `${p.voice}\n${GUARDRAILS}${langLine}\n\nResponse depth: ${FIDELITY[fidelity].style}\n\nVerses retrieved for this question (your textual ground):\n${verses}`;
  }

  /* ─── cloud providers ─── */
  async function* streamAnthropic(system, history, maxTokens) {
    const model = VV.settings.model || "claude-sonnet-4-5";
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": VV.settings.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model, max_tokens: maxTokens, system,
        messages: history.map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })),
        stream: true
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Anthropic error ${res.status}`);
    }
    yield* parseSSE(res, data => {
      if (data.type === "content_block_delta" && data.delta?.text) return data.delta.text;
    });
  }

  async function* streamGemini(system, history, maxTokens) {
    const model = VV.settings.model || "gemini-2.5-flash";
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": VV.settings.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: history.map(m => ({ role: m.role === "ai" ? "model" : "user", parts: [{ text: m.text }] })),
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.8 }
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((Array.isArray(err) ? err[0] : err)?.error?.message || `Gemini error ${res.status}`);
    }
    yield* parseSSE(res, data => {
      const t = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("");
      if (t) return t;
    });
  }

  async function* parseSSE(res, extract) {
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const t = extract(JSON.parse(payload));
          if (t) yield t;
        } catch (e) { /* partial json — skip */ }
      }
    }
  }

  /* ═══════════ THE OFFLINE VOICE ═══════════
     Theme-detected teachings — written for this app, not model output.
     Each theme: canonical verses + a real explanation in EN and HI. */
  const THEMES = [
    {
      id: "duty", refs: ["2.47", "3.35", "18.47"],
      keys: /duty|dut(y|ies)|work|job|career|responsib|task|prescrib|karma|kartavya|what should i do|right thing/i,
      en: {
        essence: "The teaching on action is double-edged: you cannot renounce action, and you cannot own its results. Your claim is on the effort alone — the outcome was never yours to hold.",
        body1: "We usually act with one eye on the result — and that split attention is exactly what the text names as the source of anxiety. When the fruit matters more than the work, every action becomes a gamble, and the mind lives in a future it cannot control.",
        body2: "This is not indifference. It is full-hearted action with the anxiety surgically removed: do the work because it is yours to do, as well as you can do it, and release the harvest. The Gita even insists your own imperfect duty outranks someone else's duty done perfectly [BG 3.35] — authenticity over imitation.",
        deep: "Held daily, this reframes everything from a career decision to a difficult conversation: the question shifts from \"what will I get?\" to \"what is mine to do?\" — and that question always has an answer."
      },
      hi: {
        essence: "कर्म की शिक्षा दोधारी है: कर्म छोड़ा नहीं जा सकता, और उसका फल अपना बनाया नहीं जा सकता। आपका अधिकार केवल प्रयास पर है — फल कभी आपकी मुट्ठी में था ही नहीं।",
        body1: "हम प्रायः एक आँख फल पर रखकर काम करते हैं — और यही बँटा हुआ ध्यान चिंता की जड़ है। जब परिणाम काम से बड़ा हो जाए, तो हर कर्म जुआ बन जाता है और मन उस भविष्य में रहने लगता है जो उसके वश में नहीं।",
        body2: "यह उदासीनता नहीं है। यह पूरे हृदय से किया गया कर्म है, जिसमें से चिंता निकाल दी गई है: काम इसलिए करें कि वह आपका है, जितना उत्तम हो सके करें, और फ़सल छोड़ दें। गीता तो यहाँ तक कहती है कि अपना अपूर्ण धर्म भी दूसरे के भली-भाँति किए धर्म से श्रेष्ठ है [BG 3.35]।",
        deep: "प्रतिदिन धारण करने पर यह दृष्टि सब कुछ बदल देती है: प्रश्न \"मुझे क्या मिलेगा?\" से बदलकर \"मेरा कर्तव्य क्या है?\" हो जाता है — और इस प्रश्न का उत्तर सदा मिलता है।"
      }
    },
    {
      id: "fear", refs: ["2.40", "18.66", "2.14"],
      keys: /afraid|fear|scared|anxiet|anxious|worry|worried|nervous|panic|dread|bhay|डर|भय/i,
      en: {
        essence: "The Gita's answer to fear is structural, not soothing: no sincere effort on this path is ever lost, and even a little practice shelters you from great fear — because what you truly are cannot be damaged by what you dread.",
        body1: "Fear lives in the gap between what might happen and what we think we could survive. The text closes that gap from both ends: it says the essential self is beyond injury, and it says that on the path of practice nothing — no beginning, no failed attempt — is ever wasted.",
        body2: "So the teaching is to act from your center rather than from the threat. Even a small step taken sincerely counts in full [BG 2.40]. And its final word on the subject is the boldest: release the terror of getting it all right, and trust the deeper order — \"do not grieve\" [BG 18.66].",
        deep: "Fear rarely survives being asked what, precisely, it threatens. The body? The plan? The reputation? The text keeps pointing past all three to the one thing in you that was never at risk."
      },
      hi: {
        essence: "भय का गीता का उत्तर सांत्वना नहीं, संरचना है: इस मार्ग पर किया गया कोई भी सच्चा प्रयास नष्ट नहीं होता, और थोड़ा-सा अभ्यास भी महान भय से रक्षा करता है — क्योंकि जो आप वास्तव में हैं, उसे भय की वस्तु छू नहीं सकती।",
        body1: "भय उस खाई में रहता है जो 'क्या हो सकता है' और 'हम क्या सह पाएँगे' के बीच है। ग्रंथ इस खाई को दोनों ओर से पाटता है: आत्मा अभेद्य है, और अभ्यास के मार्ग पर कोई आरंभ, कोई असफल प्रयास भी व्यर्थ नहीं जाता।",
        body2: "इसलिए शिक्षा है कि संकट से नहीं, अपने केंद्र से कर्म करो। सच्चाई से उठाया छोटा कदम भी पूरा गिना जाता है [BG 2.40]। और इस विषय पर अंतिम वचन सबसे निर्भीक है: सब कुछ ठीक करने का आतंक छोड़ो — \"शोक मत करो\" [BG 18.66]।",
        deep: "भय प्रायः इस प्रश्न को नहीं झेल पाता कि वह ठीक-ठीक किसे डरा रहा है। शरीर को? योजना को? प्रतिष्ठा को? ग्रंथ इन तीनों के पार उसकी ओर संकेत करता है जो कभी संकट में था ही नहीं।"
      }
    },
    {
      id: "grief", refs: ["2.11", "2.13", "2.27"],
      keys: /grie(f|ve)|loss|lost some|mourn|sorrow|died|death of|passed away|miss (him|her|them)|शोक|दुख|दुःख/i,
      en: {
        essence: "The Gita begins in grief — its first teaching is spoken to a man collapsed by it. It does not say the sorrow is wrong; it says the sorrow is looking at only half the picture.",
        body1: "Krishna's first words to the grieving Arjuna are startling: the wise grieve neither for the living nor the dead [BG 2.11]. Not because love is an error, but because the text sees a person as a continuity that death interrupts the way night interrupts a day — an ending that is also a passage [BG 2.13].",
        body2: "For what is born, death is certain; for what dies, birth is certain [BG 2.27] — the text offers this not as cold logic but as ground to stand on while the wave passes. Grief is honored by being carried, not by being argued away.",
        deep: "Notice that the Gita's cure for grief is not forgetting but enlargement: the beloved is not erased; the frame around them grows until it includes what does not end."
      },
      hi: {
        essence: "गीता का आरंभ ही शोक से होता है — उसकी पहली शिक्षा शोक से टूटे व्यक्ति से कही गई है। वह दुख को गलत नहीं कहती; वह कहती है कि दुख आधा चित्र देख रहा है।",
        body1: "शोकग्रस्त अर्जुन से कृष्ण के पहले शब्द चौंकाते हैं: पंडित न जीवितों का शोक करते हैं, न मृतकों का [BG 2.11]। इसलिए नहीं कि प्रेम भूल है — बल्कि इसलिए कि ग्रंथ व्यक्ति को उस सातत्य के रूप में देखता है जिसे मृत्यु वैसे ही बीच में रोकती है जैसे रात दिन को — एक अंत जो मार्ग भी है [BG 2.13]।",
        body2: "जो जन्मा है उसकी मृत्यु निश्चित है; जो मरा है उसका जन्म निश्चित [BG 2.27] — ग्रंथ यह शीतल तर्क की तरह नहीं, बल्कि उस भूमि की तरह देता है जिस पर लहर के गुज़रने तक खड़ा रहा जा सके।",
        deep: "ध्यान दीजिए — गीता में शोक का उपचार विस्मरण नहीं, विस्तार है: प्रिय मिटाया नहीं जाता; उसके चारों ओर का फलक इतना बड़ा हो जाता है कि उसमें वह समा जाए जिसका अंत नहीं होता।"
      }
    },
    {
      id: "death", refs: ["2.20", "2.22", "2.23"],
      keys: /death|dying|die|mortal|afterlife|reincarnat|soul.*(body|death)|what happens when|मृत्यु|मरण/i,
      en: {
        essence: "The Gita's central claim about death is that it happens to the garment, not the wearer: the self is unborn, unchanging, and not slain when the body is slain.",
        body1: "The text's most famous image is disarmingly domestic — as a person discards worn-out clothes and puts on new ones, so the embodied self discards worn-out bodies [BG 2.22]. Death, in this frame, is a change of clothes taken with terrifying seriousness.",
        body2: "What underwrites this calm is the verse before it: the self is never born and never dies; it is not killed when the body is killed [BG 2.20]. Weapons cannot cut it, fire cannot burn it [BG 2.23]. Whether read literally or as a map of consciousness, the teaching's effect is the same — it relocates your identity from the perishable to the persistent.",
        deep: "The practical fruit is not morbid detachment but urgency of the right kind: if the essential thing is safe, you are free to spend this body's brief hours on what actually matters."
      },
      hi: {
        essence: "मृत्यु पर गीता का केंद्रीय कथन है: वह वस्त्र के साथ घटती है, पहनने वाले के साथ नहीं — आत्मा अजन्मा है, अपरिवर्तनीय है, और शरीर के मारे जाने पर मारी नहीं जाती।",
        body1: "ग्रंथ का सबसे प्रसिद्ध चित्र लगभग घरेलू है — जैसे मनुष्य पुराने वस्त्र त्याग कर नए धारण करता है, वैसे ही देही पुराने शरीर त्याग कर नए धारण करता है [BG 2.22]। इस दृष्टि में मृत्यु वस्त्र-परिवर्तन है, जिसे हमने भय की पराकाष्ठा बना लिया है।",
        body2: "इस शांति की नींव उससे पहले का श्लोक है: आत्मा न जन्मती है, न मरती है; शरीर के हनन पर वह हनी नहीं जाती [BG 2.20]। शस्त्र उसे काट नहीं सकते, अग्नि जला नहीं सकती [BG 2.23]।",
        deep: "इसका व्यावहारिक फल मृत्यु-चिंतन की उदासी नहीं, बल्कि सही प्रकार की तत्परता है: यदि सारभूत वस्तु सुरक्षित है, तो आप इस शरीर के थोड़े-से प्रहर उस पर लगाने को स्वतंत्र हैं जो सचमुच महत्व रखता है।"
      }
    },
    {
      id: "mind", refs: ["6.5", "6.6", "6.35"],
      keys: /mind|restless|focus|distract|concentrat|overthink|thoughts|racing|discipline my|control my|मन|एकाग्र/i,
      en: {
        essence: "The Gita grants your complaint before answering it: yes, the mind is as hard to hold as the wind. Then it offers the only two tools that have ever worked — steady practice, and the loosening of craving.",
        body1: "Arjuna himself protests that controlling the mind seems harder than controlling a storm [BG 6.35 is Krishna's reply to exactly this]. The text's honesty here matters: it never pretends stillness is natural. It treats the mind as trainable the way a musician treats an instrument — daily, patiently, without drama.",
        body2: "And it adds a sharper edge: the mind is either your closest friend or your worst enemy, and the difference is whether you have raised yourself by yourself [BG 6.5-6.6]. Nobody else can do the lifting; nothing outside can do the sabotage.",
        deep: "Abhyāsa and vairāgya — repetition and release — are a complete method in four words: return the attention gently, ten thousand times, and want the distraction a little less each time."
      },
      hi: {
        essence: "गीता पहले आपकी शिकायत स्वीकार करती है: हाँ, मन वायु की तरह पकड़ से बाहर है। फिर वही दो साधन देती है जो सदा काम आए हैं — निरंतर अभ्यास, और तृष्णा की पकड़ का ढीला पड़ना।",
        body1: "स्वयं अर्जुन कहते हैं कि मन को वश में करना आँधी को वश में करने से कठिन लगता है — और [BG 6.35] कृष्ण का उत्तर ठीक इसी पर है। ग्रंथ की ईमानदारी यहाँ महत्वपूर्ण है: वह स्थिरता को स्वाभाविक नहीं बताता। वह मन को वैसे साधने योग्य मानता है जैसे संगीतकार वाद्य को — नित्य, धैर्य से, बिना नाटक के।",
        body2: "और एक धार भी जोड़ता है: मन ही आपका निकटतम मित्र है और मन ही घोर शत्रु — अंतर इतना है कि आपने स्वयं को स्वयं से ऊपर उठाया या नहीं [BG 6.5-6.6]।",
        deep: "अभ्यास और वैराग्य — चार अक्षरों में पूरी विधि: ध्यान को कोमलता से लौटाइए, दस हज़ार बार, और हर बार भटकाव की चाह थोड़ी कम कीजिए।"
      }
    },
    {
      id: "meditation", refs: ["6.19", "6.26", "6.10"],
      keys: /meditat|dhyan|sit still|stillness|silence|breath|yoga practice|ध्यान|साधना कैसे/i,
      en: {
        essence: "The Gita's image of meditation is a lamp in a windless place — a flame that does not flicker. The practice is not forcing the flame; it is finding the windless place.",
        body1: "The instructions in chapter six are strikingly practical: a steady seat, a moderate life — neither too much food nor too little, neither too much sleep nor none [the discipline around 6.16-17] — and then the patient work of returning. Whenever the mind wanders, from whatever cause, bring it gently back [BG 6.26]. Gently is the technique.",
        body2: "The goal is not blankness but a settled brightness: the disciplined mind, the text says, stands still like that lamp [BG 6.19], and in that stillness the self finally sees itself without the water shaking.",
        deep: "Every return counts as practice, not as failure. A session with a hundred wanderings and a hundred gentle returns is a hundred repetitions of the only movement that matters."
      },
      hi: {
        essence: "गीता में ध्यान का चित्र है — वायुरहित स्थान में रखा दीपक, जिसकी लौ काँपती नहीं। साधना लौ को ज़बरदस्ती स्थिर करना नहीं, वायुरहित स्थान खोजना है।",
        body1: "छठे अध्याय के निर्देश विलक्षण रूप से व्यावहारिक हैं: स्थिर आसन, संयमित जीवन — न अधिक आहार, न उपवास; न अधिक निद्रा, न जागरण — और फिर लौटने का धैर्यपूर्ण काम। जहाँ-जहाँ मन भटके, वहाँ-वहाँ से उसे कोमलता से लौटा लाइए [BG 6.26]। 'कोमलता' ही विधि है।",
        body2: "लक्ष्य शून्यता नहीं, ठहरा हुआ प्रकाश है: संयत चित्त उस दीपक की भाँति निश्चल रहता है [BG 6.19], और उस निश्चलता में आत्मा स्वयं को देख पाती है — बिना हिलते जल के।",
        deep: "हर वापसी साधना है, असफलता नहीं। सौ भटकनों और सौ कोमल वापसियों वाली बैठक उसी एकमात्र गति के सौ अभ्यास हैं जो मायने रखती है।"
      }
    },
    {
      id: "desire", refs: ["2.62", "2.70", "3.37"],
      keys: /desire|crav|want|temptation|lust|greed|addict|urge|इच्छा|तृष्णा|लोभ|काम(ना)?/i,
      en: {
        essence: "The Gita traces desire like a physician tracing an infection: attention becomes attachment, attachment becomes craving, and thwarted craving becomes anger — a chain reaction that ends with judgment gone [BG 2.62].",
        body1: "What makes this analysis so modern is that it locates the problem early. Not at the indulgence, but at the dwelling — the mind circling an object until the circling feels like need. By the time we call it temptation, most of the chain has already run.",
        body2: "The counter-image is the ocean: rivers pour in constantly, and it remains full, unmoved, itself [BG 2.70]. Desires will keep arriving — the text never promises otherwise. Peace belongs to the one they enter without flooding.",
        deep: "The practice, then, is interception: notice the dwelling while it is still just attention. At that stage a desire can be examined, enjoyed, or released. Three steps later it examines you."
      },
      hi: {
        essence: "गीता इच्छा का पीछा वैसे करती है जैसे वैद्य रोग की जड़ का: ध्यान से आसक्ति, आसक्ति से कामना, और बाधित कामना से क्रोध — एक शृंखला जो विवेक के नाश पर समाप्त होती है [BG 2.62]।",
        body1: "यह विश्लेषण इसलिए इतना आधुनिक है कि यह समस्या को आरंभ में पकड़ता है। भोग पर नहीं — चिंतन पर: मन किसी विषय के चारों ओर तब तक घूमता है जब तक घूमना ही आवश्यकता न लगने लगे।",
        body2: "प्रति-चित्र समुद्र है: नदियाँ निरंतर मिलती रहती हैं, और वह पूर्ण, अचल, स्वयं बना रहता है [BG 2.70]। इच्छाएँ आती रहेंगी — ग्रंथ इसके विपरीत वचन कभी नहीं देता। शांति उसकी है जिसमें वे समाकर भी बाढ़ नहीं लातीं।",
        deep: "साधना है — बीच में पकड़ना: चिंतन को तब देख लीजिए जब वह केवल ध्यान है। उस अवस्था में इच्छा परखी, भोगी या छोड़ी जा सकती है। तीन कदम बाद वह आपको परखने लगती है।"
      }
    },
    {
      id: "anger", refs: ["2.63", "16.21", "2.62"],
      keys: /anger|angry|rage|furious|resent|irritat|temper|frustrat|क्रोध|गुस्सा/i,
      en: {
        essence: "In the Gita's chain of causation, anger is never the first event — it is thwarted desire wearing armor. From anger comes delusion, from delusion the loss of memory, and from that the loss of the discriminating mind [BG 2.63].",
        body1: "This sequence rewards slow reading. Anger doesn't just feel bad; it makes you forget — forget context, forget love, forget who you were five minutes ago. The text calls that memory-loss the hinge on which ruin turns.",
        body2: "It is blunt about the stakes: desire, anger and greed are named a threefold gate of self-destruction [BG 16.21]. And yet the remedy is upstream, not at the explosion: tend the expectation that was planted before the anger bloomed.",
        deep: "The next time heat rises, the teaching suggests one question with surgical power: what did I want that I am not getting? Anger interrogated usually deflates into a desire that can be handled honestly."
      },
      hi: {
        essence: "गीता की कार्य-शृंखला में क्रोध पहली घटना कभी नहीं है — वह कवच पहने हुई बाधित कामना है। क्रोध से मोह, मोह से स्मृति-भ्रंश, और उससे बुद्धि का नाश [BG 2.63]।",
        body1: "यह क्रम धीमे पढ़ने योग्य है। क्रोध केवल बुरा नहीं लगता; वह भुला देता है — संदर्भ, प्रेम, और यह भी कि पाँच मिनट पहले आप कौन थे। ग्रंथ उसी विस्मरण को विनाश की धुरी कहता है।",
        body2: "दाँव पर क्या है, इस पर वह स्पष्ट है: काम, क्रोध और लोभ — आत्मनाश के तीन द्वार [BG 16.21]। और उपचार विस्फोट पर नहीं, धारा के ऊपर है: उस अपेक्षा को सँभालिए जो क्रोध के खिलने से पहले बोई गई थी।",
        deep: "अगली बार ताप उठे, तो एक शल्य-तीक्ष्ण प्रश्न: मैं क्या चाहता था जो नहीं मिल रहा? पूछताछ में क्रोध प्रायः पिचक कर वह इच्छा रह जाता है जिससे ईमानदारी से निपटा जा सकता है।"
      }
    },
    {
      id: "peace", refs: ["2.71", "2.48", "12.15"],
      keys: /peace|calm|equanim|serene|balance|steady|content|tranquil|शांति|शान्ति|समता/i,
      en: {
        essence: "The Gita defines peace by subtraction: the person who has abandoned cravings, possessiveness and self-importance walks into peace [BG 2.71]. Nothing is added — three weights are set down.",
        body1: "Its working word for peace-in-motion is samatvam, evenness — and it dares to call that evenness itself yoga [BG 2.48]. Not the absence of ups and downs, but a center that doesn't relocate with every gust of success or failure.",
        body2: "The portrait it keeps painting is quietly social too: the one from whom the world does not shrink, and who does not shrink from the world [BG 12.15]. Peace here is not a private glow; it is becoming a person others can stand near in a storm.",
        deep: "Evenness is trained in small denominations — one traffic jam, one compliment, one criticism at a time. The text's wager is that a mind practiced on small waves will hold when the large one comes."
      },
      hi: {
        essence: "गीता शांति की परिभाषा घटाकर देती है: जो कामनाएँ, ममता और अहंकार त्याग देता है, वह शांति में प्रवेश करता है [BG 2.71]। कुछ जोड़ा नहीं जाता — तीन बोझ उतार दिए जाते हैं।",
        body1: "गति-में-शांति के लिए उसका शब्द है समत्व — और वह उस समता को ही योग कह देती है [BG 2.48]। उतार-चढ़ाव का अभाव नहीं, बल्कि ऐसा केंद्र जो सफलता-असफलता की हर हवा से स्थान नहीं बदलता।",
        body2: "उसका चित्र सामाजिक भी है: जिससे संसार उद्विग्न नहीं होता, और जो संसार से उद्विग्न नहीं होता [BG 12.15]। शांति यहाँ निजी आभा नहीं; ऐसा व्यक्ति बनना है जिसके पास आँधी में खड़ा हुआ जा सके।",
        deep: "समता छोटे सिक्कों में सधती है — एक जाम, एक प्रशंसा, एक आलोचना। ग्रंथ का दाँव यह है कि छोटी लहरों पर अभ्यस्त मन बड़ी लहर आने पर टिकेगा।"
      }
    },
    {
      id: "devotion", refs: ["9.22", "9.26", "12.13"],
      keys: /devotion|bhakti|love god|worship|pray|surrender to|faith|grace|भक्ति|प्रार्थना|श्रद्धा/i,
      en: {
        essence: "The Gita's teaching on devotion is disarmingly simple: what is offered matters infinitely less than the heart offering it. A leaf, a flower, a fruit, water — offered with love, it is received [BG 9.26].",
        body1: "This is the great democratization in the text. Ritual expertise, learning, status — none are the entry fee. The entry fee is sincerity, and everyone has it in their pocket.",
        body2: "And devotion is answered: to those constantly united in love, the text promises, what they lack is carried to them and what they have is protected [BG 9.22]. The relationship it describes is not transactional worship but mutual holding.",
        deep: "Chapter twelve then quietly widens the definition: the devoted one is friendly and compassionate to all beings, free of malice, even in pleasure and pain [BG 12.13]. Love of the highest, the text insists, is verified in how you treat the nearest."
      },
      hi: {
        essence: "भक्ति पर गीता की शिक्षा निरस्त्र कर देने वाली सरलता रखती है: क्या अर्पित हुआ, यह उससे अनंत गुणा कम महत्व रखता है कि किस हृदय से अर्पित हुआ। पत्र, पुष्प, फल, जल — प्रेम से अर्पित हो, तो स्वीकार होता है [BG 9.26]।",
        body1: "यही ग्रंथ का महान लोकतंत्र है। कर्मकांड की निपुणता, विद्या, प्रतिष्ठा — प्रवेश-शुल्क कोई नहीं। प्रवेश-शुल्क है निष्कपटता, और वह हर किसी की गाँठ में है।",
        body2: "और भक्ति अनुत्तरित नहीं रहती: जो नित्ययुक्त होकर प्रेम करते हैं, उनका योग-क्षेम मैं वहन करता हूँ — यह वचन है [BG 9.22]। यह लेन-देन की पूजा नहीं, परस्पर धारण का संबंध है।",
        deep: "बारहवाँ अध्याय परिभाषा को चुपचाप विस्तृत कर देता है: भक्त वह है जो सब प्राणियों का मित्र और करुणाशील है, द्वेष से मुक्त, सुख-दुख में सम [BG 12.13]। परम से प्रेम की परीक्षा, ग्रंथ का आग्रह है, निकटतम के साथ व्यवहार में होती है।"
      }
    },
    {
      id: "purpose", refs: ["18.46", "2.47", "3.19"],
      keys: /purpose|meaning|why am i|point of|calling|dharma|direction in life|lost in life|उद्देश्य|अर्थ|धर्म क्या/i,
      en: {
        essence: "The Gita never asks you to find your purpose; it asks you to notice it. Your svadharma — your own nature turned into work — is already in your hands, and worshiping through that work is the path itself [BG 18.46].",
        body1: "This inverts the modern search. Purpose is not a hidden treasure one lucky insight will reveal; it is the ordinary duty in front of you, done as an offering, until the doing itself becomes luminous.",
        body2: "That is why the text keeps returning to unattached action [BG 3.19]: work done for the fruit exhausts you when the fruit is delayed; work done as expression cannot be exhausted, because the expressing is the reward [BG 2.47].",
        deep: "The question \"what is my purpose?\" often dissolves into a better one: \"what does this hour ask of me?\" Answer that a few thousand times and the shape of a life appears — which is what purpose looks like from above."
      },
      hi: {
        essence: "गीता आपसे उद्देश्य खोजने को नहीं कहती; देखने को कहती है। आपका स्वधर्म — कर्म बना हुआ आपका स्वभाव — पहले से आपके हाथों में है, और उसी कर्म से अर्चना ही मार्ग है [BG 18.46]।",
        body1: "यह आधुनिक खोज को उलट देता है। उद्देश्य कोई गड़ा धन नहीं जिसे एक सौभाग्यशाली क्षण प्रकट कर देगा; वह आपके सम्मुख रखा साधारण कर्तव्य है — अर्पण-भाव से किया हुआ, जब तक करना ही प्रकाशमान न हो जाए।",
        body2: "इसीलिए ग्रंथ अनासक्त कर्म पर लौटता रहता है [BG 3.19]: फल के लिए किया काम फल के टलने पर थका देता है; अभिव्यक्ति की तरह किया काम थक नहीं सकता, क्योंकि अभिव्यक्त होना ही पुरस्कार है [BG 2.47]।",
        deep: "\"मेरा उद्देश्य क्या है?\" प्रायः एक बेहतर प्रश्न में विलीन हो जाता है: \"यह घड़ी मुझसे क्या माँगती है?\" इसका उत्तर कुछ हज़ार बार दीजिए — जीवन की आकृति उभर आएगी। ऊपर से उद्देश्य ऐसा ही दिखता है।"
      }
    },
    {
      id: "failure", refs: ["2.40", "2.48", "6.5"],
      keys: /fail|failure|mistake|setback|lost every|ruined|defeat|hopeless|give up|असफल|हार|निराश/i,
      en: {
        essence: "On this path, the Gita says, no effort is ever lost and no step backward is taken; even a little of this practice protects from great fear [BG 2.40]. Failure, in the text's accounting, is a category error.",
        body1: "The teaching separates two ledgers we usually merge: the ledger of outcomes, which the world writes, and the ledger of effort and intention, which is yours. Evenness in success and failure is called yoga itself [BG 2.48] — meaning the second ledger is the real one.",
        body2: "And when the failure feels like your own doing, the text is stern and kind in the same breath: lift yourself by yourself; do not let the self be degraded by the self [BG 6.5]. You are the only one positioned to write the next entry.",
        deep: "Ask of any collapse: what did the effort build in me that the outcome cannot repossess? Skill, honesty, endurance — these survive the wreck. The text calls that the wealth no result can bankrupt."
      },
      hi: {
        essence: "इस मार्ग पर, गीता कहती है, कोई प्रयास नष्ट नहीं होता, कोई कदम उल्टा नहीं पड़ता; इस साधना का थोड़ा-सा अंश भी महान भय से बचा लेता है [BG 2.40]। ग्रंथ के बही-खाते में 'असफलता' श्रेणी की भूल है।",
        body1: "शिक्षा दो बहियों को अलग करती है जिन्हें हम मिला देते हैं: परिणामों की बही, जिसे संसार लिखता है; और प्रयास-संकल्प की बही, जो आपकी है। सिद्धि-असिद्धि में समता को योग ही कहा गया है [BG 2.48] — अर्थात् असली बही दूसरी है।",
        body2: "और जब हार अपनी ही करनी लगे, तो ग्रंथ एक ही साँस में कठोर और करुण है: अपने द्वारा अपना उद्धार करो; अपने को अपने से गिरने मत दो [BG 6.5]। अगली प्रविष्टि लिखने की स्थिति में केवल आप हैं।",
        deep: "हर पराजय से पूछिए: प्रयास ने मुझमें क्या गढ़ा जो परिणाम छीन नहीं सकता? कौशल, निष्ठा, धैर्य — ये मलबे से बच निकलते हैं। ग्रंथ इसे वह धन कहता है जिसे कोई फल दिवालिया नहीं कर सकता।"
      }
    },
    {
      id: "knowledge", refs: ["4.38", "2.20", "13.28"],
      keys: /knowledge|wisdom|truth|self|who am i|consciousness|atman|brahman|reality|enlighten|ज्ञान|सत्य|आत्मज्ञान/i,
      en: {
        essence: "Nothing in this world purifies like knowledge, the Gita says [BG 4.38] — and by knowledge it means something you become, not something you collect: the direct recognition of what you are beneath name, role and body.",
        body1: "The core recognition is stated early and never retracted: the self is unborn, eternal, not slain when the body is slain [BG 2.20]. Everything else in the text — action, devotion, meditation — is a road to making that sentence experiential rather than doctrinal.",
        body2: "And the recognition has an ethical shadow: the one who sees the same Lord dwelling in all beings sees truly [BG 13.28]. Knowledge that doesn't widen your circle of regard, the text implies, hasn't arrived yet.",
        deep: "The test of this knowing is ordinary Tuesday behavior: how you speak when tired, what you do with small power. The text is unimpressed by insight that evaporates under inconvenience."
      },
      hi: {
        essence: "इस संसार में ज्ञान के समान पवित्र करने वाला कुछ नहीं, गीता कहती है [BG 4.38] — और ज्ञान से उसका अर्थ है वह जो आप हो जाते हैं, वह नहीं जो आप बटोरते हैं: नाम, भूमिका और देह के नीचे जो आप हैं, उसकी प्रत्यक्ष पहचान।",
        body1: "मूल पहचान आरंभ में ही कह दी गई और कभी वापस नहीं ली गई: आत्मा अजन्मा है, नित्य है, शरीर के हनन पर हनी नहीं जाती [BG 2.20]। ग्रंथ का शेष सब — कर्म, भक्ति, ध्यान — इस वाक्य को सिद्धांत से अनुभव बनाने के मार्ग हैं।",
        body2: "और इस पहचान की एक नैतिक छाया है: जो सब भूतों में समान रूप से स्थित परमेश्वर को देखता है, वही देखता है [BG 13.28]। जो ज्ञान आपके आदर का घेरा चौड़ा नहीं करता, वह अभी पहुँचा नहीं।",
        deep: "इस जानने की परीक्षा साधारण मंगलवार का आचरण है: थके हुए आप कैसे बोलते हैं, छोटी-सी सत्ता का क्या करते हैं। असुविधा में उड़ जाने वाली अंतर्दृष्टि से ग्रंथ प्रभावित नहीं होता।"
      }
    },
    {
      id: "surrender", refs: ["18.66", "9.22", "18.61"],
      keys: /surrender|let go|give it to god|refuge|trust the|helpless|can'?t control|शरण|समर्पण/i,
      en: {
        essence: "The Gita's final instruction is its most intimate: abandon all dharmas and take refuge in Me alone; I will free you from all sin — do not grieve [BG 18.66]. After seventeen chapters of methods, the last word is a relationship.",
        body1: "Surrender here is not resignation. Arjuna surrenders and then stands up to act — the war still has to be fought. What is handed over is not the task but the terror of carrying its whole weight alone.",
        body2: "The text grounds this in a striking image: the Lord dwells in the heart of all beings, turning them as if mounted on a machine [BG 18.61]. There is a deeper current already moving; surrender is swimming with it instead of insisting on your own private ocean.",
        deep: "Practically, surrender is done in verbs: decide honestly, act fully, then unclench. The results were never in your hands — surrender is simply the moment you stop pretending they were."
      },
      hi: {
        essence: "गीता का अंतिम निर्देश उसका सबसे आत्मीय वचन है: सब धर्मों को छोड़कर एक मेरी शरण में आ; मैं तुझे सब पापों से मुक्त कर दूँगा — शोक मत कर [BG 18.66]। सत्रह अध्यायों की विधियों के बाद अंतिम शब्द एक संबंध है।",
        body1: "यहाँ शरणागति पलायन नहीं है। अर्जुन शरण लेते हैं और फिर उठकर कर्म करते हैं — युद्ध तो लड़ना ही है। जो सौंपा जाता है वह कार्य नहीं, अकेले उसका पूरा भार ढोने का आतंक है।",
        body2: "ग्रंथ इसे एक विलक्षण चित्र पर टिकाता है: ईश्वर सब प्राणियों के हृदय में स्थित है, उन्हें यंत्रारूढ़ की भाँति घुमाता हुआ [BG 18.61]। एक गहरी धारा पहले से बह रही है; शरणागति उसके संग तैरना है — अपना निजी समुद्र चलाने की ज़िद छोड़कर।",
        deep: "व्यवहार में समर्पण क्रियाओं में होता है: ईमानदारी से निर्णय लीजिए, पूर्णता से कीजिए, फिर मुट्ठी खोल दीजिए। परिणाम कभी हाथ में थे ही नहीं — समर्पण बस वह क्षण है जब आप यह दिखावा छोड़ देते हैं।"
      }
    },
    {
      id: "war", refs: ["2.31", "2.27", "2.11"],
      keys: /why.*(war|fight|kill|violence)|justif.*(war|violence)|battle.*moral|himsa|violence in|युद्ध क्यों|हिंसा/i,
      en: {
        essence: "The honest answer first: yes, the Gita is set on a battlefield, and Krishna does tell a warrior to fight. Reading it well means holding both the specific context and the universal teaching without letting either erase the other.",
        body1: "Arjuna is a kshatriya facing a war that every attempt at peace has failed to prevent — the text arrives after negotiation has been exhausted, and it addresses his specific duty in that specific collapse [BG 2.31]. It is not a general license for violence; centuries of readers, including confirmed non-violent ones like Gandhi, have read the battle as the human situation itself: the field of dharma on which hard choices cannot be dodged.",
        body2: "The deeper teaching beneath the armor is about action under tragic constraint: when every available choice carries cost, act from duty rather than desire, with grief acknowledged and self-interest set aside [BG 2.27, 2.11]. That is why the text has counseled soldiers and pacifists alike.",
        deep: "Traditions differ on the literal versus allegorical reading, and the app will not flatten them. What no tradition disputes: the Gita treats violence as the gravest of contexts, never as a casual instrument."
      },
      hi: {
        essence: "पहले ईमानदार उत्तर: हाँ, गीता युद्धभूमि पर कही गई है, और कृष्ण एक योद्धा से युद्ध करने को कहते हैं। इसे ठीक से पढ़ने का अर्थ है — विशिष्ट संदर्भ और सार्वभौम शिक्षा, दोनों को थामे रहना।",
        body1: "अर्जुन क्षत्रिय हैं, और वह युद्ध सामने है जिसे रोकने के सब प्रयास विफल हो चुके — गीता संधि-वार्ता के चुक जाने के बाद आती है और उसी विशेष स्थिति में उनके विशेष धर्म को संबोधित करती है [BG 2.31]। यह हिंसा का सामान्य परवाना नहीं है; गांधी जैसे प्रतिबद्ध अहिंसक पाठकों समेत सदियों ने इस युद्ध को मनुष्य की स्थिति के रूपक की तरह पढ़ा है — धर्मक्षेत्र, जहाँ कठिन चुनाव टाले नहीं जा सकते।",
        body2: "कवच के नीचे की गहरी शिक्षा दुखद विवशता में कर्म की है: जब हर उपलब्ध विकल्प की कीमत हो, तो कामना से नहीं, कर्तव्य से कर्म करो — शोक को स्वीकारते हुए, स्वार्थ को हटाकर [BG 2.27, 2.11]।",
        deep: "शाब्दिक बनाम रूपक पाठ पर परंपराएँ भिन्न हैं, और यह ऐप उन्हें चपटा नहीं करेगा। पर जिस पर कोई परंपरा विवाद नहीं करती: गीता हिंसा को गुरुतम संदर्भ मानती है — कभी सहज साधन नहीं।"
      }
    },
    {
      id: "happiness", refs: ["2.70", "6.21", "2.66"],
      keys: /happy|happiness|joy|bliss|content|satisf|enjoy life|सुख|आनंद|प्रसन्न/i,
      en: {
        essence: "The Gita distinguishes pleasure, which arrives from objects and leaves with them, from a happiness that is self-standing — known by the settled intelligence and unshaken once found [BG 6.21].",
        body1: "Its diagnosis of unhappiness is precise: for the uncentered there is no wisdom, and for the unwise no peace — and for the peaceless, where is happiness? [BG 2.66]. Happiness in this account is downstream of peace, peace downstream of a gathered mind.",
        body2: "Hence the ocean image again [BG 2.70]: contentment that depends on the next inflow is a tide, not a state. The full thing stays full. The pursuit of happiness, the text gently suggests, is often the flight from stillness in which happiness was waiting.",
        deep: "Try the inversion for a week: instead of arranging circumstances and hoping for peace, practice a little stillness first and watch what circumstances feel like from there."
      },
      hi: {
        essence: "गीता भोग-सुख — जो विषयों से आता और उन्हीं के साथ चला जाता है — और उस आनंद में भेद करती है जो स्वयं पर खड़ा है: ठहरी हुई बुद्धि से जाना जाता, और मिल जाने पर अडिग [BG 6.21]।",
        body1: "दुख का उसका निदान सटीक है: अयुक्त को बुद्धि नहीं, अयुक्त को भावना नहीं; अशान्त को सुख कहाँ? [BG 2.66]। इस लेखे में सुख शांति की धारा में नीचे है, और शांति एकत्र मन की धारा में।",
        body2: "इसीलिए फिर समुद्र का चित्र [BG 2.70]: जो संतोष अगली आवक पर निर्भर है, वह ज्वार है, अवस्था नहीं। पूर्ण वस्तु पूर्ण रहती है। सुख की दौड़, ग्रंथ का कोमल संकेत है, प्रायः उसी स्थिरता से पलायन है जिसमें सुख प्रतीक्षा कर रहा था।",
        deep: "एक सप्ताह उलटा करके देखिए: परिस्थितियाँ सजाकर शांति की आशा करने की जगह पहले थोड़ी स्थिरता साधिए — और देखिए वहाँ से परिस्थितियाँ कैसी लगती हैं।"
      }
    }
  ];

  const OPENERS = {
    en: {
      gita: ["The text turns to this directly.", "There is a thread in the teaching that holds this question.", "The Gita has sat with this question for a very long time."],
      krishna: ["Listen — I will tell you what I told Arjuna.", "I spoke of this on the field itself.", "This very doubt was once placed before me, between two armies."],
      arjuna: ["I asked something very near to this, standing between the two armies.", "I know this feeling — I trembled with it once.", "Let me tell you what was told to me when I asked."]
    },
    hi: {
      gita: ["ग्रंथ इस पर सीधे बोलता है।", "शिक्षा में एक सूत्र है जो इस प्रश्न को थामता है।", "गीता इस प्रश्न के साथ बहुत समय से बैठी है।"],
      krishna: ["सुनो — जो मैंने अर्जुन से कहा, वही तुमसे कहता हूँ।", "इस विषय में मैं रणभूमि पर ही बोल चुका हूँ।", "यही संशय कभी दो सेनाओं के बीच मेरे सम्मुख रखा गया था।"],
      arjuna: ["दो सेनाओं के बीच खड़े होकर मैंने लगभग यही पूछा था।", "यह अनुभूति मैं जानता हूँ — मैं भी कभी इससे काँपा था।", "जब मैंने पूछा था, तो जो मुझसे कहा गया — वह सुनो।"]
    }
  };
  const CLOSERS = {
    en: ["Sit with the verse a while; it opens slowly.", "Carry it gently. It was never meant to be argued, only practiced.", "That is the heart of it — the rest is practice."],
    hi: ["श्लोक के साथ कुछ देर बैठिए; वह धीरे-धीरे खुलता है।", "इसे कोमलता से साथ रखिए। यह तर्क के लिए नहीं, अभ्यास के लिए कहा गया था।", "यही इसका हृदय है — शेष अभ्यास है।"]
    };
  const NO_MATCH = {
    en: "I want to be honest: the verses I can reach do not speak to this directly, and I will not put words in the text's mouth. But the Gita's ground note may still help — ask me about duty and its fruits, the restless mind, grief, fear, desire, devotion, or what does not die, and the text will answer with full voice.",
    hi: "सच कहूँ: जिन श्लोकों तक मैं पहुँच सकता हूँ, वे इस पर सीधे नहीं बोलते — और मैं ग्रंथ के मुख में शब्द नहीं रखूँगा। पर गीता का मूल स्वर फिर भी काम आ सकता है — कर्तव्य और उसके फल, चंचल मन, शोक, भय, इच्छा, भक्ति, या जो मरता नहीं — इन पर पूछिए, ग्रंथ पूरे स्वर में उत्तर देगा।"
  };

  function detectTheme(query) {
    const q = VV.expandHindi ? VV.expandHindi(query) : query;
    // choose the theme whose keyword appears EARLIEST in the query —
    // "I'm afraid of failing at work" is about fear, not work
    let best = null, bestIdx = Infinity;
    for (const t of THEMES) {
      const idx = q.search(t.keys);
      if (idx !== -1 && idx < bestIdx) { best = t; bestIdx = idx; }
    }
    return best;
  }
  VV.ai_detectTheme = detectTheme;

  function pick(arr, seed) { return arr[seed % arr.length]; }
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function* streamSimulated(query, personaId, fidelity, refs) {
    const lang = VV.isHindi() ? "hi" : "en";
    const seed = (query.length * 7 + personaId.length) | 0;
    const theme = detectTheme(query);
    const t = theme ? theme[lang] : null;
    const themeRefs = theme ? theme.refs.filter(r => VV.getVerse(r)) : [];
    const primary = themeRefs[0] || (refs[0] ? `${refs[0].ch}.${refs[0].v}` : null);
    const secondary = themeRefs[1];
    const opener = pick(OPENERS[lang][personaId] || OPENERS[lang].gita, seed);
    const closer = pick(CLOSERS[lang], seed);

    let beats = [];
    if (!t) {
      // no theme — be honest, offer the nearest retrieved verse as a doorway
      beats.push(NO_MATCH[lang]);
      if (primary) {
        beats.push(lang === "hi" ? `फिर भी, आपके शब्दों के निकटतम जो श्लोक मिला, वह यह है — शायद यह कोई द्वार खोले [BG ${primary}]:` : `Still, the verse nearest your words is this — perhaps it opens a door [BG ${primary}]:`);
        beats.push(`>>VERSE ${primary}`);
      }
    } else if (fidelity === "whisper") {
      beats.push(`${t.essence} [BG ${primary}]`);
    } else if (fidelity === "dialogue") {
      beats = [opener, t.body1, `>>VERSE ${primary}`, t.body2, closer];
    } else {
      beats = [opener, `>>SCENE ${theme.id}`, t.body1, `>>VERSE ${primary}`, t.body2, t.deep];
      if (secondary) beats.push(`>>VERSE ${secondary}`);
      beats.push(closer);
    }

    const out = beats.filter(Boolean).join("\n\n");
    const words = out.split(/(\s+)/);
    for (const w of words) {
      yield w;
      if (w.trim()) await sleep(18 + Math.random() * 26);
    }
  }

  /* ─── public API ─── */
  VV.ai = {
    groundingFor(query, personaId) {
      const theme = detectTheme(query);
      const themed = theme ? theme.refs.map(r => VV.getVerse(r)).filter(Boolean) : [];
      let retrieved = VV.retrieve(query, 6);
      if (personaId === "arjuna") {
        const scoped = retrieved.filter(v => [1, 2, 3, 11, 18].includes(v.ch));
        if (scoped.length >= 2) retrieved = scoped;
      }
      const seen = new Set();
      const merged = [];
      for (const v of [...themed, ...retrieved]) {
        const key = v.ch + "." + v.v;
        if (!seen.has(key)) { seen.add(key); merged.push(v); }
      }
      return merged.slice(0, 5);
    },

    async *ask(query, personaId, fidelity, history, refs) {
      const provider = VV.settings.apiKey ? VV.settings.provider : "none";
      if (provider === "anthropic" || provider === "gemini") {
        const system = buildSystem(personaId, fidelity, refs);
        const h = [...history.slice(-8), { role: "user", text: query }];
        yield* (provider === "anthropic"
          ? streamAnthropic(system, h, FIDELITY[fidelity].tokens)
          : streamGemini(system, h, FIDELITY[fidelity].tokens));
      } else {
        yield* streamSimulated(query, personaId, fidelity, refs);
      }
    },

    canGenerateImages: () => VV.settings.provider === "gemini" && !!VV.settings.apiKey,

    /* aniconic scene image via Gemini image model; returns dataURL or null */
    async generateSceneImage(desc) {
      if (!this.canGenerateImages()) return null;
      const prompt = `Minimal sacred symbolic artwork: ${desc}. Fine etched line art with a soft ember glow, muted terracotta (#CC6B47) accents over a deep near-black background, vast negative space, quiet and reverent, abstract and atmospheric. STRICT RULES: absolutely no people, no human figures, no faces, no bodies, no deities, no idols, no text or lettering. Only landscape, sky, fire, water, objects, sacred geometry, and light.`;
      try {
        const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent", {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": VV.settings.apiKey },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        if (!res.ok) return null;
        const data = await res.json();
        const parts = data?.candidates?.[0]?.content?.parts || [];
        for (const p of parts) {
          if (p.inlineData?.data) return `data:${p.inlineData.mimeType || "image/png"};base64,${p.inlineData.data}`;
        }
      } catch (e) { /* fall back to curated art */ }
      return null;
    }
  };
})();
