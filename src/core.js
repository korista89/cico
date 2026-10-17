'use strict';
/* ================================================================
   CORE — 유틸 · 저장소(구글 시트 / 체험판) · 차트 · 공통 UI · 계산
   ================================================================ */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseD = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const TODAY = () => iso(new Date());
const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return iso(d); };
const addMonths = (mk, n) => { const d = parseD(mk + '-01'); d.setMonth(d.getMonth() + n); return iso(d).slice(0, 7); };
const monthKey = s => String(s).slice(0, 7);
const weekStart = s => { const d = parseD(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); };
const dow = s => parseD(s).getDay();
const DOW = '일월화수목금토';
const fmtD = s => { if (!s) return ''; const d = parseD(s); return `${d.getMonth() + 1}.${d.getDate()}(${DOW[d.getDay()]})`; };
const fmtDs = s => { if (!s) return ''; const d = parseD(s); return `${d.getMonth() + 1}/${d.getDate()}`; };
const fmtM = mk => `${+String(mk).slice(5, 7)}월`;
const nowTime = () => { const d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
const sum = a => a.reduce((x, y) => x + (+y || 0), 0);
const avg = a => { const v = a.filter(x => x != null && !isNaN(x)); return v.length ? sum(v) / v.length : null; };
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
const r1 = x => x == null ? null : Math.round(x * 10) / 10;
const won = n => Math.round(n || 0).toLocaleString('ko-KR');
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const countBy = (arr, f) => { const m = {}; arr.forEach(x => { [].concat(f(x)).forEach(k => { if (k != null && k !== '') m[k] = (m[k] || 0) + 1; }); }); return m; };
const sortedEntries = m => Object.entries(m).sort((a, b) => b[1] - a[1]);
const groupBy = (arr, f) => { const m = {}; arr.forEach(x => { const k = f(x); (m[k] = m[k] || []).push(x); }); return m; };
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 저장소 차단 시 무시 */ } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* noop */ } }
};

/* ---------------- icons ---------------- */
const ICON = {
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  users: 'M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 19v-1a4 4 0 0 0-3-3.9M15.5 3.1a3.5 3.5 0 0 1 0 6.8',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  shield: 'M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z',
  cal: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4',
  msg: 'M4 5h16v11H9l-5 4z',
  flag: 'M5 21V4M5 4h12l-2 4 2 4H5',
  book: 'M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  plus: 'M12 5v14M5 12h14',
  check: 'M5 12l5 5L20 7',
  alert: 'M12 3l10 18H2zM12 10v4M12 17.5v.5',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  heart: 'M12 20s-7-4.4-9-9a4.5 4.5 0 0 1 9-3 4.5 4.5 0 0 1 9 3c-2 4.6-9 9-9 9z',
  refresh: 'M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  print: 'M6 9V3h12v6M6 18H4v-7h16v7h-2M8 14h8v7H8z',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01',
  coach: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0M17 3l2 2-2 2',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  coin: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9 9.5h4.5a2 2 0 0 1 0 4H9V8M9 13.5h5',
  door: 'M5 21V3h11v18M16 12h.01M3 21h18',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01'
};
const ico = (k, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICON[k] || ''}"/></svg>`;

/* ---------------- data store ---------------- */
const COLS = ['settings', 'staff', 'students', 'bir', 'dpr', 't3log', 't3plan', 'consult', 'praise', 'obs', 'teach', 'market', 'meeting', 'tasks', 'fidelity', 'etlp', 'coaching', 'requests', 'kudos', 'budget', 'weekly'];
const DB = {}; COLS.forEach(c => { DB[c] = []; });
const DEMO_KEY = 'pbs-demo-v1', QUEUE_KEY = 'pbs-queue-v1', ME_KEY = 'pbs-me-v1', CODE_KEY = 'pbs-code-v1';

const DEFAULT_SET = {
  id: 'main', school: '경은학교', year: 2026, totalStudents: 190, totalStaff: 70,
  breaks: [['2026-07-24', '2026-08-16'], ['2027-01-01', '2027-02-28']],
  buyinAgree: 0, buyinTotal: 70, cicoTarget: 10, adminPin: '', hotline: '교감 ○○○ / 코치 ○○○ / 보건실 ○○○'
};
const SET = () => Object.assign({}, DEFAULT_SET, DB.settings.find(s => s.id === 'main') || {});

function gasCall(fn, ...args) {
  return new Promise((res, rej) => {
    google.script.run.withSuccessHandler(res).withFailureHandler(rej)[fn](...args);
  });
}

