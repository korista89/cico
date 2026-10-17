/* ================================================================
   APP — 셸 · 라우팅 · 의사결정 규칙 · 홈
   ================================================================ */
const NAV = [
  { group: '운영', items: [
    { k: 'home', t: '오늘', i: 'home', dot: 'ac' },
    { k: 'big5', t: '행동데이터 Big 5', i: 'chart', dot: 'ac' },
    { k: 'tier1', t: 'Tier 1 보편 예방', i: 'star', dot: 't1' },
    { k: 'cico', t: 'Tier 2 CICO', i: 'users', dot: 't2' },
    { k: 'tier3', t: 'Tier 3 집중지원', i: 'shield', dot: 't3' }
  ] },
  { group: '팀 · 의사결정', items: [
    { k: 'meeting', t: '월례회의 DBDM', i: 'flag', dot: 'ac' },
    { k: 'coach', t: '지원 · 코칭 · 피드백', i: 'coach', dot: 'ac' },
    { k: 'roadmap', t: '연간 로드맵', i: 'cal', dot: 'ac' },
    { k: 'outcome', t: '성과 · 충실도', i: 'target', dot: 'ac' }
  ] },
  { group: '안내', items: [
    { k: 'guide', t: '운영 가이드', i: 'book', dot: '' },
    { k: 'settings', t: '설정 · 명단', i: 'gear', dot: '' }
  ] }
];
const TABBAR = [['home', '오늘', 'home'], ['big5', 'Big 5', 'chart'], ['cico', 'CICO', 'users'], ['meeting', '회의', 'flag'], ['more', '전체', 'list']];
const UI = { view: 'home', sub: {}, filters: { big5Range: 'month', big5Lv: 2, big5Course: '' }, cicoSel: null, t3Sel: null };

function title(k) { for (const g of NAV) for (const it of g.items) if (it.k === k) return it.t; return ''; }

function shell() {
  const al = computeAlerts(); const nBad = al.filter(a => a.lv === 'bad').length;
  const req = DB.requests.filter(r => r.status !== '완료').length;
  return `
  <div class="app">
    <aside class="rail" aria-label="주 메뉴">
      <div class="brand">${brandMark()}<div><div class="brand-name">${esc(SET().school)} PBS</div><div class="brand-sub">SW-PBS 다층지원 운영실 · ${SET().year}</div></div></div>
      ${NAV.map(g => `<nav class="nav"><div class="nav-label">${g.group}</div>${g.items.map(it => `<a href="#${it.k}" data-go="${it.k}" class="${UI.view === it.k ? 'on' : ''}"><span class="dot ${it.dot}"></span>${it.t}${it.k === 'home' && nBad ? `<span class="badge">${nBad}</span>` : ''}${it.k === 'coach' && req ? `<span class="badge soft">${req}</span>` : ''}</a>`).join('')}</nav>`).join('')}
      <div class="rail-foot">
        <div>${Store.mode === 'gas' ? '구글 시트 연결됨' : '체험판 · 이 브라우저에만 저장'}</div>
        ${Store.sheetUrl ? `<a class="btn sm" href="${esc(Store.sheetUrl)}" target="_blank" rel="noopener">원본 시트 열기</a>` : ''}
      </div>
    </aside>
    <div class="main">
      <header class="topbar">
        <h1 id="vtitle">${esc(title(UI.view))}</h1><span class="sp"></span>
        <span class="sync" id="sync"></span>
        <button class="who" data-act="pick-me" aria-label="사용자 변경"><span class="avatar">${esc(ME.name().slice(0, 1))}</span><span class="nm">${esc(ME.name())}</span></button>
      </header>
      <main class="content" id="view"></main>
    </div>
  </div>
  <nav class="tabbar" aria-label="하단 메뉴">${TABBAR.map(([k, t, i]) => `<a href="#${k}" data-go="${k}" class="${UI.view === k ? 'on' : ''}">${ico(i)}${t}</a>`).join('')}</nav>
  <button class="fab" data-act="quick" aria-label="빠른 기록">${ico('plus')}기록</button>`;
}
function brandMark() {
  return `<svg class="brand-mark" viewBox="0 0 40 36" aria-hidden="true"><path d="M20 2 L27 13 H13 Z" fill="var(--t3)"/><path d="M12 15 H28 L33 23 H7 Z" fill="var(--t2)"/><path d="M6 25 H34 L39 34 H1 Z" fill="var(--t1)"/></svg>`;
}
function paintSync() {
  const el = $('#sync'); if (!el) return;
  const st = Store.mode === 'demo' ? 'demo' : Store.state;
  const lab = st === 'demo' ? '체험판' : st === 'pending' ? `저장 중 ${Store.queue.length}` : st === 'err' ? '연결 재시도 중' : `동기화 ${Store.lastSync ? pad(Store.lastSync.getHours()) + ':' + pad(Store.lastSync.getMinutes()) : ''}`;
  el.className = 'sync ' + (st === 'pending' ? 'pending' : st === 'err' ? 'err' : '');
  el.innerHTML = `<i></i><span>${esc(lab)}</span>${Store.mode === 'gas' ? `<button class="btn ghost sm" data-act="refresh" aria-label="새로고침">${ico('refresh')}</button>` : ''}`;
}

