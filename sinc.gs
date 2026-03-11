function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizeUser_(nombre, apellido) {
  return (String(nombre || '') + String(apellido || ''))
    .toLowerCase()
    .replace(/\s+/g, '');
}

function normalizeName_(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeDigits_(value) {
  return String(value || '')
    .replace(/[٠-٩]/g, function(d) { return String(d.charCodeAt(0) - 1632); }) // Arabic-Indic
    .replace(/[۰-۹]/g, function(d) { return String(d.charCodeAt(0) - 1776); }); // Eastern Arabic-Indic
}

function normalizeLessonPointRaw_(value) {
  var text = normalizeDigits_(value == null ? '' : value);
  return text
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width chars
    .replace(/\u00A0/g, ' ') // nbsp
    .trim()
    .replace(/^['"`]+|['"`]+$/g, ''); // wrapping quotes/apostrophes
}

function parseLessonPoints_(value) {
  if (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 5 &&
    Math.floor(value) === value
  ) {
    return value;
  }

  const raw = normalizeLessonPointRaw_(value);
  if (!raw) return null;

  const compact = raw.toLowerCase().replace(/\s+/g, '').replace(',', '.');

  // Caso normal: 0..5 o 0f..5f (admite 1.0f)
  const exact = compact.match(/^([0-5])(?:\.0+)?(f)?$/);
  if (exact) {
    const base = Number(exact[1]);
    return exact[2] ? `${base}f` : base;
  }

  // Fallback tolerante: si el valor trae texto adicional, pero contiene Xf válido.
  const forced = compact.match(/([0-5])(?:\.0+)?f/);
  if (forced) {
    return `${Number(forced[1])}f`;
  }

  // Fallback tolerante: número válido embebido sin sufijo f.
  const numeric = compact.match(/([0-5])(?:\.0+)?/);
  if (numeric) {
    return Number(numeric[1]);
  }

  return null;
}

function lessonPointsToNumber_(value) {
  const parsed = parseLessonPoints_(value);
  if (parsed === null) return 0;
  if (typeof parsed === 'number') return parsed;
  const m = String(parsed).match(/^([0-5])(?:\.0+)?[fF]$/);
  if (m) return Number(m[1]);
  const n = Number(String(parsed).replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function isFinalUnlockPoints_(value) {
  const parsed = parseLessonPoints_(value);
  return typeof parsed === 'string' && /[fF]$/.test(parsed);
}

function toNumberSafe_(value) {
  const n = Number(String(value == null ? '' : value).replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

// Para verify: prioriza hoja 'codigo'
function getCodeSheet_(ss) {
  return ss.getSheetByName('codigo') || ss.getSheetByName('sinc') || null;
}

function getCodeValues_(ss) {
  const sheet = getCodeSheet_(ss);
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  const out = [];

  for (let i = 0; i < values.length; i++) {
    const v = String(values[i][0] || '').trim();
    if (!v) continue;

    const lower = v.toLowerCase();
    if (
      lower === 'codigo' ||
      lower === 'código' ||
      lower === 'code' ||
      lower === 'password' ||
      lower === 'contraseña' ||
      lower === 'contrasena'
    ) {
      continue;
    }

    out.push(v.toUpperCase());
  }

  return out;
}

function getPrimaryCodeFromCodeSheet_(ss) {
  const codes = getCodeValues_(ss);
  return codes.length ? codes[0] : '';
}

/**
 * Regla de prioridad solicitada:
 * - Si PortalB(C) = 'bloc' => bloqueado (mantener esta lógica)
 * - Si PortalB(C) != codigoSheet => manda PortalB(C)
 * - Si PortalB(C) == codigoSheet => manda codigoSheet
 */
function getEffectiveLoginCode_(portalCode, sheetCode) {
  const portal = String(portalCode || '').trim().toUpperCase();
  const sheet = String(sheetCode || '').trim().toUpperCase();

  if (portal.toLowerCase() === 'bloc') return 'BLOC';

  if (portal && sheet) {
    return portal !== sheet ? portal : sheet;
  }

  if (portal) return portal;
  if (sheet) return sheet;
  return '';
}

// Para sync password: prioriza hoja 'sinc', ignorando encabezado en A1
function getSyncPassword_(ss) {
  const sheet = ss.getSheetByName('sinc') || ss.getSheetByName('codigo');
  if (!sheet) return '';

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return ''; // no hay datos debajo del encabezado

  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues(); // desde A2
  for (let i = 0; i < values.length; i++) {
    const v = String(values[i][0] || '').trim();
    if (!v) continue;

    const lower = v.toLowerCase();
    if (
      lower === 'codigo' ||
      lower === 'código' ||
      lower === 'code' ||
      lower === 'password' ||
      lower === 'contraseña' ||
      lower === 'contrasena'
    ) {
      continue;
    }

    return v.toUpperCase();
  }

  return '';
}

// ==================== CHAT (hoja: chat) ====================
const CHAT_SHEET_NAME_ = 'chat';
const CHAT_DEFAULT_COLUMN_ = 'U1L0T1';
const CHAT_MAX_MESSAGE_LENGTH_ = 280;
const CHAT_IMAGE_PROXY_MAX_BYTES_ = 5 * 1024 * 1024;

function normalizeChatColumn_(columna) {
  const normalized = String(columna || '').trim().toUpperCase();
  return normalized || CHAT_DEFAULT_COLUMN_;
}

function getChatSheet_(ss) {
  return ss.getSheetByName(CHAT_SHEET_NAME_) || null;
}

function getChatColumnIndex_(sheet, columna) {
  if (!sheet) return -1;
  const target = normalizeChatColumn_(columna);
  const lastColumn = sheet.getLastColumn();
  if (lastColumn < 1) return -1;

  const header = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  for (let i = 0; i < header.length; i++) {
    if (String(header[i] || '').trim().toUpperCase() === target) {
      return i;
    }
  }
  return -1;
}

function normalizeChatMessage_(mensaje) {
  const cleaned = String(mensaje || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
  if (!cleaned) return '';
  return cleaned.slice(0, CHAT_MAX_MESSAGE_LENGTH_);
}

function buildChatDisplayName_(data) {
  const explicitName = String((data && data.userDisplayName) || '').trim();
  if (explicitName) {
    return explicitName.replace(/[\r\n]+/g, ' ').trim();
  }

  const nombre = String((data && data.nombre) || '').trim();
  const apellido = String((data && data.apellido) || '').trim();
  const combined = [nombre, apellido].filter(Boolean).join(' ').trim();
  return combined || 'Anonimo';
}

function formatChatCellValue_(displayName, mensaje) {
  const safeName = String(displayName || 'Anonimo')
    .replace(/[\r\n]+/g, ' ')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .trim() || 'Anonimo';
  const safeMessage = normalizeChatMessage_(mensaje);
  return '-' + safeName + '-\n' + safeMessage;
}

function isCellImageValue_(rawValue) {
  return !!rawValue && typeof rawValue === 'object' && String(rawValue) === 'CellImage';
}

function getCellImageMeta_(cellImage) {
  var imageUrl = '';
  var imageTitle = '';
  if (!isCellImageValue_(cellImage)) return { imageUrl: '', imageTitle: '' };

  try {
    if (typeof cellImage.getContentUrl === 'function') {
      imageUrl = String(cellImage.getContentUrl() || '').trim();
    }
  } catch (err1) {}

  if (!imageUrl) {
    try {
      if (typeof cellImage.getUrl === 'function') {
        imageUrl = String(cellImage.getUrl() || '').trim();
      }
    } catch (err2) {}
  }

  try {
    if (typeof cellImage.getAltTextTitle === 'function') {
      imageTitle = String(cellImage.getAltTextTitle() || '').trim();
    }
  } catch (err3) {}

  if (!imageTitle) imageTitle = 'Imagen';
  return { imageUrl: imageUrl, imageTitle: imageTitle };
}

function parseChatCellValue_(rawValue) {
  if (isCellImageValue_(rawValue)) {
    var meta = getCellImageMeta_(rawValue);
    return {
      user: 'Anonimo',
      message: meta.imageUrl ? '' : 'CellImage',
      value: 'CellImage',
      imageUrl: meta.imageUrl || '',
      imageTitle: meta.imageTitle || 'Imagen'
    };
  }

  const text = String(rawValue || '').trim();
  if (!text) return null;

  const firstBreak = text.indexOf('\n');
  if (firstBreak === -1) {
    return { user: 'Anonimo', message: text, value: text, imageUrl: '', imageTitle: '' };
  }

  const userRaw = text.slice(0, firstBreak).trim();
  const messageRaw = text.slice(firstBreak + 1).trim();
  const user = userRaw.replace(/^-+/, '').replace(/-+$/, '').trim() || 'Anonimo';

  return {
    user: user,
    message: messageRaw,
    value: text,
    imageUrl: '',
    imageTitle: ''
  };
}

function getChatMessagesFromColumn_(sheet, colIndex) {
  if (!sheet || colIndex < 0) return [];
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, colIndex + 1, lastRow - 1, 1).getValues();
  const messages = [];

  for (let i = 0; i < values.length; i++) {
    const parsed = parseChatCellValue_(values[i][0]);
    if (!parsed || (!parsed.message && !parsed.imageUrl)) continue;
    messages.push({
      row: i + 2,
      user: parsed.user,
      message: parsed.message,
      value: parsed.value,
      imageUrl: parsed.imageUrl || '',
      imageTitle: parsed.imageTitle || ''
    });
  }

  return messages;
}

function findFirstEmptyChatRow_(sheet, colIndex) {
  if (!sheet || colIndex < 0) return 2;

  const lastRow = Math.max(sheet.getLastRow(), 2);
  const values = sheet.getRange(2, colIndex + 1, lastRow - 1, 1).getValues();

  for (let i = 0; i < values.length; i++) {
    if (!String(values[i][0] || '').trim()) {
      return i + 2;
    }
  }

  return lastRow + 1;
}

function inferMimeExtension_(mimeType) {
  const mime = String(mimeType || '').toLowerCase();
  if (mime.indexOf('png') !== -1) return 'png';
  if (mime.indexOf('jpeg') !== -1 || mime.indexOf('jpg') !== -1) return 'jpg';
  if (mime.indexOf('webp') !== -1) return 'webp';
  if (mime.indexOf('gif') !== -1) return 'gif';
  if (mime.indexOf('bmp') !== -1) return 'bmp';
  if (mime.indexOf('svg') !== -1) return 'svg';
  if (mime.indexOf('heic') !== -1) return 'heic';
  if (mime.indexOf('heif') !== -1) return 'heif';
  return 'bin';
}

function sanitizeFileName_(name, defaultExt) {
  const ext = String(defaultExt || 'bin').replace(/^\./, '').toLowerCase() || 'bin';
  const base = String(name || 'imagen-chat')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim() || 'imagen-chat';
  return base + '.' + ext;
}

function fetchChatImageWithFallback_(imageUrl) {
  const attempts = [
    {
      method: 'get',
      muteHttpExceptions: true,
      followRedirects: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ChatImageProxy/1.0)',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': 'https://docs.google.com/'
      }
    },
    {
      method: 'get',
      muteHttpExceptions: true,
      followRedirects: true
    }
  ];

  let lastError = '';
  for (let i = 0; i < attempts.length; i++) {
    try {
      const resp = UrlFetchApp.fetch(imageUrl, attempts[i]);
      return { resp: resp, attempt: i + 1 };
    } catch (err) {
      lastError = String(err && err.message ? err.message : err);
    }
  }

  throw new Error(lastError || 'urlfetch_failed');
}

function tryHandleChatImageBlobGet_(e) {
  const mode = String((e && e.parameter && e.parameter.mode) || '').toLowerCase();
  if (mode !== 'chat_image_blob') return null;

  const imageUrl = String((e && e.parameter && e.parameter.url) || '').trim();
  if (!imageUrl) {
    return jsonOut_({ ok: false, error: 'missing_url' });
  }

  try {
    const fetched = fetchChatImageWithFallback_(imageUrl);
    const resp = fetched.resp;
    const status = Number(resp.getResponseCode() || 0);
    if (status < 200 || status >= 300) {
      return jsonOut_({
        ok: false,
        error: 'image_fetch_failed',
        status: status,
        attempt: fetched.attempt
      });
    }

    const blob = resp.getBlob();
    const bytes = blob.getBytes();
    if (bytes.length > CHAT_IMAGE_PROXY_MAX_BYTES_) {
      return jsonOut_({ ok: false, error: 'image_too_large', bytes: bytes.length, maxBytes: CHAT_IMAGE_PROXY_MAX_BYTES_ });
    }

    const mimeType = String(blob.getContentType() || 'application/octet-stream');
    const ext = inferMimeExtension_(mimeType);
    const requestedName = String((e && e.parameter && e.parameter.filename) || '').trim();
    const fileName = sanitizeFileName_(requestedName || 'imagen-chat', ext);
    const base64 = Utilities.base64Encode(bytes);

    return jsonOut_({
      ok: true,
      mimeType: mimeType,
      fileName: fileName,
      data: base64
    });
  } catch (error) {
    return jsonOut_({
      ok: false,
      error: 'proxy_exception',
      message: String(error && error.message ? error.message : error),
      imageUrl: imageUrl
    });
  }
}

function tryHandleChatGet_(ss, e) {
  const mode = String((e && e.parameter && e.parameter.mode) || '').toLowerCase();
  if (mode !== 'chat_messages') return null;

  const columna = normalizeChatColumn_(e && e.parameter && e.parameter.columna);
  const sheet = getChatSheet_(ss);
  if (!sheet) return jsonOut_({ ok: false, error: 'chat_sheet_not_found', columna: columna, messages: [] });

  const colIndex = getChatColumnIndex_(sheet, columna);
  if (colIndex === -1) {
    return jsonOut_({ ok: false, error: 'chat_column_not_found', columna: columna, messages: [] });
  }

  const messages = getChatMessagesFromColumn_(sheet, colIndex);
  return jsonOut_({
    ok: true,
    columna: columna,
    count: messages.length,
    messages: messages
  });
}

function tryHandleChatPost_(ss, data) {
  const type = String((data && data.type) || '').toLowerCase();
  if (type !== 'chat_message') return null;

  const columna = normalizeChatColumn_(data && data.columna);
  const mensaje = normalizeChatMessage_(data && data.mensaje);
  if (!mensaje) return ContentService.createTextOutput('Chat Message Empty');

  const sheet = getChatSheet_(ss);
  if (!sheet) return ContentService.createTextOutput('Chat Sheet Not Found');

  const colIndex = getChatColumnIndex_(sheet, columna);
  if (colIndex === -1) return ContentService.createTextOutput('Chat Column Not Found');

  const displayName = buildChatDisplayName_(data);
  const cellValue = formatChatCellValue_(displayName, mensaje);

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const targetRow = findFirstEmptyChatRow_(sheet, colIndex);
    sheet.getRange(targetRow, colIndex + 1).setValue(cellValue);
  } finally {
    lock.releaseLock();
  }

  return ContentService.createTextOutput('Chat Message Saved');
}

function doGet(e) {
  const mode = String((e && e.parameter && e.parameter.mode) || '').toLowerCase();
  const ss = SpreadsheetApp.openById('1clEwUEpPGX98EL34g4UirO98cF26VTjrM32c2JC6Ums');

  // --- CHAT: proxy de imagen para descarga sin bloqueo CORS ---
  const chatImageBlobResponse = tryHandleChatImageBlobGet_(e);
  if (chatImageBlobResponse) return chatImageBlobResponse;

  // --- CHAT: leer mensajes por columna ---
  const chatGetResponse = tryHandleChatGet_(ss, e);
  if (chatGetResponse) return chatGetResponse;

  // --- MODO: ONLINE COUNT ---
  if (mode === 'online_count') {
    const sheetPortal = ss.getSheetByName('PortalB');
    if (!sheetPortal) return ContentService.createTextOutput('0');

    const data = sheetPortal.getDataRange().getValues();
    let count = 0;
    for (let i = 1; i < data.length; i++) {
      const status = String(data[i][4] || '').toLowerCase().trim();
      if (status === 'en linea' || status === 'en línea') count++;
    }
    return ContentService.createTextOutput(String(count));
  }

  // --- MODO NUEVO: USER POINTS (hidratación inicial del local) ---
  if (mode === 'user_points') {
    const nombre = normalizeName_(e && e.parameter && e.parameter.nombre);
    const apellido = normalizeName_(e && e.parameter && e.parameter.apellido);
    const codeParam = String((e && e.parameter && e.parameter.code) || '').trim().toUpperCase();
    const tokenParam = String((e && e.parameter && e.parameter.token) || '').trim();
    const columnsParam = String((e && e.parameter && e.parameter.columns) || '').trim().toUpperCase();

    if (!nombre || !apellido) {
      return jsonOut_({ ok: false, error: 'missing_name', pointsByColumn: {} });
    }

    const sheetPortal = ss.getSheetByName('PortalB');
    if (!sheetPortal) return jsonOut_({ ok: false, error: 'no_sheet', pointsByColumn: {} });

    const data = sheetPortal.getDataRange().getValues();
    if (!data || data.length < 2) return jsonOut_({ ok: false, error: 'no_data', pointsByColumn: {} });

    const header = data[0].map(h => String(h || '').trim().toUpperCase());

    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (
        normalizeName_(data[i][0]) === nombre &&
        normalizeName_(data[i][1]) === apellido
      ) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      return jsonOut_({ ok: false, error: 'user_not_found', pointsByColumn: {} });
    }

    const row = data[rowIndex];
    const codigoGuardado = String(row[2] || '').trim().toUpperCase(); // tabla PortalB
    const tokenGuardado = String(row[3] || '').trim();
    const statusGuardado = String(row[4] || '').trim();

    const codigoHoja = getPrimaryCodeFromCodeSheet_(ss); // hoja codigo
    const codigoEfectivo = getEffectiveLoginCode_(codigoGuardado, codigoHoja);

    if (codigoEfectivo.toLowerCase() === 'bloc') {
      return jsonOut_({ ok: false, blocked: true, error: 'blocked', pointsByColumn: {} });
    }

    if (codeParam && codigoEfectivo && codeParam !== codigoEfectivo) {
      return jsonOut_({ ok: false, error: 'code_mismatch', pointsByColumn: {} });
    }

    if (tokenParam && tokenGuardado && tokenParam !== tokenGuardado) {
      return jsonOut_({ ok: false, error: 'session_mismatch', pointsByColumn: {} });
    }

    let filter = null;
    if (columnsParam) {
      filter = {};
      columnsParam.split(',').forEach((c) => {
        const col = String(c || '').trim().toUpperCase();
        if (/^U\d+L\d+(?:T|E|OT)\d+$/i.test(col)) filter[col] = true;
      });
    }

    const pointsByColumn = {};
    for (let c = 0; c < header.length; c++) {
      const colName = header[c];
      if (!/^U\d+L\d+(?:T|E|OT)\d+$/i.test(colName)) continue;
      if (filter && !filter[colName]) continue;

      const parsed = parseLessonPoints_(row[c]);
      if (parsed !== null) {
        pointsByColumn[colName] = parsed;
      }
    }

    return jsonOut_({
      ok: true,
      nombre: String(row[0] || '').trim(),
      apellido: String(row[1] || '').trim(),
      codigo: codigoEfectivo || codigoGuardado,
      status: statusGuardado,
      pointsByColumn: pointsByColumn
    });
  }

  // --- MODOS: RANKING ---
  const rankingModeToColumn = {
    u1l1: 'U1L1T1',
    u1l1e1: 'U1L1E1',
    u1l1e2: 'U1L1E2',
    u1l1e3: 'U1L1E3',
    u1l1e4: 'U1L1E4',
    u1l1t1: 'U1L1T1',
    u1lt1: 'U1L1T1',
    u1l1t2: 'U1L1T2',
    u1l1t3: 'U1L1T3',
    u1l1t4: 'U1L1T4',
    u1l0t1: 'U1L0T1',
    u1l0t2: 'U1L0T2',
    u1l0t3: 'U1L0T3',
    u1l0t4: 'U1L0T4',
    u1l2t1: 'U1L2T1',
    u1l2t2: 'U1L2T2',
    u1l2t3: 'U1L2T3',
    u1l2t4: 'U1L2T4',
    u1l3t1: 'U1L3T1',
    u1l3t2: 'U1L3T2',
    u1l3t3: 'U1L3T3',
    u1l3t4: 'U1L3T4'
  };

  const scopeRaw = String((e && e.parameter && e.parameter.scope) || 'alfabeto').toLowerCase();
  const validScopes = { de0a100: true, alfabeto: true, silabas: true, paises: true };
  const scope = validScopes[scopeRaw] ? scopeRaw : 'alfabeto';

  const SCOPE_CONFIG = {
    de0a100: {
      groupToken: '__DE0A100_FROM_F_TO_I__',
      groupLabel: 'DE0A100_FROM_F_TO_I',
      groupStart: 5,
      groupEnd: 8,
      testTokens: ['__TEST1_FROM_F__', '__TEST2_FROM_G__', '__TEST3_FROM_H__', '__TEST4_FROM_I__'],
      testLabels: ['TEST1_FROM_F', 'TEST2_FROM_G', 'TEST3_FROM_H', 'TEST4_FROM_I'],
      testCols: [5, 6, 7, 8]
    },
    alfabeto: {
      groupToken: '__ALFABETO_FROM_J_TO_M__',
      groupLabel: 'ALFABETO_FROM_J_TO_M',
      groupStart: 9,
      groupEnd: 12,
      testTokens: ['__TEST1_FROM_J__', '__TEST2_FROM_K__', '__TEST3_FROM_L__', '__TEST4_FROM_M__'],
      testLabels: ['TEST1_FROM_J', 'TEST2_FROM_K', 'TEST3_FROM_L', 'TEST4_FROM_M'],
      testCols: [9, 10, 11, 12]
    },
    silabas: {
      groupToken: '__SILABAS_FROM_N_TO_Q__',
      groupLabel: 'SILABAS_FROM_N_TO_Q',
      groupStart: 13,
      groupEnd: 16,
      testTokens: ['__TEST1_FROM_N__', '__TEST2_FROM_O__', '__TEST3_FROM_P__', '__TEST4_FROM_Q__'],
      testLabels: ['TEST1_FROM_N', 'TEST2_FROM_O', 'TEST3_FROM_P', 'TEST4_FROM_Q'],
      testCols: [13, 14, 15, 16]
    },
    paises: {
      groupToken: '__PAISES_FROM_R_TO_U__',
      groupLabel: 'PAISES_FROM_R_TO_U',
      groupStart: 17,
      groupEnd: 20,
      testTokens: ['__TEST1_FROM_R__', '__TEST2_FROM_S__', '__TEST3_FROM_T__', '__TEST4_FROM_U__'],
      testLabels: ['TEST1_FROM_R', 'TEST2_FROM_S', 'TEST3_FROM_T', 'TEST4_FROM_U'],
      testCols: [17, 18, 19, 20]
    }
  };

  const scopeCfg = SCOPE_CONFIG[scope];

  const SPECIAL_TOKENS = {
    '__GENERAL_FROM_F__': { kind: 'range', start: 5, end: null, label: 'GENERAL_FROM_F' }
  };

  Object.keys(SCOPE_CONFIG).forEach((k) => {
    const cfg = SCOPE_CONFIG[k];
    SPECIAL_TOKENS[cfg.groupToken] = {
      kind: 'range',
      start: cfg.groupStart,
      end: cfg.groupEnd,
      label: cfg.groupLabel
    };
    for (let i = 0; i < 4; i++) {
      SPECIAL_TOKENS[cfg.testTokens[i]] = {
        kind: 'single',
        index: cfg.testCols[i],
        label: cfg.testLabels[i]
      };
    }
  });

  let columnaRanking = null;

  if (mode === 'ranking_general' || mode === 'general') {
    columnaRanking = '__GENERAL_FROM_F__';
  } else if (mode === 'ranking_de0a100' || mode === 'de0a100') {
    columnaRanking = SCOPE_CONFIG.de0a100.groupToken;
  } else if (mode === 'ranking_alfabeto' || mode === 'alfabeto') {
    columnaRanking = SCOPE_CONFIG.alfabeto.groupToken;
  } else if (mode === 'ranking_silabas' || mode === 'silabas') {
    columnaRanking = SCOPE_CONFIG.silabas.groupToken;
  } else if (mode === 'ranking_paises' || mode === 'paises') {
    columnaRanking = SCOPE_CONFIG.paises.groupToken;
  } else if (mode === 'ranking_test1' || mode === 'test1' || mode === 'ranking_ronda' || mode === 'ronda') {
    columnaRanking = scopeCfg.testTokens[0];
  } else if (mode === 'ranking_test2' || mode === 'test2') {
    columnaRanking = scopeCfg.testTokens[1];
  } else if (mode === 'ranking_test3' || mode === 'test3') {
    columnaRanking = scopeCfg.testTokens[2];
  } else if (mode === 'ranking_test4' || mode === 'test4') {
    columnaRanking = scopeCfg.testTokens[3];
  } else if (mode === 'ranking') {
    const columnaParam = String((e && e.parameter && e.parameter.columna) || 'U1L1T1').trim().toUpperCase();

    if (columnaParam === 'GENERAL' || columnaParam === 'TOTAL') {
      columnaRanking = '__GENERAL_FROM_F__';
    } else if (columnaParam === 'DE0A100') {
      columnaRanking = SCOPE_CONFIG.de0a100.groupToken;
    } else if (columnaParam === 'ALFABETO') {
      columnaRanking = SCOPE_CONFIG.alfabeto.groupToken;
    } else if (columnaParam === 'SILABAS') {
      columnaRanking = SCOPE_CONFIG.silabas.groupToken;
    } else if (columnaParam === 'PAISES') {
      columnaRanking = SCOPE_CONFIG.paises.groupToken;
    } else if (columnaParam === 'TEST1' || columnaParam === 'RONDA') {
      columnaRanking = scopeCfg.testTokens[0];
    } else if (columnaParam === 'TEST2') {
      columnaRanking = scopeCfg.testTokens[1];
    } else if (columnaParam === 'TEST3') {
      columnaRanking = scopeCfg.testTokens[2];
    } else if (columnaParam === 'TEST4') {
      columnaRanking = scopeCfg.testTokens[3];
    } else {
      columnaRanking = columnaParam;
    }
  } else if (rankingModeToColumn[mode]) {
    columnaRanking = rankingModeToColumn[mode];
  }

  if (columnaRanking) {
    const sheetPortal = ss.getSheetByName('PortalB');
    if (!sheetPortal) return jsonOut_({ ok: false, error: 'no_sheet', ranking: [] });

    const data = sheetPortal.getDataRange().getValues();
    if (!data || data.length < 1) return jsonOut_({ ok: false, error: 'no_data', ranking: [] });

    const header = data[0].map(h => String(h || '').trim().toUpperCase());
    const special = SPECIAL_TOKENS[columnaRanking] || null;
    const colIndex = special ? -1 : header.indexOf(columnaRanking);

    if (!special && colIndex === -1) {
      return jsonOut_({
        ok: false,
        error: 'column_not_found',
        columna: columnaRanking,
        ranking: []
      });
    }

    const ranking = [];
    for (let i = 1; i < data.length; i++) {
      const nombre = String(data[i][0] || '').trim();
      const apellido = String(data[i][1] || '').trim();
      if (!nombre && !apellido) continue;

      let puntos = 0;
      let puntosRaw = 0;
      let forcedUnlock = false;
      if (special) {
        if (special.kind === 'single') {
          const cellValue = data[i][special.index];
          puntos = lessonPointsToNumber_(cellValue);
          const parsedRaw = parseLessonPoints_(cellValue);
          puntosRaw = parsedRaw !== null ? parsedRaw : puntos;
          forcedUnlock = isFinalUnlockPoints_(cellValue);
        } else {
          const start = special.start;
          const end = special.end == null ? data[i].length - 1 : special.end;
          for (let j = start; j <= end && j < data[i].length; j++) {
            puntos += lessonPointsToNumber_(data[i][j]);
          }
          puntosRaw = puntos;
        }
      } else {
        const cellValue = data[i][colIndex];
        puntos = lessonPointsToNumber_(cellValue);
        const parsedRaw = parseLessonPoints_(cellValue);
        puntosRaw = parsedRaw !== null ? parsedRaw : puntos;
        forcedUnlock = isFinalUnlockPoints_(cellValue);
      }

      ranking.push({ nombre, apellido, puntos, puntosRaw, forcedUnlock });
    }

    ranking.sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      return (a.nombre + ' ' + a.apellido).toLowerCase().localeCompare((b.nombre + ' ' + b.apellido).toLowerCase());
    });

    return jsonOut_({
      ok: true,
      columna: special ? special.label : columnaRanking,
      ranking: ranking.map((u, idx) => ({
        puesto: idx + 1,
        nombre: u.nombre,
        apellido: u.apellido,
        puntos: u.puntos,
        puntosRaw: u.puntosRaw,
        forcedUnlock: u.forcedUnlock
      }))
    });
  }

  // --- MODO: VERIFY ---
  if (mode === 'verify') {
    const codeToVerify = String((e && e.parameter && e.parameter.code) || '').trim().toUpperCase();
    const nombre = normalizeName_(e && e.parameter && e.parameter.nombre);
    const apellido = normalizeName_(e && e.parameter && e.parameter.apellido);
    const tokenCliente = String((e && e.parameter && e.parameter.token) || '').trim();

    const sheetPortal = ss.getSheetByName('PortalB');
    const codigoHoja = getPrimaryCodeFromCodeSheet_(ss);

    if (sheetPortal && nombre && apellido) {
      const data = sheetPortal.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (
          normalizeName_(row[0]) === nombre &&
          normalizeName_(row[1]) === apellido
        ) {
          const codigoTabla = String(row[2] || '').trim().toUpperCase();
          const tokenGuardado = String(row[3] || '').trim();
          const codigoEfectivo = getEffectiveLoginCode_(codigoTabla, codigoHoja);

          // Mantener lógica bloc por tabla
          if (codigoEfectivo.toLowerCase() === 'bloc') {
            return jsonOut_({ valid: false, blocked: true });
          }

          if (!tokenCliente) {
            if (!codigoEfectivo || codeToVerify !== codigoEfectivo) {
              return jsonOut_({ valid: false });
            }

            if (tokenGuardado) {
              return jsonOut_({ valid: false, reason: 'already_active' });
            }

            return jsonOut_({ valid: true });
          }

          // Con token: validar sesión y validar que no haya cambiado el código efectivo
          if (tokenCliente !== tokenGuardado) {
            const timestamp = Utilities.formatDate(new Date(), 'GMT+1', 'dd/MM/yyyy HH:mm:ss');
            sheetPortal.getRange(i + 1, 5).setValue('OFF (' + timestamp + ')');
            return jsonOut_({ valid: false, reason: 'session_mismatch' });
          }

          if (!codigoEfectivo || codeToVerify !== codigoEfectivo) {
            const timestamp = Utilities.formatDate(new Date(), 'GMT+1', 'dd/MM/yyyy HH:mm:ss');
            sheetPortal.getRange(i + 1, 5).setValue('OFF (' + timestamp + ')');
            return jsonOut_({ valid: false, reason: 'code_changed' });
          }

          return jsonOut_({ valid: true });
        }
      }
    }

    // Usuario no encontrado en PortalB: fallback a hoja codigo/sinc
    const validCodes = getCodeValues_(ss);
    const isValid = validCodes.indexOf(codeToVerify) !== -1;
    return jsonOut_({ valid: isValid });
  }

  return ContentService.createTextOutput('Invalid mode');
}

