/**
 * 경은 SW-PBS 운영실 — Google Apps Script 서버
 * 구글 시트 하나에 기록을 탭별로 저장합니다.
 *  - A열 id · B열 updatedAt · C열 by · D열 json(앱이 읽는 원본) · E열부터 사람이 읽는 사본
 *  - 스크립트 속성 ACCESS_CODE를 설정하면 접속 코드를 확인합니다 (선택).
 */
var APP_TITLE = '경은 SW-PBS 운영실';
var COLS = ['settings', 'staff', 'students', 'bir', 'dpr', 't3log', 't3plan', 'consult', 'praise', 'obs', 'teach', 'market', 'meeting', 'tasks', 'fidelity', 'etlp', 'coaching', 'requests', 'kudos', 'budget', 'weekly'];
var SHEET_NAMES = {
  settings: '설정', staff: '교직원', students: '학생', bir: '행동사건_BIR', dpr: 'CICO_DPR', t3log: 'Tier3_일일기록', t3plan: 'Tier3_FBA_BIP',
  consult: 'Tier3_상담', praise: '칭찬토큰', obs: '4대1_관찰', teach: '직접교수', market: '토큰마켓', meeting: '월례회의', tasks: '로드맵',
  fidelity: 'TFI', etlp: 'ETLP', coaching: 'GROW_코칭', requests: '지원요청', kudos: '감사쪽지', budget: '예산집행', weekly: 'CICO_주간분석'
};
var BASE_HEAD = ['id', 'updatedAt', 'by', 'json'];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle(APP_TITLE)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** 편집기에서 한 번 실행: 시트 탭 생성 + 권한 승인 */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('구글 시트의 [확장 프로그램 → Apps Script]에서 열어 실행하세요.');
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', ss.getId());
  COLS.forEach(function (c) { sheet_(c); });
  var first = ss.getSheetByName('Sheet1') || ss.getSheetByName('시트1');
  if (first && ss.getSheets().length > 1 && first.getLastRow() === 0) ss.deleteSheet(first);
  return '준비 완료: ' + ss.getUrl();
}

function ss_() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}
function sheet_(col) {
  if (COLS.indexOf(col) < 0) throw new Error('UNKNOWN_COLLECTION');
  var ss = ss_(), name = SHEET_NAMES[col] || col;
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, BASE_HEAD.length).setValues([BASE_HEAD]).setFontWeight('bold').setBackground('#e3ecf8');
    sh.setFrozenRows(1);
    sh.getRange('A:Z').setNumberFormat('@');
    sh.setColumnWidth(4, 60);
  }
  return sh;
}
function check_(code) {
  var need = PropertiesService.getScriptProperties().getProperty('ACCESS_CODE');
  if (need && String(code || '') !== String(need)) throw new Error('ACCESS_DENIED');
}

function apiLoadAll(code) {
  check_(code);
  var ss = ss_(), data = {};
  COLS.forEach(function (c) {
    var sh = ss.getSheetByName(SHEET_NAMES[c] || c);
    data[c] = [];
    if (!sh || sh.getLastRow() < 2) return;
    var vals = sh.getRange(2, 4, sh.getLastRow() - 1, 1).getValues();
    for (var i = 0; i < vals.length; i++) {
      var s = vals[i][0];
      if (!s) continue;
      try { data[c].push(JSON.parse(s)); } catch (e) { /* 손상된 행은 건너뜀 */ }
    }
  });
  return { data: data, sheetUrl: ss.getUrl() };
}

function apiSaveMany(code, col, recs, views) {
  check_(code);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = sheet_(col);
    var head = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), BASE_HEAD.length)).getValues()[0];
    var last = sh.getLastRow();
    var ids = last >= 2 ? sh.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];
    (views || []).forEach(function (v) {
      Object.keys(v || {}).forEach(function (k) { if (head.indexOf(k) < 0) head.push(k); });
    });
    sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
    var appended = [];
    recs.forEach(function (rec, i) {
      var v = (views && views[i]) || {};
      var row = head.map(function (h) {
        if (h === 'id') return rec.id;
        if (h === 'updatedAt') return rec.updatedAt || new Date().toISOString();
        if (h === 'by') return rec.by || '';
        if (h === 'json') return JSON.stringify(rec);
        var x = v[h];
        return x === undefined || x === null ? '' : String(x);
      });
      var at = ids.indexOf(String(rec.id));
      if (at >= 0) sh.getRange(at + 2, 1, 1, row.length).setNumberFormat('@').setValues([row]);
      else { appended.push(row); ids.push(String(rec.id)); }
    });
    if (appended.length) {
      var start = sh.getLastRow() + 1;
      sh.getRange(start, 1, appended.length, head.length).setNumberFormat('@').setValues(appended);
    }
    return { ok: true, n: recs.length };
  } finally {
    lock.releaseLock();
  }
}

function apiRemove(code, col, id) {
  check_(code);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = sheet_(col), last = sh.getLastRow();
    if (last < 2) return { ok: true };
    var ids = sh.getRange(2, 1, last - 1, 1).getValues();
    for (var i = ids.length - 1; i >= 0; i--) if (String(ids[i][0]) === String(id)) sh.deleteRow(i + 2);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}
