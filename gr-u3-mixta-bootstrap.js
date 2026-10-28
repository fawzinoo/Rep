(() => {
  'use strict';

  const TOPICS = [
    'ser', 'estar', 'tener', 'muymucho', 'quecuales', 'cuantos', 'donde'
  ];

  const VERB_TOPICS = {
    ser: 'ser',
    estar: 'estar',
    tener: 'tener'
  };

  const VERB_DISTRACTORS = {
    ser: ['soy', 'eres', 'es', 'somos', 'sois', 'son', 'se', 'ero', 'sos', 'somis', 'sen', 'soi'],
    estar: ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están', 'esto', 'esta', 'estemos', 'esteis', 'estais', 'este'],
    tener: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen', 'teni', 'tengas', 'tene', 'tenis', 'tienemos', 'tenan']
  };

  const CARDS_PER_TOPIC = 5;
  const TOTAL = TOPICS.length * CARDS_PER_TOPIC; // 35

  const getCanonicalAudioFile = (source, sourceIndex) => {
    if (VERB_TOPICS[source]) {
      const personMap = [1, 2, 3, 3, 3, 4, 4, 5, 5, 6, 6, 6];
      const p = personMap[sourceIndex] || 1;
      return `${source}-${p}.wav`;
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
#flashcard-container .flashcard[data-source="ser"] .front-infinitive {
  font-size: clamp(1.82rem, 5.7vw, 2.45rem) !important;
}
`;

  const HUB_ARTICLE_CSS = `
#flashcard-container .flashcard[data-card-id*="-muymucho-"] .article-front-card,
#flashcard-container .flashcard[data-source="muymucho"] .article-front-card,
#flashcard-container .flashcard[data-card-id*="-muymucho-"] .front .article-front-card,
#flashcard-container .flashcard[data-source="muymucho"] .front .article-front-card {
  width: min(86%, 560px) !important;
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

#flashcard-container .flashcard .article-options-column,
#flashcard-container .flashcard .article-front-card .article-options-column,
#flashcard-container .flashcard .article-front-card.target-after .article-options-column,
#flashcard-container .article-front-card.target-after .article-options-column,
#flashcard-container .flashcard[data-card-id*="-muymucho-"] .article-front-card .article-options-column,
#flashcard-container .flashcard[data-source="muymucho"] .article-front-card .article-options-column,
#flashcard-container .flashcard[data-card-id*="-muymucho-"] .article-front-card.target-after .article-options-column,
#flashcard-container .flashcard[data-source="muymucho"] .article-front-card.target-after .article-options-column {
  order: 1 !important;
}
#flashcard-container .flashcard .article-noun-column,
#flashcard-container .flashcard .article-front-card .article-noun-column,
#flashcard-container .flashcard .article-front-card.target-after .article-noun-column,
#flashcard-container .article-front-card.target-after .article-noun-column,
#flashcard-container .flashcard[data-card-id*="-muymucho-"] .article-front-card .article-noun-column,
#flashcard-container .flashcard[data-source="muymucho"] .article-front-card .article-noun-column,
#flashcard-container .flashcard[data-card-id*="-muymucho-"] .article-front-card.target-after .article-noun-column,
#flashcard-container .flashcard[data-source="muymucho"] .article-front-card.target-after .article-noun-column {
  order: 2 !important;
}

#flashcard-container .flashcard[data-card-id*="-donde-"] .article-front-card,
#flashcard-container .flashcard[data-source="donde"] .article-front-card,
#flashcard-container .flashcard[data-card-id*="-donde-"] .front .article-front-card,
#flashcard-container .flashcard[data-source="donde"] .front .article-front-card {
  width: min(86%, 560px) !important;
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

#flashcard-container .flashcard[data-card-id*="-donde-"] .article-front-card .article-options-column,
#flashcard-container .flashcard[data-source="donde"] .article-front-card .article-options-column,
#flashcard-container .flashcard[data-card-id*="-donde-"] .article-front-card.target-after .article-options-column,
#flashcard-container .flashcard[data-source="donde"] .article-front-card.target-after .article-options-column {
  order: 1 !important;
}
#flashcard-container .flashcard[data-card-id*="-donde-"] .article-front-card .article-noun-column,
#flashcard-container .flashcard[data-source="donde"] .article-front-card .article-noun-column,
#flashcard-container .flashcard[data-card-id*="-donde-"] .article-front-card.target-after .article-noun-column,
#flashcard-container .flashcard[data-source="donde"] .article-front-card.target-after .article-noun-column {
  order: 2 !important;
}

#flashcard-container .flashcard[data-source="quecuales"] .article-front-card,
#flashcard-container .flashcard[data-source="cuantos"] .article-front-card {
  width: min(88%, 520px) !important;
  min-height: auto !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: clamp(9px, 1.7vw, 13px) !important;
  position: relative !important;
  z-index: 2 !important;
  padding: clamp(10px, 1.8vw, 14px) !important;
  border-radius: 20px !important;
  background: rgba(255, 255, 255, 0.09) !important;
  border: 1px solid rgba(255, 255, 255, 0.16) !important;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.13), 0 16px 34px rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: blur(5px) !important;
  -webkit-backdrop-filter: blur(5px) !important;
}

#flashcard-container .flashcard[data-source="muymucho"] .article-noun-column,
#flashcard-container .flashcard[data-source="quecuales"] .article-noun-column,
#flashcard-container .flashcard[data-source="cuantos"] .article-noun-column,
#flashcard-container .flashcard[data-source="donde"] .article-noun-column {
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
  text-transform: none !important;
  white-space: normal !important;
  overflow-wrap: normal !important;
  word-break: normal !important;
  hyphens: none !important;
  text-shadow: 0 0 42px rgba(34, 211, 238, 0.36), 0 10px 28px rgba(0, 0, 0, 0.46) !important;
}

#flashcard-container .flashcard[data-source="muymucho"] .article-options-column {
  order: 1 !important;
  width: min(100%, 510px) !important;
  display: grid !important;
  grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
  gap: 5px !important;
  padding: 5px !important;
  border-radius: 15px !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  align-self: center !important;
  align-content: center !important;
  justify-self: center !important;
  justify-items: stretch !important;
  margin: 0 auto !important;
}

#flashcard-container .flashcard[data-card-id*="-quecuales-"] .article-options-column,
#flashcard-container .flashcard[data-source="quecuales"] .article-options-column,
#flashcard-container .flashcard[data-card-id*="-quecuales-"] .front .article-options-column,
#flashcard-container .flashcard[data-source="quecuales"] .front .article-options-column,
#flashcard-container .flashcard[data-card-id*="-quecuales-"] .article-front-card .article-options-column,
#flashcard-container .flashcard[data-source="quecuales"] .article-front-card .article-options-column {
  order: 1 !important;
  width: min(100%, 480px) !important;
  max-width: 480px !important;
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  gap: 6px !important;
  padding: 5px !important;
  border-radius: 15px !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  align-self: center !important;
  align-content: center !important;
  justify-self: center !important;
  justify-items: stretch !important;
  margin: 0 auto !important;
}

#flashcard-container .flashcard[data-card-id*="-cuantos-"] .article-options-column,
#flashcard-container .flashcard[data-source="cuantos"] .article-options-column,
#flashcard-container .flashcard[data-card-id*="-cuantos-"] .front .article-options-column,
#flashcard-container .flashcard[data-source="cuantos"] .front .article-options-column,
#flashcard-container .flashcard[data-card-id*="-cuantos-"] .article-front-card .article-options-column,
#flashcard-container .flashcard[data-source="cuantos"] .article-front-card .article-options-column {
  order: 1 !important;
  width: min(100%, 390px) !important;
  max-width: 390px !important;
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 8px !important;
  padding: 5px !important;
  border-radius: 15px !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  align-self: center !important;
  align-content: center !important;
  justify-self: center !important;
  justify-items: stretch !important;
  margin: 0 auto !important;
}