function doPost(e) {
  const ss = SpreadsheetApp.openById('1clEwUEpPGX98EL34g4UirO98cF26VTjrM32c2JC6Ums');

  let data = {};
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return ContentService.createTextOutput('Invalid JSON');
  }

  // --- CHAT: guardar mensaje en primera fila libre de la columna ---
  const chatPostResponse = tryHandleChatPost_(ss, data);
  if (chatPostResponse) return chatPostResponse;

  // --- SINCRONIZACION INTELIGENTE (sinc.gs) ---
  if (data.type === 'sinc_sync' && typeof tryHandleSincSync_ === 'function') {
    try {
      const syncResponse = tryHandleSincSync_(ss, data);
      if (syncResponse) return syncResponse;
    } catch (err) {
      return jsonOut_({ success: false, message: err.message || 'Error en tryHandleSincSync_' });
    }
  }

  // --- FALLBACK sinc_sync (si no existe tryHandleSincSync_ o devuelve null) ---
  if (data.type === 'sinc_sync') {
    try {
      const sheet = ss.getSheetByName('PortalB');
      if (!sheet) return jsonOut_({ success: false, message: 'PortalB Not Found' });

      const nombre = String(data.nombre || '').trim();
      const apellido = String(data.apellido || '').trim();
      if (!nombre || !apellido) return jsonOut_({ success: false, message: 'Nombre/apellido requeridos' });

      const expectedPassword = getSyncPassword_(ss);
      const receivedPassword = String(data.password || '').trim().toUpperCase();

      if (!receivedPassword) return jsonOut_({ success: false, message: 'Contraseña requerida' });
      if (!expectedPassword) return jsonOut_({ success: false, message: 'No hay contraseña configurada' });
      if (receivedPassword !== expectedPassword) return jsonOut_({ success: false, message: 'Contraseña incorrecta' });

      const points = (data.points && typeof data.points === 'object' && !Array.isArray(data.points)) ? data.points : {};
      const pointKeys = Object.keys(points);
      if (pointKeys.length === 0) {
        return jsonOut_({ success: true, changedCount: 0, skippedCount: 0, updatedCount: 0, fastPath: true });
      }

      const rows = sheet.getDataRange().getValues();
      if (!rows || rows.length < 1) return jsonOut_({ success: false, message: 'No Data' });

      const userKey = normalizeUser_(nombre, apellido);
      let userRowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (normalizeUser_(rows[i][0], rows[i][1]) === userKey) {
          userRowIndex = i;
          break;
        }
      }
      if (userRowIndex === -1) return jsonOut_({ success: false, message: 'User Not Found' });

      const header = rows[0].map(h => String(h || '').trim().toUpperCase());
      const headerMap = {};
      for (let i = 0; i < header.length; i++) headerMap[header[i]] = i;

      let changedCount = 0;
      let skippedCount = 0;

      for (let k = 0; k < pointKeys.length; k++) {
        const rawColumn = pointKeys[k];
        const column = String(rawColumn || '').trim().toUpperCase();
        if (!column || headerMap[column] == null) {
          skippedCount++;
          continue;
        }

        const parsed = parseLessonPoints_(points[rawColumn]);
        if (parsed === null) {
          skippedCount++;
          continue;
        }

        const colIndex = headerMap[column];
        const current = rows[userRowIndex][colIndex];
        const currentParsed = parseLessonPoints_(current);
        const same = currentParsed !== null
          ? String(currentParsed) === String(parsed)
          : String(current == null ? '' : current).trim() === String(parsed);

        if (same) {
          skippedCount++;
          continue;
        }

        sheet.getRange(userRowIndex + 1, colIndex + 1).setValue(parsed);
        rows[userRowIndex][colIndex] = parsed;
        changedCount++;
      }

      return jsonOut_({
        success: true,
        changedCount: changedCount,
        updatedCount: changedCount,
        skippedCount: skippedCount,
        fastPath: changedCount === 0
      });
    } catch (err) {
      return jsonOut_({ success: false, message: err.message || 'Error interno de sincronización' });
    }
  }

  // --- ACTUALIZAR ESTADO ---
  if (data.type === 'status' && data.nombre && data.apellido) {
    const sheet = ss.getSheetByName('PortalB');
    if (!sheet) return ContentService.createTextOutput('PortalB Not Found');

    const rows = sheet.getDataRange().getValues();
    const usuario = normalizeUser_(data.nombre, data.apellido);

    for (let i = 1; i < rows.length; i++) {
      if (normalizeUser_(rows[i][0], rows[i][1]) === usuario) {
        let finalStatus = 'En linea';
        if (String(data.estado || '').toUpperCase() === 'OFF') {
          const timestamp = Utilities.formatDate(new Date(), 'GMT+1', 'dd/MM/yyyy HH:mm:ss');
          finalStatus = 'OFF (' + timestamp + ')';
        }
        sheet.getRange(i + 1, 5).setValue(finalStatus);
        return ContentService.createTextOutput('Status Updated');
      }
    }
    return ContentService.createTextOutput('User Not Found');
  }

  // --- GUARDAR PUNTOS DE LECCION ---
  if (data.type === 'lesson_points' && data.nombre && data.apellido) {
    const sheet = ss.getSheetByName('PortalB');
    if (!sheet) return ContentService.createTextOutput('PortalB Not Found');

    const rows = sheet.getDataRange().getValues();
    if (!rows || rows.length < 1) return ContentService.createTextOutput('No Data');

    const usuario = normalizeUser_(data.nombre, data.apellido);
    const columnaObjetivo = String(data.columna || 'U1L1E1').trim().toUpperCase();
    const header = rows[0].map(h => String(h || '').trim().toUpperCase());
    const colIndex = header.indexOf(columnaObjetivo);
    if (colIndex === -1) return ContentService.createTextOutput('Column Not Found');

    const puntos = parseLessonPoints_(data.puntos);
    if (puntos === null) return ContentService.createTextOutput('Invalid Points');

    for (let i = 1; i < rows.length; i++) {
      if (normalizeUser_(rows[i][0], rows[i][1]) === usuario) {
        sheet.getRange(i + 1, colIndex + 1).setValue(puntos);
        return ContentService.createTextOutput('Lesson Points Saved');
      }
    }
    return ContentService.createTextOutput('User Not Found');
  }

  // --- LOGIN ---
  if (data.type === 'portalB' && data.nombre) {
    const sheet = ss.getSheetByName('PortalB');
    if (!sheet) return ContentService.createTextOutput('PortalB Not Found');

    const rows = sheet.getDataRange().getValues();
    const nombre = String(data.nombre || '').trim();
    const apellido = String(data.apellido || '').trim();
    const usuario = normalizeUser_(nombre, apellido);

    for (let i = 1; i < rows.length; i++) {
      if (normalizeUser_(rows[i][0], rows[i][1]) === usuario) {
        sheet.getRange(i + 1, 3).setValue(data.codigo || '');
        sheet.getRange(i + 1, 4).setValue(data.token || '');
        sheet.getRange(i + 1, 5).setValue('En linea');
        return ContentService.createTextOutput('Login Registered');
      }
    }

    sheet.appendRow([nombre, apellido, data.codigo || '', data.token || '', 'En linea']);
    return ContentService.createTextOutput('User Created');
  }

  return ContentService.createTextOutput('OK');
}