const VIEWS = {};
function go(k, sub) {
  if (k === 'more') { openMore(); return; }
  UI.view = k; if (sub) UI.sub[k] = sub;
  try { if (location.hash !== '#' + k) history.replaceState(null, '', '#' + k); } catch (e) { /* GAS iframe */ }
  render(); window.scrollTo(0, 0);
}
function render() {
  const root = $('#root');
  const scrollY = window.scrollY;
  root.innerHTML = shell();
  const v = $('#view');
  let html = '';
  if (Store.mode === 'demo') html += `<div class="demo-bar no-print"><b>체험판</b><span>예시 학생·교직원은 가상 자료이며, 입력한 내용은 이 브라우저에만 저장됩니다. 실제 운영은 구글 시트 연결판(설치 5분)으로 하세요.</span><button class="btn sm" data-go="guide" data-sub="install">설치 방법</button></div>`;
  try { html += (VIEWS[UI.view] || VIEWS.home)(); } catch (e) { console.error(e); html += `<div class="empty"><b>화면을 그리는 중 문제가 생겼습니다</b>${esc(e.message)}</div>`; }
  v.innerHTML = html;
  drawCharts(v); paintSync();
  window.scrollTo(0, scrollY);
}
function rerender() { const y = window.scrollY; render(); window.scrollTo(0, y); }

function openMore() {
  openModal({ title: '전체 메뉴', foot: false, body: `<div class="stack">${NAV.map(g => `<div><div class="eyebrow" style="margin-bottom:6px">${g.group}</div><div class="qa">${g.items.map(it => `<button data-go="${it.k}"><span class="qi" style="background:var(--surface-2)">${ico(it.i)}</span><b>${it.t}</b></button>`).join('')}</div></div>`).join('')}</div>` });
}