#flashcard-container .flashcard[data-card-id*="-donde-"] .front .article-options-column,
#flashcard-container .flashcard[data-source="donde"] .front .article-options-column,
#flashcard-container .flashcard[data-card-id*="-donde-"] .article-front-card .article-options-column,
#flashcard-container .flashcard[data-source="donde"] .article-front-card .article-options-column,
#flashcard-container .flashcard[data-card-id*="-donde-"] .article-options-column,
#flashcard-container .flashcard[data-source="donde"] .article-options-column {
  order: 1 !important;
  width: min(100%, 300px) !important;
  max-width: 300px !important;
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 6px !important;
  padding: 5px !important;
  border-radius: 15px !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  align-self: center !important;
  align-content: center !important;
  justify-self: center !important;
  justify-items: stretch !important;
  margin: 0 auto !important;
}

#flashcard-container .flashcard[data-card-id*="-muymucho-"] .article-option,
#flashcard-container .flashcard[data-source="muymucho"] .article-option,
#flashcard-container .flashcard[data-card-id*="-quecuales-"] .article-option,
#flashcard-container .flashcard[data-source="quecuales"] .article-option,
#flashcard-container .flashcard[data-card-id*="-cuantos-"] .article-option,
#flashcard-container .flashcard[data-source="cuantos"] .article-option {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  width: 100% !important;
  min-width: 0 !important;
  max-width: none !important;
  box-sizing: border-box !important;
  min-height: 32px !important;
  padding: 4px 6px !important;
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
}

#flashcard-container .flashcard[data-card-id*="-donde-"] .front .article-option,
#flashcard-container .flashcard[data-source="donde"] .front .article-option,
#flashcard-container .flashcard[data-card-id*="-donde-"] .article-front-card .article-option,
#flashcard-container .flashcard[data-source="donde"] .article-front-card .article-option,
#flashcard-container .flashcard[data-card-id*="-donde-"] .article-option,
#flashcard-container .flashcard[data-source="donde"] .article-option {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 32px !important;
  padding: 4px 6px !important;
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
  margin: 0 !important;
  width: 100% !important;
  max-width: none !important;
  box-sizing: border-box !important;
}

#flashcard-container .flashcard[data-card-id*="-muymucho-"] .front-verb-tag,
#flashcard-container .flashcard[data-source="muymucho"] .front-verb-tag,
#flashcard-container .flashcard[data-card-id*="-donde-"] .front-verb-tag,
#flashcard-container .flashcard[data-source="donde"] .front-verb-tag {
  position: absolute !important;
  top: 18px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  font-family: 'Poppins', sans-serif !important;
  font-weight: 700 !important;
  font-size: 0.95rem !important;
  color: rgba(255, 255, 255, 0.45) !important;
  text-transform: none !important;
  letter-spacing: 3px !important;
  z-index: 2 !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  padding: 5px 16px !important;
  border-radius: 20px !important;
  backdrop-filter: blur(4px) !important;
  -webkit-backdrop-filter: blur(4px) !important;
  white-space: nowrap !important;
}

#flashcard-container .flashcard[data-source="quecuales"] .front-verb-tag,
#flashcard-container .flashcard[data-source="cuantos"] .front-verb-tag {
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

#flashcard-container .flashcard[data-source="muymucho"] .article-answer-card .back-verb-main,
#flashcard-container .flashcard[data-source="quecuales"] .article-answer-card .back-verb-main,
#flashcard-container .flashcard[data-source="cuantos"] .article-answer-card .back-verb-main,
#flashcard-container .flashcard[data-source="donde"] .article-answer-card .back-verb-main {
  text-transform: none !important;
  font-size: clamp(1.65rem, 4.2vw, 3.05rem) !important;
  line-height: 1 !important;
  text-wrap: balance !important;
}

#flashcard-container .flashcard[data-source="muymucho"] .back > div[style*="respuestaGlow"],
#flashcard-container .flashcard[data-source="quecuales"] .back > div[style*="respuestaGlow"],
#flashcard-container .flashcard[data-source="cuantos"] .back > div[style*="respuestaGlow"],
#flashcard-container .flashcard[data-source="donde"] .back > div[style*="respuestaGlow"],
#flashcard-container .flashcard[data-card-id*="-muymucho-"] .back > div[style*="respuestaGlow"],
#flashcard-container .flashcard[data-card-id*="-quecuales-"] .back > div[style*="respuestaGlow"],
#flashcard-container .flashcard[data-card-id*="-cuantos-"] .back > div[style*="respuestaGlow"],
#flashcard-container .flashcard[data-card-id*="-donde-"] .back > div[style*="respuestaGlow"],
#flashcard-container .flashcard[data-source="muymucho"] .back > div[style*="clamp(2.4rem"],
#flashcard-container .flashcard[data-source="quecuales"] .back > div[style*="clamp(2.4rem"],
#flashcard-container .flashcard[data-source="cuantos"] .back > div[style*="clamp(2.4rem"],
#flashcard-container .flashcard[data-source="donde"] .back > div[style*="clamp(2.4rem"],
#flashcard-container .flashcard[data-card-id*="-muymucho-"] .back > div[style*="clamp(2.4rem"],
#flashcard-container .flashcard[data-card-id*="-quecuales-"] .back > div[style*="clamp(2.4rem"],
#flashcard-container .flashcard[data-card-id*="-cuantos-"] .back > div[style*="clamp(2.4rem"],
#flashcard-container .flashcard[data-card-id*="-donde-"] .back > div[style*="clamp(2.4rem"] {
  font-size: clamp(1.35rem, 3vw, 2.05rem) !important;
  line-height: 1.25 !important;
  max-width: 90% !important;
  margin-top: 0 !important;
  margin-bottom: 16px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  text-wrap: balance !important;
}

@media (max-width: 620px) {
  #flashcard-container .flashcard[data-card-id*="-muymucho-"] .article-front-card,
  #flashcard-container .flashcard[data-source="muymucho"] .article-front-card,
  #flashcard-container .flashcard[data-card-id*="-donde-"] .article-front-card,
  #flashcard-container .flashcard[data-source="donde"] .article-front-card,
  #flashcard-container .flashcard[data-card-id*="-donde-"] .front .article-front-card,
  #flashcard-container .flashcard[data-source="donde"] .front .article-front-card {
    width: min(88%, 330px) !important;
    gap: 6px !important;
    padding: 10px !important;
  }
  #flashcard-container .flashcard[data-card-id*="-muymucho-"] .article-options-column,
  #flashcard-container .flashcard[data-source="muymucho"] .article-options-column {
    width: min(100%, 310px) !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
  #flashcard-container .flashcard[data-card-id*="-donde-"] .front .article-options-column,
  #flashcard-container .flashcard[data-source="donde"] .front .article-options-column,
  #flashcard-container .flashcard[data-card-id*="-donde-"] .article-front-card .article-options-column,
  #flashcard-container .flashcard[data-source="donde"] .article-front-card .article-options-column,
  #flashcard-container .flashcard[data-card-id*="-donde-"] .article-options-column,
  #flashcard-container .flashcard[data-source="donde"] .article-options-column {
    width: min(100%, 290px) !important;
    max-width: 290px !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  #flashcard-container .flashcard[data-card-id*="-donde-"] .front .article-option,
  #flashcard-container .flashcard[data-source="donde"] .front .article-option,
  #flashcard-container .flashcard[data-card-id*="-donde-"] .article-front-card .article-option,
  #flashcard-container .flashcard[data-source="donde"] .article-front-card .article-option,
  #flashcard-container .flashcard[data-card-id*="-donde-"] .article-option,
  #flashcard-container .flashcard[data-source="donde"] .article-option {
    min-height: 34px !important;
    padding: 6px 7px !important;
    font-size: clamp(.78rem, 3.45vw, .94rem) !important;
  }
  #flashcard-container .flashcard[data-source="quecuales"] .article-front-card,
  #flashcard-container .flashcard[data-source="cuantos"] .article-front-card {
    width: min(88%, 330px) !important;
    gap: 6px !important;
    padding: 10px !important;
  }
  #flashcard-container .flashcard[data-card-id*="-quecuales-"] .article-options-column,
  #flashcard-container .flashcard[data-source="quecuales"] .article-options-column {
    width: min(100%, 300px) !important;
    max-width: 300px !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  #flashcard-container .flashcard[data-card-id*="-cuantos-"] .article-options-column,
  #flashcard-container .flashcard[data-source="cuantos"] .article-options-column {
    width: min(100%, 310px) !important;
    max-width: 310px !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
  #flashcard-container .article-options-column,
  #flashcard-container .article-front-card .article-options-column,
  #flashcard-container .flashcard .article-options-column,
  #flashcard-container .flashcard .article-front-card .article-options-column {
    order: 1 !important;
  }
  #flashcard-container .article-noun-column,
  #flashcard-container .article-front-card .article-noun-column,
  #flashcard-container .flashcard .article-noun-column,
  #flashcard-container .flashcard .article-front-card .article-noun-column {
    order: 2 !important;
  }
}
@media (max-width: 360px) {
  #flashcard-container .flashcard[data-card-id*="-cuantos-"] .article-options-column,
  #flashcard-container .flashcard[data-source="cuantos"] .article-options-column {
    width: min(100%, 250px) !important;
    max-width: 250px !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
  #flashcard-container .flashcard[data-card-id*="-muymucho-"] .article-options-column,
  #flashcard-container .flashcard[data-source="muymucho"] .article-options-column {
    width: min(100%, 250px) !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  #flashcard-container .flashcard[data-card-id*="-donde-"] .front .article-options-column,
  #flashcard-container .flashcard[data-source="donde"] .front .article-options-column,
  #flashcard-container .flashcard[data-card-id*="-donde-"] .article-front-card .article-options-column,
  #flashcard-container .flashcard[data-source="donde"] .article-front-card .article-options-column,
  #flashcard-container .flashcard[data-card-id*="-donde-"] .article-options-column,
  #flashcard-container .flashcard[data-source="donde"] .article-options-column {
    width: min(100%, 240px) !important;
    max-width: 240px !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  #flashcard-container .article-options-column,
  #flashcard-container .article-front-card .article-options-column,
  #flashcard-container .flashcard .article-options-column,
  #flashcard-container .flashcard .article-front-card .article-options-column {
    order: 1 !important;
  }
  #flashcard-container .article-noun-column,
  #flashcard-container .article-front-card .article-noun-column,
  #flashcard-container .flashcard .article-noun-column,
  #flashcard-container .flashcard .article-front-card .article-noun-column {
    order: 2 !important;
  }
}

