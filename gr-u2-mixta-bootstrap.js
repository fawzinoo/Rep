(() => {
  'use strict';

  const TOPICS = [
    'querer', 'pensar', 'ir', 'ver', 'leer', 'aprender', 'escuchar',
    'salir', 'jugar', 'practicar', 'visitar', 'indeterminantes',
    'porparaporque'
  ];
  const VERB_TOPICS = {
    querer: 'querer',
    pensar: 'pensar',
    ir: 'ir',
    ver: 'ver',
    leer: 'leer',
    aprender: 'aprender',
    escuchar: 'escuchar',
    salir: 'salir',
    jugar: 'jugar',
    practicar: 'practicar',
    visitar: 'visitar'
  };
  const VERB_DISTRACTORS = {
    querer: ['quiero', 'quieres', 'quiere', 'queremos', 'queréis', 'quieren', 'queres', 'quere', 'queren', 'quieremos', 'quieréis', 'quiro'],
    pensar: ['pienso', 'piensas', 'piensa', 'pensamos', 'pensáis', 'piensan', 'pensas', 'pensa', 'pensan', 'piensemos', 'pienéis', 'penso'],
    ir: ['voy', 'vas', 'va', 'vamos', 'vais', 'van', 'vo', 'imos', 'vai', 'ves', 've', 'io'],
    ver: ['veo', 'ves', 've', 'vemos', 'veis', 'ven', 'vo', 'veyo', 'veimos', 'vies', 'vei', 'vien'],
    leer: ['leo', 'lees', 'lee', 'leemos', 'leéis', 'leen', 'leyo', 'les', 'leye', 'leimos', 'leyen', 'leis'],
    aprender: ['aprendo', 'aprendes', 'aprende', 'aprendemos', 'aprendéis', 'aprenden', 'aprendas', 'aprenda', 'aprendis', 'aprendimos', 'aprendan'],
    escuchar: ['escucho', 'escuchas', 'escucha', 'escuchamos', 'escucháis', 'escuchan', 'escuches', 'escuche', 'escuchimos', 'escuchen'],
    salir: ['salgo', 'sales', 'sale', 'salimos', 'salís', 'salen', 'salo', 'salemos', 'salas', 'salan', 'salis', 'saléis'],
    jugar: ['juego', 'juegas', 'juega', 'jugamos', 'jugáis', 'juegan', 'jugas', 'juga', 'jugan', 'juegamos', 'juegáis', 'jugo'],
    practicar: ['practico', 'practicas', 'practica', 'practicamos', 'practicáis', 'practican', 'practiques', 'practique', 'practicimos', 'practiquen'],
    visitar: ['visito', 'visitas', 'visita', 'visitamos', 'visitáis', 'visitan', 'visites', 'visite', 'visitimos', 'visiten']
  };
  const getCanonicalAudioFile = (source, sourceIndex) => {
    if (VERB_TOPICS[source]) {
      const personMap = [1, 2, 3, 3, 3, 4, 4, 5, 5, 6, 6, 6];
      let p = personMap[sourceIndex] || 1;
      // Caso especial CDN: practicar-4.wav no existe, fallback a practica (practicar-3.wav)
      if (source === 'practicar' && p === 4) p = 3;
      return `${source}-${p}.wav`;
    }
    if (source === 'indeterminantes') {
      return sourceIndex === 0 ? 'indeterminantes-1.wav' : `indeterminantes-${sourceIndex + 1}..wav`;
    }
    if (source === 'porparaporque') {
      return `porparaporque-${sourceIndex + 1}.wav`;
    }
    return `${source}-${sourceIndex + 1}.wav`;
  };
  const INFINITIVE_CSS = `
#flashcard-container .flashcard .front-infinitive {
  display: block !important;
  margin-top: 6px !important;
  color: #facc15 !important;
  font-family: 'Poppins', sans-serif !important;
  font-size: clamp(1.6rem, 5vw, 2.2rem) !important;
  font-weight: 800 !important;
  line-height: 1.1 !important;
  letter-spacing: .08em !important;
  text-transform: lowercase !important;
  text-shadow: 0 3px 10px rgba(0, 0, 0, .38) !important;
}
#flashcard-container .flashcard .front-infinitive::before {
  content: '' !important;
  display: block !important;
  width: min(34%, 160px) !important;
  height: 2px !important;
  margin: 0 auto 10px !important;
  border-radius: 999px !important;
  background: rgba(250, 204, 21, .72) !important;
  box-shadow: 0 1px 6px rgba(250, 204, 21, .28) !important;
}
#flashcard-container .flashcard[data-source="ir"] .front-infinitive,
#flashcard-container .flashcard[data-source="ver"] .front-infinitive {
  font-size: clamp(1.82rem, 5.7vw, 2.45rem) !important;
}
`;
  const SEL_ARTICLE_CSS = `
/* Estilos auténticos de Selección para porparaporque e indeterminantes en U2 */
#flashcard-container .flashcard[data-source="porparaporque"] .article-front-card,
#flashcard-container .flashcard[data-source="indeterminantes"] .article-front-card {
  width: min(72%, 360px) !important;
  min-height: auto !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: clamp(9px, 1.7vw, 13px) !important;
  position: relative !important;
  z-index: 2 !important;
  padding: clamp(10px, 1.8vw, 14px) !important;
  border-radius: 18px !important;
  background: rgba(255, 255, 255, 0.09) !important;
  border: 1px solid rgba(255, 255, 255, 0.16) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.13), 0 16px 34px rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: blur(5px) !important;
  -webkit-backdrop-filter: blur(5px) !important;
}
#flashcard-container .flashcard[data-source="porparaporque"] .article-front-card::before,
#flashcard-container .flashcard[data-source="indeterminantes"] .article-front-card::before {
  content: none !important;
  display: none !important;
}
#flashcard-container .flashcard[data-source="porparaporque"] .article-noun-column,
#flashcard-container .flashcard[data-source="indeterminantes"] .article-noun-column {
  order: 2 !important;
  max-width: 100% !important;
  min-width: 0 !important;
  font-family: 'Poppins', sans-serif !important;
  font-weight: 900 !important;
  font-size: clamp(1.55rem, 3.5vw, 2.45rem) !important;
  color: #fff !important;
  line-height: 0.95 !important;
  text-align: center !important;
  letter-spacing: 0 !important;
  text-transform: lowercase !important;
  white-space: normal !important;
  overflow-wrap: normal !important;
  word-break: normal !important;
  hyphens: none !important;
  text-shadow: 0 0 42px rgba(34, 211, 238, 0.36), 0 10px 28px rgba(0, 0, 0, 0.46) !important;
}
#flashcard-container .flashcard[data-source="porparaporque"] .article-options-column {
  order: 1 !important;
  width: min(100%, 300px) !important;
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 5px !important;
  padding: 5px !important;
  border-radius: 15px !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  align-self: center !important;
  align-content: center !important;
  justify-items: stretch !important;
  margin: 0 auto !important;
}
#flashcard-container .flashcard[data-source="indeterminantes"] .article-options-column {
  order: 1 !important;
  width: min(100%, 300px) !important;
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  gap: 5px !important;
  padding: 5px !important;
  border-radius: 15px !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  align-self: center !important;
  align-content: center !important;
  justify-items: stretch !important;
  margin: 0 auto !important;
}
#flashcard-container .flashcard[data-source="porparaporque"] .article-option,
#flashcard-container .flashcard[data-source="indeterminantes"] .article-option {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 30px !important;
  padding: 4px 5px !important;
  border-radius: 10px !important;
  font-family: 'Poppins', sans-serif !important;
  font-weight: 800 !important;
  font-size: clamp(0.72rem, 1.35vw, 0.84rem) !important;
  color: #ffd54a !important;
  background: rgba(255, 213, 74, 0.12) !important;
  border: 1px solid rgba(255, 213, 74, 0.28) !important;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.26) !important;
  text-transform: lowercase !important;
  letter-spacing: 0 !important;
  box-shadow: none !important;
  cursor: pointer !important;
  width: 100% !important;
  min-width: 0 !important;
  margin: 0 !important;
}
#flashcard-container .flashcard[data-source="porparaporque"] .front-verb-tag,
#flashcard-container .flashcard[data-source="indeterminantes"] .front-verb-tag {
  position: absolute !important;
  top: 18px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  font-family: 'Poppins', sans-serif !important;
  font-weight: 700 !important;
  font-size: 0.95rem !important;
  color: rgba(255, 255, 255, 0.45) !important;
  text-transform: uppercase !important;
  letter-spacing: 3px !important;
  z-index: 2 !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  padding: 5px 16px !important;
  border-radius: 20px !important;
  backdrop-filter: blur(4px) !important;
  -webkit-backdrop-filter: blur(4px) !important;
  white-space: nowrap !important;
}
@media (max-width: 620px) {
  #flashcard-container .flashcard[data-source="porparaporque"] .article-front-card,
  #flashcard-container .flashcard[data-source="indeterminantes"] .article-front-card {
    width: min(82%, 285px) !important;
    min-height: auto !important;
    gap: 6px !important;
    padding: 10px !important;
  }
  #flashcard-container .flashcard[data-source="porparaporque"] .article-noun-column,
  #flashcard-container .flashcard[data-source="indeterminantes"] .article-noun-column {
    font-size: clamp(1.38rem, 6.4vw, 2rem) !important;
  }
  #flashcard-container .flashcard[data-source="porparaporque"] .article-options-column {
    width: min(100%, 250px) !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 5px !important;
    padding: 5px !important;
    border-radius: 13px !important;
  }
  #flashcard-container .flashcard[data-source="indeterminantes"] .article-options-column {
    width: min(100%, 250px) !important;
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    gap: 5px !important;
    padding: 5px !important;
    border-radius: 13px !important;
  }
  #flashcard-container .flashcard[data-source="porparaporque"] .article-option,
  #flashcard-container .flashcard[data-source="indeterminantes"] .article-option {
    min-height: 28px !important;
    font-size: clamp(0.66rem, 2.9vw, 0.78rem) !important;
    border-radius: 9px !important;
  }
}
@media (max-width: 360px) {
  #flashcard-container .flashcard[data-source="porparaporque"] .article-options-column {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    width: min(100%, 220px) !important;
  }
  #flashcard-container .flashcard[data-source="indeterminantes"] .article-options-column {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    width: min(100%, 220px) !important;
  }
}
`;

  const HUB_ARTICLE_CSS = `
#flashcard-container .flashcard[data-source="porparaporque"] .article-front-card,
#flashcard-container .flashcard[data-source="indeterminantes"] .article-front-card {
  width: min(88%, 500px) !important;
  min-height: min(58%, 320px) !important;
  display: grid !important;
  grid-template-columns: minmax(108px, 0.36fr) minmax(0, 1fr) !important;
  align-items: center !important;
  gap: clamp(18px, 4.5vw, 34px) !important;
  z-index: 2 !important;
  position: relative !important;
  padding: clamp(18px, 4vw, 26px) !important;
  border-radius: 28px !important;
  background: linear-gradient(135deg, rgba(255,255,255,0.13), rgba(255,255,255,0.045)) !important;
  border: 1px solid rgba(255,255,255,0.16) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 22px 60px rgba(4, 8, 30, 0.26) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
}
#flashcard-container .flashcard[data-source="porparaporque"] .article-front-card::before,
#flashcard-container .flashcard[data-source="indeterminantes"] .article-front-card::before {
  content: '' !important;
  display: block !important;
  position: absolute !important;
  inset: 12px !important;
  border-radius: 22px !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  pointer-events: none !important;
}
#flashcard-container .flashcard[data-source="porparaporque"] .article-options-column,
#flashcard-container .flashcard[data-source="indeterminantes"] .article-options-column {
  display: grid !important;
  grid-template-columns: 1fr !important;
  gap: 9px !important;
  justify-items: stretch !important;
  align-self: stretch !important;
  align-content: center !important;
  order: 0 !important;
  width: auto !important;
  padding: 0 !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  margin: 0 !important;
}
#flashcard-container .flashcard[data-source="porparaporque"] .article-option,
#flashcard-container .flashcard[data-source="indeterminantes"] .article-option {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 42px !important;
  padding: 8px 12px !important;
  border-radius: 14px !important;
  font-family: 'Poppins', sans-serif !important;
  font-weight: 800 !important;
  font-size: clamp(1rem, 2.4vw, 1.28rem) !important;
  color: rgba(255, 255, 255, 0.82) !important;
  background: rgba(255, 255, 255, 0.105) !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  text-transform: lowercase !important;
  letter-spacing: 0 !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12) !important;
  text-shadow: none !important;
  cursor: pointer !important;
  width: auto !important;
  min-width: 0 !important;
  margin: 0 !important;
}
#flashcard-container .flashcard[data-source="porparaporque"] .article-noun-column,
#flashcard-container .flashcard[data-source="indeterminantes"] .article-noun-column {
  min-width: 0 !important;
  max-width: 100% !important;
  font-family: 'Poppins', sans-serif !important;
  font-weight: 900 !important;
  font-size: clamp(2.35rem, 6.4vw, 5rem) !important;
  color: #fff !important;
  line-height: 0.98 !important;
  text-align: left !important;
  letter-spacing: 0 !important;
  text-transform: none !important;
  text-wrap: balance !important;
  overflow-wrap: normal !important;
  word-break: normal !important;
  hyphens: none !important;
  text-shadow: 0 0 42px rgba(34, 211, 238, 0.38), 0 8px 26px rgba(0, 0, 0, 0.42) !important;
  order: 0 !important;
}
#flashcard-container .flashcard[data-source="porparaporque"] .front-verb-tag,
#flashcard-container .flashcard[data-source="indeterminantes"] .front-verb-tag {
  position: absolute !important;
  top: 18px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  font-family: 'Poppins', sans-serif !important;
  font-weight: 700 !important;
  font-size: 0.95rem !important;
  color: rgba(255, 255, 255, 0.45) !important;
  text-transform: uppercase !important;
  letter-spacing: 3px !important;
  z-index: 2 !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  padding: 5px 16px !important;
  border-radius: 20px !important;
  backdrop-filter: blur(4px) !important;
  -webkit-backdrop-filter: blur(4px) !important;
  white-space: nowrap !important;
}
@media (max-width: 620px) {
  #flashcard-container .flashcard[data-source="porparaporque"] .article-front-card,
  #flashcard-container .flashcard[data-source="indeterminantes"] .article-front-card {
    width: min(90%, 390px) !important;
    min-height: auto !important;
    grid-template-columns: 1fr !important;
    gap: 20px !important;
    padding: 20px !important;
    text-align: center !important;
  }
  #flashcard-container .flashcard[data-source="porparaporque"] .article-options-column {
    width: min(100%, 300px) !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 7px !important;
    order: 2 !important;
    justify-self: center !important;
    margin: 0 auto !important;
  }
  #flashcard-container .flashcard[data-source="indeterminantes"] .article-options-column {
    width: min(100%, 300px) !important;
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    gap: 7px !important;
    order: 2 !important;
    justify-self: center !important;
    margin: 0 auto !important;
  }
  #flashcard-container .flashcard[data-source="porparaporque"] .article-option,
  #flashcard-container .flashcard[data-source="indeterminantes"] .article-option {
    min-height: 38px !important;
    padding: 7px 6px !important;
    border-radius: 12px !important;
    font-size: clamp(0.88rem, 4.2vw, 1.05rem) !important;
  }
  #flashcard-container .flashcard[data-source="porparaporque"] .article-noun-column,
  #flashcard-container .flashcard[data-source="indeterminantes"] .article-noun-column {
    order: 1 !important;
    text-align: center !important;
    font-size: clamp(2.15rem, 11.5vw, 3.55rem) !important;
  }
}
@media (max-width: 380px) {
  #flashcard-container .flashcard[data-source="porparaporque"] .article-options-column {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
  #flashcard-container .flashcard[data-source="indeterminantes"] .article-options-column {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}
`;

  const COM_ARTICLE_CSS = `
#flashcard-container .flashcard[data-source="porparaporque"] .article-front-card,
#flashcard-container .flashcard[data-source="indeterminantes"] .article-front-card {
  display: grid !important;
  grid-template-columns: minmax(96px, 0.9fr) minmax(150px, 1.1fr) !important;
  align-items: center !important;
  gap: clamp(18px, 5vw, 34px) !important;
  width: min(92%, 460px) !important;
  z-index: 2 !important;
  position: relative !important;
}
#flashcard-container .flashcard[data-source="porparaporque"] .article-options-column,
#flashcard-container .flashcard[data-source="indeterminantes"] .article-options-column {
  display: grid !important;
  gap: 10px !important;
  justify-items: stretch !important;
}
#flashcard-container .flashcard[data-source="porparaporque"] .article-option,
#flashcard-container .flashcard[data-source="indeterminantes"] .article-option {
  display: block !important;
  padding: 9px 14px !important;
  border-radius: 999px !important;
  font-family: 'Poppins', sans-serif !important;
  font-weight: 800 !important;
  font-size: clamp(1.05rem, 4vw, 1.65rem) !important;
  color: rgba(255, 255, 255, 0.62) !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  text-transform: lowercase !important;
  letter-spacing: 0 !important;
}
#flashcard-container .flashcard[data-source="porparaporque"] .article-noun-column,
#flashcard-container .flashcard[data-source="indeterminantes"] .article-noun-column {
  font-family: 'Poppins', sans-serif !important;
  font-weight: 900 !important;
  font-size: clamp(2rem, 7vw, 3.8rem) !important;
  color: #fff !important;
  line-height: 1.05 !important;
  text-align: left !important;
  text-shadow: 0 0 38px rgba(34, 211, 238, 0.42), 0 5px 18px rgba(0, 0, 0, 0.35) !important;
  overflow-wrap: anywhere !important;
}
@media (max-width: 520px) {
  #flashcard-container .flashcard[data-source="porparaporque"] .article-front-card,
  #flashcard-container .flashcard[data-source="indeterminantes"] .article-front-card {
    grid-template-columns: 1fr !important;
    gap: 18px !important;
    text-align: center !important;
  }
  #flashcard-container .flashcard[data-source="porparaporque"] .article-options-column {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
  #flashcard-container .flashcard[data-source="indeterminantes"] .article-options-column {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  #flashcard-container .flashcard[data-source="porparaporque"] .article-noun-column,
  #flashcard-container .flashcard[data-source="indeterminantes"] .article-noun-column {
    text-align: center !important;
  }
}
`;

  const getArticleCss = (pageMode) => {
    if (pageMode === 'sel') return SEL_ARTICLE_CSS;
    if (pageMode === 'com') return COM_ARTICLE_CSS;
    return HUB_ARTICLE_CSS;
  };
  const TOTAL = TOPICS.length * 3;
  const script = document.currentScript;
  const mode = String(script && script.dataset.mode || '').trim();

  const readText = (file) => {
    const request = new XMLHttpRequest();
    request.open('GET', file, false);
    request.send(null);
    if (request.status && (request.status < 200 || request.status >= 300)) {
      throw new Error('No se pudo leer ' + file);
    }
    return request.responseText;
  };

  const parse = (file) => new DOMParser().parseFromString(readText(file), 'text/html');

  const shuffle = (items) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const normalize = (value) => String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/[.。]\s*$/, '')
    .trim();

  const replaceIdentity = (page, pageMode) => {
    const oldKey = pageMode === 'hub' ? 'gr-u1-mixta' : pageMode + '-gr-u1-mixta';
    const newKey = pageMode === 'hub' ? 'gr-u2-mixta' : pageMode + '-gr-u2-mixta';
    return page
      .replaceAll('U1G14T', 'U2G14T')
      .replaceAll(oldKey, newKey)
      .replaceAll('GR_U1_MIXTA', 'GR_U2_MIXTA')
      .replaceAll('Gramática U1', 'Gramática U2')
      .replaceAll('GRAMÁTICA U1', 'GRAMÁTICA U2')
      .replaceAll('Repaso mixto U1', 'Repaso mixto U2')
      .replaceAll('UNIDAD 1', 'UNIDAD 2')
      .replaceAll('U1G14T1', 'U2G14T1')
      .replaceAll('U1G14T2', 'U2G14T2')
      .replaceAll('U1G14T3', 'U2G14T3')
      .replaceAll('U1G14T4', 'U2G14T4');
  };

  const readDraw = (key, pools) => {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || 'null');
      if (!Array.isArray(parsed) || parsed.length !== TOTAL) return null;
      if (parsed.some((entry) => !entry || !pools[entry.source] ||
        !Number.isInteger(entry.sourceIndex) || entry.sourceIndex < 0 ||
        entry.sourceIndex >= pools[entry.source].length)) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  };

  const makeDraw = (key, pools) => {
    const saved = readDraw(key, pools);
    if (saved) return saved;
    const draw = shuffle(TOPICS.flatMap((source) =>
      shuffle(pools[source].map((_, sourceIndex) => ({ source, sourceIndex }))).slice(0, 3)
    ));
    try { localStorage.setItem(key, JSON.stringify(draw)); } catch (_) {}
    return draw;
  };

  const extractTranslations = (sourceText) => {
    const match = sourceText.match(/const\s+translationMap\s*=\s*(\{[\s\S]*?\});\s*const\s+arabicFontBase64/);
    if (!match) return {};
    try { return Function('"use strict"; return (' + match[1] + ');')(); }
    catch (_) { return {}; }
  };

  const scopeFrontCss = (cssText, root) => {
    const parserStyle = document.createElement('style');
    parserStyle.textContent = cssText;
    document.head.appendChild(parserStyle);
    const walk = (rules) => Array.from(rules || []).map((rule) => {
      if (rule.type === CSSRule.STYLE_RULE) {
        const selectors = rule.selectorText.split(',').map((selector) => selector.trim())
          .map((selector) => {
            const match = selector.match(/\.(?:front(?:\b|-)|article-(?:front|options|option|noun))/);
            return match ? root + ' ' + selector.slice(match.index) : '';
          })
          .filter(Boolean);
        return selectors.length ? selectors.join(',') + '{' + rule.style.cssText + '}' : '';
      }
      if (rule.type === CSSRule.MEDIA_RULE) {
        const nested = walk(rule.cssRules);
        return nested ? '@media ' + rule.conditionText + '{' + nested + '}' : '';
      }
      if (typeof CSSSupportsRule !== 'undefined' && rule instanceof CSSSupportsRule) {
        const nested = walk(rule.cssRules);
        return nested ? '@supports ' + rule.conditionText + '{' + nested + '}' : '';
      }
      return '';
    }).join('');
    let scoped = '';
    try { scoped = walk(parserStyle.sheet && parserStyle.sheet.cssRules); }
    finally { parserStyle.remove(); }
    return scoped;
  };

  const loadPools = (prefix) => {
    const pools = {};
    const translations = {};
    const frontStyles = {};
    for (const topic of TOPICS) {
      // A1beta reutiliza expresamente el tema de indeterminantes de U1.
      const file = prefix === 'gr-u2' && topic === 'indeterminantes'
        ? 'gr-u1-indeterminantes.html'
        : prefix + '-' + topic + '.html';
      const sourceText = readText(file);
      const source = new DOMParser().parseFromString(sourceText, 'text/html');
      pools[topic] = Array.from(source.querySelectorAll('#flashcard-container > .flashcard'));
      if (pools[topic].length < 3) throw new Error('Faltan tarjetas en ' + file);
      translations[topic] = extractTranslations(sourceText);
      // Se leen todos los estilos del archivo de origen. scopeFrontCss conserva
      // exclusivamente los selectores del front y evita contaminar la mixta.
      frontStyles[topic] = Array.from(source.querySelectorAll('style'))
        .map((node) => node.textContent);
    }
    return { pools, translations, frontStyles };
  };

  const appendScopedFrontStyles = (template, frontStyles, pageMode) => {
    Object.entries(frontStyles).forEach(([topic, blocks]) => {
      if (!blocks.length) return;
      const style = template.createElement('style');
      style.id = pageMode + '-gr-u2-mixta-origin-front-' + topic;
      style.textContent = scopeFrontCss(
        blocks.join('\n'),
        '#flashcard-container .flashcard[data-source="' + topic + '"]'
      );
      template.body.appendChild(style);
    });
  };

  const originalFrontStyleMarkup = (pageMode) => {
    const markup = [];
    for (const topic of TOPICS) {
      const source = parse(pageMode + '-' + topic + '.html');
      const css = Array.from(source.querySelectorAll('style'))
        .map((node) => node.textContent)
        .join('\n');
      if (css) {
        const scoped = scopeFrontCss(css, '#flashcard-container .flashcard[data-source="' + topic + '"]');
        markup.push('<style id="' + pageMode + '-gr-u2-mixta-origin-front-' + topic + '">' + scoped + '</style>');
      }
    }
    markup.push('<style id="' + pageMode + '-gr-u2-mixta-front-infinitives">' + INFINITIVE_CSS + '</style>');
    markup.push('<style id="' + pageMode + '-gr-u2-mixta-origin-article-css">' + getArticleCss(pageMode) + '</style>');
    return markup.join('');
  };

  const removeOriginalDeckBuilder = (template) => {
    // Las mixtas U1 contienen varios constructores independientes dentro del
    // tablero (formas verbales, frecuencia, contenido compartido, etc.). Si
    // queda uno, vuelve a insertar tarjetas U1 al ejecutar el documento.
    template.querySelectorAll('#flashcard-container > script').forEach((node) => {
      if (!node.id.includes('canonical')) node.remove();
    });
    template.querySelectorAll('script').forEach((node) => {
      if (node.textContent.includes('const sourceCardPools =')) node.remove();
    });
    template.querySelectorAll('#flashcard-container > template').forEach((node) => node.remove());
    template.querySelectorAll('#flashcard-container > .flashcard').forEach((node) => node.remove());
  };

  const buildStaticMixed = (pageMode) => {
    const isHub = pageMode === 'hub';
    const prefix = isHub ? 'gr-u2' : pageMode;
    const baseFile = isHub ? 'gr-u1-mixta.html' : pageMode + '-gr-u1-mixta.html';
    const template = new DOMParser().parseFromString(
      replaceIdentity(readText(baseFile), pageMode),
      'text/html'
    );
    const finalTitle = isHub
      ? 'Gramática U2 · Mixta'
      : ({ sel: 'Selección · Gramática U2 · Mixta', com: 'Composición · Gramática U2 · Mixta' }[pageMode]);
    template.title = finalTitle;
    if (isHub) {
      const heading = template.querySelector('.demasiado-title-text');
      if (heading) heading.textContent = 'GRAMÁTICA U2 · MIXTA';
    }
    removeOriginalDeckBuilder(template);

    const container = template.getElementById('flashcard-container');
    if (!container) throw new Error('No se encontró el tablero en ' + baseFile);
    const { pools, translations, frontStyles } = loadPools(prefix);
    appendScopedFrontStyles(template, frontStyles, pageMode);

    const infinitiveStyle = template.createElement('style');
    infinitiveStyle.id = (isHub ? 'gr-u2-mixta' : pageMode + '-gr-u2-mixta') + '-front-infinitives';
    infinitiveStyle.textContent = INFINITIVE_CSS;
    template.body.appendChild(infinitiveStyle);

    const originArticleStyle = template.createElement('style');
    originArticleStyle.id = (isHub ? 'gr-u2-mixta' : pageMode + '-gr-u2-mixta') + '-origin-article-css';
    originArticleStyle.textContent = getArticleCss(pageMode);
    template.body.appendChild(originArticleStyle);

    const key = (isHub ? 'gr-u2-mixta' : pageMode + '-gr-u2-mixta') + '-draw';
    const draw = makeDraw(key, pools);
    const metadata = [];
    const anchor = container.querySelector('.results-card, #stats-box');

    draw.forEach(({ source, sourceIndex }, contentIndex) => {
      const original = pools[source][sourceIndex];
      const card = template.importNode(original, true);
      const answer = normalize(card.dataset.answer || card.querySelector('.back')?.textContent);
      card.dataset.answer = answer;
      card.dataset.cardId = (isHub ? 'gr-u2-mixta' : pageMode + '-gr-u2-mixta') + '-' + source + '-' + (sourceIndex + 1);
      card.dataset.contentIndex = String(contentIndex);
      card.dataset.source = source;
      card.dataset.sourceIndex = String(sourceIndex);
      card.dataset.audioFile = getCanonicalAudioFile(source, sourceIndex);

      const front = card.querySelector('.front');
      const infinitive = VERB_TOPICS[source];
      const pronoun = front?.querySelector('.front-pronoun');
      if (infinitive && pronoun && !front.querySelector('.front-infinitive')) {
        const infinitiveLabel = template.createElement('span');
        infinitiveLabel.className = 'front-infinitive';
        infinitiveLabel.textContent = infinitive;
        pronoun.insertAdjacentElement('afterend', infinitiveLabel);
      }

      container.insertBefore(card, anchor || null);

      const translated = translations[source][answer] || translations[source][normalize(answer)] || {};
      metadata.push({
        es: answer,
        ar: translated.ar || answer,
        fr: translated.fr || answer,
        en: translated.en || answer,
        frontHtml: card.querySelector('.front')?.innerHTML || '',
        backHtml: card.querySelector('.back')?.innerHTML || '',
        source,
        sourceIndex
      });
    });

    const optionsByAnswer = {};
    const optionVerbs = {};

    Object.entries(pools).forEach(([topic, cardList]) => {
      cardList.forEach((c) => {
        const answer = normalize(c.dataset.answer || c.querySelector('.back')?.textContent);
        if (!answer || optionsByAnswer[answer]) return;

        let distractors = [];
        if (VERB_DISTRACTORS[topic]) {
          const pool = VERB_DISTRACTORS[topic].filter((opt) => normalize(opt).toLowerCase() !== answer.toLowerCase());
          distractors = shuffle(pool).slice(0, 3);
        } else if (topic === 'indeterminantes') {
          const firstSpace = answer.indexOf(' ');
          const noun = firstSpace >= 0 ? answer.slice(firstSpace + 1).trim() : answer;
          const allArticles = ['un', 'una', 'unos', 'unas'];
          distractors = allArticles
            .filter((art) => (art + ' ' + noun).toLowerCase() !== answer.toLowerCase())
            .map((art) => (art + ' ' + noun).trim());
        } else if (topic === 'porparaporque') {
          const words = answer.split(/\s+/);
          const connector = words[0];
          const remainder = words.slice(1).join(' ');
          const allConnectors = ['por', 'para', 'porque'];
          distractors = allConnectors
            .filter((conn) => conn.toLowerCase() !== connector.toLowerCase())
            .map((conn) => (conn + ' ' + remainder).trim());
        } else {
          const pool = [...new Set(cardList.map((card) => normalize(card.dataset.answer || card.querySelector('.back')?.textContent)))]
            .filter((opt) => opt && opt.toLowerCase() !== answer.toLowerCase());
          distractors = shuffle(pool).slice(0, 3);
        }

        optionsByAnswer[answer] = [answer, ...distractors];
        optionVerbs[answer] = answer;
        distractors.forEach((opt) => { optionVerbs[opt] = opt; });
      });
    });

    const dataScript = template.createElement('script');
    dataScript.id = 'gr-u2-mixta-card-data';
    dataScript.textContent =
      'window.GR_U2_MIXTA_CARD_DATA=' + JSON.stringify(metadata) + ';' +
      'window.GR_U1_MIXTA_CARD_DATA=window.GR_U2_MIXTA_CARD_DATA;' +
      'window.TU_SELECTION_OPTIONS=' + JSON.stringify(optionsByAnswer) + ';' +
      'window.TU_VERB_FORMS={};' +
      'window.TU_OPTION_VERBS=' + JSON.stringify(optionVerbs) + ';';
    container.insertBefore(dataScript, anchor || null);

    let page = '<!DOCTYPE html>\n' + template.documentElement.outerHTML;
    page = replaceIdentity(page, pageMode)
      .replaceAll('esc-gr-u1-mixta.html', 'esc-gr-u2-mixta.html')
      .replaceAll('sel-gr-u1-mixta.html', 'sel-gr-u2-mixta.html')
      .replaceAll('com-gr-u1-mixta.html', 'com-gr-u2-mixta.html')
      .replaceAll('reco-gr-u1-mixta.html', 'reco-gr-u2-mixta.html');

    const verbMapSource = JSON.stringify(VERB_TOPICS);
    const verbKeysSource = JSON.stringify(Object.keys(VERB_TOPICS));
    page = page
      .replace(/const\s+infinitiveBySource\s*=\s*\{[\s\S]*?\};/g, 'const infinitiveBySource = ' + verbMapSource + ';')
      .replace(/const\s+mixedInfinitives\s*=\s*\{[\s\S]*?\};/g, 'const mixedInfinitives = ' + verbMapSource + ';')
      .replace(/const\s+infinitives\s*=\s*\{[\s\S]*?\};/g, 'const infinitives = ' + verbMapSource + ';')
      .replace(/const\s+verbTopics\s*=\s*new\s+Set\(\[[\s\S]*?\]\);/g, 'const verbTopics = new Set(' + verbKeysSource + ');')
      .replace(
        /function\s+resolveAudioFileForCard\([\s\S]*?\}\s*\n/g,
        'function resolveAudioFileForCard(cardId, fallback) {\n' +
        '    if (fallback && /^[^/]+\\.(wav|mp3)$/i.test(fallback.trim())) return fallback.trim();\n' +
        '    const el = document.querySelector(`[data-card-id="${cardId}"]`);\n' +
        '    if (el && el.dataset && el.dataset.audioFile) return el.dataset.audioFile;\n' +
        '    return fallback || "";\n' +
        '}\n'
      );

    document.open();
    document.write(page);
    document.close();
    document.title = finalTitle;
  };

  const buildWrapperMixed = (pageMode) => {
    let page = readText(pageMode + '-gr-u1-mixta.html');
    page = replaceIdentity(page, pageMode);
    const verbMapSource = JSON.stringify(VERB_TOPICS);
    const verbKeysSource = JSON.stringify(Object.keys(VERB_TOPICS));
    page = page
      .replace(/const\s+infinitiveBySource\s*=\s*\{[\s\S]*?\};/g, 'const infinitiveBySource = ' + verbMapSource + ';')
      .replace(/const\s+mixedInfinitives\s*=\s*\{[\s\S]*?\};/g, 'const mixedInfinitives = ' + verbMapSource + ';')
      .replace(/const\s+infinitives\s*=\s*\{[\s\S]*?\};/g, 'const infinitives = ' + verbMapSource + ';')
      .replace(/const\s+verbTopics\s*=\s*new\s+Set\(\[[\s\S]*?\]\);/g, 'const verbTopics = new Set(' + verbKeysSource + ');');
    page = page.replace(
      /const\s+SOURCES\s*=\s*\[[\s\S]*?\];/,
      'const SOURCES = ' + JSON.stringify(TOPICS) + ';'
    );
    page = page
      .replaceAll('completed < 42', 'completed < ' + TOTAL)
      .replaceAll('length !== 42', 'length !== ' + TOTAL)
      .replaceAll('las 42', 'las ' + TOTAL)
      .replaceAll('los 42', 'los ' + TOTAL)
      .replaceAll('42 audios', TOTAL + ' audios');
    page = page.replace(
      /let\s+sourceAudioFile\s*=\s*audioFiles\[sourceIndex\][\s\S]*?card\.dataset\.audioFile\s*=\s*sourceAudioFile;/g,
      'let sourceAudioFile = (' + getCanonicalAudioFile.toString() + ')(source, sourceIndex);\n' +
      '              card.dataset.audioFile = sourceAudioFile;'
    );
    page = page.replace(
      /if\s*\(!audioFile\)\s*throw\s+new\s+Error\('Falta el audio[\s\S]*?card\.dataset\.audioFile\s*=\s*audioFile;/g,
      'audioFile = (' + getCanonicalAudioFile.toString() + ')(source, index);\n' +
      '          card.dataset.audioFile = audioFile;'
    );
    page = page.replace('</body>', originalFrontStyleMarkup(pageMode) + '</body>');
    document.open();
    document.write(page);
    document.close();
    document.title = ({
      esc: 'Escritura · Gramática U2 · Mixta',
      reco: 'Reconocimiento · Gramática U2 · Mixta'
    })[pageMode];
  };

  try {
    if (mode === 'hub' || mode === 'sel' || mode === 'com') buildStaticMixed(mode);
    else if (mode === 'esc' || mode === 'reco') buildWrapperMixed(mode);
    else throw new Error('Modo mixto U2 no válido: ' + mode);
  } catch (error) {
    console.error('gr-u2-mixta:', error);
    document.body.innerHTML = '<main style="font-family:Arial,sans-serif;padding:32px;text-align:center"><h2>No se pudo preparar Gramática U2 · Mixta</h2><p>' + String(error.message || error) + '</p></main>';
  }
})();
