/* Composición libre para determinados, indeterminantes y posesivos.
   No se dibuja una cantidad fija de casillas: el alumno construye el intento
   que considere y la validación sucede exclusivamente al pulsar ✓. */
(() => {
    const articleSources = new Set(['determinados', 'indeterminantes', 'posesivos1']);
    const pageSource = (window.location.pathname.split('/').pop() || '')
        .replace(/^com-/, '')
        .replace(/\.html$/i, '');
    const attemptsByCard = new Map();

    const controlsStyle = document.createElement('style');
    controlsStyle.textContent = `
        #flashcard-container .word-display-container .confirm-word-btn,
        #flashcard-container .word-display-container .clear-word-btn {
            width: 28px !important; height: 28px !important; min-width: 28px !important;
            padding: 0 !important; box-sizing: border-box !important; top: -38px !important;
        }
        #flashcard-container .word-display-container .confirm-word-btn {
            left: calc(50% - 12px) !important; right: auto !important;
            transform: translateX(-100%) !important;
        }
        #flashcard-container .word-display-container .clear-word-btn {
            left: calc(50% + 12px) !important; right: auto !important; transform: none !important;
        }
        #flashcard-container .word-display-container .confirm-word-btn:hover { transform: translateX(-100%) scale(1.08) !important; }
        #flashcard-container .word-display-container .confirm-word-btn:active { transform: translateX(-100%) scale(0.96) !important; }
        #flashcard-container .word-display-container .clear-word-btn:hover { transform: scale(1.08) !important; }
        #flashcard-container .word-display-container .clear-word-btn:active { transform: scale(0.96) !important; }
    `;
    document.head.appendChild(controlsStyle);

    function sourceOf(card) {
        return String(card?.dataset.source || pageSource || '').toLowerCase();
    }

    function render(display, letters) {
        display.innerHTML = '';
        display.style.minWidth = '56px';
        display.style.letterSpacing = '4px';
        letters.forEach((letter) => {
            const character = document.createElement('span');
            character.className = 'wd-char filled';
            character.textContent = letter;
            display.appendChild(character);
        });
        const caret = document.createElement('span');
        caret.className = 'wd-caret';
        display.appendChild(caret);
    }

    function targetArticleOf(card, answer) {
        if (typeof getIndefiniteArticleExercise === 'function') {
            const exercise = getIndefiniteArticleExercise(answer);
            if (exercise && exercise.article) return exercise.article;
        }
        const match = String(answer || '').trim().match(/^([^\s]+)/);
        return match ? match[1].toLowerCase() : answer;
    }

    function install(container) {
        if (container.dataset.freeArticleInstalled === '1') {
            container.__restoreFreeArticleAttempt?.();
            return;
        }
        const card = container.closest('.flashcard');
        if (!articleSources.has(sourceOf(card))) return;

        const display = container.querySelector('.word-display');
        const back = container.closest('.back');
        const answer = String(card?.dataset.answer || '').trim();
        if (!display || !back || !answer) return;

        const cardKey = card.dataset.cardId || answer;
        let savedLetters = [];
        try {
            const saved = JSON.parse(card.dataset.freeArticleAttempt || '[]');
            if (Array.isArray(saved)) savedLetters = saved.filter((letter) => typeof letter === 'string');
        } catch (_) {}
        const state = attemptsByCard.get(cardKey) || { letters: savedLetters };
        if (savedLetters.length) state.letters = savedLetters;
        attemptsByCard.set(cardKey, state);
        const inputContainer = display.closest('.word-display-container');
        let confirm = inputContainer?.querySelector('.confirm-word-btn');
        let clear = inputContainer?.querySelector('.clear-word-btn');
        if (!inputContainer || !confirm || !clear) return;

        const update = () => {
            // El elemento .flashcard no se destruye al girar; su dataset sí
            // permanece y es la fuente persistente del intento libre.
            card.dataset.freeArticleAttempt = JSON.stringify(state.letters);
            formedWord = [...state.letters];
            selectedButtons = [];
            currentCorrectWordLength = state.letters.length;
            render(display, state.letters);
            const showControls = state.letters.length > 0;
            confirm.style.setProperty('display', showControls ? 'flex' : 'none', 'important');
            confirm.style.visibility = showControls ? 'visible' : 'hidden';
            clear.style.setProperty('display', showControls ? 'flex' : 'none', 'important');
            clear.style.visibility = showControls ? 'visible' : 'hidden';
        };
        container.__restoreFreeArticleAttempt = update;

        container.querySelectorAll('.letter-option').forEach((oldButton) => {
            const button = oldButton.cloneNode(true);
            oldButton.replaceWith(button);
            button.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                state.letters.push(button.dataset.letter || button.textContent.trim());
                if (typeof vibrar === 'function') vibrar(50);
                try {
                    const keyAudio = document.getElementById('letterClickSound');
                    if (keyAudio && (typeof areButtonSoundsMuted !== 'function' || !areButtonSoundsMuted())) {
                        keyAudio.currentTime = 0;
                        keyAudio.volume = 0.35;
                        keyAudio.play().catch(() => {});
                    }
                } catch (_) {}
                update();
            });
        });

        const cleanConfirm = confirm.cloneNode(true);
        cleanConfirm.removeAttribute('onclick');
        confirm.replaceWith(cleanConfirm);
        confirm = cleanConfirm;
        confirm.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!state.letters.length) return;
            const targetWord = targetArticleOf(card, answer);
            checkFormedWordAutomatically(targetWord, answer, back);
        });

        const cleanClear = clear.cloneNode(true);
        cleanClear.removeAttribute('onclick');
        clear.replaceWith(cleanClear);
        clear = cleanClear;
        clear.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            state.letters = [];
            if (typeof playButtonSound === 'function') playButtonSound();
            update();
        });

        container.dataset.freeArticleInstalled = '1';
        update();
    }

    const observer = new MutationObserver((records) => {
        const hasNewCombination = records.some((record) => Array.from(record.addedNodes).some((node) =>
            node.nodeType === Node.ELEMENT_NODE
            && (node.matches?.('.letter-combination-container') || node.querySelector?.('.letter-combination-container'))
        ));
        if (hasNewCombination) {
            document.querySelectorAll('.letter-combination-container').forEach(install);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Al volver de front a back, la actividad crea de nuevo el DOM del
    // reverso. Forzamos la restauración en el siguiente frame para pintar el
    // intento guardado antes de que el alumno tenga que tocar una letra.
    const originalShowLetterCombination = showLetterCombination;
    showLetterCombination = function (...args) {
        const result = originalShowLetterCombination.apply(this, args);
        const restore = () => document.querySelectorAll('.letter-combination-container').forEach(install);
        requestAnimationFrame(restore);
        setTimeout(restore, 80);
        return result;
    };

    // Si el reverso ya existe, el juego no vuelve a llamar a show...:
    // invoca updateFormedWordDisplayWithCursor(), que repinta las casillas
    // desde su estado clásico. Restauramos inmediatamente el intento libre.
    const originalUpdateFormedWordDisplay = updateFormedWordDisplayWithCursor;
    updateFormedWordDisplayWithCursor = function (...args) {
        const result = originalUpdateFormedWordDisplay.apply(this, args);
        requestAnimationFrame(() => {
            document.querySelectorAll('.letter-combination-container').forEach(install);
        });
        return result;
    };
    document.querySelectorAll('.letter-combination-container').forEach(install);
})();
