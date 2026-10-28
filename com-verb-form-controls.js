/* Controles comunes de las actividades com- de formas verbales.
   La respuesta pronominal se construye en una sola ranura y el botón de
   comprobación permanece disponible sobre el cuadro. */
(() => {
    const source = (window.location.pathname.split('/').pop() || '')
        .replace(/^com-/, '')
        .replace(/\.html$/i, '');
    const pronominalSources = new Set(['apellidarse', 'dedicarse', 'llamarse']);

    const controlsStyle = document.createElement('style');
    controlsStyle.textContent = `
        #flashcard-container .word-display-container .confirm-word-btn,
        #flashcard-container .word-display-container .clear-word-btn {
            width: 28px !important;
            height: 28px !important;
            min-width: 28px !important;
            padding: 0 !important;
            box-sizing: border-box !important;
        }
        #flashcard-container .word-display-container .confirm-word-btn {
            left: calc(50% - 12px) !important;
            right: auto !important;
            top: -38px !important;
            transform: translateX(-100%) !important;
        }
        #flashcard-container .word-display-container .clear-word-btn {
            left: calc(50% + 12px) !important;
            right: auto !important;
            top: -38px !important;
            transform: none !important;
        }
        #flashcard-container .word-display-container .confirm-word-btn:hover { transform: translateX(-100%) scale(1.08) !important; }
        #flashcard-container .word-display-container .confirm-word-btn:active { transform: translateX(-100%) scale(0.96) !important; }
        #flashcard-container .word-display-container .clear-word-btn:hover { transform: scale(1.08) !important; }
        #flashcard-container .word-display-container .clear-word-btn:active { transform: scale(0.96) !important; }
    `;
    document.head.appendChild(controlsStyle);

    if (pronominalSources.has(source) && typeof splitAnswerIntoWords === 'function') {
        splitAnswerIntoWords = (text) => {
            const normalized = normalizeAnswerText(text);
            return normalized ? [normalized.replace(/\s+/g, '')] : [];
        };
    }

    function installConfirmButtons() {
        document.querySelectorAll('.word-display-container').forEach((container) => {
            if (container.dataset.confirmInstalled === '1') return;
            const input = container.querySelector('.word-input-wrapper');
            if (!input) return;

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'confirm-word-btn';
            button.setAttribute('aria-label', 'Comprobar respuesta');
            button.title = 'Comprobar respuesta';
            button.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i>';
            button.style.cssText = [
                'position:absolute', 'left:calc(50% - 4px)', 'top:-38px',
                'transform:translateX(-100%)', 'width:28px', 'height:28px', 'min-width:28px', 'padding:0',
                'border:0', 'border-radius:50%', 'background:#22c55e', 'color:#fff',
                'display:none', 'align-items:center', 'justify-content:center',
                'cursor:pointer', 'z-index:1002', 'box-shadow:0 4px 12px rgba(34,197,94,.42)'
            ].join(';');
            button.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (!formedWord.some((letter) => letter)) {
                    if (typeof vibrar === 'function') vibrar(40);
                    return;
                }
                const back = container.closest('.back');
                const card = container.closest('.flashcard');
                const answer = card?.dataset.answer || '';
                if (back && answer && typeof checkFormedWordAutomatically === 'function') {
                    checkFormedWordAutomatically(answer, answer, back);
                }
            });
            container.insertBefore(button, input);
            container.dataset.confirmInstalled = '1';
        });
    }

    function refreshConfirmButtons() {
        document.querySelectorAll('.word-display-container .confirm-word-btn').forEach((button) => {
            const hasLetters = formedWord.some((letter) => letter);
            const completed = Boolean(document.querySelector('.letter-combination-container.correct-state'));
            button.style.display = hasLetters && !completed ? 'flex' : 'none';
        });
    }

    function addPronominalGap() {
        if (!pronominalSources.has(source)) return;
        const display = document.querySelector('#formed-word-0');
        const answer = display?.closest('.flashcard')?.dataset.answer || '';
        const prefix = String(answer).trim().split(/\s+/)[0] || '';
        const prefixLength = prefix.length;
        if (!prefixLength || !formedWord.slice(0, prefixLength).every(Boolean)) return;
        const characters = display?.querySelectorAll('.wd-char');
        const lastPrefixCharacter = characters?.[prefixLength - 1];
        if (!lastPrefixCharacter || lastPrefixCharacter.nextElementSibling?.classList.contains('verb-pronoun-gap')) return;
        const gap = document.createElement('span');
        gap.className = 'verb-pronoun-gap';
        gap.style.cssText = 'display:inline-block;width:.52em;flex:0 0 .52em';
        lastPrefixCharacter.insertAdjacentElement('afterend', gap);
    }

    const originalUpdate = updateFormedWordDisplayWithCursor;
    updateFormedWordDisplayWithCursor = function (...args) {
        const result = originalUpdate.apply(this, args);
        installConfirmButtons();
        refreshConfirmButtons();
        addPronominalGap();
        return result;
    };

    new MutationObserver(() => {
        installConfirmButtons();
        refreshConfirmButtons();
    }).observe(document.body, { childList: true, subtree: true });

    installConfirmButtons();
    refreshConfirmButtons();
})();