const Store = {
  mode: 'demo', state: 'ok', queue: [], code: '', sheetUrl: '', lastSync: null, busy: false,
  isGas() { return typeof google !== 'undefined' && google.script && google.script.run; },
  async init() {
    if (this.isGas()) {
      this.mode = 'gas';
      this.code = LS.get(CODE_KEY, '');
      this.queue = LS.get(QUEUE_KEY, []);
      await this.pull(true);
    } else {
      this.mode = 'demo';
      const saved = LS.get(DEMO_KEY, null);
      if (saved && saved.v === 1) COLS.forEach(c => { DB[c] = saved.db[c] || []; });
      else { buildSample(); this.persistDemo(); }
    }
  },
  async pull(first) {
    if (this.mode !== 'gas') return;
    try {
      const res = await gasCall('apiLoadAll', this.code);
      COLS.forEach(c => { DB[c] = (res.data && res.data[c]) || []; });
      this.sheetUrl = res.sheetUrl || '';
      // 아직 전송되지 않은 내 변경분을 다시 덮어씀
      this.queue.forEach(op => this.applyLocal(op));
      this.lastSync = new Date(); this.state = this.queue.length ? 'pending' : 'ok';
      if (first && !DB.settings.length) await this.seedFresh();
      this.flush();
    } catch (e) {
      const msg = String(e && e.message || e);
      if (msg.includes('ACCESS_DENIED')) { this.state = 'locked'; throw new Error('ACCESS_DENIED'); }
      this.state = 'err'; if (first) throw e;
    }
  },
  async seedFresh() {
    const set = Object.assign({}, DEFAULT_SET, { updatedAt: new Date().toISOString() });
    this.save('settings', set);
    this.saveMany('tasks', roadmapTasks());
  },
  applyLocal(op) {
    const arr = DB[op.col];
    if (op.t === 'del') { const i = arr.findIndex(r => r.id === op.id); if (i >= 0) arr.splice(i, 1); return; }
    (op.recs || [op.rec]).forEach(rec => {
      const i = arr.findIndex(r => r.id === rec.id);
      if (i >= 0) arr[i] = rec; else arr.push(rec);
    });
  },
  stamp(rec) {
    rec.id = rec.id || uid();
    rec.updatedAt = new Date().toISOString();
    if (!rec.by && ME.get()) rec.by = ME.get().name;
    return rec;
  },
  save(col, rec) {
    this.stamp(rec);
    const op = { t: 'save', col, rec };
    this.applyLocal(op); this.commit(op);
    return rec;
  },
  saveMany(col, recs) {
    recs.forEach(r => this.stamp(r));
    const op = { t: 'many', col, recs };
    this.applyLocal(op); this.commit(op);
  },
  remove(col, id) {
    const op = { t: 'del', col, id };
    this.applyLocal(op); this.commit(op);
  },
  commit(op) {
    if (this.mode === 'demo') { this.persistDemo(); return; }
    this.queue.push(op); LS.set(QUEUE_KEY, this.queue);
    this.state = 'pending'; paintSync(); this.flush();
  },
  persistDemo() { LS.set(DEMO_KEY, { v: 1, db: DB }); },
  async flush() {
    if (this.mode !== 'gas' || this.busy || !this.queue.length) return;
    this.busy = true;
    while (this.queue.length) {
      const op = this.queue[0];
      try {
        if (op.t === 'del') await gasCall('apiRemove', this.code, op.col, op.id);
        else {
          const recs = op.recs || [op.rec];
          await gasCall('apiSaveMany', this.code, op.col, recs, recs.map(r => sheetView(op.col, r)));
        }
        this.queue.shift(); LS.set(QUEUE_KEY, this.queue);
      } catch (e) {
        this.state = 'err'; paintSync(); this.busy = false;
        setTimeout(() => this.flush(), 15000);
        return;
      }
    }
    this.busy = false; this.state = 'ok'; this.lastSync = new Date(); paintSync();
  },
  resetDemo() { LS.del(DEMO_KEY); COLS.forEach(c => { DB[c] = []; }); buildSample(); this.persistDemo(); },
  clearDemo() { COLS.forEach(c => { DB[c] = []; }); DB.settings.push(Object.assign({}, DEFAULT_SET)); DB.tasks = roadmapTasks(); this.persistDemo(); }
};

function roadmapTasks() {
  const out = [];
  PLAN.roadmap.forEach((p, pi) => p.tasks.forEach((t, ti) => out.push({ id: `task-${pi}-${ti}`, phase: pi, title: t, due: p.e, start: p.s, owner: p.who, done: false })));
  return out;
}