/* ---------------- 의사결정 규칙 (DBDM decision rules) ---------------- */
function computeAlerts() {
  const out = []; const today = TODAY(); const mk = monthKey(today);
  const d30 = addDays(today, -30);
  // 1) CICO 선별 후보: 최근 30일 BIR(2단계↑) 2회 이상 또는 최근 7일 경미 5회 이상인 Tier 1 학생
  const recent = birIn(d30, today, 2);
  const cnt = countBy(recent, b => b.studentId);
  const minor7 = countBy(birIn(addDays(today, -7), today, 1, b => +b.level === 1), b => b.studentId);
  const cands = DB.students.filter(s => +s.tier === 1 && ((cnt[s.id] || 0) >= 2 || (minor7[s.id] || 0) >= 5));
  if (cands.length) out.push({ lv: 'warn', t: `CICO 선별 후보 ${cands.length}명`, why: cands.slice(0, 4).map(s => `${s.name}(${cnt[s.id] ? 'BIR ' + cnt[s.id] + '회' : '경미 ' + minor7[s.id] + '회'})`).join(', ') + ' — 30일 BIR 2회↑ 또는 주 5회↑ 경미행동', go: ['cico', 'screen'], act: '선별 검토' });
  // 2) CICO 학생별 판단
  cicoStudents().forEach(s => {
    const st = cicoStats(s.id); const dc = cicoDecision(st, s);
    if (dc.lv === 'bad') out.push({ lv: 'bad', t: `${s.name}: ${dc.t}`, why: dc.why + ' — 선행사건 수정·멘토링 강화', go: ['cico', 'stu:' + s.id], act: '학생 보기' });
    if (dc.t === '졸업·페이딩 검토') out.push({ lv: 'good', t: `${s.name}: 자기관리 전환 검토`, why: dc.why, go: ['cico', 'stu:' + s.id], act: '학생 보기' });
    // 3단계 위기 2회 이상 → Tier 3 의뢰 검토
    const c3 = birIn(d30, today, 3).filter(b => b.studentId === s.id).length;
    if (c3 >= 2) out.push({ lv: 'bad', t: `${s.name}: Tier 3 의뢰 검토`, why: `최근 30일 3단계 위기행동 ${c3}회`, go: ['tier3'], act: 'Tier 3' });
  });
  // 3) DPR 입력 누락
  if (isSchoolDay(today) && new Date().getHours() >= 15) {
    const miss = cicoStudents().filter(s => s.cicoStatus !== '자기관리' && !DB.dpr.some(d => d.studentId === s.id && d.date === today));
    if (miss.length) out.push({ lv: 'warn', t: `오늘 DPR 미입력 ${miss.length}명`, why: miss.map(s => s.name).join(', '), go: ['cico', 'dpr'], act: 'DPR 입력' });
  }
  // 4) Tier 3: 주 3회 이상 심리안정실, 부상
  t3Students().forEach(s => {
    const st = t3Stats(s.id); const lw = st.lastW;
    if (lw && lw.w >= weekStart(addDays(today, -7)) && lw.calm >= 3) out.push({ lv: 'bad', t: `${s.name}: 심리안정실 주 ${lw.calm}회`, why: '주 3회 이상 — Tier 3 전담팀 긴급 협의 및 BIP 수정', go: ['tier3', 'stu:' + s.id], act: 'BIP 보기' });
    const inj = st.rows.filter(r => r.injury && r.date >= addDays(today, -14));
    if (inj.length) out.push({ lv: 'bad', t: `${s.name}: 최근 2주 신체 부상 ${inj.length}건`, why: '목표 0건 — 안전 조치 점검·보호자 소통 확인', go: ['tier3', 'stu:' + s.id], act: '확인' });
    const cons = DB.consult.filter(c => c.studentId === s.id && c.type === '보호자 상담' && monthKey(c.date) === mk).length;
    if (+today.slice(8) >= 20 && cons < 2) out.push({ lv: 'warn', t: `${s.name}: 이번 달 보호자 상담 ${cons}/2회`, why: '계획: Tier 3 보호자 정기 상담 월 2회', go: ['tier3', 'stu:' + s.id], act: '상담 기록' });
  });
  // 5) 다발 장소 → 보완교수
  const [ms, me] = monthRange(mk); const mon = birIn(ms, me, 2);
  if (mon.length >= 5) {
    const top = big5(mon).loc[0];
    if (top && top[1] / mon.length >= .3) {
      const cls = top[0] === '보통교실';
      out.push(cls
        ? { lv: 'warn', t: `다발 장소: 보통교실 (${pct(top[1], mon.length)}%)`, why: '교실 수업 중 집중 — 학급 8대 실행(ETLPs) 자기점검·4:1 관찰과 GROW 코칭으로 대응', go: ['coach', 'etlp'], act: 'ETLP 점검' }
        : { lv: 'warn', t: `다발 장소: ${top[0]} (${pct(top[1], mon.length)}%)`, why: '이번 달 BIR 30% 이상 집중 — 넷째 주 월요일 보완교수(Booster)·Double Token Week', go: ['tier1', 'teach'], act: '보완교수 기록' });
    }
  }
  // 6) 로드맵 지연
  const late = DB.tasks.filter(t => !t.done && t.due < today);
  if (late.length) out.push({ lv: 'warn', t: `기한 지난 로드맵 과업 ${late.length}개`, why: late.slice(0, 2).map(t => t.title).join(' · '), go: ['roadmap'], act: '로드맵' });
  // 7) 회의 해결계획 미완료
  const openPlans = DB.meeting.filter(m => m.due && m.planStatus !== '완료' && m.due < today);
  if (openPlans.length) out.push({ lv: 'warn', t: `기한 지난 해결계획 ${openPlans.length}건`, why: openPlans.map(m => `${fmtM(monthKey(m.date))} 회의 · ${m.owner || '책임자 미정'}`).join(', '), go: ['meeting'], act: '점검' });
  // 8) 회의 D-day
  const md = meetingDate(mk); const dd = Math.round((parseD(md) - parseD(today)) / 864e5);
  if (dd >= 0 && dd <= 3) out.push({ lv: 'info', t: dd === 0 ? '오늘 15:30 리더십팀 월례회의' : `리더십팀 월례회의 D-${dd} (${fmtD(md)})`, why: dd >= 2 ? '데이터 분석가: 회의 2일 전 Big 5·CICO 요약 배포' : '회의록 화면에서 이번 달 데이터가 자동으로 채워집니다', go: ['meeting'], act: '회의 준비' });
  // 9) 지원 요청
  const pend = DB.requests.filter(r => r.status === '접수');
  if (pend.length) out.push({ lv: 'info', t: `새 지원 요청 ${pend.length}건`, why: pend.slice(0, 3).map(r => r.type).join(', '), go: ['coach'], act: '요청함' });
  return out.sort((a, b) => ({ bad: 0, warn: 1, info: 2, good: 3 })[a.lv] - ({ bad: 0, warn: 1, info: 2, good: 3 })[b.lv]);
}
function alertHtml(a) {
  const ic = { bad: '!', warn: '△', info: 'i', good: '✓' }[a.lv];
  return `<div class="alert ${a.lv}"><span class="ic">${ic}</span><div><b>${esc(a.t)}</b><div class="why">${esc(a.why)}</div></div>${a.go ? `<button class="btn sm" data-go="${a.go[0]}" ${a.go[1] ? `data-sub="${esc(a.go[1])}"` : ''}>${esc(a.act || '열기')}</button>` : ''}</div>`;
}

