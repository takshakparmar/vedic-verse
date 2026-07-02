/* ═══ Vedic Verse — ink-and-wash art system (v3) ═══
   Direction from reference plates: warm hand-drawn line work over soft watercolor
   washes, swirling epic motion, story-first compositions — translated onto the
   app's OLED-black liquid-glass canvas.
   Aniconic discipline holds: figures appear only as featureless silhouettes
   (a charioteer, a walking trio, sages at a fire) — never rendered faces. */
(function () {
  const VV = window.VV;

  const T = "#CC6B47", TE = "#E8A489", G = "#3A3532", S = "#57514C", A = "#8C8681", P = "#C9C2BB", INK = "#161211";

  /* shared defs — identical in every svg so duplicate ids resolve harmlessly */
  const DEFS = `<defs>
    <radialGradient id="vv-wash-t" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${T}" stop-opacity="0.30"/>
      <stop offset="55%" stop-color="${T}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${T}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vv-wash-a" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#C99A4A" stop-opacity="0.20"/>
      <stop offset="60%" stop-color="#C99A4A" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="#C99A4A" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vv-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${TE}" stop-opacity="0.85"/>
      <stop offset="40%" stop-color="${T}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${T}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="vv-flame" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${TE}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${T}" stop-opacity="0.25"/>
    </linearGradient>
    <filter id="vv-soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>
    <filter id="vv-rough"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.6"/></filter>
  </defs>`;

  function wrap(inner, vb = "0 0 400 240") {
    return `<svg class="art" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${DEFS}${inner}</svg>`;
  }

  /* ── primitives ── */
  const wash = (cx, cy, rx, ry, kind = "t", extra = "") =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#vv-wash-${kind})" ${extra}/>`;
  const glow = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#vv-glow)" filter="url(#vv-soft)"/>`;

  function spiral(cx, cy, r0, r1, turns, rot = 0) {
    const n = 60; let d = "";
    for (let i = 0; i <= n; i++) {
      const p = i / n;
      const a = rot + p * turns * Math.PI * 2;
      const r = r0 + (r1 - r0) * p;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    return d;
  }
  const swirl = (cx, cy, r0, r1, turns, color = S, w = 1.2, rot = 0, o = 1) =>
    `<path d="${spiral(cx, cy, r0, r1, turns, rot)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;

  function stars(seed, n, w, h, yMax = 0.65) {
    let out = ""; let s = seed;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) {
      const x = rnd() * w, y = rnd() * h * yMax, r = 0.5 + rnd() * 1.1, o = 0.15 + rnd() * 0.45;
      out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${A}" opacity="${o.toFixed(2)}"/>`;
    }
    return out;
  }
  function sparks(seed, n, cx, cy, spread) {
    let out = ""; let s = seed;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) {
      const x = cx + (rnd() - 0.5) * spread, y = cy - rnd() * spread * 0.9;
      out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.7 + rnd() * 1.2).toFixed(1)}" fill="${TE}" opacity="${(0.2 + rnd() * 0.55).toFixed(2)}"/>`;
    }
    return out;
  }
  const ground = (y, w = 400, o = 0.9) =>
    `<path d="M 0 ${y} Q ${w * 0.3} ${y - 3} ${w * 0.55} ${y} T ${w} ${y - 1}" fill="none" stroke="${G}" stroke-width="1.1" opacity="${o}" filter="url(#vv-rough)"/>`;

  /* a small flame (diya / offering) */
  const flame = (cx, cy, h) => `
    <path d="M ${cx} ${cy} C ${cx - h * 0.34} ${cy - h * 0.5} ${cx - h * 0.1} ${cy - h * 0.72} ${cx} ${cy - h}
             C ${cx + h * 0.12} ${cy - h * 0.66} ${cx + h * 0.38} ${cy - h * 0.42} ${cx + h * 0.16} ${cy - h * 0.14}
             C ${cx + h * 0.34} ${cy - h * 0.22} ${cx + h * 0.36} ${cy - h * 0.32} ${cx + h * 0.4} ${cy - h * 0.42}
             C ${cx + h * 0.48} ${cy - h * 0.14} ${cx + h * 0.28} ${cy + h * 0.02} ${cx} ${cy} Z"
      fill="url(#vv-flame)" stroke="${T}" stroke-width="1"/>`;

  /* seated sage silhouette (featureless, back-lit) */
  const sage = (cx, cy, s = 1, fill = INK) => `
    <g transform="translate(${cx} ${cy}) scale(${s})">
      <path d="M 0 -30 C -7 -30 -11 -25 -11 -19 C -11 -14 -8 -10 -4 -9
               C -14 -6 -20 2 -22 12 L -24 20 L 24 20 L 22 12 C 20 2 14 -6 4 -9
               C 8 -10 11 -14 11 -19 C 11 -25 7 -30 0 -30 Z"
        fill="${fill}" stroke="${TE}" stroke-width="1.2" stroke-opacity="0.9"/>
      <path d="M -24 20 L 24 20 L 20 24 L -20 24 Z" fill="${fill}" opacity="0.9"/>
    </g>`;

  /* standing walker silhouette */
  const walker = (cx, cy, s = 1, bow = false) => `
    <g transform="translate(${cx} ${cy}) scale(${s})">
      <circle cx="0" cy="-34" r="6" fill="${INK}" stroke="${TE}" stroke-width="1.1" stroke-opacity="0.85"/>
      <path d="M 0 -28 C -6 -26 -8 -18 -8 -8 L -10 22 L -4 22 L -1 -2 L 2 22 L 8 22 L 7 -8 C 7 -18 5 -26 0 -28 Z"
        fill="${INK}" stroke="${TE}" stroke-width="1.1" stroke-opacity="0.8"/>
      ${bow ? `<path d="M 10 -30 Q 22 -8 10 14" fill="none" stroke="${TE}" stroke-width="1.1" opacity="0.8"/><line x1="10" y1="-30" x2="10" y2="14" stroke="${A}" stroke-width="0.6" opacity="0.7"/>` : ""}
    </g>`;

  /* the great chariot — canopy, wheel, banner, two seated silhouettes */
  function chariot(cx, cy, s = 1) {
    return `<g transform="translate(${cx} ${cy}) scale(${s})">
      <!-- wheel -->
      <circle cx="26" cy="26" r="22" fill="none" stroke="${P}" stroke-width="1.6"/>
      <circle cx="26" cy="26" r="16" fill="none" stroke="${S}" stroke-width="0.9"/>
      ${Array.from({ length: 10 }, (_, i) => { const a = i / 10 * Math.PI * 2; return `<line x1="${26 + Math.cos(a) * 4}" y1="${26 + Math.sin(a) * 4}" x2="${(26 + Math.cos(a) * 15).toFixed(1)}" y2="${(26 + Math.sin(a) * 15).toFixed(1)}" stroke="${S}" stroke-width="1"/>`; }).join("")}
      <circle cx="26" cy="26" r="3.4" fill="${T}"/>
      <!-- carriage -->
      <path d="M -52 22 L -46 -2 C -44 -8 -38 -10 -30 -10 L 34 -10 L 40 22 Z" fill="${INK}" stroke="${P}" stroke-width="1.3"/>
      <path d="M -52 22 L 44 22" stroke="${P}" stroke-width="1.3"/>
      <!-- canopy -->
      <path d="M -46 -34 Q -6 -50 38 -34 L 34 -28 Q -6 -42 -42 -28 Z" fill="${INK}" stroke="${P}" stroke-width="1.2"/>
      <line x1="-40" y1="-29" x2="-40" y2="-10" stroke="${A}" stroke-width="1"/>
      <line x1="30" y1="-29" x2="30" y2="-10" stroke="${A}" stroke-width="1"/>
      <!-- charioteer (front, holding reins) + archer behind: featureless silhouettes -->
      <circle cx="-30" cy="-18" r="5" fill="${INK}" stroke="${TE}" stroke-width="1.2" stroke-opacity="0.9"/>
      <path d="M -30 -13 C -36 -12 -38 -6 -38 -10 L -38 -10 L -22 -10 C -22 -6 -24 -12 -30 -13 Z" fill="${INK}" stroke="${TE}" stroke-width="1" stroke-opacity="0.75"/>
      <path d="M -36 -12 Q -48 -8 -56 -2" stroke="${TE}" stroke-width="0.8" fill="none" opacity="0.7"/>
      <circle cx="2" cy="-22" r="5.6" fill="${INK}" stroke="${TE}" stroke-width="1.2" stroke-opacity="0.9"/>
      <path d="M 2 -16 C -6 -15 -8 -10 -8 -10 L 12 -10 C 12 -10 10 -15 2 -16 Z" fill="${INK}" stroke="${TE}" stroke-width="1" stroke-opacity="0.75"/>
      <path d="M 10 -24 Q 20 -12 10 0" fill="none" stroke="${TE}" stroke-width="1" opacity="0.85"/>
      <!-- banner -->
      <line x1="14" y1="-56" x2="14" y2="-34" stroke="${A}" stroke-width="1.1"/>
      <path d="M 14 -56 Q 30 -52 14 -46" fill="${T}" opacity="0.9"/>
    </g>`;
  }

  /* ═══════════ COVERS ═══════════ */
  const covers = {
    /* Gita — the chariot drawn up between two armies, banner lifted, dust swirling */
    gita: () => wrap(`
      ${wash(300, 40, 180, 110, "t")}${wash(70, 200, 150, 90, "a")}
      ${stars(11, 20, 400, 120)}
      ${swirl(340, 60, 4, 40, 2.2, G, 1, 0.6, 0.8)}
      ${swirl(60, 80, 3, 30, 2, G, 0.9, 2.4, 0.6)}
      <g opacity="0.55">
        ${Array.from({ length: 7 }, (_, i) => `<line x1="${8 + i * 13}" y1="${150 - (i % 3) * 6}" x2="${14 + i * 13}" y2="${128 - (i % 3) * 6}" stroke="${S}" stroke-width="1"/>`).join("")}
        ${Array.from({ length: 7 }, (_, i) => `<line x1="${310 + i * 13}" y1="${150 - (i % 3) * 6}" x2="${304 + i * 13}" y2="${128 - (i % 3) * 6}" stroke="${S}" stroke-width="1"/>`).join("")}
      </g>
      ${glow(200, 150, 60)}
      ${chariot(196, 158, 1.05)}
      ${ground(208)}
      ${sparks(23, 10, 200, 130, 140)}
    `),
    /* Ramayana — the walking trio in the forest, arched trees, distant bow-star bridge */
    ramayana: () => wrap(`
      ${wash(200, 60, 190, 100, "a")}${wash(330, 190, 130, 80, "t")}
      ${stars(29, 18, 400, 100)}
      <path d="M 30 210 C 40 120 70 70 130 46" fill="none" stroke="${S}" stroke-width="1.6" filter="url(#vv-rough)"/>
      <path d="M 370 210 C 360 120 330 70 270 46" fill="none" stroke="${S}" stroke-width="1.6" filter="url(#vv-rough)"/>
      <path d="M 118 60 Q 200 18 282 60" fill="none" stroke="${G}" stroke-width="1.2"/>
      <g opacity="0.75">${swirl(96, 84, 2, 22, 1.8, G, 0.9, 1, 0.9)}${swirl(306, 90, 2, 20, 1.8, G, 0.9, 4, 0.9)}</g>
      ${glow(200, 128, 46)}
      ${walker(172, 158, 1.06, true)}
      ${walker(200, 154, 0.98)}
      ${walker(228, 160, 1.02)}
      ${ground(186)}
      <path d="M 60 40 Q 200 8 340 40" fill="none" stroke="${T}" stroke-width="1" stroke-dasharray="1 7" stroke-linecap="round" opacity="0.9"/>
    `),
    /* Mahabharata — the war-swirl: spears and banners caught in a great vortex, dice below */
    mahabharata: () => wrap(`
      ${wash(220, 90, 200, 120, "t")}
      ${stars(47, 14, 400, 90)}
      ${swirl(230, 96, 6, 84, 2.6, P, 1.5, 0.4)}
      ${swirl(230, 96, 4, 62, 2.2, S, 1, 2.2, 0.8)}
      ${swirl(120, 140, 3, 26, 1.8, G, 0.9, 1.2, 0.7)}
      <g stroke="${P}" stroke-width="1.2" opacity="0.9">
        <line x1="84" y1="176" x2="128" y2="84"/><path d="M 128 84 l -7 3 l 5 -9 l 4 9 z" fill="${P}"/>
        <line x1="120" y1="182" x2="150" y2="108"/><path d="M 150 108 l -6 2 l 4 -8 l 4 8 z" fill="${A}"/>
        <line x1="300" y1="180" x2="276" y2="96"/><path d="M 276 96 l -3 8 l 5 -3 l 4 5 z" fill="${A}"/>
      </g>
      <line x1="318" y1="176" x2="318" y2="120" stroke="${A}" stroke-width="1.1"/>
      <path d="M 318 120 Q 336 126 318 134" fill="${T}"/>
      ${glow(230, 96, 30)}
      <g transform="rotate(-12 150 204)"><rect x="136" y="190" width="26" height="26" rx="5" fill="${INK}" stroke="${T}" stroke-width="1.3"/><circle cx="144" cy="198" r="1.7" fill="${TE}"/><circle cx="154" cy="208" r="1.7" fill="${TE}"/></g>
      <g transform="rotate(9 252 206)"><rect x="240" y="192" width="26" height="26" rx="5" fill="${INK}" stroke="${S}" stroke-width="1.2"/><circle cx="248" cy="200" r="1.7" fill="${A}"/><circle cx="253" cy="205" r="1.7" fill="${A}"/><circle cx="258" cy="210" r="1.7" fill="${A}"/></g>
      ${ground(224, 400, 0.7)}
    `),
    /* Vedas — sages gathered at the fire altar, sparks rising into a listening sky */
    vedas: () => wrap(`
      ${wash(200, 190, 190, 100, "a")}${wash(200, 70, 150, 80, "t")}
      ${stars(83, 26, 400, 110)}
      ${glow(200, 148, 44)}
      <path d="M 156 178 L 244 178 L 228 156 L 172 156 Z" fill="${INK}" stroke="${P}" stroke-width="1.3"/>
      <path d="M 168 156 L 232 156 L 220 140 L 180 140 Z" fill="${INK}" stroke="${S}" stroke-width="1.1"/>
      ${flame(200, 138, 34)}
      ${sparks(7, 14, 200, 120, 90)}
      ${sage(120, 186, 1.15)}
      ${sage(282, 186, 1.15)}
      ${sage(60, 194, 0.9)}
      ${sage(342, 194, 0.9)}
      ${ground(212)}
      ${swirl(200, 54, 2, 26, 2, G, 0.8, 0.8, 0.55)}
    `),
    /* Upanishads — the teacher and student beneath the great tree */
    upanishads: () => wrap(`
      ${wash(140, 90, 170, 100, "a")}${wash(320, 200, 120, 70, "t")}
      ${stars(61, 16, 400, 90)}
      <path d="M 116 196 C 112 130 120 92 140 66" fill="none" stroke="${S}" stroke-width="2" filter="url(#vv-rough)"/>
      <path d="M 140 66 C 96 58 66 74 48 96 M 140 66 C 168 40 216 38 252 54 M 140 66 C 120 44 92 38 66 44" fill="none" stroke="${S}" stroke-width="1.2"/>
      <g opacity="0.8">${swirl(230, 58, 2, 24, 1.9, G, 0.9, 3.2, 0.8)}${swirl(70, 80, 2, 18, 1.7, G, 0.8, 1, 0.7)}</g>
      ${glow(226, 168, 34)}
      ${sage(200, 178, 1.25)}
      ${sage(258, 188, 0.95)}
      ${ground(204)}
    `),
    /* Puranas — the cosmic ocean: serpent-wave, conch spiral, a churning sky */
    puranas: () => wrap(`
      ${wash(240, 80, 200, 110, "t")}${wash(90, 190, 140, 80, "a")}
      ${stars(97, 22, 400, 100)}
      ${swirl(260, 84, 5, 60, 2.4, P, 1.3, 0.2)}
      ${swirl(150, 70, 3, 30, 2, S, 1, 2, 0.8)}
      <path d="M 0 178 Q 46 162 92 178 T 184 178 T 276 178 T 368 178 L 400 176" fill="none" stroke="${P}" stroke-width="1.4"/>
      <path d="M 0 196 Q 46 182 92 196 T 184 196 T 276 196 T 368 196 L 400 194" fill="none" stroke="${S}" stroke-width="1"/>
      <path d="M 40 178 C 24 156 36 138 58 138 C 46 148 44 160 56 170 Z" fill="${INK}" stroke="${TE}" stroke-width="1" stroke-opacity="0.7"/>
      ${glow(210, 130, 36)}
      ${swirl(210, 132, 2, 22, 2.6, TE, 1.4, 1.2)}
      ${ground(224, 400, 0.6)}
    `)
  };

  /* ═══════════ ONBOARDING PLATES ═══════════ */
  const onboardArt = [
    /* 1 — the unrolled scroll, Om rising from it in light */
    () => wrap(`
      ${wash(210, 110, 210, 130, "a")}${wash(90, 220, 130, 70, "t")}
      ${stars(5, 18, 400, 110)}
      ${swirl(330, 70, 3, 34, 2.2, G, 1, 0.4, 0.8)}
      <g transform="rotate(-7 200 170)">
        <rect x="92" y="150" width="216" height="52" rx="6" fill="${INK}" stroke="${P}" stroke-width="1.4"/>
        <circle cx="92" cy="176" r="11" fill="${INK}" stroke="${P}" stroke-width="1.4"/>
        <circle cx="308" cy="176" r="11" fill="${INK}" stroke="${P}" stroke-width="1.4"/>
        <line x1="112" y1="166" x2="240" y2="166" stroke="${S}" stroke-width="1"/>
        <line x1="112" y1="176" x2="268" y2="176" stroke="${S}" stroke-width="1"/>
        <line x1="112" y1="186" x2="220" y2="186" stroke="${S}" stroke-width="1"/>
      </g>
      ${glow(200, 96, 46)}
      <text x="200" y="112" text-anchor="middle" font-size="52" fill="${TE}" style="font-family:'Noto Serif Devanagari', serif" opacity="0.95">ॐ</text>
      ${sparks(3, 12, 200, 86, 120)}
    `, "0 0 400 260"),
    /* 2 — the diya and the mala: daily practice */
    () => wrap(`
      ${wash(200, 170, 190, 100, "t")}${wash(310, 60, 120, 70, "a")}
      ${stars(19, 20, 400, 100)}
      <ellipse cx="200" cy="196" rx="58" ry="9" fill="none" stroke="${G}" stroke-width="1.1"/>
      <path d="M 148 190 Q 200 172 252 190 L 244 200 Q 200 186 156 200 Z" fill="${INK}" stroke="${P}" stroke-width="1.3"/>
      ${glow(200, 150, 42)}
      ${flame(200, 168, 44)}
      ${sparks(13, 10, 200, 140, 70)}
      <path d="M 84 226 C 120 210 160 204 200 206 C 250 208 300 218 330 232" fill="none" stroke="${S}" stroke-width="1"/>
      ${Array.from({ length: 15 }, (_, i) => { const t = i / 14; const x = 84 + t * 246; const y = 226 - Math.sin(t * Math.PI) * 22 + t * 4; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.1" fill="${INK}" stroke="${i === 7 ? T : A}" stroke-width="1.1"/>`; }).join("")}
      ${swirl(330, 80, 2, 26, 2, G, 0.9, 4.4, 0.7)}
    `, "0 0 400 260"),
    /* 3 — the teaching on the field: chariot at rest, question and answer */
    () => wrap(`
      ${wash(200, 80, 210, 110, "t")}${wash(60, 210, 120, 70, "a")}
      ${stars(31, 18, 400, 100)}
      ${swirl(66, 70, 3, 32, 2.2, G, 1, 1.8, 0.8)}
      ${glow(206, 130, 56)}
      ${chariot(200, 150, 1.12)}
      ${ground(206)}
      ${sparks(43, 8, 200, 110, 130)}
    `, "0 0 400 260"),
    /* 4 — the path to the summit at first light */
    () => wrap(`
      ${wash(290, 70, 160, 90, "a")}${wash(110, 200, 140, 80, "t")}
      ${stars(53, 24, 400, 110)}
      <path d="M 30 216 L 150 96 L 214 160 L 268 106 L 372 216" fill="none" stroke="${P}" stroke-width="1.5" stroke-linejoin="round" filter="url(#vv-rough)"/>
      <path d="M 110 216 L 190 138 L 246 196" fill="none" stroke="${S}" stroke-width="1" opacity="0.8"/>
      <path d="M 200 216 C 176 196 224 178 204 160 C 188 146 216 132 208 118" fill="none" stroke="${T}" stroke-width="1.2" stroke-dasharray="6 7" stroke-linecap="round"/>
      ${glow(298, 64, 30)}
      <circle cx="298" cy="64" r="15" fill="none" stroke="${T}" stroke-width="1.4"/>
      ${ground(218)}
      ${swirl(348, 130, 2, 20, 1.8, G, 0.8, 0.6, 0.6)}
    `, "0 0 400 260")
  ];

  /* ═══════════ SCENES (Darshan beats) ═══════════ */
  const scenes = {
    battlefield: () => covers.gita(),
    flame: () => onboardArt[1](),
    lotus: () => wrap(`
      ${wash(200, 130, 180, 100, "t")}${stars(19, 14, 400, 90)}
      <g stroke-width="1.2" fill="none">
        <path d="M 200 170 C 186 148 186 124 200 104 C 214 124 214 148 200 170 Z" stroke="${T}"/>
        <path d="M 200 170 C 176 158 164 136 166 112 C 188 122 200 142 200 170 Z" stroke="${P}"/>
        <path d="M 200 170 C 224 158 236 136 234 112 C 212 122 200 142 200 170 Z" stroke="${P}"/>
        <path d="M 200 170 C 168 168 146 152 138 130 C 164 132 188 148 200 170 Z" stroke="${S}"/>
        <path d="M 200 170 C 232 168 254 152 262 130 C 236 132 212 148 200 170 Z" stroke="${S}"/>
      </g>
      <path d="M 96 186 Q 200 202 304 186" fill="none" stroke="${S}" stroke-width="1"/>
      <path d="M 110 198 Q 200 212 290 198" fill="none" stroke="${G}" stroke-width="0.8"/>
      ${glow(200, 136, 34)}${swirl(320, 70, 2, 24, 2, G, 0.9, 1, 0.7)}
    `),
    tree: () => covers.upanishads(),
    mountain: () => onboardArt[3](),
    river: () => wrap(`
      ${wash(300, 70, 150, 90, "a")}${wash(120, 180, 150, 90, "t")}${stars(61, 18, 400, 100)}
      <path d="M 40 52 C 130 78 110 116 200 130 C 282 142 292 168 356 182" fill="none" stroke="${P}" stroke-width="1.5" filter="url(#vv-rough)"/>
      <path d="M 20 78 C 110 102 92 136 182 150 C 262 162 274 186 336 200" fill="none" stroke="${S}" stroke-width="1"/>
      ${glow(330, 60, 32)}
      <circle cx="330" cy="60" r="14" fill="none" stroke="${T}" stroke-width="1.3"/>
      ${swirl(84, 130, 2, 22, 2, G, 0.9, 2.6, 0.7)}
      ${sage(70, 210, 1.0)}
      ${ground(226, 400, 0.6)}
    `),
    cosmos: () => covers.puranas(),
    path: () => onboardArt[3]()
  };

  const THEME_SCENE = {
    duty: "battlefield", action: "battlefield", grief: "river", fear: "mountain",
    mind: "path", meditation: "lotus", devotion: "flame", death: "cosmos",
    attachment: "tree", anger: "flame", peace: "lotus", knowledge: "tree",
    purpose: "path", surrender: "flame", equanimity: "mountain", war: "battlefield",
    happiness: "lotus", desire: "flame", failure: "mountain", default: "cosmos"
  };

  VV.art = {
    cover: id => (covers[id] || covers.gita)(),
    onboard: n => (onboardArt[n] || onboardArt[0])(),
    scene: key => (scenes[key] || scenes.cosmos)(),
    sceneForTheme: t => (scenes[THEME_SCENE[t] || "cosmos"])(),
    sceneKeys: Object.keys(scenes),
    sceneFromText(desc) {
      const d = (desc || "").toLowerCase();
      const map = [
        [/battle|field|armies|chariot|war|kuru/, "battlefield"],
        [/flame|fire|lamp|diya|ember|offering|altar/, "flame"],
        [/lotus|calm|still|pond|petal/, "lotus"],
        [/tree|banyan|root|branch|ashvattha|leaf/, "tree"],
        [/mountain|peak|summit|himalaya|stone|cliff/, "mountain"],
        [/river|flow|sea|ocean|ganga|stream|water|wave/, "river"],
        [/cosmos|universe|star|infinite|form|sky|sun|moon|serpent/, "cosmos"],
        [/path|road|journey|steps|way|dawn/, "path"]
      ];
      for (const [re, key] of map) if (re.test(d)) return key;
      return "cosmos";
    }
  };
})();