/* 구글 시트에 사람이 읽기 좋은 열로 함께 기록 (앱은 json 열만 읽음) */
function sheetView(col, r) {
  const st = id => (stuById(id) || {}).name || '';
  switch (col) {
    case 'bir': return { 날짜: r.date, 시각: r.time, 학생: st(r.studentId), 단계: r.level, 장소: r.location, 활동맥락: r.context, 행동유형: (r.types || []).join(', '), 선행사건: (r.ante || []).join(', '), 추정기능: (r.func || []).join(', '), 조치: (r.resp || []).join(', '), 사후조치: (r.post || []).join(', '), 심리안정실: r.calmIn ? `${r.calmIn}~${r.calmOut || ''}` : '', 보고자: r.by, 메모: r.memo || '' };
    case 'dpr': return { 날짜: r.date, 학생: st(r.studentId), 체크인: r.ci ? 'O' : '', 체크아웃: r.co ? 'O' : '', 총점: r.total, 만점: r.max, 달성률: r.pct, 토큰: r.token ? 'O' : '', 보호자서명: r.parent ? 'O' : '', 멘토한마디: r.memo || '', 입력: r.by };
    case 't3log': return { 날짜: r.date, 학생: st(r.studentId), 자해: r.sib, 타해: r.agg, 기물파손: r.dest, 심리안정실횟수: r.calm, 심리안정실분: r.calmMin, 대체행동사용: r.fct, 부상: r.injury ? 'O' : '', 메모: r.memo || '', 입력: r.by };
    case 'students': return { 이름: r.name, 과정: r.course, 학년반: r.cls, Tier: r.tier, 의사소통군: r.comm, CICO상태: r.cicoStatus || '', 멘토: r.mentor || '' };
    case 'staff': return { 이름: r.name, 역할: r.role, 소속: r.dept || '', 멘토: r.mentor ? 'O' : '', 리더십팀: r.team ? 'O' : '' };
    case 'praise': return { 날짜: r.date, 학급: r.cls, 토큰: r.tokens, 입력: r.by };
    case 'meeting': return { 날짜: r.date, 출석: `${r.attend || ''}/${r.members || 10}`, 문제진술: r.problem || '', Tier1: r.p1 || '', Tier2: r.p2 || '', Tier3: r.p3 || '', 책임자: r.owner || '', 기한: r.due || '', 이행: r.planStatus || '' };
    case 'requests': return { 날짜: r.date, 유형: r.type, 학생: st(r.studentId), 내용: r.detail, 상태: r.status, 답변: r.reply || '', 요청자: r.by };
    default: {
      const o = {}; Object.keys(r).forEach(k => { if (['id', 'updatedAt'].includes(k)) return; const v = r[k]; o[k] = (v && typeof v === 'object') ? JSON.stringify(v) : v; }); return o;
    }
  }
}

/* ---------------- identity ---------------- */
const ME = {
  get() { return LS.get(ME_KEY, null); },
  set(v) { LS.set(ME_KEY, v); },
  name() { const m = this.get(); return m ? m.name : '손님'; },
  role() { const m = this.get(); return m ? m.role : ''; },
  isLead() { const r = this.role(); return ['관리자', '내부 코치(학생지원부장)', 'CICO 코디네이터', '데이터 분석가'].includes(r); }
};