/* ---------------- HOME ---------------- */
VIEWS.home = () => {
  const today = TODAY(), mk = monthKey(today), pmk = addMonths(mk, -1);
  const [ms, me] = monthRange(mk), [ps, pe] = monthRange(pmk);
  const cur = birIn(ms, me, 2), prev = birIn(ps, pe, 2);
  const curPd = perDay(cur, ms, me), prevPd = perDay(prev, ps, pe);
  const mb = monthlyBir(2);
  const cico = cicoStudents(); const stats = cico.map(s => ({ s, st: cicoStats(s.id) }));
  const cicoAvg = avg(stats.map(x => x.st.cur ? x.st.cur.avg : (x.st.last ? x.st.last.avg : null)));
  const cicoMet = stats.filter(x => (x.st.cur || x.st.last || {}).avg >= PLAN.cicoGoal).length;
  const t3 = t3Students().map(s => ({ s, st: t3Stats(s.id) }));
  const calmM = sum(DB.t3log.filter(r => monthKey(r.date) === mk).map(r => r.calm));
  const calmP = sum(DB.t3log.filter(r => monthKey(r.date) === pmk).map(r => r.calm));
  const wk = weekStart(today);
  const tokW = sum(DB.praise.filter(p => p.date >= wk).map(p => p.tokens));
  const tokWeeks = Array.from({ length: 8 }, (_, i) => { const w = addDays(wk, -7 * (7 - i)); return sum(DB.praise.filter(p => weekStart(p.date) === w).map(p => p.tokens)); });
  const al = computeAlerts();
  const me_ = ME.get();
  const active = staffActive(addDays(today, -6), today);
  const staffN = DB.staff.length || SET().totalStaff;
  const myWeek = ['bir', 'dpr', 'praise', 'obs', 't3log', 'teach', 'kudos'].reduce((n, c) => n + DB[c].filter(r => r.by === ME.name() && r.date >= wk).length, 0);
  const g = new Date().getHours();
  const hello = g < 11 ? '좋은 아침입니다' : g < 15 ? '오늘도 수고 많으십니다' : '하루 마무리 시간입니다';

  return `
  <section class="sec-h"><div><div class="eyebrow">${fmtD(today)} · ${isSchoolDay(today) ? '수업일' : '휴업일'}</div><h2>${esc(ME.name())} 선생님, ${hello}</h2><p>계획서의 <b>3단계 대응 → 기록 → 월례회의 결정</b> 흐름을 이 화면에서 시작합니다.</p></div>
  <div class="row"><button class="btn" data-go="guide">${ico('book')}처음 사용 안내</button></div></section>

  <section class="qa" aria-label="빠른 기록">
    ${qaBtn('bir', 'alert', '행동사건 기록(BIR)', '2·3단계 · 3분', 't3')}
    ${qaBtn('dpr', 'check', 'CICO 점검표(DPR)', '0·1·2점 터치', 't2')}
    ${qaBtn('praise', 'coin', '칭찬 토큰', '학급별 +1 · +5', 't1')}
    ${qaBtn('tally', 'clock', '4:1 칭찬 관찰', '15분 타이머', 't1')}
    ${qaBtn('t3log', 'shield', 'Tier 3 일일기록', '빈도·심리안정실', 't3')}
    ${qaBtn('request', 'msg', '지원 요청', 'CICO·Tier 3 의뢰·코칭', 'ac')}
  </section>

  <section class="grid g4" aria-label="이번 달 핵심 지표">
    <div class="card kpi acc"><span class="lab">이번 달 BIR · 하루 평균</span><span class="val">${r1(curPd)}<small>건/일</small></span>${deltaHtml(curPd, prevPd, true)}<div class="spark">${chart({ type: 'spark', values: mb.map(x => r1(x.pd)), h: 34, color: 'var(--s1)' })}</div><span class="xs muted">${cur.length}건 (2·3단계) · 월별 추이</span></div>
    <div class="card kpi tier2"><span class="lab">CICO 이번 주 평균 달성률</span><span class="val">${cicoAvg == null ? '—' : Math.round(cicoAvg)}<small>%</small></span><span class="delta ${cicoAvg >= PLAN.cicoGoal ? 'up-good' : 'flat'}">목표 ${PLAN.cicoGoal}% · 달성 ${cicoMet}/${cico.length}명</span><div class="meter t2"><i style="width:${clamp(cicoAvg || 0, 0, 100)}%"></i></div><span class="xs muted">참여 ${cico.length}명 · 목표 ${SET().cicoTarget}명(5%)</span></div>
    <div class="card kpi tier3"><span class="lab">Tier 3 심리안정실 이용</span><span class="val">${calmM}<small>회</small></span>${deltaHtml(calmM, calmP, true)}<span class="xs muted">${t3.map(x => `${esc(x.s.name)} 감소율 ${x.st.drop == null ? '—' : x.st.drop + '%'}`).join(' · ') || 'Tier 3 학생 미지정'}</span><span class="xs muted">목표: 기초선 대비 70%↓</span></div>
    <div class="card kpi tier1"><span class="lab">이번 주 칭찬 토큰</span><span class="val">${won(tokW)}<small>개</small></span><span class="delta flat">최근 8주 추이</span><div class="spark">${chart({ type: 'spark', values: tokWeeks, h: 34, color: 'var(--t1)' })}</div><span class="xs muted">교직원 참여 ${active.size}/${staffN}명 (최근 7일)</span></div>
  </section>

  <section class="grid g2">
    <div class="card"><div class="card-h"><h3>지금 결정이 필요한 일</h3><span class="sub">계획서 기준(80%·70%·주 3회 등)으로 자동 판정</span></div>
      <div class="stack">${al.length ? al.slice(0, 7).map(alertHtml).join('') : `<div class="empty"><b>모든 지표가 기준 안에 있습니다</b>새 기록이 들어오면 자동으로 다시 판정합니다.</div>`}</div>
      ${al.length > 7 ? `<p class="xs muted" style="margin-top:8px">외 ${al.length - 7}건 — 각 메뉴에서 확인</p>` : ''}
    </div>
    <div class="stack">
      <div class="card"><div class="card-h"><h3>오늘 할 일</h3><span class="sub">${esc(me_ ? me_.role : '')}</span></div>${todoList()}</div>
      <div class="card"><div class="card-h"><h3>우리 학교 참여 온도</h3><span class="sub">최근 7일 한 번이라도 기록한 교직원</span></div>
        <div class="ringwrap">${ring(pct(active.size, staffN), 76, 'var(--t1)')}<div class="stack" style="gap:4px"><b>${active.size}명 / ${staffN}명 참여</b><span class="small ink2">목표: 교직원 칭찬 참여 90% 이상</span><span class="small">이번 주 <b>${esc(ME.name())}</b> 선생님 기록 <b>${myWeek}건</b> — 고맙습니다.</span></div></div>
      </div>
    </div>
  </section>

  <section class="card"><div class="card-h"><h3>다층 지원 현황</h3><span class="sub">눌러서 해당 단계로 이동</span></div>
    <div class="pyr">
      ${tierBand(3, t3Students().length, '초고위기 2명 · FBA·BIP', 'tier3')}
      ${tierBand(2, cico.length, `CICO 5% · 목표 ${SET().cicoTarget}명`, 'cico')}
      ${tierBand(1, totalStudents(), '전교생 100% · 3대 기대행동', 'tier1')}
    </div>
  </section>`;
};
function qaBtn(k, i, t, s, tone) {
  const bg = tone === 't1' ? 'var(--t1-soft)' : tone === 't2' ? 'var(--t2-soft)' : tone === 't3' ? 'var(--t3-soft)' : 'var(--accent-soft)';
  const fg = tone === 't1' ? 'var(--t1)' : tone === 't2' ? 'var(--warn)' : tone === 't3' ? 'var(--t3)' : 'var(--accent)';
  return `<button data-act="new-${k}"><span class="qi" style="background:${bg};color:${fg}">${ico(i)}</span><b>${t}</b><span>${s}</span></button>`;
}
function tierBand(n, cnt, sub, go) {
  const T = PLAN.tiers[n - 1];
  return `<button class="tierband b${n}" data-go="${go}"><span class="tn">T${n}</span><span><b>${T.name}</b><span class="small muted" style="display:block">${esc(sub)} · ${esc(T.goal)}</span></span><span class="cnt">${cnt}<small>명</small></span></button>`;
}
function todoList() {
  const today = TODAY(); const items = [];
  const me = ME.get(); const myName = ME.name();
  const mentees = cicoStudents().filter(s => s.mentor === myName && s.cicoStatus !== '자기관리');
  if (isSchoolDay(today)) {
    mentees.forEach(s => { const d = DB.dpr.find(x => x.studentId === s.id && x.date === today); items.push({ done: !!(d && d.ci), t: `${s.name} 아침 체크인 (08:50~09:10)`, act: `dpr:${s.id}` }); items.push({ done: !!(d && d.co), t: `${s.name} 하교 체크아웃·토큰 (14:40~15:00)`, act: `dpr:${s.id}` }); });
    if (me && me.role === 'CICO 코디네이터') {
      const n = cicoStudents().filter(s => DB.dpr.some(d => d.studentId === s.id && d.date === today)).length;
      items.push({ done: n === cicoStudents().length && n > 0, t: `오늘 DPR 수합 ${n}/${cicoStudents().length}명`, go: 'cico' });
      if (dow(today) === 5) items.push({ done: DB.weekly.some(w => w.week === weekStart(today)), t: '금요일 주간 분석·바우처 지급', go: 'cico', sub: 'weekly' });
    }
    if (dow(today) === 5) items.push({ done: DB.market.some(m => m.date === today), t: '경은마트·마루 토큰마켓 운영대장', act: 'market' });
    const tk = DB.praise.some(p => p.date === today && p.by === myName);
    items.push({ done: tk, t: '오늘 칭찬 토큰 기록 (학급)', act: 'praise' });
  }
  const mk = monthKey(today);
  DB.tasks.filter(t => !t.done && t.start <= today && t.due >= addDays(today, -31)).slice(0, 3).forEach(t => items.push({ done: false, t: `[로드맵] ${t.title}`, go: 'roadmap' }));
  const md = meetingDate(mk); if (md >= today && md <= addDays(today, 3)) items.push({ done: DB.meeting.some(m => monthKey(m.date) === mk), t: `월례회의 ${fmtD(md)} 15:30`, go: 'meeting' });
  if (!items.length) return `<div class="empty"><b>오늘 예정된 개인 과업이 없습니다</b>오른쪽 아래 <b>기록</b> 버튼으로 언제든 입력하세요.</div>`;
  return `<div class="list">${items.map(it => `<div class="todo ${it.done ? 'done' : ''}"><span class="box">${it.done ? ico('check') : ''}</span><span class="t">${esc(it.t)}</span>${it.done ? '' : `<button class="btn sm" ${it.act ? `data-act="todo" data-v="${esc(it.act)}"` : `data-go="${it.go}" ${it.sub ? `data-sub="${it.sub}"` : ''}`}>하기</button>`}</div>`).join('')}</div>`;
}

