/* ================================================================
   Tier 3 집중지원 · 월례회의(DBDM) · 지원·코칭·피드백
   ================================================================ */
function counter(id, label, v, hint) {
  return `<div class="field"><span class="flabel">${esc(label)}${hint ? ` <span class="hint">${esc(hint)}</span>` : ''}</span><div class="row" style="gap:6px;flex-wrap:nowrap"><button type="button" class="btn big" data-cnt="${id}" data-d="-1" aria-label="${esc(label)} 줄이기">−</button><input class="inp num" style="text-align:center;font-size:20px;font-weight:800;max-width:90px" type="number" min="0" id="${id}" value="${v || 0}"><button type="button" class="btn big" data-cnt="${id}" data-d="1" aria-label="${esc(label)} 늘리기">+</button></div></div>`;
}
function bindCounters(b) { b.addEventListener('click', e => { const k = e.target.closest('[data-cnt]'); if (!k) return; const i = $('#' + k.dataset.cnt, b); i.value = Math.max(0, (+i.value || 0) + +k.dataset.d); }); }

function openT3Log(sid, rec) {
  const L = t3Students(); if (!L.length) { toast('Tier 3 학생이 지정되지 않았습니다'); go('tier3'); return; }
  const r = rec || { date: TODAY(), studentId: sid || UI.t3Sel || L[0].id };
  openModal({
    title: 'Tier 3 일일 행동 기록',
    body: `<div class="form"><div class="f2"><div class="field"><span class="flabel">학생</span>${choices('t3s', L.map(s => ({ v: s.id, l: s.name })), r.studentId)}</div><div class="field"><label for="t3-date">날짜</label><input class="inp" type="date" id="t3-date" value="${esc(r.date)}"></div></div>
      <div class="f3">${counter('t3-sib', '자해', r.sib, '머리박기·물기')}${counter('t3-agg', '타해', r.agg, '때리기·밀치기')}${counter('t3-dest', '기물파손', r.dest, '전도·투척')}</div>
      <div class="f3">${counter('t3-calm', '심리안정실 이용', r.calm, '횟수')}${counter('t3-min', '심리안정실 시간', r.calmMin, '분 합계')}${counter('t3-fct', '대체행동(FCT) 사용', r.fct, '휴식카드·스위치 등')}</div>
      <label class="check"><input type="checkbox" id="t3-inj" ${r.injury ? 'checked' : ''}> 학생·교직원 신체 부상 발생 (보건실 처치)</label>
      <div class="field"><label for="t3-memo">관찰 메모 <span class="hint">선행사건·BIP 적용 여부</span></label><textarea class="inp" id="t3-memo" placeholder="예) 소음 시 헤드셋 선제 제공 → 휴식카드 자발 사용 3회">${esc(r.memo || '')}</textarea></div></div>`,
    onMount: bindCounters,
    onSave: b => {
      const studentId = readChoice(b, 't3s'); if (!studentId) { toast('학생을 고르세요'); return false; }
      const date = val(b, '#t3-date') || TODAY();
      const ex = rec ? rec : DB.t3log.find(x => x.studentId === studentId && x.date === date);
      Store.save('t3log', Object.assign({}, ex || {}, { studentId, date, sib: num(b, '#t3-sib'), agg: num(b, '#t3-agg'), dest: num(b, '#t3-dest'), calm: num(b, '#t3-calm'), calmMin: num(b, '#t3-min'), fct: num(b, '#t3-fct'), injury: checked(b, '#t3-inj'), memo: val(b, '#t3-memo') }));
      toast(checked(b, '#t3-inj') ? '부상 기록 — 보호자 소통·전담팀 공유를 확인하세요' : 'Tier 3 기록 저장'); return true;
    }
  });
}
ACTIONS['t3log-edit'] = t => { const r = DB.t3log.find(x => x.id === t.dataset.v); if (r) openT3Log(r.studentId, Object.assign({}, r)); };

function openT3Plan(sid) {
  const s = stuById(sid); const p = DB.t3plan.find(x => x.studentId === sid) || { studentId: sid };
  const f = (id, label, v, ph) => `<div class="field"><label for="${id}">${label}</label><textarea class="inp" id="${id}" placeholder="${esc(ph || '')}">${esc(v || '')}</textarea></div>`;
  openModal({
    title: `${s.name} FBA · BIP`, wide: true,
    body: `<div class="form"><div class="eyebrow">표적 학생 프로파일</div>${f('tp-prof', '프로파일 (학년·장애·의사소통·감각 특성)', p.profile, '예) 초등 3학년, 자폐성장애, 무발화, 감각 과민')}
      <div class="eyebrow">기능적 행동평가 (FBA)</div><div class="f2">${f('tp-a', '선행사건 (A)', p.a, '소음, 복잡한 과제, 활동 전환 지시')}${f('tp-b', '행동 (B) · 조작적 정의', p.b, '머리를 벽·책상에 박기, 손 물기')}</div><div class="f2">${f('tp-c', '결과 (C)', p.c, '과제 중단 및 격리')}${f('tp-fn', '추정 기능', p.fn, '어려운 과제 회피 및 과도한 감각 자극 회피')}</div>
      <div class="eyebrow">개별 행동중재계획 (BIP)</div>${f('tp-ant', '선행 수정 (예방)', p.ant, 'TEACCH식 과제 구조화, 10분 과제 후 2분 감각휴식, 소음차단 헤드셋')}${f('tp-rep', '대체행동 교수 (FCT)', p.rep, "'쉬고 싶어요' 빅맥 스위치, 빨간 휴식카드 건네기")}${f('tp-rein', '강화', p.rein, '스위치 누르면 과제 3분 면제 + 트램펄린')}${f('tp-safe', '전담 지원·안전망', p.safe, '지도사 1:1 동행, 책상 모서리 가드, 심리안정실 안전매트')}
      <div class="f3"><div class="field"><label for="tp-base">기초선 (위기행동/일)</label><input class="inp" type="number" step="0.1" id="tp-base" value="${esc(p.baseline ?? '')}" placeholder="비우면 첫 2주 평균"></div><div class="field"><label for="tp-bcba">외부 전문가(BCBA)</label><input class="inp" id="tp-bcba" value="${esc(p.bcba || '')}"></div><div class="field"><label for="tp-aide">전담 지원인력</label><input class="inp" id="tp-aide" value="${esc(p.aide || '')}"></div></div></div>`,
    onSave: b => { Store.save('t3plan', Object.assign({}, p, { profile: val(b, '#tp-prof'), a: val(b, '#tp-a'), b: val(b, '#tp-b'), c: val(b, '#tp-c'), fn: val(b, '#tp-fn'), ant: val(b, '#tp-ant'), rep: val(b, '#tp-rep'), rein: val(b, '#tp-rein'), safe: val(b, '#tp-safe'), baseline: val(b, '#tp-base') === '' ? '' : +val(b, '#tp-base'), bcba: val(b, '#tp-bcba'), aide: val(b, '#tp-aide') })); toast('FBA·BIP 저장'); return true; }
  });
}
ACTIONS['t3plan-edit'] = t => openT3Plan(t.dataset.v);
function openConsult(sid, rec) {
  const r = rec || { date: TODAY(), studentId: sid, type: '보호자 상담' };
  openModal({
    title: '상담 · 협의 기록',
    body: `<div class="form"><div class="field"><span class="flabel">학생</span>${choices('cs-s', t3Students().map(s => ({ v: s.id, l: s.name })), r.studentId)}</div>
      <div class="field"><span class="flabel">구분</span>${choices('cs-t', ['보호자 상담', 'IEP팀 회의', '외부 전문가 컨설팅', '전담팀 긴급회의'], r.type)}</div>
      <div class="field"><label for="cs-d">날짜</label><input class="inp" type="date" id="cs-d" value="${esc(r.date)}"></div>
      <div class="field"><label for="cs-c">주요 내용</label><textarea class="inp" id="cs-c">${esc(r.content || '')}</textarea></div>
      <div class="field"><label for="cs-n">합의·다음 조치</label><input class="inp" id="cs-n" value="${esc(r.next || '')}"></div></div>`,
    onSave: b => { const studentId = readChoice(b, 'cs-s'); if (!studentId) { toast('학생을 고르세요'); return false; } Store.save('consult', Object.assign({}, r, { studentId, type: readChoice(b, 'cs-t'), date: val(b, '#cs-d'), content: val(b, '#cs-c'), next: val(b, '#cs-n') })); toast('기록했습니다'); return true; }
  });
}
ACTIONS['consult-new'] = t => openConsult(t.dataset.v);
ACTIONS['consult-edit'] = t => { const r = DB.consult.find(x => x.id === t.dataset.v); if (r) openConsult(r.studentId, Object.assign({}, r)); };
ACTIONS['t3-assign'] = () => {
  openModal({
    title: 'Tier 3 대상 학생 지정',
    body: `<div class="form"><p class="ink2">선정 기준: 심각한 자해·타해·기물파손으로 <b>주 3회 이상 심리안정실</b>을 이용하는 학생 · IEP팀 협의 필수</p>
      <div class="field"><label for="ta-s">학생</label><select class="inp" id="ta-s">${stuOptions('', DB.students.filter(s => +s.tier !== 3))}</select></div>
      ${t3Students().length ? `<div class="field"><span class="flabel">현재 Tier 3</span>${t3Students().map(s => `<div class="row between li"><span>${esc(s.name)} · ${esc(s.cls || '')}</span><button type="button" class="btn sm" data-act="t3-release" data-v="${esc(s.id)}">해제</button></div>`).join('')}</div>` : ''}</div>`,
    saveLabel: '지정',
    onSave: b => { const s = stuById(val(b, '#ta-s')); if (!s) { toast('학생을 선택하세요'); return false; } Store.save('students', Object.assign({}, s, { tier: 3, t3Start: TODAY() })); UI.t3Sel = s.id; toast(`${s.name} Tier 3 지정 — FBA·BIP를 작성하세요`); return true; }
  });
};
ACTIONS['t3-release'] = t => { const s = stuById(t.dataset.v); Store.save('students', Object.assign({}, s, { tier: 1 })); closeModal(true); toast(`${s.name} Tier 3 해제`); rerender(); };
ACTIONS['t3-sel'] = t => { UI.t3Sel = t.dataset.v; rerender(); };