/* ---------------- lookups ---------------- */
const stuById = id => DB.students.find(s => s.id === id);
const staffById = id => DB.staff.find(s => s.id === id);
const stuName = id => { const s = stuById(id); return s ? s.name : '(삭제된 학생)'; };
const stuLabel = id => { const s = stuById(id); return s ? `${s.name} · ${s.cls || s.course || ''}` : '(삭제된 학생)'; };
const tierOf = id => { const s = stuById(id); return s ? (+s.tier || 1) : 1; };
const cicoStudents = (all) => DB.students.filter(s => +s.tier === 2 && (all || !['졸업', '중단'].includes(s.cicoStatus))).sort((a, b) => a.name.localeCompare(b.name, 'ko'));
const t3Students = () => DB.students.filter(s => +s.tier === 3).sort((a, b) => a.name.localeCompare(b.name, 'ko'));
const classList = () => Array.from(new Set(DB.students.map(s => s.cls).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ko', { numeric: true }));
const totalStudents = () => DB.students.length >= 30 ? DB.students.length : (SET().totalStudents || DB.students.length);

/* ---------------- school calendar ---------------- */
function isSchoolDay(s) {
  const w = dow(s); if (w === 0 || w === 6) return false;
  return !(SET().breaks || []).some(([a, b]) => s >= a && s <= b);
}
function schoolDays(from, to) { const out = []; let s = from; let guard = 0; while (s <= to && guard++ < 800) { if (isSchoolDay(s)) out.push(s); s = addDays(s, 1); } return out; }
function prevSchoolDay(s) { let d = addDays(s, -1); let g = 0; while (!isSchoolDay(d) && g++ < 30) d = addDays(d, -1); return d; }
function meetingDate(mk) { // 매월 셋째 주 수요일
  const d = parseD(mk + '-01'); const first = (3 - d.getDay() + 7) % 7 + 1; return `${mk}-${pad(first + 14)}`;
}
function monthRange(mk) { const s = mk + '-01'; const e = addDays(addMonths(mk, 1) + '-01', -1); return [s, e]; }
const schoolMonths = () => { const y = SET().year; const out = []; for (let m = 3; m <= 12; m++) out.push(`${y}-${pad(m)}`); out.push(`${y + 1}-01`, `${y + 1}-02`); return out; };

/* ---------------- analytics ---------------- */
const birLevel = (lvMin = 2) => DB.bir.filter(b => +b.level >= lvMin);
function birIn(from, to, lvMin = 2, filter) { return DB.bir.filter(b => b.date >= from && b.date <= to && +b.level >= lvMin && (!filter || filter(b))); }
function hourOf(t) { return t ? +String(t).slice(0, 2) : null; }
function big5(list) {
  return {
    n: list.length,
    type: sortedEntries(countBy(list, b => b.types || [])),
    loc: sortedEntries(countBy(list, b => b.location)),
    ctx: sortedEntries(countBy(list, b => b.context)),
    hour: countBy(list, b => hourOf(b.time)),
    stu: sortedEntries(countBy(list, b => b.studentId)),
    func: sortedEntries(countBy(list, b => b.func || [])),
    ante: sortedEntries(countBy(list, b => b.ante || [])),
    course: sortedEntries(countBy(list, b => (stuById(b.studentId) || {}).course || '미상'))
  };
}
function perDay(list, from, to) { const end = to > TODAY() ? TODAY() : to; const d = schoolDays(from, end).length; return d ? list.length / d : 0; }
function monthlyBir(lvMin = 2, filter) {
  const months = schoolMonths().filter(m => m <= monthKey(TODAY()));
  return months.map(m => { const [s, e] = monthRange(m); const l = birIn(s, e, lvMin, filter); return { m, n: l.length, pd: perDay(l, s, e), l2: l.filter(b => +b.level === 2).length, l3: l.filter(b => +b.level === 3).length }; });
}

function dprCalc(sc) {
  let total = 0, max = 0;
  (sc || []).forEach(p => { if (!p) return; p.forEach(v => { if (v != null) { total += +v; max += 2; } }); });
  return { total, max, pct: max ? Math.round(total / max * 100) : null };
}
function cicoStats(sid) {
  const rows = DB.dpr.filter(d => d.studentId === sid && d.pct != null).sort((a, b) => a.date < b.date ? -1 : 1);
  const weeks = groupBy(rows, r => weekStart(r.date));
  const wk = Object.keys(weeks).sort().map(w => ({ w, avg: Math.round(avg(weeks[w].map(r => r.pct))), n: weeks[w].length }));
  const curW = weekStart(TODAY());
  const done = wk.filter(x => x.w < curW || x.n >= 4);
  let streak = 0; for (let i = done.length - 1; i >= 0; i--) { if (done[i].avg >= PLAN.cicoGoal) streak++; else break; }
  const last = done[done.length - 1] || null;
  const cur = wk.find(x => x.w === curW) || null;
  const byPeriod = PLAN.periods.map((p, i) => { const v = rows.slice(-20).map(r => r.sc && r.sc[i] ? sum(r.sc[i].filter(x => x != null)) / (r.sc[i].filter(x => x != null).length * 2 || 1) * 100 : null); return avg(v); });
  const byExp = PLAN.expectations.map((e, j) => avg(rows.slice(-20).flatMap(r => (r.sc || []).map(p => p && p[j] != null ? p[j] * 50 : null))));
  const ciRate = rows.length ? pct(rows.filter(r => r.ci).length, rows.length) : null;
  const last10 = rows.slice(-10);
  const metDays = rows.filter(r => r.pct >= PLAN.cicoGoal).length;
  return { rows, wk, done, streak, last, cur, byPeriod, byExp, ciRate, recentAvg: avg(last10.map(r => r.pct)), metRate: rows.length ? pct(metDays, rows.length) : null, today: rows.find(r => r.date === TODAY()) };
}
function cicoDecision(st, s) {
  if (!st.rows.length) return { lv: 'info', t: '데이터 수집 시작', why: '첫 DPR 입력 전' };
  if (s.cicoStatus === '자기관리') return { lv: 'good', t: '자기관리(페이딩) 진행', why: '자기점검표 위주로 주 1회 멘토 확인' };
  if (st.streak >= PLAN.cicoGradWeeks) return { lv: 'good', t: '졸업·페이딩 검토', why: `${st.streak}주 연속 주간 평균 ${PLAN.cicoGoal}% 이상` };
  if (st.last && st.last.avg < PLAN.cicoLow) return { lv: 'bad', t: '멘토 협의·전략 수정', why: `지난주 평균 ${st.last.avg}% (기준 ${PLAN.cicoLow}% 미만)` };
  if (st.last && st.last.avg < PLAN.cicoGoal) return { lv: 'warn', t: '관찰·보완', why: `지난주 평균 ${st.last.avg}% (목표 ${PLAN.cicoGoal}%)` };
  return { lv: 'good', t: '유지', why: st.last ? `지난주 평균 ${st.last.avg}% 달성` : '진행 중' };
}
function t3Stats(sid) {
  const rows = DB.t3log.filter(r => r.studentId === sid).sort((a, b) => a.date < b.date ? -1 : 1);
  const plan = DB.t3plan.find(p => p.studentId === sid) || {};
  const weeks = groupBy(rows, r => weekStart(r.date));
  const wk = Object.keys(weeks).sort().map(w => { const l = weeks[w]; return { w, crisis: sum(l.map(r => (+r.sib || 0) + (+r.agg || 0) + (+r.dest || 0))), calm: sum(l.map(r => r.calm)), calmMin: sum(l.map(r => r.calmMin)), fct: sum(l.map(r => r.fct)), days: l.length, injury: l.filter(r => r.injury).length }; });
  wk.forEach(x => { x.crisisPd = x.days ? x.crisis / x.days : 0; });
  const base = plan.baseline != null && plan.baseline !== '' ? +plan.baseline : (wk.length ? avg(wk.slice(0, 2).map(x => x.crisisPd)) : null);
  const recent = wk.length >= 2 ? avg(wk.slice(-2).map(x => x.crisisPd)) : (wk[0] ? wk[0].crisisPd : null);
  const drop = base ? Math.round((1 - recent / base) * 100) : null;
  const lastW = wk[wk.length - 1];
  const injuries = rows.filter(r => r.injury).length;
  return { rows, wk, base, recent, drop, lastW, injuries, plan };
}
function staffActive(from, to) {
  const names = new Set();
  ['bir', 'dpr', 'praise', 'obs', 't3log', 'teach', 'kudos', 'requests', 'coaching', 'etlp'].forEach(c => DB[c].forEach(r => { if (r.date >= from && r.date <= to && r.by) names.add(r.by); }));
  return names;
}

/* ---------------- charts ---------------- */
const CH = {}; let chSeq = 0;
function chart(spec) { const id = 'c' + (++chSeq); CH[id] = spec; return `<div class="chart-slot" data-cid="${id}" style="min-height:${spec.h || 200}px"></div>`; }
function niceStep(range, count) { const raw = range / count; const p = Math.pow(10, Math.floor(Math.log10(raw || 1))); const f = raw / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; }
function drawCharts(root = document) {
  $$('.chart-slot', root).forEach(el => {
    const s = CH[el.dataset.cid]; if (!s) return;
    const W = Math.max(260, el.clientWidth || 600);
    el.innerHTML = s.type === 'col' ? svgCol(W, s) : s.type === 'spark' ? svgSpark(W, s) : svgLine(W, s);
  });
}
function axisY(W, H, padL, padR, padT, padB, min, max, fmt, ticks = 4) {
  const step = niceStep(max - min, ticks); let out = '<g class="grid">';
  for (let v = min; v <= max + 1e-9; v += step) {
    const y = padT + (H - padT - padB) * (1 - (v - min) / (max - min));
    out += `<line x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}"/><text x="${padL - 6}" y="${y + 4}" text-anchor="end">${fmt ? fmt(v) : r1(v)}</text>`;
  }
  return out + '</g>';
}
function svgLine(W, s) {
  const H = s.h || 200, padL = 38, padR = s.endLabels === false ? 14 : 46, padT = 14, padB = 26;
  const n = s.labels.length; if (!n) return '<div class="empty">아직 데이터가 없습니다</div>';
  const vals = s.series.flatMap(x => x.values).filter(v => v != null);
  const min = s.yMin != null ? s.yMin : 0;
  let max = s.yMax != null ? s.yMax : Math.max(1, ...vals, s.goal || 0);
  if (s.yMax == null) { const st = niceStep(max - min, 4); max = Math.ceil(max / st) * st; }
  const iw = W - padL - padR, ih = H - padT - padB;
  const x = i => padL + (n <= 1 ? iw / 2 : i * iw / (n - 1));
  const y = v => padT + ih * (1 - (v - min) / (max - min || 1));
  let o = `<svg class="chart" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(s.title || '추이 그래프')}">`;
  o += axisY(W, H, padL, padR, padT, padB, min, max, s.yFmt);
  o += `<line class="base" x1="${padL}" x2="${W - padR}" y1="${y(min)}" y2="${y(min)}"/>`;
  const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 54))));
  s.labels.forEach((l, i) => { if (i % every === 0 || i === n - 1) o += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${esc(l)}</text>`; });
  if (s.goal != null) o += `<line class="goal" x1="${padL}" x2="${W - padR}" y1="${y(s.goal)}" y2="${y(s.goal)}"/><text class="goal-t" x="${W - padR + 4}" y="${y(s.goal) + 4}">${esc(s.goalLabel || '목표')}</text>`;
  s.series.forEach((se, k) => {
    const col = se.color || `var(--s${k + 1})`;
    let d = '', pen = false, area = '', first = null, lastPt = null;
    se.values.forEach((v, i) => { if (v == null) { pen = false; return; } d += (pen ? 'L' : 'M') + x(i) + ' ' + y(v); pen = true; if (first == null) first = i; lastPt = i; });
    if (s.series.length === 1 && s.area !== false && first != null) {
      area = `<path d="${d} L${x(lastPt)} ${y(min)} L${x(first)} ${y(min)} Z" fill="${col}" opacity=".10"/>`;
    }
    o += area + `<path d="${d}" fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    if (s.dots) se.values.forEach((v, i) => { if (v != null) o += `<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="${col}"/>`; });
    if (lastPt != null) {
      o += `<circle cx="${x(lastPt)}" cy="${y(se.values[lastPt])}" r="4.5" fill="${col}" stroke="var(--surface)" stroke-width="2"/>`;
      if (s.endLabels !== false && s.series.length <= 3) o += `<text class="val" x="${x(lastPt) + 8}" y="${y(se.values[lastPt]) + 4}">${esc(s.yFmt ? s.yFmt(se.values[lastPt]) : r1(se.values[lastPt]))}</text>`;
    }
  });
  // hover bands
  for (let i = 0; i < n; i++) {
    const x0 = i === 0 ? padL : (x(i - 1) + x(i)) / 2, x1 = i === n - 1 ? W - padR : (x(i) + x(i + 1)) / 2;
    const tip = `<b>${esc(s.tipLabels ? s.tipLabels[i] : s.labels[i])}</b>` + s.series.map((se, k) => `<br>${esc(se.name || '')} ${se.values[i] == null ? '—' : esc(s.yFmt ? s.yFmt(se.values[i]) : r1(se.values[i]))}`).join('');
    o += `<g class="band"><rect class="hit" x="${x0}" y="${padT}" width="${Math.max(1, x1 - x0)}" height="${ih}" data-tip="${esc(tip)}"/><line class="hl" x1="${x(i)}" x2="${x(i)}" y1="${padT}" y2="${padT + ih}" stroke="var(--ink-2)" stroke-width="1" opacity="0" pointer-events="none"/></g>`;
  }
  return o + '</svg>';
}
function svgCol(W, s) {
  const H = s.h || 200, padL = 38, padR = 14, padT = 18, padB = 26;
  const n = s.labels.length; if (!n) return '<div class="empty">아직 데이터가 없습니다</div>';
  const tot = s.labels.map((_, i) => sum(s.series.map(se => se.values[i] || 0)));
  let max = s.yMax != null ? s.yMax : Math.max(1, ...tot, s.goal || 0); const st = niceStep(max, 4); max = Math.ceil(max / st) * st;
  const iw = W - padL - padR, ih = H - padT - padB, band = iw / n, bw = Math.min(26, band * .62);
  const y = v => padT + ih * (1 - v / max);
  let o = `<svg class="chart" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(s.title || '막대 그래프')}">`;
  o += axisY(W, H, padL, padR, padT, padB, 0, max, s.yFmt);
  if (s.goal != null) o += `<line class="goal" x1="${padL}" x2="${W - padR}" y1="${y(s.goal)}" y2="${y(s.goal)}"/>`;
  s.labels.forEach((l, i) => {
    const cx = padL + band * i + band / 2; let acc = 0; const segs = [];
    s.series.forEach((se, k) => { const v = se.values[i] || 0; if (v > 0) segs.push({ v, k, se }); });
    segs.forEach((g, j) => {
      const y0 = y(acc), y1 = y(acc + g.v); acc += g.v;
      const top = j === segs.length - 1; const hgt = Math.max(0, y0 - y1 - (j > 0 ? 2 : 0)); const yy = y1;
      const col = g.se.color || `var(--s${g.k + 1})`;
      const r = top ? Math.min(4, hgt, bw / 2) : 0; const x0 = cx - bw / 2;
      const path = `M${x0} ${yy + hgt} V${yy + r} Q${x0} ${yy} ${x0 + r} ${yy} H${x0 + bw - r} Q${x0 + bw} ${yy} ${x0 + bw} ${yy + r} V${yy + hgt} Z`;
      o += `<path class="bar" d="${path}" fill="${col}"/>`;
    });
    const tip = `<b>${esc(s.tipLabels ? s.tipLabels[i] : l)}</b>` + s.series.map(se => `<br>${esc(se.name || '')} ${esc(s.yFmt ? s.yFmt(se.values[i] || 0) : r1(se.values[i] || 0))}`).join('');
    o += `<rect class="hit" x="${padL + band * i}" y="${padT}" width="${band}" height="${ih}" data-tip="${esc(tip)}"/>`;
    if (s.valueLabels !== false && tot[i] > 0 && band > 22) o += `<text class="val" x="${cx}" y="${y(tot[i]) - 5}" text-anchor="middle">${esc(s.yFmt ? s.yFmt(tot[i]) : r1(tot[i]))}</text>`;
    const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 44))));
    if (i % every === 0) o += `<text x="${cx}" y="${H - 8}" text-anchor="middle">${esc(l)}</text>`;
  });
  o += `<line class="base" x1="${padL}" x2="${W - padR}" y1="${y(0)}" y2="${y(0)}"/>`;
  return o + '</svg>';
}
function svgSpark(W, s) {
  const H = s.h || 34, v = s.values.filter(x => x != null); if (v.length < 2) return '';
  const max = s.yMax != null ? s.yMax : Math.max(...v, s.goal || 0) * 1.1 || 1, min = 0, n = s.values.length;
  const x = i => 3 + i * (W - 10) / (n - 1), y = val => 3 + (H - 6) * (1 - (val - min) / (max - min));
  let d = '', pen = false, lp = null; s.values.forEach((val, i) => { if (val == null) { pen = false; return; } d += (pen ? 'L' : 'M') + x(i) + ' ' + y(val); pen = true; lp = i; });
  const col = s.color || 'var(--s1)';
  let o = `<svg class="chart" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">`;
  if (s.goal != null) o += `<line x1="0" x2="${W}" y1="${y(s.goal)}" y2="${y(s.goal)}" stroke="var(--grid)" stroke-width="1"/>`;
  o += `<path d="${d}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (lp != null) o += `<circle cx="${x(lp)}" cy="${y(s.values[lp])}" r="3.5" fill="${col}" stroke="var(--surface)" stroke-width="2"/>`;
  return o + '</svg>';
}
function ring(p, size = 64, col = 'var(--accent)', label) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r, v = clamp(p || 0, 0, 100);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-label="${v}%"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--sunk)" stroke-width="7"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${c * v / 100} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" style="font-size:${size / 4.2}px;font-weight:800;fill:var(--ink)">${label != null ? esc(label) : v + '%'}</text></svg>`;
}
function hbars(entries, opts = {}) {
  if (!entries.length) return `<div class="empty">${opts.empty || '기록이 없습니다'}</div>`;
  const max = Math.max(...entries.map(e => e[1]), 1), tot = opts.total || sum(entries.map(e => e[1]));
  return entries.slice(0, opts.limit || 8).map(([k, v], i) => `<div class="hbar ${i === 0 && opts.hiTop !== false ? 'top' : ''}" data-tip="${esc(`<b>${esc(opts.label ? opts.label(k) : k)}</b><br>${v}건 · ${pct(v, tot)}%`)}"><span class="l">${esc(opts.label ? opts.label(k) : k)}</span><span class="b"><i style="width:${v / max * 100}%;${opts.color ? 'background:' + opts.color : ''}"></i></span><span class="v">${opts.showPct ? pct(v, tot) + '%' : v}</span></div>`).join('');
}
function heatmap(rows, cols, val, opts = {}) {
  const max = Math.max(1, ...rows.flatMap(r => cols.map(c => val(r, c))));
  let o = `<div class="heat" style="grid-template-columns:minmax(80px,1.4fr) repeat(${cols.length},minmax(30px,1fr))"><div></div>${cols.map(c => `<div class="hh" style="justify-content:center;text-align:center">${esc(opts.colLabel ? opts.colLabel(c) : c)}</div>`).join('')}`;
  rows.forEach(r => {
    o += `<div class="hh">${esc(opts.rowLabel ? opts.rowLabel(r) : r)}</div>`;
    cols.forEach(c => { const v = val(r, c); const a = v / max; o += `<div class="hc" style="background:color-mix(in srgb,var(--s2) ${Math.round(a * 85)}%,var(--surface-2));color:${a > .55 ? '#fff' : 'var(--ink-2)'}" data-tip="${esc(`<b>${esc(opts.rowLabel ? opts.rowLabel(r) : r)} · ${esc(opts.colLabel ? opts.colLabel(c) : c)}</b><br>${v}건`)}">${v || ''}</div>`; });
  });
  return o + '</div>';
}
function legend(items) { return `<div class="legend">${items.map(([n, c, sq]) => `<span><i class="${sq ? 'sq' : ''}" style="background:${c}"></i>${esc(n)}</span>`).join('')}</div>`; }
function deltaHtml(cur, prev, lowerBetter, unit = '%') {
  if (prev == null || cur == null || prev === 0) return '<span class="delta flat">비교 기준 없음</span>';
  const d = Math.round((cur - prev) / prev * 100);
  if (d === 0) return '<span class="delta flat">변화 없음</span>';
  const up = d > 0; const cls = up ? (lowerBetter ? 'up-bad' : 'up-good') : (lowerBetter ? 'down-good' : 'down-bad');
  return `<span class="delta ${cls}">${up ? '▲' : '▼'} ${Math.abs(d)}${unit} <span class="muted" style="font-weight:400">전월 대비</span></span>`;
}