/* ---------------- 빠른 기록 시트 ---------------- */
function openQuick() {
  openModal({ title: '무엇을 기록할까요?', foot: false, body: `<div class="qa">
    ${qaBtn('bir', 'alert', '행동사건(BIR)', '1·2·3단계 / 심리안정실', 't3')}
    ${qaBtn('dpr', 'check', 'CICO DPR', '교시별 0·1·2점', 't2')}
    ${qaBtn('praise', 'coin', '칭찬 토큰', '학급 단위 개수', 't1')}
    ${qaBtn('tally', 'clock', '4:1 칭찬 관찰', '15분 카운터', 't1')}
    ${qaBtn('t3log', 'shield', 'Tier 3 일일기록', '자해·타해·FCT', 't3')}
    ${qaBtn('teach', 'book', '직접교수·보완교수', '공간별 체크', 't1')}
    ${qaBtn('market', 'coin', '토큰마켓 운영대장', '금요일', 't1')}
    ${qaBtn('request', 'msg', '지원 요청', '의뢰·코칭·물품', 'ac')}
    ${qaBtn('kudos', 'heart', '동료 감사 쪽지', '칭찬 샤우팅 보드', 'ac')}
  </div>` });
}

/* ---------------- 사용자 선택 ---------------- */
function openWho(first) {
  const me = ME.get() || {};
  const staff = DB.staff.slice().sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  openModal({
    title: first ? '반갑습니다! 누구신가요?' : '사용자 변경',
    body: `<p class="ink2" style="margin-bottom:12px">기록에 이름이 함께 남고, 내 업무(멘티·담당 과업)가 홈에 표시됩니다. 로그인은 필요 없습니다.</p>
    ${staff.length ? `<div class="field"><span class="flabel">교직원 명단에서 선택</span><div class="who-pick">${staff.map(s => `<button type="button" data-act="who" data-v="${esc(s.id)}" class="${me.name === s.name ? 'on' : ''}">${esc(s.name)}<small>${esc(s.role || '')}${s.mentor ? ' · CICO 멘토' : ''}</small></button>`).join('')}</div></div>` : ''}
    <div class="f2" style="margin-top:14px"><div class="field"><label for="who-name">명단에 없으면 직접 입력</label><input class="inp" id="who-name" value="${esc(me.name || '')}" placeholder="이름"></div>
    <div class="field"><label for="who-role">역할</label><select class="inp" id="who-role">${PLAN.staffRoles.map(r => `<option ${r === me.role ? 'selected' : ''}>${r}</option>`).join('')}</select></div></div>`,
    saveLabel: '시작하기',
    onSave: b => {
      const name = val(b, '#who-name'); if (!name) { toast('이름을 선택하거나 입력하세요'); return false; }
      const st = DB.staff.find(s => s.name === name);
      ME.set({ name, role: st ? st.role : val(b, '#who-role'), staffId: st ? st.id : null });
      toast(`${name} 선생님, 환영합니다`); return true;
    }
  });
}