VIEWS.tier3 = () => {
  const L = t3Students();
  const head = `<section class="sec-h"><div><div class="eyebrow">Tier 3 개별집중지원 · 초고위기 2명</div><h2>FBA · BIP 집중지원</h2><p>목표: 위기행동·심리안정실 이용 <b>70% 이상 감소</b>, 신체 부상 <b>0건</b>. 매일 기록 → 주간 빈도 → 월례회의 사례 검토.</p></div>
    <div class="row"><button class="btn" data-act="t3-assign">대상 지정</button><button class="btn pri" data-act="new-t3log">${ico('plus')}일일 기록</button></div></section>`;
  if (!L.length) return head + `<div class="empty"><b>Tier 3 대상 학생이 없습니다</b>3월 IEP팀 협의 후 ‘대상 지정’에서 등록하세요.</div>` + crisisCard();
  if (!UI.t3Sel || !L.some(s => s.id === UI.t3Sel)) UI.t3Sel = L[0].id;
  const s = stuById(UI.t3Sel); const st = t3Stats(s.id); const p = st.plan; const mk = monthKey(TODAY());
  const wk = st.wk.slice(-20);
  const thisW = st.wk.find(x => x.w === weekStart(TODAY()));
  const cons = DB.consult.filter(c => c.studentId === s.id).sort((a, b) => b.date.localeCompare(a.date));
  const consM = cons.filter(c => c.type === '보호자 상담' && monthKey(c.date) === mk).length;
  const nowM = +TODAY().slice(5, 7);
  const phaseIdx = nowM <= 3 ? 0 : nowM === 4 ? 1 : nowM <= 7 ? 2 : nowM === 8 ? 3 : 4;
  const b3 = DB.bir.filter(b => b.studentId === s.id && +b.level === 3).sort((a, b) => b.date.localeCompare(a.date));
  const goal = st.base != null ? r1(st.base * .3) : null;
  return head + `
  <div class="row">${L.map(x => `<button class="choice ${x.id === s.id ? 'on' : ''}" data-act="t3-sel" data-v="${esc(x.id)}">${esc(x.name)} · ${esc(x.cls || '')}</button>`).join('')}</div>
  <section class="grid g4">
    <div class="card kpi tier3"><span class="lab">위기행동 감소율</span><span class="val">${st.drop == null ? '—' : st.drop}<small>%</small></span><div class="meter ${st.drop >= 70 ? 'good' : 't3'}"><i style="width:${clamp(st.drop || 0, 0, 100)}%"></i></div><span class="xs muted">기초선 ${st.base == null ? '—' : r1(st.base)} → 최근 ${st.recent == null ? '—' : r1(st.recent)}회/일 · 목표 70%↓</span></div>
    <div class="card kpi tier3"><span class="lab">이번 주 심리안정실</span><span class="val">${thisW ? thisW.calm : 0}<small>회</small></span><span class="delta ${thisW && thisW.calm >= 3 ? 'up-bad' : 'flat'}">${thisW && thisW.calm >= 3 ? '주 3회 이상 — BIP 점검' : '기준: 주 3회 미만'}</span><span class="xs muted">${thisW ? thisW.calmMin : 0}분 · 1회 최대 20분</span></div>
    <div class="card kpi tier3"><span class="lab">이번 주 대체행동(FCT)</span><span class="val">${thisW ? thisW.fct : 0}<small>회</small></span><span class="xs muted">늘어날수록 BIP가 작동 중</span></div>
    <div class="card kpi tier3"><span class="lab">신체 부상 (누적)</span><span class="val">${st.injuries}<small>건</small></span><span class="delta ${st.injuries ? 'up-bad' : 'down-good'}">목표 0건</span><span class="xs muted">보호자 상담 이번 달 ${consM}/2회</span></div>
  </section>
  <section class="card"><div class="card-h"><h3>주간 위기행동 (하루 평균)</h3><span class="sub">자해+타해+기물파손 · 점선 = 목표(기초선의 30%)</span></div>
    ${chart({ type: 'line', h: 230, dots: true, labels: wk.map(x => fmtDs(x.w)), tipLabels: wk.map(x => `${fmtDs(x.w)} 주 · ${x.days}일`), goal, goalLabel: '목표', yFmt: v => r1(v) + '', series: [{ name: '위기행동/일', color: 'var(--t3)', values: wk.map(x => r1(x.crisisPd)) }] })}</section>
  <section class="grid g2">
    <div class="card"><div class="card-h"><h3>주간 심리안정실 이용</h3><span class="sub">점선 = 주 3회 선정 기준</span></div>${chart({ type: 'col', h: 190, labels: wk.map(x => fmtDs(x.w)), goal: 3, series: [{ name: '횟수', color: 'var(--s8)', values: wk.map(x => x.calm) }] })}</div>
    <div class="card"><div class="card-h"><h3>주간 대체행동(FCT) 사용</h3><span class="sub">기능적 의사소통 자발 사용</span></div>${chart({ type: 'line', h: 190, labels: wk.map(x => fmtDs(x.w)), series: [{ name: 'FCT', color: 'var(--s3)', values: wk.map(x => x.fct) }] })}</div>
  </section>
  <section class="grid g2">
    <div class="card"><div class="card-h"><h3>FBA 요약</h3><button class="btn sm" data-act="t3plan-edit" data-v="${esc(s.id)}">${ico('edit')}수정</button></div>
      ${p.profile ? `<p class="ink2" style="margin-bottom:10px">${esc(p.profile)}</p>` : ''}
      <div class="flow"><div class="fx"><span class="eyebrow">A 선행사건</span><br>${esc(p.a || '—')}</div><span class="ar">→</span><div class="fx"><span class="eyebrow">B 행동</span><br>${esc(p.b || '—')}</div><span class="ar">→</span><div class="fx"><span class="eyebrow">C 결과</span><br>${esc(p.c || '—')}</div></div>
      <div class="alert info" style="margin-top:10px"><span class="ic">?</span><div><b>추정 기능</b><div class="why">${esc(p.fn || '미작성 — 외부 BCBA 관찰 후 가설 검증')}</div></div><span></span></div></div>
    <div class="card"><div class="card-h"><h3>BIP 핵심 전략</h3><span class="sub">선행 · 대체 · 강화 · 안전망</span></div>
      <div class="stack">${[['선행 수정', p.ant, 't1'], ['대체행동(FCT)', p.rep, 't2'], ['강화', p.rein, 't1'], ['전담 지원·안전망', p.safe, 't3']].map(([k, v, c]) => `<div><span class="chip ${c}">${k}</span><p style="margin-top:4px">${esc(v || '—')}</p></div>`).join('')}
      <p class="xs muted">외부 전문가: ${esc(p.bcba || '—')} · 전담 인력: ${esc(p.aide || '—')}</p></div></div>
  </section>
  <section class="card"><div class="card-h"><h3>1차년도 Tier 3 공통 프로토콜</h3><span class="sub">[표 13]</span></div><div class="steps">${PLAN.t3protocol.map((x, i) => `<div class="step" style="${i === phaseIdx ? 'border-color:var(--t3);background:var(--t3-soft)' : ''}"><span class="n" style="color:var(--t3)">${esc(x.m)}${i === phaseIdx ? ' · 지금' : ''}</span><span>${esc(x.d)}</span></div>`).join('')}</div></section>
  <section class="grid g2">
    <div class="card"><div class="card-h"><h3>상담 · 협의 기록</h3><button class="btn sm pri" data-act="consult-new" data-v="${esc(s.id)}">${ico('plus')}기록</button></div>${cons.length ? `<div class="list">${cons.slice(0, 8).map(c => `<div class="li click" data-act="consult-edit" data-v="${esc(c.id)}" role="button"><span class="chip">${esc(c.type)}</span><div class="grow"><div class="t">${fmtD(c.date)}</div><div class="s">${esc(c.content || '')}${c.next ? ' → ' + esc(c.next) : ''}</div></div></div>`).join('')}</div>` : '<div class="empty">상담 기록이 없습니다 · 보호자 상담 월 2회</div>'}</div>
    <div class="card"><div class="card-h"><h3>3단계 위기 BIR</h3><span class="sub">행동사건 기록에서 자동 연결</span></div>${b3.length ? `<div class="list">${b3.slice(0, 6).map(b => `<div class="li"><span class="chip t3">3단계</span><div class="grow"><div class="t">${fmtD(b.date)} ${esc(b.time || '')} · ${esc(b.location || '')}</div><div class="s">${esc((b.types || []).join(', '))} · ${esc((b.ante || []).join(', '))}${b.calmIn ? ` · 안정실 ${esc(b.calmIn)}~${esc(b.calmOut || '')}` : ''}</div></div></div>`).join('')}</div>` : '<div class="empty">3단계 기록 없음</div>'}</div>
  </section>
  <section class="card"><div class="card-h"><h3>일일 기록</h3><span class="sub">눌러서 수정</span></div>${st.rows.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>날짜</th><th class="r">자해</th><th class="r">타해</th><th class="r">파손</th><th class="r">안정실</th><th class="r">분</th><th class="r">FCT</th><th>부상</th><th>메모</th></tr></thead><tbody>${st.rows.slice().reverse().slice(0, 20).map(r => `<tr class="click" data-act="t3log-edit" data-v="${esc(r.id)}"><td>${fmtD(r.date)}</td><td class="r num">${r.sib || 0}</td><td class="r num">${r.agg || 0}</td><td class="r num">${r.dest || 0}</td><td class="r num">${r.calm || 0}</td><td class="r num">${r.calmMin || 0}</td><td class="r num">${r.fct || 0}</td><td>${r.injury ? '<span class="chip bad">부상</span>' : ''}</td><td class="small">${esc(r.memo || '')}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">아직 기록이 없습니다</div>'}</section>
  ${crisisCard()}`;
};
function crisisCard() {
  return `<section class="card" style="border-color:var(--t3)"><div class="card-h"><h3>문제행동 3단계 대응 프로토콜</h3><span class="sub">비상 핫라인: ${esc(SET().hotline)}</span></div><div class="grid g3">${PLAN.response3.map(r => `<div class="stack" style="gap:6px"><span class="chip t${r.lv}"><span class="d"></span>${esc(r.title)}</span><span class="xs muted">${esc(r.sub)}</span><span class="small"><b>예)</b> ${esc(r.def)}</span><ol style="margin:0;padding-left:18px" class="small">${r.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol><span class="xs ink2">기록: ${esc(r.record)}</span></div>`).join('')}</div></section>`;
}

/* ---------------- 월례회의 DBDM ---------------- */
function meetingSnapshot(mk) {
  const [s, e] = monthRange(mk); const l = birIn(s, e, 2); const b = big5(l);
  const [ps, pe] = monthRange(addMonths(mk, -1)); const pl = birIn(ps, pe, 2);
  const L = cicoStudents(); const sts = L.map(x => cicoStats(x.id));
  const monthAvg = sid => { const v = DB.dpr.filter(d => d.studentId === sid && monthKey(d.date) === mk && d.pct != null).map(d => d.pct); return v.length ? avg(v) : null; };
  const avgs = L.map(x => monthAvg(x.id)).filter(v => v != null);
  const calm = sum(DB.t3log.filter(r => monthKey(r.date) === mk).map(r => r.calm)); const calmP = sum(DB.t3log.filter(r => monthKey(r.date) === addMonths(mk, -1)).map(r => r.calm));
  const top2 = a => a.slice(0, 2).map(x => `${x[0]}(${pct(x[1], b.n)}%)`).join(' / ');
  return { pd: r1(perDay(l, s, e)), ppd: r1(perDay(pl, ps, pe)), n: b.n, type: top2(b.type), loc: top2(b.loc), ctx: top2(b.ctx), hour: sortedEntries(b.hour).slice(0, 2).map(x => `${x[0]}시(${pct(x[1], b.n)}%)`).join(' / '), cicoN: L.length, cicoAvg: avgs.length ? Math.round(avg(avgs)) : null, cicoMet: avgs.filter(v => v >= PLAN.cicoGoal).length, cicoNeed: avgs.filter(v => v < PLAN.cicoGoal).length, calm, calmP, problem: problemStatement(b), topFunc: (b.func[0] || [])[0] || '' };
}
function openMeeting(rec, preset) {
  const mk = rec ? monthKey(rec.date) : monthKey(TODAY());
  const sn = (rec && rec.snap) || meetingSnapshot(mk);
  const prev = DB.meeting.filter(m => m.date < (rec ? rec.date : TODAY()) && m.id !== (rec || {}).id).sort((a, b) => b.date.localeCompare(a.date))[0];
  const r = rec || { date: meetingDate(mk) <= TODAY() ? TODAY() : meetingDate(mk), members: 10, problem: preset || sn.problem, funcs: [], planStatus: '진행', targets: '다발구역 BIR 20% 감소 · CICO DPR 80% 이상 유지 · 심리안정실 이용 주 1회 이하' };
  const lead = DB.staff.filter(s => s.team);
  const topCls = sortedEntries(DB.praise.filter(p => monthKey(p.date) === mk).reduce((m, p) => { m[p.cls] = (m[p.cls] || 0) + (+p.tokens || 0); return m; }, {}))[0];
  const topMentor = sortedEntries(countBy(DB.dpr.filter(d => monthKey(d.date) === mk && d.ci && d.co), d => (stuById(d.studentId) || {}).mentor))[0];
  const ta = (id, label, v, ph) => `<div class="field"><label for="${id}">${label}</label><textarea class="inp" id="${id}" placeholder="${esc(ph || '')}">${esc(v || '')}</textarea></div>`;
  openModal({
    title: `${fmtM(mk)} 리더십팀 회의록 · 해결계획서`, wide: true,
    body: `<div class="form">
      <div class="f3"><div class="field"><label for="mt-d">회의 일시</label><input class="inp" type="date" id="mt-d" value="${esc(r.date)}"></div><div class="field"><label for="mt-a">참석 인원</label><input class="inp" type="number" min="0" id="mt-a" value="${esc(r.attend ?? '')}" placeholder="예) 9"></div><div class="field"><label for="mt-m">재적</label><input class="inp" type="number" min="1" id="mt-m" value="${esc(r.members || 10)}"></div></div>
      <div class="f3"><div class="field"><label for="mt-f">진행(코치)</label><select class="inp" id="mt-f">${staffOptions(r.facil, lead.length ? s => s.team : null)}</select></div><div class="field"><label for="mt-r">기록</label><select class="inp" id="mt-r">${staffOptions(r.recorder, lead.length ? s => s.team : null)}</select></div><div class="field"><label for="mt-t">시간관리</label><select class="inp" id="mt-t">${staffOptions(r.timer, lead.length ? s => s.team : null)}</select></div></div>
      <label class="check"><input type="checkbox" id="mt-pre" ${r.predist ? 'checked' : ''}> 회의 2일 전 Big 5·CICO 데이터 공유 완료</label>
      <div class="card flat" style="background:var(--surface-2)"><div class="eyebrow">1. 당월 Big 5 요약 (자동) · 10분</div>
        <div class="grid g2 small" style="margin-top:8px"><div>(1) 일평균 <b>${sn.pd}건</b> (전월 ${sn.ppd}건) · 총 ${sn.n}건<br>(2) 유형: ${esc(sn.type || '—')}<br>(3) 장소: ${esc(sn.loc || '—')}<br>(4) 시간: ${esc(sn.ctx || '—')} · ${esc(sn.hour || '')}</div>
        <div>CICO ${sn.cicoN}명 평균 DPR <b>${sn.cicoAvg ?? '—'}%</b><br>80% 이상 ${sn.cicoMet}명 / 보완 필요 ${sn.cicoNeed}명<br>Tier 3 심리안정실 총 <b>${sn.calm}회</b> (전월 ${sn.calmP}회)</div></div></div>
      <div class="eyebrow">2. 정밀 문제 진술 · 10분</div>
      ${ta('mt-prob', '누가(과정) + 어디서 + 언제 + 어떤 행동을 + 왜', r.problem)}
      <div class="field"><span class="flabel">추정 행동 기능</span>${choices('mt-fn', ['성인/또래 관심 얻기', '선호 물건/활동 얻기', '과제/지시 회피', '소음/감각자극 회피'], r.funcs, { multi: true })}</div>
      <div class="eyebrow">3. 다층 해결계획 (Solution Plan) · 25분</div>
      ${ta('mt-p1', 'Tier 1 환경수정·보완교수', r.p1, '예) 급식실 대기선 바닥 발자국 스티커, 넷째 주 월요일 급식실 보완교수, Double Token Week')}
      ${ta('mt-p2', 'Tier 2 CICO 멘토링 강화', r.p2, '예) 70% 미만 학생 4교시 선행사건 수정, 체크인 목표 구체화')}
      ${ta('mt-p3', 'Tier 3 BIP 수정', r.p3, '예) 휴식카드 접근성 확대, 소음 시 헤드셋 선제 제공')}
      <div class="f2"><div class="field"><label for="mt-o">실행 책임자</label><select class="inp" id="mt-o">${staffOptions(r.owner)}</select></div><div class="field"><label for="mt-due">완료 기한</label><input class="inp" type="date" id="mt-due" value="${esc(r.due || addDays(TODAY(), 28))}"></div></div>
      <div class="field"><label for="mt-tg">목표 성과 지표</label><input class="inp" id="mt-tg" value="${esc(r.targets || '')}"></div>
      <div class="eyebrow">4. 전월 해결계획 점검 및 환류 · 15분</div>
      ${prev ? `<div class="small ink2">전월(${fmtD(prev.date)}) 계획: ${esc([prev.p1, prev.p2, prev.p3].filter(Boolean).join(' / ') || '—')} · 책임 ${esc(prev.owner || '—')}</div>
      <div class="f2"><div class="field"><span class="flabel">이행도</span>${choices('mt-ps', ['완료', '부분 이행', '미이행'], r.prevStatus || prev.planStatus)}</div><div class="field"><span class="flabel">목표 달성</span>${choices('mt-pg', ['달성', '추가 보완 필요'], r.prevGoal)}</div></div>` : '<div class="small muted">첫 회의입니다</div>'}
      <div class="eyebrow">전 교직원 공지</div>
      <div class="f2"><div class="field"><label for="mt-k">이달의 우수 실천 학급·우수 멘토</label><input class="inp" id="mt-k" value="${esc(r.kudos || [topCls ? `우수 학급 ${topCls[0]}(토큰 ${topCls[1]})` : '', topMentor && topMentor[0] && topMentor[0] !== 'undefined' ? `우수 멘토 ${topMentor[0]}` : ''].filter(Boolean).join(' · '))}"></div><div class="field"><label for="mt-n">교직원 협조 사항</label><input class="inp" id="mt-n" value="${esc(r.notice || '')}"></div></div>
    </div>`,
    foot: `${rec ? `<button class="btn" data-act="meeting-copy" data-v="${esc(rec.id)}" style="margin-right:auto">${ico('copy')}서식 텍스트 복사</button>` : ''}<button class="btn" data-act="modal-close">취소</button><button class="btn pri" data-act="modal-save">회의록 저장</button>`,
    onSave: b => {
      const rec2 = Object.assign({}, r, { date: val(b, '#mt-d'), attend: num(b, '#mt-a'), members: num(b, '#mt-m') || 10, facil: val(b, '#mt-f'), recorder: val(b, '#mt-r'), timer: val(b, '#mt-t'), predist: checked(b, '#mt-pre'), problem: val(b, '#mt-prob'), funcs: readChoice(b, 'mt-fn'), p1: val(b, '#mt-p1'), p2: val(b, '#mt-p2'), p3: val(b, '#mt-p3'), owner: val(b, '#mt-o'), due: val(b, '#mt-due'), targets: val(b, '#mt-tg'), prevStatus: prev ? readChoice(b, 'mt-ps') : null, prevGoal: prev ? readChoice(b, 'mt-pg') : null, kudos: val(b, '#mt-k'), notice: val(b, '#mt-n'), snap: sn });
      if (!rec2.planStatus) rec2.planStatus = '진행';
      Store.save('meeting', rec2);
      if (prev && rec2.prevStatus) Store.save('meeting', Object.assign({}, prev, { planStatus: rec2.prevStatus === '완료' ? '완료' : rec2.prevStatus }));
      toast('회의록 저장 · 해결계획이 홈 알림으로 추적됩니다'); return true;
    }
  });
}
ACTIONS['meeting-new'] = () => { const ps = MODAL.open ? null : (VIEWS.big5 && UI.view === 'big5' ? problemStatement(big5(birIn(big5Range()[0], big5Range()[1], 2))) : null); openMeeting(null, ps); };
ACTIONS['meeting-edit'] = t => { const r = DB.meeting.find(x => x.id === t.dataset.v); if (r) openMeeting(JSON.parse(JSON.stringify(r))); };
ACTIONS['meeting-status'] = t => { const r = DB.meeting.find(x => x.id === t.dataset.id); if (r) { Store.save('meeting', Object.assign({}, r, { planStatus: t.dataset.v })); toast(`해결계획: ${t.dataset.v}`); rerender(); } };
function meetingText(r) {
  const sn = r.snap || {}; const ck = (a, v) => (a || []).includes(v) ? '[V]' : '[  ]';
  return `[월간 SW-PBS 리더십 팀 회의록 및 Big 5/CICO 해결계획서]
■ 회의 일시: ${r.date} (15:30~16:30) / 위원 출석: 재적 ${r.members || 10}명 중 ${r.attend || 0}명 참석 (80% 이상: ${(r.attend || 0) / (r.members || 10) >= .8 ? '[V]예 [  ]아니오' : '[  ]예 [V]아니오'})
■ 역할: 진행(코치) ${r.facil || ''} | 기록 ${r.recorder || ''} | 시간관리 ${r.timer || ''} / 데이터 사전배포 ${r.predist ? '[V]완료' : '[  ]완료'}
1. 당월 Big 5 행동데이터 요약
 • (1) 일평균 발생 건수(BIR): 일평균 ${sn.pd}건 (전월 ${sn.ppd}건)
 • (2) 최다 행동 유형: ${sn.type || ''}
 • (3) 최다 발생 장소: ${sn.loc || ''}
 • (4) 최다 발생 시간: ${sn.ctx || ''} ${sn.hour || ''}
 • CICO 및 Tier 3: CICO(${sn.cicoN}명) 평균 DPR 달성률 ${sn.cicoAvg ?? '-'}% (80% 이상 ${sn.cicoMet}명 / 보완 필요 ${sn.cicoNeed}명), Tier 3 심리안정실 총 ${sn.calm}회 (전월 ${sn.calmP}회)
2. 정밀 문제 진술: ${r.problem || ''}
 추정 기능: ${ck(r.funcs, '성인/또래 관심 얻기')} 성인/또래 관심 얻기 ${ck(r.funcs, '선호 물건/활동 얻기')} 선호 물건/활동 얻기 ${ck(r.funcs, '과제/지시 회피')} 과제/지시 회피 ${ck(r.funcs, '소음/감각자극 회피')} 소음/감각자극 회피
3. 다층 해결계획
 • [Tier 1 환경수정·보완교수]: ${r.p1 || ''}
 • [Tier 2 CICO 멘토링 강화]: ${r.p2 || ''}
 • [Tier 3 BIP 수정]: ${r.p3 || ''}
 • [실행 책임자 및 기한]: 책임자 ${r.owner || ''} (완료기한: ${r.due || ''})
 • 목표 성과 지표: ${r.targets || ''}
4. 전월 해결계획 점검: 이행도 ${r.prevStatus || '-'} / 목표 ${r.prevGoal || '-'}
■ 전 교직원 공지: ${r.kudos || ''} / 협조 사항: ${r.notice || ''}`;
}
ACTIONS['meeting-copy'] = t => { const r = DB.meeting.find(x => x.id === t.dataset.v); if (r) copyText(meetingText(r)); };

VIEWS.meeting = () => {
  const mk = monthKey(TODAY()); const md = meetingDate(mk); const nextMd = md >= TODAY() ? md : meetingDate(addMonths(mk, 1));
  const ms = DB.meeting.slice().sort((a, b) => b.date.localeCompare(a.date));
  const thisDone = ms.find(m => monthKey(m.date) === mk);
  const att = ms.slice().reverse();
  const attRate = att.length ? Math.round(avg(att.map(m => pct(m.attend || 0, m.members || 10)))) : null;
  const open = ms.filter(m => m.planStatus !== '완료' && (m.p1 || m.p2 || m.p3));
  return `<section class="sec-h"><div><div class="eyebrow">MO SW-PBS DBDM 표준 프로토콜 · 매월 3주 수요일 60분</div><h2>월례회의 · 데이터 기반 의사결정</h2><p>Big 5와 CICO·Tier 3 데이터가 회의록에 자동으로 채워집니다. 문제 진술 → 해결계획 → 다음 달 점검.</p></div>
    <button class="btn pri" data-act="meeting-new">${ico('flag')}${thisDone ? '새 회의록' : `${fmtM(mk)} 회의록 작성`}</button></section>
  <section class="grid g3">
    <div class="card kpi acc"><span class="lab">다음 정례회의</span><span class="val" style="font-size:24px">${fmtD(nextMd)}</span><span class="xs muted">15:30~16:30 · 회의 2일 전(${fmtD(addDays(nextMd, -2))}) 데이터 배포</span></div>
    <div class="card kpi acc"><span class="lab">평균 출석률</span><span class="val">${attRate ?? '—'}<small>%</small></span><span class="delta ${attRate >= 80 ? 'up-good' : 'flat'}">목표 80% 이상 · ${ms.length}회 개최</span></div>
    <div class="card kpi acc"><span class="lab">진행 중 해결계획</span><span class="val">${open.length}<small>건</small></span><span class="xs muted">기한 경과 ${open.filter(m => m.due && m.due < TODAY()).length}건</span></div>
  </section>
  <section class="card"><div class="card-h"><h3>회의 60분 진행표</h3><span class="sub">[표 15] 서식 순서</span></div><div class="flow">${[['Big 5 요약', '10분', '데이터 분석가'], ['정밀 문제 진술', '10분', '코치'], ['다층 해결계획', '25분', '전원'], ['전월 계획 점검', '15분', '기록자']].map(([a, b, c], i) => `${i ? '<span class="ar">→</span>' : ''}<div class="fx"><b>${a}</b><br><span class="muted small">${b} · ${c}</span></div>`).join('')}</div></section>
  ${open.length ? `<section class="card"><div class="card-h"><h3>해결계획 이행 추적</h3><span class="sub">상태를 눌러 갱신</span></div><div class="list">${open.map(m => `<div class="li"><span class="chip ${m.due < TODAY() ? 'bad' : 'warn'}">${m.due < TODAY() ? '기한 경과' : '진행'}</span><div class="grow"><div class="t">${fmtM(monthKey(m.date))} · ${esc(m.problem || '').slice(0, 60)}</div><div class="s">책임 ${esc(m.owner || '미정')} · 기한 ${fmtD(m.due)} · ${esc([m.p1, m.p2, m.p3].filter(Boolean).join(' / ')).slice(0, 90)}</div></div><div class="row" style="gap:4px">${['부분 이행', '완료'].map(s => `<button class="btn sm" data-act="meeting-status" data-id="${esc(m.id)}" data-v="${s}">${s}</button>`).join('')}</div></div>`).join('')}</div></section>` : ''}
  <section class="card"><div class="card-h"><h3>회의 기록</h3><span class="sub">눌러서 열기 · 서식 텍스트는 한글 문서에 붙여넣기</span></div>
    ${ms.length ? `<div class="list">${ms.map(m => `<div class="li"><span class="chip ${pct(m.attend || 0, m.members || 10) >= 80 ? 'good' : 'warn'}">출석 ${m.attend || 0}/${m.members || 10}</span><div class="grow click" data-act="meeting-edit" data-v="${esc(m.id)}" role="button"><div class="t">${fmtD(m.date)} · ${esc(m.problem || '(문제 진술 없음)')}</div><div class="s">계획 ${esc(m.planStatus || '진행')} · 책임 ${esc(m.owner || '—')}${m.kudos ? ' · ' + esc(m.kudos) : ''}</div></div><button class="btn sm" data-act="meeting-copy" data-v="${esc(m.id)}">${ico('copy')}복사</button></div>`).join('')}</div>` : `<div class="empty"><b>아직 회의 기록이 없습니다</b>회의록 작성 버튼을 누르면 이번 달 데이터가 자동으로 채워집니다.</div>`}
  </section>`;
};

/* ---------------- 지원 · 코칭 · 피드백 ---------------- */
function openRequest(rec) {
  const r = rec || { date: TODAY(), type: 'CICO 의뢰', status: '접수' };
  const lead = ME.isLead();
  openModal({
    title: rec ? '지원 요청' : '지원 요청하기',
    body: `<div class="form"><div class="field"><span class="flabel">무엇이 필요하세요?</span>${choices('rq-t', ['CICO 의뢰', 'Tier 3 의뢰', '코칭 요청', '위기 지원', '강화물·물품', '기타'], r.type)}</div>
      <div class="field"><label for="rq-s">관련 학생 <span class="hint">선택</span></label><select class="inp" id="rq-s">${stuOptions(r.studentId, null, '해당 없음')}</select></div>
      <div class="field"><label for="rq-d">상황 · 요청 내용</label><textarea class="inp" id="rq-d" placeholder="예) 3주째 전환 시간마다 10분 이상 거부. 아침 체크인 멘토가 필요합니다.">${esc(r.detail || '')}</textarea></div>
      ${rec && lead ? `<div class="field"><span class="flabel">처리 상태</span>${choices('rq-st', ['접수', '검토중', '완료'], r.status)}</div><div class="field"><label for="rq-r">답변·조치</label><textarea class="inp" id="rq-r">${esc(r.reply || '')}</textarea></div>` : rec ? `<p class="small">상태: <b>${esc(r.status)}</b>${r.reply ? ` · 답변: ${esc(r.reply)}` : ''}</p>` : '<p class="xs muted">리더십팀(코치·코디네이터)에게 바로 전달되고, 홈 알림에 표시됩니다.</p>'}</div>`,
    saveLabel: rec ? '저장' : '요청 보내기',
    onSave: b => {
      const detail = val(b, '#rq-d'); if (!detail) { toast('요청 내용을 적어주세요'); return false; }
      const o = Object.assign({}, r, { type: readChoice(b, 'rq-t'), studentId: val(b, '#rq-s'), detail });
      if (rec && lead) { o.status = readChoice(b, 'rq-st') || r.status; o.reply = val(b, '#rq-r'); o.handler = ME.name(); }
      if (!rec) o.by = ME.name();
      Store.save('requests', o); toast(rec ? '저장했습니다' : '요청을 보냈습니다 · 처리 상황은 코칭 메뉴에서 확인'); return true;
    }
  });
}
ACTIONS['req-edit'] = t => { const r = DB.requests.find(x => x.id === t.dataset.v); if (r) openRequest(Object.assign({}, r)); };
function openKudos() {
  openModal({
    title: 'PBIS 칭찬 샤우팅 보드 · 감사 쪽지',
    body: `<div class="form"><div class="field"><label for="kd-to">누구에게</label><select class="inp" id="kd-to">${staffOptions('', s => s.name !== ME.name(), '동료 선택')}</select><input class="inp" id="kd-to2" placeholder="명단에 없으면 이름 입력" style="margin-top:6px"></div>
      <div class="field"><label for="kd-m">감사 메시지</label><textarea class="inp" id="kd-m" placeholder="예) 급식실 시차 배식 때 우리 반 학생을 끝까지 기다려 주셔서 고맙습니다!"></textarea></div></div>`,
    saveLabel: '보내기',
    onSave: b => { const to = val(b, '#kd-to') || val(b, '#kd-to2'); const msg = val(b, '#kd-m'); if (!to || !msg) { toast('받는 사람과 메시지를 입력하세요'); return false; } Store.save('kudos', { date: TODAY(), to, msg }); toast(`${to} 선생님께 감사 쪽지를 보냈습니다`); return true; }
  });
}
function openGrow(rec) {
  const r = rec || { date: TODAY(), coach: ME.name(), status: '진행', focus: PLAN.etlp[2].t };
  const ta = (id, k, label, v) => `<div class="field"><label for="${id}"><b style="color:var(--accent)">${k}</b> ${label}</label><textarea class="inp" id="${id}" placeholder="${esc(PLAN.scripts.grow[k][0])}">${esc(v || '')}</textarea></div>`;
  openModal({
    title: 'GROW 동료 코칭 기록', wide: true,
    body: `<div class="form"><div class="f3"><div class="field"><label for="gr-d">날짜</label><input class="inp" type="date" id="gr-d" value="${esc(r.date)}"></div><div class="field"><label for="gr-c">코치</label><select class="inp" id="gr-c">${staffOptions(r.coach)}</select></div><div class="field"><label for="gr-t">코칭 대상 교사</label><select class="inp" id="gr-t">${staffOptions(r.teacher)}</select></div></div>
      <div class="field"><span class="flabel">초점</span>${choices('gr-f', PLAN.etlp.map(e => e.t).concat(['CICO 멘토링', 'Tier 3 BIP 실행', '위기 대응']), r.focus)}</div>
      <div class="f2">${ta('gr-g', 'G', '목표 Goal', r.g)}${ta('gr-r', 'R', '현실 Reality (데이터)', r.r)}</div><div class="f2">${ta('gr-o', 'O', '대안 Options', r.o)}${ta('gr-w', 'W', '실행 의지 Will', r.w)}</div>
      <div class="f2"><div class="field"><label for="gr-fu">다음 확인일</label><input class="inp" type="date" id="gr-fu" value="${esc(r.followUp || addDays(TODAY(), 14))}"></div><div class="field"><span class="flabel">상태</span>${choices('gr-st', ['진행', '완료'], r.status)}</div></div></div>`,
    onSave: b => { const teacher = val(b, '#gr-t'); if (!teacher) { toast('코칭 대상 교사를 선택하세요'); return false; } Store.save('coaching', Object.assign({}, r, { date: val(b, '#gr-d'), coach: val(b, '#gr-c'), teacher, focus: readChoice(b, 'gr-f'), g: val(b, '#gr-g'), r: val(b, '#gr-r'), o: val(b, '#gr-o'), w: val(b, '#gr-w'), followUp: val(b, '#gr-fu'), status: readChoice(b, 'gr-st') })); toast('코칭 기록 저장'); return true; }
  });
}
ACTIONS['grow-new'] = () => openGrow(); ACTIONS['grow-edit'] = t => { const r = DB.coaching.find(x => x.id === t.dataset.v); if (r) openGrow(Object.assign({}, r)); };
function openEtlp() {
  const mine = DB.etlp.filter(e => e.by === ME.name()).sort((a, b) => b.date.localeCompare(a.date))[0];
  openModal({
    title: '학급 8대 실행(ETLPs) 자기점검', wide: true,
    body: `<div class="form"><p class="ink2">0 = 아직 · 1 = 부분적으로 · 2 = 지표를 충족. 결과는 본인 성장 기록과 전학공 GROW 코칭 주제 선정에만 쓰입니다.</p>
      ${PLAN.etlp.map((e, i) => `<div class="row between li" style="align-items:flex-start"><div class="grow" style="flex:1;min-width:200px"><b>${i + 1}. ${esc(e.t)}</b><div class="xs muted">${esc(e.d)} · 지표: ${esc(e.k)}</div></div>${choices('et' + i, [{ v: 0, l: '0 아직' }, { v: 1, l: '1 부분' }, { v: 2, l: '2 충족' }], mine ? mine.scores[i] : null)}</div>`).join('')}</div>`,
    onSave: b => { const scores = PLAN.etlp.map((e, i) => { const v = readChoice(b, 'et' + i); return v == null ? null : +v; }); if (scores.some(v => v == null)) { toast('8개 항목을 모두 선택하세요'); return false; } Store.save('etlp', { date: TODAY(), sem: +TODAY().slice(5, 7) >= 8 ? 2 : 1, scores }); toast(`자기점검 저장 · ${pct(sum(scores), 16)}%`); return true; }
  });
}
ACTIONS['etlp-new'] = () => openEtlp();
ACTIONS['tab-coach'] = t => { UI.sub.coach = t.dataset.v; rerender(); };
VIEWS.coach = () => {
  const sub = UI.sub.coach || 'req';
  const pend = DB.requests.filter(r => r.status !== '완료');
  const head = `<section class="sec-h"><div><div class="eyebrow">교원 소진 예방 · 팀으로 대처</div><h2>지원 · 코칭 · 피드백</h2><p>혼자 감당하지 않도록 요청하고, 동료 코칭으로 성장하고, 서로 감사합니다.</p></div>
    <div class="row"><button class="btn" data-act="new-kudos">${ico('heart')}감사 쪽지</button><button class="btn pri" data-act="new-request">${ico('msg')}지원 요청</button></div></section>
  <div class="tabs">${[['req', `지원 요청함${pend.length ? ' ' + pend.length : ''}`], ['grow', 'GROW 코칭'], ['etlp', 'ETLP 자기점검'], ['kudos', '감사 보드'], ['cards', '코칭 카드']].map(([k, l]) => `<button class="${sub === k ? 'on' : ''}" data-act="tab-coach" data-v="${k}">${l}</button>`).join('')}</div>`;
  if (sub === 'grow') return head + coachGrow();
  if (sub === 'etlp') return head + coachEtlp();
  if (sub === 'kudos') return head + coachKudos();
  if (sub === 'cards') return head + coachCards();
  return head + coachReq();
};
function coachReq() {
  const by = s => DB.requests.filter(r => r.status === s).sort((a, b) => b.date.localeCompare(a.date));
  const col = (s, tone) => `<div class="card"><div class="card-h"><h3>${s}</h3><span class="badge soft">${by(s).length}</span></div>${by(s).length ? `<div class="list">${by(s).slice(0, 12).map(r => `<div class="li click" data-act="req-edit" data-v="${esc(r.id)}" role="button"><span class="chip ${tone}">${esc(r.type)}</span><div class="grow"><div class="t">${esc(r.detail).slice(0, 70)}</div><div class="s">${fmtD(r.date)} · ${esc(r.by || '')}${r.studentId ? ' · ' + esc(stuName(r.studentId)) : ''}${r.reply ? ' → ' + esc(r.reply) : ''}</div></div></div>`).join('')}</div>` : '<div class="empty">없음</div>'}</div>`;
  return `<section class="grid g3">${col('접수', 'warn')}${col('검토중', 't2')}${col('완료', 'good')}</section><p class="xs muted">리더십팀(관리자·코치·코디네이터·분석가)은 요청을 눌러 상태와 답변을 기록할 수 있습니다.</p>`;
}
function coachGrow() {
  const L = DB.coaching.slice().sort((a, b) => b.date.localeCompare(a.date));
  const foci = sortedEntries(countBy(L, c => c.focus));
  return `<section class="grid g2"><div class="card"><div class="card-h"><h3>GROW 4단계 질문</h3><button class="btn sm pri" data-act="grow-new">${ico('plus')}코칭 기록</button></div><div class="grid g2">${Object.entries(PLAN.scripts.grow).map(([k, qs]) => `<div><b style="color:var(--accent);font-size:18px">${k}</b> <span class="small muted">${{ G: 'Goal 목표', R: 'Reality 현실', O: 'Options 대안', W: 'Will 실행' }[k]}</span><ul class="small" style="margin:4px 0;padding-left:18px">${qs.map(q => `<li>${esc(q)}</li>`).join('')}</ul></div>`).join('')}</div></div>
    <div class="card"><div class="card-h"><h3>코칭 초점 분포</h3><span class="sub">${L.length}회</span></div>${hbars(foci, { color: 'var(--accent)', hiTop: false, empty: '코칭 기록이 없습니다' })}</div></section>
  <section class="card"><div class="card-h"><h3>코칭 기록</h3></div>${L.length ? `<div class="list">${L.map(c => `<div class="li click" data-act="grow-edit" data-v="${esc(c.id)}" role="button"><span class="chip ${c.status === '완료' ? 'good' : 'warn'}">${esc(c.status)}</span><div class="grow"><div class="t">${esc(c.teacher)} ← ${esc(c.coach)} · ${esc(c.focus)}</div><div class="s">${fmtD(c.date)} · G: ${esc(c.g || '')} · W: ${esc(c.w || '')} · 다음 확인 ${fmtD(c.followUp)}</div></div></div>`).join('')}</div>` : '<div class="empty">아직 코칭 기록이 없습니다</div>'}</section>`;
}
function coachEtlp() {
  const all = DB.etlp; const mine = all.filter(e => e.by === ME.name()).sort((a, b) => a.date.localeCompare(b.date));
  const last = mine[mine.length - 1]; const school = PLAN.etlp.map((e, i) => avg(all.map(x => x.scores[i])));
  return `<section class="card"><div class="card-h"><h3>8대 실행 자기점검 결과</h3><button class="btn sm pri" data-act="etlp-new">${ico('check')}자기점검 하기</button></div>
    ${legend([['내 점검', 'var(--accent)', 1], ['학교 평균', 'var(--line-2)', 1]])}
    ${PLAN.etlp.map((e, i) => `<div class="hbar" style="grid-template-columns:minmax(120px,34%) minmax(0,1fr) 64px" data-tip="${esc(`<b>${esc(e.t)}</b><br>${esc(e.k)}`)}"><span class="l">${i + 1}. ${esc(e.t)}</span><span class="stack" style="gap:3px"><span class="b"><i style="width:${last ? last.scores[i] * 50 : 0}%;background:var(--accent)"></i></span><span class="b" style="height:6px"><i style="width:${(school[i] || 0) * 50}%;background:var(--line-2)"></i></span></span><span class="v">${last ? last.scores[i] : '—'} <span class="muted xs">/ ${school[i] == null ? '—' : r1(school[i])}</span></span></div>`).join('')}
    <p class="small ink2" style="margin-top:10px">${last ? `가장 낮은 항목 <b>${esc(PLAN.etlp[last.scores.indexOf(Math.min(...last.scores))].t)}</b> → GROW 코칭 초점으로 추천합니다.` : '자기점검을 하면 나와 학교 평균이 비교됩니다.'} 참여 ${new Set(all.map(e => e.by)).size}명</p></section>`;
}
function coachKudos() {
  const L = DB.kudos.slice().sort((a, b) => b.date.localeCompare(a.date));
  const top = sortedEntries(countBy(L.filter(k => monthKey(k.date) === monthKey(TODAY())), k => k.to)).slice(0, 5);
  return `<section class="grid g2"><div class="card"><div class="card-h"><h3>이번 달 감사를 많이 받은 동료</h3><span class="sub">경은마루 음료 쿠폰 추천</span></div>${hbars(top, { color: 'var(--t2)', hiTop: false, empty: '이번 달 쪽지가 아직 없습니다' })}</div>
    <div class="card"><div class="card-h"><h3>내가 받은 쪽지</h3><span class="badge soft">${L.filter(k => k.to === ME.name()).length}</span></div>${L.filter(k => k.to === ME.name()).slice(0, 4).map(k => `<div class="kudo" style="margin-bottom:8px"><span>${esc(k.msg)}</span><span class="meta">${esc(k.by || '')} · ${fmtD(k.date)}</span></div>`).join('') || '<div class="empty">아직 없습니다 — 먼저 동료에게 보내보세요</div>'}</div></section>
  <section class="card"><div class="card-h"><h3>PBIS 칭찬 샤우팅 보드</h3><button class="btn sm pri" data-act="new-kudos">${ico('heart')}쪽지 쓰기</button></div><div class="grid g-auto">${L.slice(0, 24).map(k => `<div class="kudo"><span><b>To. ${esc(k.to)}</b></span><span>${esc(k.msg)}</span><span class="meta">From. ${esc(k.by || '')} · ${fmtD(k.date)}</span></div>`).join('') || '<div class="empty">첫 감사 쪽지를 남겨주세요</div>'}</div></section>`;
}
function coachCards() {
  return `<section class="grid g2">
    <div class="card"><div class="card-h"><h3>4:1 구체적 칭찬 문장</h3><span class="sub">행동 명칭 + 기대행동 연결 · 3초 이내</span></div><ul>${PLAN.scripts.praise.map(x => `<li>${esc(x)}</li>`).join('')}</ul><p class="xs muted">중도중복 학생: 토큰과 선호 감각물(비눗방울·음악)을 즉시 함께</p></div>
    <div class="card"><div class="card-h"><h3>CICO 멘토 대화</h3></div><b class="small">체크인</b><ul class="small">${PLAN.scripts.checkin.map(x => `<li>${esc(x)}</li>`).join('')}</ul><b class="small">체크아웃</b><ul class="small">${PLAN.scripts.checkout.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="card"><div class="card-h"><h3>8대 실행(ETLPs) 기준</h3></div><ol class="small" style="padding-left:18px;margin:0">${PLAN.etlp.map(e => `<li><b>${esc(e.t)}</b> — ${esc(e.d)} <span class="muted">(${esc(e.k)})</span></li>`).join('')}</ol></div>
    <div class="card"><div class="card-h"><h3>교직원 80% 합의 4단계</h3></div><ol class="small" style="padding-left:18px;margin:0"><li>현황 분석: 전년도 위기행동·교원 소진 실태 공유</li><li>업무 경감 보장: 간소화 DPR·토큰마켓으로 행정 부담 최소화 (이 웹앱)</li><li>전 교직원 참여: 가중치 투표로 기대행동 선정·멘토 지원단 구성</li><li>공식 선언: 무기명 동의 80% 이상 · 학교교육계획 최우선 과제</li></ol></div>
  </section>${crisisCard()}`;
}