/* ---------------- tooltip ---------------- */
function initTip() {
  const tip = document.createElement('div'); tip.id = 'tip'; tip.setAttribute('role', 'tooltip'); document.body.appendChild(tip);
  const show = (e) => {
    const t = e.target.closest && e.target.closest('[data-tip]'); if (!t) { tip.classList.remove('on'); return; }
    tip.innerHTML = t.getAttribute('data-tip'); tip.classList.add('on');
    const w = tip.offsetWidth, h = tip.offsetHeight; let x = e.clientX + 14, y = e.clientY - h - 12;
    if (x + w > innerWidth - 8) x = e.clientX - w - 14; if (y < 8) y = e.clientY + 18;
    tip.style.left = Math.max(8, x) + 'px'; tip.style.top = y + 'px';
    const band = t.closest('.band'); $$('.band .hl').forEach(l => l.setAttribute('opacity', '0')); if (band) band.querySelector('.hl').setAttribute('opacity', '.5');
  };
  document.addEventListener('pointermove', show);
  document.addEventListener('pointerdown', show);
  document.addEventListener('scroll', () => tip.classList.remove('on'), true);
  document.addEventListener('pointerleave', () => tip.classList.remove('on'));
}

/* ---------------- toast / modal ---------------- */
let toastT = null;
function toast(msg) {
  let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600);
}
const MODAL = { open: false, onSave: null, onClose: null };
function openModal({ title, body, foot, wide, onSave, saveLabel = '저장', onClose, onMount }) {
  closeModal(true);
  const sc = document.createElement('div'); sc.className = 'scrim'; sc.id = 'scrim';
  sc.innerHTML = `<div class="sheet ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sheet-h"><h3>${esc(title)}</h3><button class="x" data-act="modal-close" aria-label="닫기">✕</button></div><div class="sheet-b" id="sheet-b">${body}</div>${foot === false ? '' : `<div class="sheet-f">${foot || `<button class="btn" data-act="modal-close">취소</button><button class="btn pri" data-act="modal-save">${esc(saveLabel)}</button>`}</div>`}</div>`;
  sc.addEventListener('pointerdown', e => { if (e.target === sc) sc.dataset.down = '1'; });
  sc.addEventListener('click', e => { if (e.target === sc && sc.dataset.down) closeModal(); sc.dataset.down = ''; });
  document.body.appendChild(sc);
  MODAL.open = true; MODAL.onSave = onSave; MODAL.onClose = onClose;
  if (onMount) onMount($('#sheet-b'));
  drawCharts(sc);
  setTimeout(() => { const f = sc.querySelector('[autofocus]'); if (f) f.focus(); }, 30);
}
function closeModal(silent) {
  const sc = $('#scrim'); if (sc) sc.remove();
  if (MODAL.open && !silent && MODAL.onClose) MODAL.onClose();
  MODAL.open = false; MODAL.onSave = null; MODAL.onClose = null;
}
function confirmBox(msg, onYes, yesLabel = '삭제') {
  openModal({ title: '확인', body: `<p style="font-size:15px">${msg}</p>`, foot: `<button class="btn" data-act="modal-close">취소</button><button class="btn pri" data-act="modal-save">${esc(yesLabel)}</button>`, onSave: () => { onYes(); return true; } });
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('복사했습니다. 한글(HWP)·메신저에 붙여넣으세요'); }
  catch (e) {
    openModal({ title: '아래 내용을 복사하세요', body: `<textarea class="inp" id="copybox" style="min-height:320px">${esc(text)}</textarea><p class="xs muted" style="margin-top:6px">전체 선택(Ctrl+A) 후 복사(Ctrl+C)</p>`, foot: `<button class="btn" data-act="modal-close">닫기</button>`, onMount: b => { const t = $('#copybox', b); t.focus(); t.select(); } });
  }
}