/* ---------------- 이벤트 위임 ---------------- */
function onClick(e) {
  const t = e.target.closest('[data-go],[data-act],.choice,[data-seg] button,.sc button');
  if (!t) return;
  if (t.classList.contains('choice')) {
    const g = t.closest('[data-choice]'); if (!g) return;
    if (g.dataset.multi !== '1') $$('.choice', g).forEach(c => { if (c !== t) c.classList.remove('on'); });
    t.classList.toggle('on'); g.dispatchEvent(new CustomEvent('change', { bubbles: true })); return;
  }
  if (t.parentElement && t.parentElement.dataset.seg) {
    const g = t.parentElement; $$('button', g).forEach(c => c.classList.toggle('on', c === t));
    const name = g.dataset.seg; const v = t.dataset.v;
    if (SEG_HANDLERS[name]) { SEG_HANDLERS[name](v); } else g.dispatchEvent(new CustomEvent('change', { bubbles: true }));
    return;
  }
  if (t.parentElement && t.parentElement.classList.contains('sc')) { const g = t.parentElement; const was = t.classList.contains('on'); $$('button', g).forEach(c => c.classList.remove('on')); if (!was) t.classList.add('on'); g.dispatchEvent(new CustomEvent('change', { bubbles: true })); return; }
  if (t.dataset.go) {
    e.preventDefault(); const sub = t.dataset.sub; if (MODAL.open) closeModal(true);
    if (sub && sub.startsWith('stu:')) { if (t.dataset.go === 'cico') UI.cicoSel = sub.slice(4); if (t.dataset.go === 'tier3') UI.t3Sel = sub.slice(4); go(t.dataset.go, t.dataset.go === 'cico' ? 'stu' : null); return; }
    go(t.dataset.go, sub); return;
  }
  const a = t.dataset.act;
  if (a === 'modal-close') { closeModal(); return; }
  if (a === 'modal-save') { const b = $('#sheet-b'); const ok = MODAL.onSave ? MODAL.onSave(b) : true; if (ok !== false) { closeModal(true); rerender(); } return; }
  if (ACTIONS[a]) { e.preventDefault(); ACTIONS[a](t); }
}
const SEG_HANDLERS = {};
const ACTIONS = {
  'pick-me': () => openWho(false),
  quick: () => openQuick(),
  refresh: async () => { toast('최신 자료를 불러오는 중…'); try { await Store.pull(); rerender(); toast('최신 자료로 갱신했습니다'); } catch (e) { toast('연결 실패 — 잠시 후 다시 시도'); } },
  who: t => { const s = staffById(t.dataset.v); if (!s) return; $('#who-name').value = s.name; const r = $('#who-role'); if (r) r.value = s.role || '기타'; $$('.who-pick button').forEach(b => b.classList.toggle('on', b === t)); },
  todo: t => { const v = t.dataset.v; if (v.startsWith('dpr:')) openDpr(v.slice(4)); else if (v === 'praise') openPraise(); else if (v === 'market') openMarket(); },
  'new-bir': () => openBir(), 'new-dpr': () => openDpr(), 'new-praise': () => openPraise(), 'new-tally': () => openTally(),
  'new-t3log': () => openT3Log(), 'new-request': () => openRequest(), 'new-teach': () => openTeach(), 'new-market': () => openMarket(), 'new-kudos': () => openKudos()
};

