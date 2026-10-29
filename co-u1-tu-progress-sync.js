(function () {
    'use strict';
    const KEY = 'co-u1-tu-test-unlock-state-v2';
    const CACHE_KEY = 'a1beta-topic-points-cache-v1';
    const COLUMNS = ['U1C1T1', 'U1C1T2', 'U1C1T3', 'U1C1T4'];
    const EVENT = 'co-u1-tu-progress-updated';
    const ENDPOINT = 'https://script.google.com/macros/s/AKfycbyo7SUAWvSrARC9g2p4xkqUMcl2UyZ5_WhHNLBRxKthdJLtUFOr4BhcVSQqqF__abFy/exec';
    const LEGACY_KEYS = ['u1-tu-test-unlock-state-v2', 'u1-tu-esc-unlock-v1', 'reco-tu-unlock-state-v2', 'loslunes-test-unlock-state-v2'];
    let inFlight = null;
    let revision = 0;

    function stored(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || '{}');
            return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
        } catch (_) { return {}; }
    }

    function parse(value) {
        if (value && typeof value === 'object') {
            const forced = value.forced === true || value.forcedUnlock === true || value.unlockForced === true;
            for (const field of ['puntosRaw', 'puntos', 'pointsRaw', 'points', 'value', 'score', 'nota']) {
                const result = parse(value[field]);
                if (result.points !== null) return { points: result.points, forced: forced || result.forced };
            }
            return { points: null, forced: forced };
        }
        const match = String(value == null ? '' : value).trim().toLowerCase().match(/^([0-5])(?:[.,]0+)?\s*([ft])?$/);
        return match ? { points: Number(match[1]), forced: Boolean(match[2]) } : { points: null, forced: false };
    }

    function normalize(input) {
        const state = { ...input, scores: {}, unlocksByColumn: {}, localRevisionByColumn: { ...(input.localRevisionByColumn || {}) }, pendingScoresByColumn: { ...(input.pendingScoresByColumn || {}) } };
        COLUMNS.forEach(function (column, index) {
            const result = parse(input.scores && input.scores[column]);
            const legacyFlag = index < 3 ? input[['test2', 'test3', 'test4'][index]] : null;
            const forced = Boolean(input.unlocksByColumn && input.unlocksByColumn[column] === true) || legacyFlag === true || Boolean(legacyFlag && legacyFlag.unlocked === true) || result.forced || (result.points !== null && result.points >= 4);
            state.unlocksByColumn[column] = forced;
            if (result.points !== null) state.scores[column] = forced ? result.points + 'f' : result.points;
        });
        ['test2', 'test3', 'test4'].forEach(function (test, index) {
            const column = COLUMNS[index];
            state[test] = { unlocked: state.unlocksByColumn[column], points: parse(state.scores[column]).points || 0 };
        });
        return state;
    }

    function read() { return normalize(stored(KEY)); }

    function emit() { window.dispatchEvent(new CustomEvent(EVENT)); }

    function write(value) {
        const state = normalize(value);
        try {
            const serialized = JSON.stringify(state);
            const changed = localStorage.getItem(KEY) !== serialized;
            localStorage.setItem(KEY, serialized);
            const cache = stored(CACHE_KEY);
            COLUMNS.forEach(function (column) {
                const result = parse(state.scores[column]);
                if (result.points !== null) cache[column] = state.unlocksByColumn[column] ? result.points + 't' : result.points;
            });
            const cacheText = JSON.stringify(cache);
            if (localStorage.getItem(CACHE_KEY) !== cacheText) localStorage.setItem(CACHE_KEY, cacheText);
            if (changed) emit();
        } catch (_) { /* The exercise remains usable when browser storage is unavailable. */ }
        return state;
    }

    function migrate() {
        const state = read();
        if (state.syncVersion === 1) return;
        LEGACY_KEYS.forEach(function (key) {
            const legacy = stored(key);
            COLUMNS.forEach(function (column) {
                // Only migrate this topic's explicit columns, never copied Grammar/Lexicon scores.
                const incoming = parse(legacy.scores && legacy.scores[column]);
                const current = parse(state.scores[column]);
                if (incoming.points !== null && (current.points === null || (current.points === 0 && incoming.points > 0))) {
                    state.scores[column] = incoming.points;
                }
                if (incoming.forced || (legacy.unlocksByColumn && legacy.unlocksByColumn[column] === true)) state.unlocksByColumn[column] = true;
            });
        });
        state.syncVersion = 1;
        write(state);
    }

    function saveScore(column, value) {
        const state = read();
        const result = parse(value);
        if (!COLUMNS.includes(column) || result.points === null) return state;
        state.scores[column] = result.forced ? result.points + 'f' : result.points;
        if (result.forced || result.points >= 4) state.unlocksByColumn[column] = true;
        state.localRevisionByColumn[column] = Date.now() + ':' + (++revision) + ':' + Math.random();
        state.pendingScoresByColumn[column] = true;
        return write(state);
    }

    function unlock(column) {
        const state = read();
        if (!COLUMNS.includes(column)) return state;
        state.unlocksByColumn[column] = true;
        state.localRevisionByColumn[column] = Date.now() + ':' + (++revision) + ':' + Math.random();
        return write(state);
    }

    function getStudent() {
        try {
            if (typeof window.getStudentIdentityForChat === 'function') {
                const identity = window.getStudentIdentityForChat();
                if (identity && identity.firstName && identity.lastName) return { nombre: identity.firstName, apellido: identity.lastName };
            }
            const nombre = localStorage.getItem('access_first_name') || sessionStorage.getItem('nombreUsuario') || '';
            const apellido = localStorage.getItem('access_last_name') || sessionStorage.getItem('apellidoUsuario') || '';
            return nombre && apellido ? { nombre: nombre, apellido: apellido } : null;
        } catch (_) { return null; }
    }

    function refresh(options) {
        if (inFlight) return inFlight;
        const config = options || {};
        const student = config.student || getStudent();
        if (!student) return Promise.resolve(read());
        const before = read();
        inFlight = (async function () {
            const query = new URLSearchParams({ mode: 'user_points', nombre: student.nombre, apellido: student.apellido, columns: COLUMNS.join(','), t: String(Date.now()) });
            const response = await fetch((config.endpoint || ENDPOINT) + '?' + query.toString(), { method: 'GET', cache: 'no-store' });
            if (!response.ok) throw new Error('user_points HTTP ' + response.status);
            const data = await response.json();
            if (!data || data.ok !== true || !data.pointsByColumn || typeof data.pointsByColumn !== 'object') throw new Error('Invalid user_points response');
            const remoteScores = { ...data.pointsByColumn };
            // Older deployments only include Lexicon columns in user_points; ranking supports any header.
            const normalizeName = function (name) { return String(name || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' '); };
            await Promise.all(COLUMNS.filter(function (column) { return parse(remoteScores[column]).points === null; }).map(async function (column) {
                try {
                    const rankingQuery = new URLSearchParams({ mode: 'ranking', columna: column, scope: 'u1-tu', t: String(Date.now()) });
                    const rankingResponse = await fetch((config.endpoint || ENDPOINT) + '?' + rankingQuery.toString(), { method: 'GET', cache: 'no-store' });
                    if (!rankingResponse.ok) throw new Error('ranking HTTP ' + rankingResponse.status);
                    const rankingData = await rankingResponse.json();
                    const rows = Array.isArray(rankingData) ? rankingData : rankingData && rankingData.ranking;
                    if (!Array.isArray(rows)) return;
                    const row = rows.find(function (entry) { return normalizeName(entry.nombre) === normalizeName(student.nombre) && normalizeName(entry.apellido) === normalizeName(student.apellido); });
                    if (row) remoteScores[column] = row;
                } catch (error) { console.warn('No se pudo leer la columna ' + column + '; se conserva su nota local:', error); }
            }));
            const state = read();
            COLUMNS.forEach(function (column) {
                const result = parse(remoteScores[column]);
                if (result.points === null) return;
                // Preserve permanent unlocks even while a newly earned grade is awaiting confirmation.
                if (result.forced || result.points >= 4) state.unlocksByColumn[column] = true;
                const changedDuringRequest = state.localRevisionByColumn[column] !== before.localRevisionByColumn[column];
                const awaitingConfirmation = state.pendingScoresByColumn[column] === true && parse(state.scores[column]).points !== result.points;
                if (changedDuringRequest || awaitingConfirmation) return;
                state.scores[column] = result.forced ? result.points + 'f' : result.points;
                delete state.pendingScoresByColumn[column];
            });
            return write(state);
        })().finally(function () { inFlight = null; });
        return inFlight;
    }

    function refreshSafely() { return refresh().catch(function (error) { console.warn('No se pudo leer la hoja de Tu; se conservan las notas locales:', error); }); }

    window.CoU1TuProgress = { key: KEY, columns: COLUMNS.slice(), read: read, parse: parse, saveScore: saveScore, unlock: unlock, hasUnlock: function (column) { return read().unlocksByColumn[column] === true; }, refresh: refresh };
    migrate();
    window.addEventListener('storage', function (event) { if (event.key === KEY || event.key === null) emit(); });
    window.addEventListener('focus', refreshSafely);
    window.addEventListener('pageshow', refreshSafely);
    window.addEventListener('online', refreshSafely);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') void refreshSafely(); });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refreshSafely, { once: true });
    else void refreshSafely();
})();