/* ---------------- form helpers ---------------- */
function choices(name, opts, val, { multi = false, cls = '' } = {}) {
  const vals = multi ? (val || []) : [val];
  return `<div class="choices" data-choice="${name}" data-multi="${multi ? 1 : 0}">${opts.map(o => { const v = typeof o === 'object' ? o.v : o; const l = typeof o === 'object' ? (o.l || o.v) : o; const c = typeof o === 'object' && o.c ? o.c : cls; return `<button type="button" class="choice ${c} ${vals.includes(v) || vals.map(String).includes(String(v)) ? 'on' : ''}" data-v="${esc(v)}">${esc(l)}</button>`; }).join('')}</div>`;
}
function readChoice(root, name) {
  const g = root.querySelector(`[data-choice="${name}"]`); if (!g) return null;
  const on = $$('.choice.on', g).map(b => b.dataset.v);
  return g.dataset.multi === '1' ? on : (on[0] ?? null);
}
function seg(name, opts, val) { return `<div class="seg" data-seg="${name}">${opts.map(o => { const v = typeof o === 'object' ? o.v : o; const l = typeof o === 'object' ? o.l : o; return `<button type="button" class="${String(v) === String(val) ? 'on' : ''}" data-v="${esc(v)}">${esc(l)}</button>`; }).join('')}</div>`; }
function stuOptions(sel, list, blank = '학생 선택') {
  const L = list || DB.students.slice().sort((a, b) => (a.cls || '').localeCompare(b.cls || '', 'ko', { numeric: true }) || a.name.localeCompare(b.name, 'ko'));
  return `<option value="">${blank}</option>` + L.map(s => `<option value="${esc(s.id)}" ${s.id === sel ? 'selected' : ''}>${esc(s.name)} · ${esc(s.cls || s.course || '')}${+s.tier > 1 ? ` (Tier ${s.tier})` : ''}</option>`).join('');
}
function staffOptions(sel, filter, blank = '선택') {
  const L = DB.staff.filter(filter || (() => true)).sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  return `<option value="">${blank}</option>` + L.map(s => `<option value="${esc(s.name)}" ${s.name === sel ? 'selected' : ''}>${esc(s.name)} · ${esc(s.role || '')}</option>`).join('');
}
const val = (root, sel) => { const el = root.querySelector(sel); return el ? el.value.trim() : ''; };
const num = (root, sel) => { const v = val(root, sel); return v === '' ? 0 : +v; };
const checked = (root, sel) => { const el = root.querySelector(sel); return !!(el && el.checked); };