/* ---------------- boot ---------------- */
async function boot() {
  const root = $('#root');
  root.innerHTML = `<div style="display:grid;place-items:center;min-height:70vh;gap:10px;text-align:center;padding:24px">${brandMark()}<b>SW-PBS 운영실을 여는 중…</b><span class="muted small">구글 시트에서 자료를 불러오고 있습니다</span></div>`;
  try { await Store.init(); }
  catch (e) {
    if (String(e.message).includes('ACCESS_DENIED')) { askCode(Store.code ? '코드가 맞지 않습니다. 다시 확인해 주세요.' : ''); return; }
    root.innerHTML = `<div class="empty" style="margin:40px 16px"><b>자료를 불러오지 못했습니다</b>${esc(e.message || e)}<br><br><button class="btn" onclick="location.reload()">다시 시도</button></div>`; return;
  }
  initTip();
  document.addEventListener('click', onClick);
  window.addEventListener('resize', debounce(() => drawCharts(), 200));
  try { const h = (location.hash || '').slice(1); if (h && (VIEWS[h])) UI.view = h; } catch (e) { /* noop */ }
  render();
  if (!ME.get()) openWho(true);
  if (Store.mode === 'gas') {
    setInterval(async () => { if (MODAL.open || document.hidden) return; try { await Store.pull(); rerender(); } catch (e) { /* 다음 주기에 재시도 */ } }, 120000);
    document.addEventListener('visibilitychange', async () => { if (!document.hidden && !MODAL.open) { try { await Store.pull(); rerender(); } catch (e) { /* noop */ } } });
  }
}
function askCode(msg) {
  $('#root').innerHTML = `<div style="max-width:420px;margin:12vh auto;padding:0 16px" class="stack"><div class="row">${brandMark()}<h2 style="font-family:var(--f-display)">학교 접속 코드</h2></div><p class="ink2">학생 개인정보 보호를 위해 접속 코드가 설정되어 있습니다. 학생지원부에서 안내받은 코드를 입력하세요.</p><input class="inp" id="code-in" inputmode="numeric" autocomplete="off" placeholder="접속 코드"><button class="btn pri big" id="code-go">들어가기</button><p class="xs" id="code-msg" style="color:var(--bad)">${esc(msg || '')}</p></div>`;
  $('#code-in').addEventListener('keydown', e => { if (e.key === 'Enter') $('#code-go').click(); });
  $('#code-go').onclick = () => { Store.code = $('#code-in').value.trim(); LS.set(CODE_KEY, Store.code); boot(); };
}
function debounce(f, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), ms); }; }