.article-composition-row.is-stacked {
  flex-direction: column !important;
  gap: clamp(12px, 2.5vw, 22px) !important;
}
.article-composition-row.is-stacked .formation-rows-wrapper {
  align-items: center !important;
  margin: 0 auto !important;
}
.article-context-noun.is-stacked {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 0.08em !important;
  text-align: center !important;
  line-height: 0.95 !important;
}
.article-context-noun.is-stacked .context-line {
  display: block !important;
  white-space: nowrap !important;
}
.article-composition-row,
.article-composition-row.is-stacked,
.article-composition-row.target-after,
.article-composition-row.is-stacked.target-after,
#flashcard-container .article-composition-row {
  flex-direction: column !important;
  gap: clamp(12px, 2.5vw, 22px) !important;
}
.article-composition-row .formation-rows-wrapper,
.article-composition-row.is-stacked .formation-rows-wrapper,
#flashcard-container .article-composition-row .formation-rows-wrapper {
  order: 1 !important;
  align-items: center !important;
  margin: 0 auto !important;
}
.article-composition-row .article-context-noun,
.article-composition-row.is-stacked .article-context-noun,
#flashcard-container .article-composition-row .article-context-noun {
  order: 2 !important;
  text-align: center !important;
}
#flashcard-container .flashcard[data-source="donde"] .word-group-row,
#flashcard-container .flashcard[data-source="quecuales"] .word-group-row {
  display: flex !important;
  flex-direction: row !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  margin-bottom: 12px !important;
}
#flashcard-container .flashcard[data-source="donde"] .word-display-container,
#flashcard-container .flashcard[data-source="quecuales"] .word-display-container {
  position: relative !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}
