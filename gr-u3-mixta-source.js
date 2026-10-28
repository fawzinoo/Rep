// Ejecutar únicamente los constructores locales de preguntas del tema padre.
window.prepareU3MixedSource = (doc) => {
  doc.querySelectorAll('#flashcard-container > script').forEach((script) => {
    if (script.textContent.includes('const questionCards =')) {
      new Function('document', script.textContent)(doc);
    }
  });
  doc.querySelectorAll('#flashcard-container > .flashcard').forEach((card) => {
    // El motor de cada modalidad instala su propio manejador de volteo.
    card.removeAttribute('onclick');
    card.dataset.answer = card.dataset.answer || card.querySelector('.back').textContent.replace(/\s+/g, ' ').trim();
    card.querySelector('.back').setAttribute('data-original-text', card.dataset.answer);
  });
  return doc;
};