#flashcard-container .flashcard[data-source="donde"] .word-display,
#flashcard-container .flashcard[data-source="quecuales"] .word-display {
  background: rgba(255, 255, 255, 0.15) !important;
  color: #ffffff !important;
  font-size: 1.4rem !important;
  font-weight: bold !important;
  min-height: 38px !important;
  min-width: 56px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0 !important;
  border-radius: 12px !important;
  border: 2px dashed rgba(255, 255, 255, 0.4) !important;
  letter-spacing: 4px !important;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4) !important;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.15) !important;
  padding: 0 18px !important;
}
#flashcard-container .flashcard[data-source="donde"] .word-display.active,
#flashcard-container .flashcard[data-source="quecuales"] .word-display.active {
  background: rgba(255, 255, 255, 0.25) !important;
  border: 2.5px solid #fbbf24 !important;
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.4) !important;
  transform: scale(1.02) !important;
}
#flashcard-container .flashcard[data-source="donde"] .word-display-container .word-clear-btn,
#flashcard-container .flashcard[data-source="donde"] .word-display-container .clear-word-btn,
#flashcard-container .flashcard[data-source="quecuales"] .word-display-container .word-clear-btn,
#flashcard-container .flashcard[data-source="quecuales"] .word-display-container .clear-word-btn,
#flashcard-container .article-composition-row .word-clear-btn,
#flashcard-container .article-composition-row .clear-word-btn {
  position: absolute !important;
  left: -38px !important;
  right: auto !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  margin-left: 0 !important;
  width: 28px !important;
  height: 28px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
}
#flashcard-container .article-composition-row.target-after .word-clear-btn,
#flashcard-container .article-composition-row.target-after .clear-word-btn {
  left: auto !important;
  right: -38px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
}
#flashcard-container .flashcard[data-source="donde"] .word-display-container .confirm-word-btn.single-confirm-btn,
#flashcard-container .flashcard[data-source="quecuales"] .word-display-container .confirm-word-btn.single-confirm-btn,
#flashcard-container .article-composition-row .confirm-word-btn.single-confirm-btn,
.confirm-word-btn.single-confirm-btn {
  position: absolute !important;
  left: 50% !important;
  right: auto !important;
  top: -38px !important;
  transform: translateX(-50%) !important;
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  padding: 0 !important;
  align-items: center !important;
  justify-content: center !important;
}
#flashcard-container .flashcard[data-source="donde"] .word-display-container .confirm-word-btn:not(.single-confirm-btn),
#flashcard-container .flashcard[data-source="quecuales"] .word-display-container .confirm-word-btn:not(.single-confirm-btn),
#flashcard-container .article-composition-row .confirm-word-btn:not(.single-confirm-btn) {
  display: none !important;
}
.confirm-word-btn.single-confirm-btn:hover {
  transform: translateX(-50%) scale(1.1) !important;
}
.confirm-word-btn.single-confirm-btn:active {
  transform: translateX(-50%) scale(0.95) !important;
}
`;

  const script = document.currentScript;
  const mode = String(script && script.dataset.mode || 'hub').trim();

  const readText = (file) => {
    const request = new XMLHttpRequest();
    request.open('GET', file, false);
    request.send(null);
    if (request.status && (request.status < 200 || request.status >= 300)) {
      throw new Error('No se pudo leer ' + file);
    }
    return request.responseText;
  };

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
    const newKey = pageMode === 'hub' ? 'gr-u3-mixta' : pageMode + '-gr-u3-mixta';
    return page
      .replaceAll('U1G14T', 'U3G8T')
      .replaceAll(oldKey, newKey)
      .replaceAll('gr-u2-mixta', 'gr-u3-mixta')
      .replaceAll('lud-gr-u1-mixta', 'lud-gr-u3-mixta')
      .replaceAll('lud-gr-u2-mixta', 'lud-gr-u3-mixta')
      .replaceAll('GR_U1_MIXTA', 'GR_U3_MIXTA')
      .replaceAll('GR_U2_MIXTA', 'GR_U3_MIXTA')
      .replaceAll('Gramática U1', 'Gramática U3')
      .replaceAll('Gramática U2', 'Gramática U3')
      .replaceAll('GRAMÁTICA U1', 'GRAMÁTICA U3')
      .replaceAll('GRAMÁTICA U2', 'GRAMÁTICA U3')
      .replaceAll('Repaso mixto U1', 'Repaso mixto U3')
      .replaceAll('Repaso mixto U2', 'Repaso mixto U3')
      .replaceAll('UNIDAD 1', 'UNIDAD 3')
      .replaceAll('UNIDAD 2', 'UNIDAD 3')
      .replaceAll('U1G14T1', 'U3G8T1')
      .replaceAll('U1G14T2', 'U3G8T2')
      .replaceAll('U1G14T3', 'U3G8T3')
      .replaceAll('U1G14T4', 'U3G8T4')
      .replaceAll('U2G14T1', 'U3G8T1')
      .replaceAll('U2G14T2', 'U3G8T2')
      .replaceAll('U2G14T3', 'U3G8T3')
      .replaceAll('U2G14T4', 'U3G8T4')
      .replaceAll('completed < 42', 'completed < ' + TOTAL)
      .replaceAll('length !== 42', 'length !== ' + TOTAL)
      .replaceAll('las 42', 'las ' + TOTAL)
      .replaceAll('los 42', 'los ' + TOTAL)
      .replaceAll('42 audios', TOTAL + ' audios')
      .replaceAll('esc-gr-u1-mixta.html', 'esc-gr-u3-mixta.html')
      .replaceAll('sel-gr-u1-mixta.html', 'sel-gr-u3-mixta.html')
      .replaceAll('com-gr-u1-mixta.html', 'com-gr-u3-mixta.html')
      .replaceAll('reco-gr-u1-mixta.html', 'reco-gr-u3-mixta.html')
      .replaceAll('esc-gr-u2-mixta.html', 'esc-gr-u3-mixta.html')
      .replaceAll('sel-gr-u2-mixta.html', 'sel-gr-u3-mixta.html')
      .replaceAll('com-gr-u2-mixta.html', 'com-gr-u3-mixta.html')
      .replaceAll('reco-gr-u2-mixta.html', 'reco-gr-u3-mixta.html');
  };

  const makeDraw = (pools) => {
    return shuffle(TOPICS.flatMap((source) =>
      shuffle(pools[source].map((_, sourceIndex) => ({ source, sourceIndex }))).slice(0, CARDS_PER_TOPIC)
    ));
  };

  const extractTranslations = (sourceText) => {
    const match = sourceText.match(/const\s+translationMap\s*=\s*(\{[\s\S]*?\});\s*const\s+(?:arabicFontBase64|langLabels)/);
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
        if (rule.selectorText && rule.selectorText.includes('target-after')) {
          return '';
        }
        rule.style.removeProperty('order');
        const selectors = rule.selectorText.split(',').map((selector) => selector.trim())
          .map((selector) => {
            const match = selector.match(/\.(?:front(?:\b|-)|article-(?:front|options|option|noun|composition|context)|(?:letter-combination|word-(?:formation|display|input|group|clear)|formation-rows|minor-word-label|letters-container|letter-option|confirm-word))/);
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
      const file = prefix + '-' + topic + '.html';
      const sourceText = readText(file);
      const source = new DOMParser().parseFromString(sourceText, 'text/html');

      // Si el tema tiene mutador de preguntas (como quecuales, cuantos, donde), ejecutarlo en el DOM origen
      const mutatorScript = Array.from(source.querySelectorAll('#flashcard-container script'))
        .find((node) => node.textContent.includes('questionCards'));
      if (mutatorScript) {
        try {
          new Function('document', mutatorScript.textContent)(source);
        } catch (err) {
          console.warn('Mutador de tarjetas U3 (' + topic + '):', err);
        }
      }

      pools[topic] = Array.from(source.querySelectorAll('#flashcard-container > .flashcard'));
      pools[topic].forEach((card) => {
        card.classList.remove('target-after');
        card.querySelectorAll('.target-after').forEach((el) => el.classList.remove('target-after'));
      });
      if (pools[topic].length < CARDS_PER_TOPIC) {
        throw new Error('Faltan tarjetas en ' + file + ' (mínimo ' + CARDS_PER_TOPIC + ', encontradas ' + pools[topic].length + ')');
      }
      translations[topic] = extractTranslations(sourceText);
      frontStyles[topic] = Array.from(source.querySelectorAll('style'))
        .map((node) => node.textContent);
    }
    return { pools, translations, frontStyles };
  };

  const appendScopedFrontStyles = (template, frontStyles, pageMode) => {
    Object.entries(frontStyles).forEach(([topic, blocks]) => {
      if (!blocks.length) return;
      const style = template.createElement('style');
      style.id = pageMode + '-gr-u3-mixta-origin-front-' + topic;
      style.textContent = scopeFrontCss(
        blocks.join('\n'),
        '#flashcard-container .flashcard[data-source="' + topic + '"]'
      );
      template.body.appendChild(style);
    });
  };

  const removeOriginalDeckBuilder = (template) => {
    template.querySelectorAll('#flashcard-container > script').forEach((node) => {
      if (!node.id.includes('canonical')) node.remove();
    });
    template.querySelectorAll('script').forEach((node) => {
      if (node.textContent.includes('const sourceCardPools =')) node.remove();
    });
    template.querySelectorAll('#flashcard-container > template').forEach((node) => node.remove());
    template.querySelectorAll('#flashcard-container > .flashcard').forEach((node) => node.remove());
    template.querySelectorAll('style[id*="article-option-widths"]').forEach((node) => node.remove());
  };

  const buildStaticMixed = (pageMode) => {
    try {
      const keysToClear = [
        'com-gr-u3-mixta-v5_gameProgress',
        'gr-u3-mixta-v5_gameProgress',
        'sel-gr-u3-mixta-v5_gameProgress',
        'com-gr-u1-mixta-v5_gameProgress'
      ];
      keysToClear.forEach((k) => {
        try {
          const val = localStorage.getItem(k);
          if (val && (val.includes('target-after') || val.includes('"version":4') || val.includes('"version":1'))) {
            localStorage.removeItem(k);
          }
        } catch (_) {}
      });
      [
        'com-gr-u3-mixta-draw',
        'gr-u3-mixta-draw',
        'sel-gr-u3-mixta-draw',
        'esc-gr-u3-mixta-draw',
        'reco-gr-u3-mixta-draw'
      ].forEach((k) => {
        try { localStorage.removeItem(k); } catch (_) {}
      });
    } catch (_) {}
    const isHub = pageMode === 'hub';
    const prefix = 'gr-u3';
    const baseFile = isHub ? 'gr-u1-mixta.html' : pageMode + '-gr-u1-mixta.html';
    const template = new DOMParser().parseFromString(
      replaceIdentity(readText(baseFile), pageMode),
      'text/html'
    );
    const finalTitle = isHub
      ? 'Gramática U3 · Mixta'
      : ({ sel: 'Selección · Gramática U3 · Mixta', com: 'Composición · Gramática U3 · Mixta' }[pageMode]);

    template.title = finalTitle;
    if (pageMode === 'com') template.body.classList.add('u3-com-page');
    if (isHub) {
      const heading = template.querySelector('.demasiado-title-text');
      if (heading) heading.textContent = 'GRAMÁTICA U3 · MIXTA';
    }
    removeOriginalDeckBuilder(template);

    const container = template.getElementById('flashcard-container');
    if (!container) throw new Error('No se encontró el tablero en ' + baseFile);
    const { pools, translations, frontStyles } = loadPools(prefix);
    appendScopedFrontStyles(template, frontStyles, pageMode);

    const infinitiveStyle = template.createElement('style');
    infinitiveStyle.id = (isHub ? 'gr-u3-mixta' : pageMode + '-gr-u3-mixta') + '-front-infinitives';
    infinitiveStyle.textContent = INFINITIVE_CSS;
    template.body.appendChild(infinitiveStyle);

    const originArticleStyle = template.createElement('style');
    originArticleStyle.id = (isHub ? 'gr-u3-mixta' : pageMode + '-gr-u3-mixta') + '-origin-article-css';
    originArticleStyle.textContent = HUB_ARTICLE_CSS;
    template.head.appendChild(originArticleStyle.cloneNode(true));
    template.body.appendChild(originArticleStyle);
    if (pageMode === 'sel') {
      const optionWidths = template.createElement('style');
      optionWidths.id = 'sel-gr-u3-mixta-option-widths';
      optionWidths.textContent = ['muymucho', 'cuantos', 'quecuales', 'donde'].map((topic) =>
        '#flashcard-container .flashcard[data-card-id*="-' + topic + '-"] .front .article-option {' +
        'width:auto!important;min-width:0!important;max-width:none!important;' +
        'justify-self:stretch!important;margin-left:0!important;margin-right:0!important;}'
      ).join('\n');
      optionWidths.textContent += '\n' +
        '#flashcard-container .flashcard[data-card-id*="-cuantos-"] .front .article-options-column,\n' +
        '#flashcard-container .flashcard[data-source="cuantos"] .front .article-options-column {\n' +
        '  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;\n' +
        '  width: min(100%, 390px) !important;\n' +
        '  max-width: 390px !important;\n' +
        '  justify-content: center !important;\n' +
        '  margin-left: auto !important;\n' +
        '  margin-right: auto !important;\n' +
        '}\n' +
        '#flashcard-container .flashcard[data-card-id*="-cuantos-"] .front .article-option,\n' +
        '#flashcard-container .flashcard[data-source="cuantos"] .front .article-option {\n' +
        '  width: 100% !important;\n' +
        '  max-width: none !important;\n' +
        '  box-sizing: border-box !important;\n' +
        '}\n' +
        '#flashcard-container .flashcard[data-card-id*="-donde-"] .front .article-options-column,\n' +
        '#flashcard-container .flashcard[data-source="donde"] .front .article-options-column {\n' +
        '  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;\n' +
        '  width: min(100%, 300px) !important;\n' +
        '  max-width: 300px !important;\n' +
        '  justify-content: center !important;\n' +
        '  margin-left: auto !important;\n' +
        '  margin-right: auto !important;\n' +
        '}\n' +
        '#flashcard-container .flashcard[data-card-id*="-donde-"] .front .article-option,\n' +
        '#flashcard-container .flashcard[data-source="donde"] .front .article-option {\n' +
        '  width: 100% !important;\n' +
        '  max-width: none !important;\n' +
        '  box-sizing: border-box !important;\n' +
        '}\n' +
        '#flashcard-container .multiple-choice-container {\n' +
        '  display: flex !important;\n' +
        '  flex-direction: column !important;\n' +
        '  justify-content: center !important;\n' +
        '  align-items: center !important;\n' +
        '  padding: 16px !important;\n' +
        '}\n' +
        '#flashcard-container .multiple-choice-options {\n' +
        '  margin: 0 auto !important;\n' +
        '  width: 100% !important;\n' +
        '  max-width: min(92%, 460px) !important;\n' +
        '  gap: 10px !important;\n' +
        '}\n' +
        '#flashcard-container .multiple-choice-option {\n' +
        '  width: 100% !important;\n' +
        '  min-height: 52px !important;\n' +
        '  padding: 8px 14px !important;\n' +
        '}\n' +
        '#flashcard-container .multiple-choice-option .option-choice-group {\n' +
        '  display: flex !important;\n' +
        '  align-items: center !important;\n' +
        '  justify-content: flex-start !important;\n' +
        '  width: 100% !important;\n' +
        '  max-width: none !important;\n' +
        '  gap: 10px !important;\n' +
        '}\n' +
        '#flashcard-container .multiple-choice-option .option-letter-prefix {\n' +
        '  flex: 0 0 auto !important;\n' +
        '  font-weight: 800 !important;\n' +
        '}\n' +
        '#flashcard-container .multiple-choice-option .option-text-content {\n' +
        '  flex: 1 1 auto !important;\n' +
        '  text-align: left !important;\n' +
        '  white-space: normal !important;\n' +
        '}';
      template.body.appendChild(optionWidths);
    }

    const draw = makeDraw(pools);
    const metadata = [];
    const anchor = container.querySelector('.results-card, #stats-box');

    draw.forEach(({ source, sourceIndex }, contentIndex) => {
      const original = pools[source][sourceIndex];
      const card = template.importNode(original, true);
      const answer = normalize(card.dataset.answer || card.querySelector('.back')?.textContent);
      card.dataset.answer = answer;
      // Las preguntas se presentan en varios spans; textContent los uniría
      // sin espacios al inicializar el motor de composición.
      card.querySelector('.back')?.setAttribute('data-original-text', answer);
      card.dataset.cardId = (isHub ? 'gr-u3-mixta' : pageMode + '-gr-u3-mixta') + '-' + source + '-' + (sourceIndex + 1);
      card.dataset.contentIndex = String(contentIndex);
      card.dataset.source = source;
      card.dataset.sourceIndex = String(sourceIndex);
      // Los archivos gr-u3 de preguntas generan correctOption, mientras que
      // el motor de composición necesita los mismos atributos que com-quecuales.
      if (['quecuales', 'cuantos', 'donde'].includes(source)) {
        const targetForm = answer.match(/^¿(qué es|qué son|cuál es|cuáles son|cuánto|cuántos|cuántas|dónde está|dónde están)\b/i)?.[1]?.toLowerCase() || '';
        if (targetForm) card.dataset.targetForm = targetForm;
        card.dataset.targetPosition = 'before';
        if (targetForm) card.querySelector('.article-front-card')?.classList.remove('target-after');
      }
      card.dataset.audioFile = getCanonicalAudioFile(source, sourceIndex);
      if (original.dataset.clue) card.dataset.clue = original.dataset.clue;
      if (original.dataset.correctOption) card.dataset.correctOption = original.dataset.correctOption;
      if (original.dataset.targetForm) card.dataset.targetForm = original.dataset.targetForm;
      if (original.dataset.targetPosition) card.dataset.targetPosition = original.dataset.targetPosition;
      if (['quecuales', 'cuantos', 'donde'].includes(source)) {
        const targetForm = answer.match(/^¿(qué es|qué son|cuál es|cuáles son|cuánto|cuántos|cuántas|dónde está|dónde están)\b/i)?.[1]?.toLowerCase() || '';
        if (targetForm) card.dataset.targetForm = targetForm;
        card.dataset.targetPosition = 'before';
      }

      card.classList.remove('target-after');
      card.querySelectorAll('.target-after').forEach((el) => el.classList.remove('target-after'));

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

      const pronounText = (pronoun?.textContent || '').trim().toLowerCase();
      const fullVerbKey = pronounText ? (pronounText + ' ' + answer).toLowerCase() : answer.toLowerCase();

      const translated = translations[source][answer]
        || translations[source][normalize(answer)]
        || translations[source][fullVerbKey]
        || {};

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
        let highlightWord = answer;

        if (VERB_DISTRACTORS[topic]) {
          const pool = VERB_DISTRACTORS[topic].filter((opt) => normalize(opt).toLowerCase() !== answer.toLowerCase());
          distractors = shuffle(pool).slice(0, 3);
          highlightWord = answer;
        } else if (topic === 'cuantos') {
          const cleanAnswer = answer.trim();
          const match = cleanAnswer.match(/^¿(cuánto|cuánta|cuántos|cuántas)\s+(.+)$/i);
          if (match) {
            const correctForm = match[1].toLowerCase();
            highlightWord = match[1];
            const rest = match[2];
            const forms = ['cuánto', 'cuántos', 'cuántas', 'cuánta'];
            const distForms = forms.filter((f) => f !== correctForm);
            distractors = distForms.map((f) => `¿${f.charAt(0).toUpperCase()}${f.slice(1)} ${rest}`);
            distForms.forEach((f) => {
              const optText = `¿${f.charAt(0).toUpperCase()}${f.slice(1)} ${rest}`;
              optionVerbs[optText] = `${f.charAt(0).toUpperCase()}${f.slice(1)}`;
            });
          }
        } else if (topic === 'donde') {
          const cleanAnswer = answer.trim();
          const match = cleanAnswer.match(/^¿(dónde está|dónde están)\s+(.+)$/i);
          if (match) {
            const correctForm = match[1].toLowerCase();
            highlightWord = match[1];
            const rest = match[2];
            const forms = ['dónde está', 'dónde están'];
            const distForms = forms.filter((f) => f !== correctForm);
            distractors = distForms.map((f) => `¿${f.charAt(0).toUpperCase()}${f.slice(1)} ${rest}`);
            distForms.forEach((f) => {
              const optText = `¿${f.charAt(0).toUpperCase()}${f.slice(1)} ${rest}`;
              optionVerbs[optText] = `${f.charAt(0).toUpperCase()}${f.slice(1)}`;
            });
          }
        } else if (topic === 'quecuales') {
          const cleanAnswer = answer.trim();
          const match = cleanAnswer.match(/^¿(qué es|qué son|cuál es|cuáles son)\s+(.+)$/i);
          if (match) {
            const correctForm = match[1].toLowerCase();
            highlightWord = match[1];
            const rest = match[2];
            const forms = ['qué es', 'qué son', 'cuál es', 'cuáles son'];
            const distForms = forms.filter((f) => f !== correctForm);
            distractors = distForms.map((f) => `¿${f.charAt(0).toUpperCase()}${f.slice(1)} ${rest}`);
            distForms.forEach((f) => {
              const optText = `¿${f.charAt(0).toUpperCase()}${f.slice(1)} ${rest}`;
              optionVerbs[optText] = `${f.charAt(0).toUpperCase()}${f.slice(1)}`;
            });
          }
        } else if (topic === 'muymucho') {
          const cleanAnswer = answer.trim();
          const forms = ['muy', 'mucho', 'mucha', 'muchos', 'muchas'];
          const endMatch = cleanAnswer.match(/^(.+)\s+(mucho)$/i);
          if (endMatch) {
            const verb = endMatch[1];
            highlightWord = endMatch[2];
            const distForms = ['muy', 'mucha', 'muchos', 'muchas'];
            distractors = shuffle(distForms).slice(0, 3).map((f) => `${verb} ${f}`);
            distractors.forEach((opt) => {
              const lastWord = opt.split(/\s+/).pop();
              optionVerbs[opt] = lastWord;
            });
          } else {
            const startMatch = cleanAnswer.match(/^(muy|mucho|mucha|muchos|muchas)\s+(.+)$/i);
            if (startMatch) {
              const correctForm = startMatch[1].toLowerCase();
              highlightWord = startMatch[1];
              const rest = startMatch[2];
              const distForms = forms.filter((f) => f !== correctForm);
              distractors = shuffle(distForms).slice(0, 3).map((f) => `${f} ${rest}`);
              distractors.forEach((opt) => {
                const firstWord = opt.split(/\s+/)[0];
                optionVerbs[opt] = firstWord;
              });
            }
          }
        }

        if (!distractors.length) {
          const pool = [...new Set(cardList.map((card) => normalize(card.dataset.answer || card.querySelector('.back')?.textContent)))]
            .filter((opt) => opt && opt.toLowerCase() !== answer.toLowerCase());
          distractors = shuffle(pool).slice(0, 3);
        }

        optionsByAnswer[answer] = [answer, ...distractors];
        optionVerbs[answer] = highlightWord;
        distractors.forEach((opt) => {
          if (!optionVerbs[opt]) optionVerbs[opt] = opt;
        });
      });
    });

    const dataScript = template.createElement('script');
    dataScript.id = 'gr-u3-mixta-card-data';
    dataScript.textContent =
      'window.GR_U3_MIXTA_CARD_DATA=' + JSON.stringify(metadata) + ';' +
      'window.GR_U1_MIXTA_CARD_DATA=window.GR_U3_MIXTA_CARD_DATA;' +
      'window.TU_SELECTION_OPTIONS=' + JSON.stringify(optionsByAnswer) + ';' +
      'window.TU_VERB_FORMS={};' +
      'window.TU_OPTION_VERBS=' + JSON.stringify(optionVerbs) + ';';
    container.insertBefore(dataScript, anchor || null);

    if (pageMode === 'com') {
      const compositionMetadata = template.createElement('script');
      compositionMetadata.id = 'gr-u3-mixta-composition-targets';
      compositionMetadata.textContent = `
        (() => {
          const applyU3CompositionTargets = () => {
            document.querySelectorAll('#flashcard-container > .flashcard[data-source]').forEach((card) => {
              if (!['quecuales', 'cuantos', 'donde'].includes(card.dataset.source)) return;
              const answer = String(card.dataset.answer || '').trim();
              const match = answer.match(/^¿(qué es|qué son|cuál es|cuáles son|cuánto|cuántos|cuántas|dónde está|dónde están)\\b/i);
              if (!match) return;
              card.dataset.targetForm = match[1].toLowerCase();
              card.dataset.targetPosition = 'before';
              card.querySelector('.article-front-card')?.classList.remove('target-after');
            });
          };
          applyU3CompositionTargets();
          const container = document.getElementById('flashcard-container');
          if (container) new MutationObserver(applyU3CompositionTargets).observe(container, { childList: true, subtree: true });
        })();`;
      template.body.appendChild(compositionMetadata);

      // El CSS común de la mixta coloca los controles de composición arriba
      // de la fila. En com-quecuales cada cuadro conserva sus controles en
      // el lateral, por lo que estas reglas deben prevalecer en U3.
      const compositionOriginLayout = template.createElement('style');
      compositionOriginLayout.id = 'com-gr-u3-mixta-composition-origin-layout';
      compositionOriginLayout.textContent = `
        #flashcard-container .flashcard[data-source="donde"] .word-group-row,
        #flashcard-container .flashcard[data-source="quecuales"] .word-group-row {
          display: flex !important;
          flex-direction: row !important;
          justify-content: center !important;
          align-items: center !important;
          width: 100% !important;
          margin-bottom: 12px !important;
        }
        #flashcard-container .flashcard[data-source="donde"] .word-display-container,
        #flashcard-container .flashcard[data-source="quecuales"] .word-display-container {
          position: relative !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        #flashcard-container .flashcard[data-source="donde"] .word-display,
        #flashcard-container .flashcard[data-source="quecuales"] .word-display {
          background: rgba(255, 255, 255, 0.15) !important;
          color: #ffffff !important;
          font-size: 1.4rem !important;
          font-weight: bold !important;
          min-height: 38px !important;
          min-width: 56px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 0 !important;
          border-radius: 12px !important;
          border: 2px dashed rgba(255, 255, 255, 0.4) !important;
          letter-spacing: 4px !important;
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4) !important;
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.15) !important;
          padding: 0 18px !important;
        }
        #flashcard-container .flashcard[data-source="donde"] .word-display.active,
        #flashcard-container .flashcard[data-source="quecuales"] .word-display.active {
          background: rgba(255, 255, 255, 0.25) !important;
          border: 2.5px solid #fbbf24 !important;
          box-shadow: 0 0 15px rgba(251, 191, 36, 0.4) !important;
          transform: scale(1.02) !important;
        }
        #flashcard-container .flashcard[data-source="donde"] .word-display-container .word-clear-btn,
        #flashcard-container .flashcard[data-source="donde"] .word-display-container .clear-word-btn,
        #flashcard-container .flashcard[data-source="quecuales"] .word-display-container .word-clear-btn,
        #flashcard-container .flashcard[data-source="quecuales"] .word-display-container .clear-word-btn,
        #flashcard-container .article-composition-row .word-clear-btn,
        #flashcard-container .article-composition-row .clear-word-btn {
          position: absolute !important;
          left: -38px !important;
          right: auto !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          margin-left: 0 !important;
          width: 28px !important;
          height: 28px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
        }
        #flashcard-container .article-composition-row.target-after .word-clear-btn,
        #flashcard-container .article-composition-row.target-after .clear-word-btn {
          left: auto !important;
          right: -38px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
        }
        #flashcard-container .flashcard[data-source="donde"] .word-display-container .confirm-word-btn.single-confirm-btn,
        #flashcard-container .flashcard[data-source="quecuales"] .word-display-container .confirm-word-btn.single-confirm-btn,
        #flashcard-container .article-composition-row .confirm-word-btn.single-confirm-btn,
        .confirm-word-btn.single-confirm-btn {
          position: absolute !important;
          left: 50% !important;
          right: auto !important;
          top: -38px !important;
          transform: translateX(-50%) !important;
          width: 28px !important;
          height: 28px !important;
          min-width: 28px !important;
          padding: 0 !important;
          align-items: center !important;
          justify-content: center !important;
        }
        #flashcard-container .flashcard[data-source="donde"] .word-display-container .confirm-word-btn:not(.single-confirm-btn),
        #flashcard-container .flashcard[data-source="quecuales"] .word-display-container .confirm-word-btn:not(.single-confirm-btn),
        #flashcard-container .article-composition-row .confirm-word-btn:not(.single-confirm-btn) {
          display: none !important;
        }
      `;
      template.body.appendChild(compositionOriginLayout);
    }

    let page = '<!DOCTYPE html>\n' + template.documentElement.outerHTML;
    page = replaceIdentity(page, pageMode);

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

    if (pageMode === 'com') {
      const u3ArticleSet = "const INDEFINITE_ARTICLE_SET = new Set([\n" +
        "    'qué es', 'qué son', 'cuál es', 'cuáles son',\n" +
        "    'cuánto', 'cuántos', 'cuántas', 'cuánta',\n" +
        "    'dónde está', 'dónde están',\n" +
        "    'muy', 'mucho', 'mucha', 'muchos', 'muchas'\n" +
        "]);\n" +
        "const ARTICLE_BUTTONS_BY_SOURCE = {\n" +
        "    quecuales: ['q', 'u', 'é', 'e', 'e', 's', 's', 'o', 'n', 'c', 'á', 'l'],\n" +
        "    cuantos: ['c', 'u', 'á', 'n', 't', 'o', 's', 'a'],\n" +
        "    donde: ['d', 'd', 'ó', 'n', 'e', 'e', 's', 't', 'á', 'n'],\n" +
        "    muymucho: ['m', 'u', 'y', 'c', 'h', 'o', 'a', 's']\n" +
        "};\n" +
        "const VERB_CONJUGATION_SOURCES = new Set(['ser', 'estar', 'tener']);";

      page = page.replace(
        /const\s+INDEFINITE_ARTICLE_SET\s*=\s*new\s+Set\(\[[\s\S]*?const\s+VERB_CONJUGATION_SOURCES\s*=\s*new\s+Set\(\[[\s\S]*?\]\);/,
        u3ArticleSet
      );

      const u3GetArticleExercise = "function getIndefiniteArticleExercise(answer) {\n" +
        "    const fullAnswer = normalizeAnswerText(answer);\n" +
        "    const clean = fullAnswer.replace(/^¿/, '').replace(/\\?$/, '').replace(/\\s+/g, ' ').trim();\n" +
        "    const lower = clean.toLowerCase();\n" +
        "    const qcForms = ['qué es', 'qué son', 'cuál es', 'cuáles son'];\n" +
        "    const qc = qcForms.find(form => lower.startsWith(form + ' '));\n" +
        "    if (qc) {\n" +
        "        return { article: qc, noun: clean.slice(qc.length).trim(), position: 'before', topic: 'quecuales', fullAnswer };\n" +
        "    }\n" +
        "    const ddForms = ['dónde está', 'dónde están'];\n" +
        "    const dd = ddForms.find(form => lower.startsWith(form + ' '));\n" +
        "    if (dd) {\n" +
        "        return { article: dd, noun: clean.slice(dd.length).trim(), position: 'before', topic: 'donde', fullAnswer };\n" +
        "    }\n" +
        "    const ctForms = ['cuánto', 'cuántos', 'cuántas', 'cuánta'];\n" +
        "    const ct = ctForms.find(form => lower.startsWith(form + ' '));\n" +
        "    if (ct) {\n" +
        "        return { article: ct, noun: clean.slice(ct.length).trim(), position: 'before', topic: 'cuantos', fullAnswer };\n" +
        "    }\n" +
        "    const muymuchoForms = new Set(['muy', 'mucho', 'mucha', 'muchos', 'muchas']);\n" +
        "    const words = splitAnswerIntoWords(clean);\n" +
        "    if (words.length >= 2) {\n" +
        "        const first = words[0].toLowerCase();\n" +
        "        const last = words[words.length - 1].toLowerCase();\n" +
        "        if (muymuchoForms.has(first)) {\n" +
        "            return { article: first, noun: words.slice(1).join(' '), position: 'before', topic: 'muymucho', fullAnswer };\n" +
        "        }\n" +
        "        if (last === 'mucho') {\n" +
        "            return { article: last, noun: words.slice(0, -1).join(' '), position: 'after', topic: 'muymucho', fullAnswer };\n" +
        "        }\n" +
        "    }\n" +
        "    return null;\n" +
        "}";

      page = page.replace(
        /function\s+getIndefiniteArticleExercise\(answer\)\s*\{[\s\S]*?\n\}/,
        u3GetArticleExercise
      );

      const u3TargetWordLengths = "if (articleExercise) {\n" +
        "        if (cardSource === 'quecuales' || articleExercise.topic === 'quecuales') {\n" +
        "            targetWordLengths = words.map((w, idx) => idx === 0 ? 6 : (idx === 1 ? 3 : w.length));\n" +
        "        } else if (cardSource === 'cuantos' || articleExercise.topic === 'cuantos') {\n" +
        "            targetWordLengths = [7];\n" +
        "        } else {\n" +
        "            targetWordLengths = words.map(w => w.length);\n" +
        "        }\n" +
        "    } else {\n" +
        "        targetWordLengths = words.map(w => w.length);\n" +
        "    }";

      page = page.replace(
        "targetWordLengths = words.map(w => w.length);",
        u3TargetWordLengths
      );

      page = page.replace(
        "currentCorrectWordLength = letterData.letterData.correctWord.replace(/\\s+/g, '').length;",
        "currentCorrectWordLength = targetWordLengths.reduce((total, length) => total + length, 0);"
      );

      page = page.replace(
        '<button class="confirm-word-btn" id="confirm-word-btn-${idx}" data-word-idx="${idx}" onclick="event.stopPropagation(); confirmFormedWordManual(event, ${idx})" aria-label="Comprobar respuesta" title="Comprobar respuesta"><i class="fas fa-check" style="font-size: 12px;"></i></button>',
        '${(!articleExercise || idx === 0) ? `<button class="confirm-word-btn${articleExercise ? \' single-confirm-btn\' : \'\'}" id="confirm-word-btn-${idx}" data-word-idx="${idx}" onclick="event.stopPropagation(); confirmFormedWordManual(event, ${idx})" aria-label="Comprobar respuesta" title="Comprobar respuesta"><i class="fas fa-check" style="font-size: 12px;"></i></button>` : \'\'}'
      );

      const u3StackedContextBlock = "if (articleExercise) {\n" +
        "        const contextWords = splitAnswerIntoWords(articleExercise.noun);\n" +
        "        const stackContext = true;\n" +
        "        const shortDeterminers = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas']);\n" +
        "        let contextHtml = articleExercise.noun;\n" +
        "        if (stackContext) {\n" +
        "            if (contextWords.length === 1) {\n" +
        "                contextHtml = `<span class=\"context-line\">${contextWords[0]}</span>`;\n" +
        "            } else if (shortDeterminers.has(contextWords[0].toLowerCase())) {\n" +
        "                contextHtml = `<span class=\"context-line\">${contextWords.join(' ')}</span>`;\n" +
        "            } else {\n" +
        "                contextHtml = `<span class=\"context-line\">${contextWords[0]}</span><span class=\"context-line\">${contextWords.slice(1).join(' ')}</span>`;\n" +
        "            }\n" +
        "        }\n" +
        "        wordAreaDiv.innerHTML = `\n" +
        "            <div class=\"article-composition-row${stackContext ? ' is-stacked' : ''}\" style=\"display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: clamp(12px, 3vw, 22px); max-width: 100%; margin: 0 auto;\">\n" +
        "                <div class=\"formation-rows-wrapper\" style=\"display: inline-flex; flex-direction: column; align-items: flex-start; width: fit-content; margin: 0;\">\n" +
        "                    ${displayContainersHtml}\n" +
        "                </div>\n" +
        "                <div class=\"article-context-noun${stackContext ? ' is-stacked' : ''}\" style=\"font-family: 'Poppins', sans-serif; font-size: clamp(1.35rem, 4.2vw, 2.2rem); font-weight: 900; color: #ffffff; line-height: 1; text-align: center; text-transform: none; text-shadow: 0 5px 18px rgba(0,0,0,0.35);\">${contextHtml}</div>\n" +
        "            </div>\n" +
        "        `;\n" +
        "        wordAreaDiv.querySelectorAll('.word-display-container').forEach((box) => {\n" +
        "            box.style.setProperty('position', 'relative', 'important');\n" +
        "            const clear = box.querySelector('.word-clear-btn, .clear-word-btn');\n" +
        "            if (clear) {\n" +
        "                clear.style.setProperty('left', '-38px', 'important');\n" +
        "                clear.style.setProperty('right', 'auto', 'important');\n" +
        "                clear.style.setProperty('top', '50%', 'important');\n" +
        "                clear.style.setProperty('transform', 'translateY(-50%)', 'important');\n" +
        "            }\n" +
        "            box.querySelectorAll('.confirm-word-btn:not(.single-confirm-btn)').forEach((button) => {\n" +
        "                button.style.setProperty('display', 'none', 'important');\n" +
        "            });\n" +
        "            const confirm = box.querySelector('.confirm-word-btn.single-confirm-btn');\n" +
        "            if (confirm) {\n" +
        "                confirm.style.setProperty('left', '50%', 'important');\n" +
        "                confirm.style.setProperty('right', 'auto', 'important');\n" +
        "                confirm.style.setProperty('top', '-38px', 'important');\n" +
        "                confirm.style.setProperty('transform', 'translateX(-50%)', 'important');\n" +
        "            }\n" +
        "        });\n" +
        "    }";

      page = page.replace(
        /const\s+hasLongArticleContext\s*=\s*articleExercise\s*&&[\s\S]*?<\/div>\s*`;\s*\}/,
        u3StackedContextBlock
      );

      page = page.replace(
        "const targetWordIdx = wordIdx;",
        "const targetWordIdx = articleExercise ? (activeWordIndex === -1 ? 0 : activeWordIndex) : wordIdx;"
      );

      const u3FinalAnswer = "function showFinalAnswerView(backElement, correctWord, card) {\n" +
        "    canFlip = false;\n" +
        "    canFlipBack = false;\n" +
        "    const raw = String(correctWord || '').replace(/\\s+/g, ' ').trim();\n" +
        "    backElement.innerHTML = '';\n" +
        "    backElement.dataset.originalText = raw;\n" +
        "    const answerCard = document.createElement('div');\n" +
        "    answerCard.className = 'back-conjugation article-answer-card u3-revealed-answer';\n" +
        "    const answer = document.createElement('span');\n" +
        "    answer.className = 'back-verb-main';\n" +
        "    const cleanQuestion = raw.replace(/^¿/, '').replace(/\\?$/, '').trim();\n" +
        "    const lowerQuestion = cleanQuestion.toLowerCase();\n" +
        "    const questionForm = [...INDEFINITE_ARTICLE_SET].find(form => lowerQuestion.startsWith(form + ' '));\n" +
        "    if (questionForm) {\n" +
        "        const clue = cleanQuestion.slice(questionForm.length).trim();\n" +
        "        answer.innerHTML = `<span class=\"back-reflexive\">¿${questionForm.charAt(0).toUpperCase()}${questionForm.slice(1)}</span> ${clue}?`;\n" +
        "    } else {\n" +
        "        const words = raw.split(/\\s+/).filter(Boolean);\n" +
        "        if (words.length > 1 && ['muy', 'mucho', 'mucha', 'muchos', 'muchas'].includes(words[0].toLowerCase())) {\n" +
        "            answer.innerHTML = `<span class=\"back-reflexive\">${words[0]}</span> ${words.slice(1).join(' ')}`;\n" +
        "        } else if (words.length > 1 && words[words.length - 1].toLowerCase() === 'mucho') {\n" +
        "            answer.innerHTML = `${words.slice(0, -1).join(' ')} <span class=\"back-reflexive\">${words[words.length - 1]}</span>`;\n" +
        "        } else {\n" +
        "            answer.textContent = raw.charAt(0).toUpperCase() + raw.slice(1);\n" +
        "        }\n" +
        "    }\n" +
        "    answerCard.appendChild(answer);\n" +
        "    backElement.appendChild(answerCard);\n" +
        "    const audioIndex = flashcards.indexOf(card);\n" +
        "    playCardResponseAudio(card, audioIndex, raw);\n" +
        "}";

      page = page.replace(
        /function\s+showFinalAnswerView\(backElement,\s*correctWord,\s*card\)\s*\{[\s\S]*?playCardResponseAudio\(card,\s*audioIndex,\s*correctWord\);\s*\}/,
        u3FinalAnswer
      );

      page = page.replace(
        "const GAME_STATE_VERSION = 4;",
        "const GAME_STATE_VERSION = 50;"
      );

      page = page.replace(
        "frontEl.innerHTML = cardData.frontHTML || canonical.frontHTML;",
        "frontEl.innerHTML = (cardData.frontHTML || canonical.frontHTML || '').replace(/\\btarget-after\\b/g, ''); frontEl.classList.remove('target-after'); frontEl.querySelectorAll('.target-after').forEach(el => el.classList.remove('target-after'));"
      );

      page = page.replace(
        "setCanonicalBackText(back, cardData.backText || canonical.backText, cardData.backHTML || canonical.backHTML);",
        "const cleanBackHTML = (cardData.backHTML || canonical.backHTML || '').replace(/\\btarget-after\\b/g, ''); setCanonicalBackText(back, cardData.backText || canonical.backText, cleanBackHTML); back.querySelectorAll('.target-after').forEach(el => el.classList.remove('target-after'));"
      );

      page = page.replace(
        "if (!existingLetterContent) {\n                        showLetterCombination(backElement, correctWord);",
        "if (!existingLetterContent || existingLetterContent.querySelector('.target-after') || !existingLetterContent.querySelector('.article-context-noun')) {\n                        showLetterCombination(backElement, correctWord);"
      );
    }

    page = page.replace(
      "function clearCurrentProgress() {",
      "function clearCurrentProgress() {\n    try { ['com-gr-u3-mixta-draw', 'gr-u3-mixta-draw', 'sel-gr-u3-mixta-draw'].forEach(k => localStorage.removeItem(k)); } catch(_) {}"
    );
    if (pageMode === 'com') {
      // Última capa de compatibilidad: debe quedar después de todos los
      // estilos heredados para reproducir exactamente com-quecuales.
      page = page.replace('</body>', `<style id="com-gr-u3-mixta-final-composition-layout">
        #flashcard-container .article-composition-row:has(.article-context-noun) {
          flex-direction: column !important;
          gap: clamp(12px, 2.5vw, 22px) !important;
        }
        #flashcard-container .article-composition-row:has(.article-context-noun) .word-clear-btn,
        #flashcard-container .article-composition-row:has(.article-context-noun) .clear-word-btn {
          left: -38px !important;
          right: auto !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
        }
        #flashcard-container .article-composition-row:has(.article-context-noun) .confirm-word-btn:not(.single-confirm-btn) {
          display: none !important;
        }
        #flashcard-container .article-composition-row:has(.article-context-noun) .confirm-word-btn.single-confirm-btn {
          left: 50% !important;
          right: auto !important;
          top: -38px !important;
          transform: translateX(-50%) !important;
        }
      </style></body>`);
    }
    document.write(page);
    document.close();
    document.title = finalTitle;
  };

  try {
    if (mode === 'hub') {
      buildStaticMixed('hub');
    } else {
      buildStaticMixed(mode);
    }
  } catch (error) {
    console.error('gr-u3-mixta:', error);
    document.body.innerHTML = '<main style="font-family:Arial,sans-serif;padding:32px;text-align:center"><h2>No se pudo preparar Gramática U3 · Mixta</h2><p>' + String(error.message || error) + '</p></main>';
  }
})();
