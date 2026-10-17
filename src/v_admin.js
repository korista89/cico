/* ================================================================
   연간 로드맵 · 성과·충실도 · 운영 가이드 · 설정
   ================================================================ */
ACTIONS['task-toggle'] = t => {
  const r = DB.tasks.find(x => x.id === t.dataset.v); if (!r) return;
  const done = !r.done; Store.save('tasks', Object.assign({}, r, { done, doneBy: done ? ME.name() : '', doneAt: done ? TODAY() : '' }));
  toast(done ? '완료 처리 · 고맙습니다' : '미완료로 되돌렸습니다'); rerender();
};
VIEWS.roadmap = () => {
  const today = TODAY(); const y = SET().year;
  const months = []; for (let i = 0; i < 13; i++) months.push(addMonths(`${y}-02`, i));
  const T = DB.tasks; const done = T.filter(t => t.done).length;
  const curP = PLAN.roadmap.findIndex(p => today >= p.s && today <= p.e);
  const late = T.filter(t => !t.done && t.due < today);
  const span0 = parseD(`${y}-02-01`), span1 = parseD(addMonths(`${y}-02`, 13) + '-01');
  const pos = s => clamp((parseD(s) - span0) / (span1 - span0) * 100, 0, 100);
  return `<section class="sec-h"><div><div class="eyebrow">[표 3] 12개월 다층 추진 로드맵</div><h2>연간 로드맵 · 부서 업무 체크리스트</h2><p>과업을 누르면 완료자와 날짜가 남습니다. 기한이 지나면 홈 알림에 표시됩니다.</p></div></section>
  <section class="grid g3">
    <div class="card kpi acc"><span class="lab">전체 진행률</span><span class="val">${pct(done, T.length)}<small>%</small></span><div class="meter"><i style="width:${pct(done, T.length)}%"></i></div><span class="xs muted">${done}/${T.length} 과업</span></div>
    <div class="card kpi acc"><span class="lab">현재 단계</span><span class="val" style="font-size:22px">${curP >= 0 ? esc(PLAN.roadmap[curP].phase) : '—'}</span><span class="xs muted">${curP >= 0 ? esc(PLAN.roadmap[curP].when) : ''}</span></div>
    <div class="card kpi ${late.length ? 'tier3' : 'tier1'}"><span class="lab">기한 경과 과업</span><span class="val">${late.length}<small>개</small></span><span class="xs muted">${late.length ? '아래 빨간 표시 확인' : '모두 기한 내'}</span></div>
  </section>
  <section class="card"><div class="card-h"><h3>추진 일정 (Gantt)</h3><span class="sub">채움 = 과업 완료율 · 빨간 선 = 오늘</span></div>
    <div style="overflow-x:auto"><div class="gantt"><div class="gh" style="text-align:left">단계</div>${months.map(m => `<div class="gh ${m === monthKey(today) ? 'now' : ''}">${+m.slice(5)}월</div>`).join('')}
    ${PLAN.roadmap.map((p, i) => { const ts = T.filter(t => t.phase === i); const pr = pct(ts.filter(t => t.done).length, ts.length); const l = pos(p.s), r = pos(addDays(p.e, 1)); return `<div class="gl" title="${esc(p.phase)}">${esc(p.phase)}</div><div class="gc" style="grid-column:span 13">${i === 0 ? `<span class="nowline" style="left:${pos(today)}%"></span>` : `<span class="nowline" style="left:${pos(today)}%;opacity:.5"></span>`}<span class="gb" style="left:${l}%;width:${Math.max(1.5, r - l)}%" data-tip="${esc(`<b>${esc(p.phase)}</b><br>${esc(p.when)} · 완료 ${pr}%`)}"><i style="width:${pr}%"></i></span></div>`; }).join('')}</div></div></section>
  <section class="grid g2">${PLAN.roadmap.map((p, i) => { const ts = T.filter(t => t.phase === i); const isCur = i === curP; return `<div class="card" style="${isCur ? 'border-color:var(--accent);box-shadow:var(--shadow)' : ''}"><div class="card-h"><h3>${esc(p.phase)} ${isCur ? '<span class="chip" style="color:var(--accent)">지금</span>' : ''}</h3><span class="sub">${esc(p.when)}</span></div>
    <div class="list">${ts.map(t => { const lt = !t.done && t.due < today; return `<div class="todo ${t.done ? 'done' : ''}" data-act="task-toggle" data-v="${esc(t.id)}" role="checkbox" aria-checked="${t.done}" tabindex="0" style="cursor:pointer"><span class="box">${t.done ? ico('check') : ''}</span><span class="t">${esc(t.title)}${t.done ? `<span class="xs muted" style="display:block;text-decoration:none">${esc(t.doneBy || '')} · ${fmtD(t.doneAt)}</span>` : lt ? '<span class="xs" style="display:block;color:var(--bad)">기한 경과</span>' : ''}</span></div>`; }).join('')}</div>
    <p class="xs muted" style="margin-top:8px">담당: ${esc(p.who)} · 산출물: ${esc(p.out)}</p></div>`; }).join('')}</section>`;
};

/* ---------------- 성과 · 충실도 ---------------- */
function tfiLatest(tier) { const L = DB.fidelity.filter(f => f.type === 'TFI' && f['t' + tier] != null).sort((a, b) => a.date.localeCompare(b.date)); return L[L.length - 1]; }
function outcomes() {
  const today = TODAY(); const S = SET();
  const ms = DB.meeting; const staffN = DB.staff.length || S.totalStaff;
  const praisers = new Set(DB.praise.concat(DB.obs).filter(p => p.date >= addDays(today, -30)).map(p => p.by));
  const tc = Math.max(teachCoverage('1학기 배움주간').pct, teachCoverage('2학기 배움주간').pct);
  const everCico = DB.students.filter(s => +s.tier === 2 || s.cicoStatus);
  const cMet = everCico.filter(s => { if (['자기관리', '졸업'].includes(s.cicoStatus)) return true; const st = cicoStats(s.id); return st.recentAvg != null && st.recentAvg >= PLAN.cicoGoal; }).length;
  const drops = everCico.map(cicoBirDrop).filter(Boolean).map(d => d.drop);
  const t3 = t3Students().map(s => t3Stats(s.id));
  const t1 = tfiLatest(1);
  return {
    buyin: S.buyinTotal ? pct(S.buyinAgree, S.buyinTotal) : null,
    attend: ms.length ? Math.round(avg(ms.map(m => pct(m.attend || 0, m.members || 10)))) : null,
    teach: tc, praiseStaff: pct(praisers.size, staffN), tfi1: t1 ? t1.t1 : null,
    cicoMet: everCico.length ? pct(cMet, everCico.length) : null,
    cicoBir: drops.length ? Math.round(avg(drops)) : null,
    t3drop: t3.filter(x => x.drop != null).length ? Math.round(avg(t3.map(x => x.drop))) : null,
    injury: sum(t3.map(x => x.injuries))
  };
}
function openTfi(rec) {
  const r = rec || { date: TODAY(), type: 'TFI', round: (PLAN.tfiRounds.slice().reverse().find(x => x.m <= +TODAY().slice(5, 7)) || PLAN.tfiRounds[0]).label, items: { 1: [], 2: [], 3: [] } };
  const block = tier => `<div class="card flat" style="background:var(--surface-2)"><div class="card-h"><h3>Tier ${tier} (${PLAN.tfi[tier].length}문항)</h3><span class="sub" id="tfi-p${tier}"></span></div>${PLAN.tfi[tier].map((q, i) => `<div class="row between li"><span class="small">${tier}.${i + 1} ${esc(q)}</span>${choices(`tf${tier}-${i}`, [{ v: 0, l: '0' }, { v: 1, l: '1' }, { v: 2, l: '2' }], (r.items[tier] || [])[i])}</div>`).join('')}</div>`;
  const calc = (b, tier) => { const v = PLAN.tfi[tier].map((q, i) => readChoice(b, `tf${tier}-${i}`)); const got = v.filter(x => x != null); return got.length ? { pct: Math.round(sum(got.map(Number)) / (PLAN.tfi[tier].length * 2) * 100), n: got.length, items: v.map(x => x == null ? null : +x) } : null; };
  openModal({
    title: 'TFI 충실도 평가 입력', wide: true,
    body: `<div class="form"><div class="f2"><div class="field"><span class="flabel">회차</span>${choices('tfr', PLAN.tfiRounds.map(x => x.label), r.round)}</div><div class="field"><label for="tf-d">평가일</label><input class="inp" type="date" id="tf-d" value="${esc(r.date)}"></div></div>
      <p class="xs muted">0 = 미실행 · 1 = 부분 실행 · 2 = 완전 실행. 문항명은 Center on PBIS TFI 구조의 요약 번역입니다. 원문 채점 기준은 TFI 공식 양식을 참고하세요.</p>
      ${block(1)}${block(2)}${block(3)}<div class="field"><label for="tf-n">메모 (SAS·SCS 결과 요약 등)</label><textarea class="inp" id="tf-n">${esc(r.note || '')}</textarea></div></div>`,
    onMount: b => { const upd = () => [1, 2, 3].forEach(t => { const c = calc(b, t); $('#tfi-p' + t, b).textContent = c ? `${c.pct}% (${c.n}/${PLAN.tfi[t].length} 응답)` : '미입력'; }); b.addEventListener('change', upd); upd(); },
    onSave: b => {
      const c = [1, 2, 3].map(t => calc(b, t)); if (!c.some(Boolean)) { toast('한 단계 이상 입력하세요'); return false; }
      Store.save('fidelity', Object.assign({}, r, { type: 'TFI', round: readChoice(b, 'tfr'), date: val(b, '#tf-d'), t1: c[0] ? c[0].pct : null, t2: c[1] ? c[1].pct : null, t3: c[2] ? c[2].pct : null, items: { 1: c[0] ? c[0].items : [], 2: c[1] ? c[1].items : [], 3: c[2] ? c[2].items : [] }, note: val(b, '#tf-n') }));
      toast(`TFI 저장 · Tier 1 ${c[0] ? c[0].pct + '%' : '—'}`); return true;
    }
  });
}
ACTIONS['tfi-new'] = () => openTfi(); ACTIONS['tfi-edit'] = t => { const r = DB.fidelity.find(x => x.id === t.dataset.v); if (r) openTfi(JSON.parse(JSON.stringify(r))); };
function openBudget(rec) {
  const r = rec || { date: TODAY(), area: 1 };
  openModal({
    title: '예산 집행 기록',
    body: `<div class="form"><div class="field"><span class="flabel">영역</span>${choices('bg-a', PLAN.budget.map(b => ({ v: b.k, l: `${b.k}. ${b.name}` })), r.area)}</div>
      <div class="f2"><div class="field"><label for="bg-d">집행일</label><input class="inp" type="date" id="bg-d" value="${esc(r.date)}"></div><div class="field"><label for="bg-m">금액(원)</label><input class="inp" type="number" min="0" step="1000" id="bg-m" value="${esc(r.amount ?? '')}"></div></div>
      <div class="field"><label for="bg-i">품목·내역</label><input class="inp" id="bg-i" value="${esc(r.item || '')}" placeholder="예) 경은마트 강화물품 10월분"></div></div>`,
    onSave: b => { const amount = num(b, '#bg-m'); if (!amount) { toast('금액을 입력하세요'); return false; } Store.save('budget', Object.assign({}, r, { area: +readChoice(b, 'bg-a'), date: val(b, '#bg-d'), amount, item: val(b, '#bg-i') })); toast('집행 내역 저장'); return true; }
  });
}
ACTIONS['budget-new'] = () => openBudget(); ACTIONS['budget-edit'] = t => { const r = DB.budget.find(x => x.id === t.dataset.v); if (r) openBudget(Object.assign({}, r)); };
function annualText() {
  const o = outcomes(); const S = SET(); const mb = monthlyBir(2).filter(x => x.n || x.pd);
  const first = mb.slice(0, 2), last = mb.slice(-2);
  const fa = avg(first.map(x => x.pd)), la = avg(last.map(x => x.pd));
  return `[${S.school} ${S.year}학년도 SW-PBS 1차년도 운영 결과 요약]
1. Tier 1: TFI Tier 1 ${o.tfi1 ?? '-'}% (목표 70~80%), 교직원 동의율 ${o.buyin ?? '-'}%, 직접교수 이행 ${o.teach}%, 교직원 칭찬 참여 ${o.praiseStaff}%
2. 행동사건(BIR, 2·3단계): 하루 평균 ${r1(fa) ?? '-'}건(초기 2개월) → ${r1(la) ?? '-'}건(최근 2개월), 감소율 ${fa ? Math.round((1 - la / fa) * 100) : '-'}%
3. Tier 2 CICO: 참여 학생 목표 달성 비율 ${o.cicoMet ?? '-'}% (목표 80%), 참여 학생 BIR 감소율 ${o.cicoBir ?? '-'}% (목표 50%)
4. Tier 3: 위기행동 감소율 ${o.t3drop ?? '-'}% (목표 70%), 신체 부상 ${o.injury}건 (목표 0건)
5. 리더십팀: 월례회의 ${DB.meeting.length}회, 평균 출석률 ${o.attend ?? '-'}%
6. 예산: 총 ${won(PLAN.budgetTotal)}원 중 ${won(sum(DB.budget.map(b => b.amount)))}원 집행 (${pct(sum(DB.budget.map(b => b.amount)), PLAN.budgetTotal)}%)`;
}
ACTIONS['annual-copy'] = () => copyText(annualText());
VIEWS.outcome = () => {
  const o = outcomes();
  const mb = monthlyBir(2);
  const months = mb.map(x => x.m);
  const cicoM = months.map(m => { const v = DB.dpr.filter(d => monthKey(d.date) === m && d.pct != null).map(d => d.pct); return v.length ? Math.round(avg(v)) : null; });
  const tfis = DB.fidelity.filter(f => f.type === 'TFI').sort((a, b) => a.date.localeCompare(b.date));
  const spent = PLAN.budget.map(b => sum(DB.budget.filter(x => +x.area === b.k).map(x => x.amount)));
  const totalSpent = sum(spent);
  const status = (t, v) => { if (v == null) return ['—', '']; const okv = t.lowerBetter ? v <= t.goal : v >= t.goal; const near = !t.lowerBetter && v >= t.goal * .8; return okv ? ['달성', 'good'] : near ? ['근접', 'warn'] : ['미달', 'bad']; };
  return `<section class="sec-h"><div><div class="eyebrow">[그림 6] 1차년도 성과 대시보드 · 연 3회 TFI</div><h2>성과 · 충실도 · 예산</h2><p>계획서의 달성 목표 지표를 실시간으로 집계합니다. 연차보고서 문구는 복사해서 바로 쓰세요.</p></div>
    <div class="row"><button class="btn" data-act="annual-copy">${ico('copy')}연차보고서 요약 복사</button><button class="btn pri" data-act="tfi-new">TFI 입력</button></div></section>
  <section class="card"><div class="card-h"><h3>달성 목표 지표</h3><span class="sub">[표 1]·[표 2] 기준</span></div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>지표</th><th class="r">현재</th><th class="r">목표</th><th style="min-width:140px">진행</th><th>판정</th></tr></thead><tbody>${PLAN.targets.map(t => { const v = o[t.k]; const [lab, cls] = status(t, v); const w = v == null ? 0 : t.lowerBetter ? (v === 0 ? 100 : 30) : clamp(v / t.goal * 100, 0, 100); return `<tr><td><b>${esc(t.label)}</b></td><td class="r num">${v == null ? '—' : v + t.unit}</td><td class="r num">${t.lowerBetter ? t.goal + t.unit : t.goal + t.unit + ' 이상'}</td><td><div class="meter ${cls}"><i style="width:${w}%"></i></div></td><td>${cls ? `<span class="chip ${cls}">${lab}</span>` : '<span class="muted">자료 없음</span>'}</td></tr>`; }).join('')}</tbody></table></div></section>
  <section class="grid g2">
    <div class="card"><div class="card-h"><h3>월별 행동사건 하루 평균</h3><span class="sub">2·3단계 BIR</span></div>${chart({ type: 'line', h: 210, dots: true, labels: months.map(fmtM), yFmt: v => r1(v) + '', series: [{ name: '건/일', color: 'var(--s1)', values: mb.map(x => r1(x.pd)) }] })}</div>
    <div class="card"><div class="card-h"><h3>CICO 학생 월평균 DPR 달성률</h3><span class="sub">점선 = 목표 80%</span></div>${chart({ type: 'line', h: 210, dots: true, labels: months.map(fmtM), goal: PLAN.cicoGoal, goalLabel: '80%', yMax: 100, yFmt: v => Math.round(v) + '%', series: [{ name: 'DPR', color: 'var(--t2)', values: cicoM }] })}</div>
  </section>
  <section class="grid g2">
    <div class="card"><div class="card-h"><h3>TFI 충실도 추이</h3><span class="sub">3·7·12월 · 점선 = Tier 1 목표 70%</span></div>
      ${tfis.length ? legend([['Tier 1', 'var(--t1)'], ['Tier 2', 'var(--t2)'], ['Tier 3', 'var(--t3)']]) + chart({ type: 'line', h: 210, dots: true, labels: tfis.map(f => f.round ? f.round.replace(/\(.*\)/, '') : fmtDs(f.date)), goal: 70, goalLabel: '70%', yMax: 100, yFmt: v => Math.round(v) + '%', series: [{ name: 'Tier 1', color: 'var(--t1)', values: tfis.map(f => f.t1) }, { name: 'Tier 2', color: 'var(--t2)', values: tfis.map(f => f.t2) }, { name: 'Tier 3', color: 'var(--t3)', values: tfis.map(f => f.t3) }] }) : '<div class="empty"><b>TFI 기록이 없습니다</b>3월 기초선부터 입력하세요.</div>'}
      ${tfis.length ? `<div class="list" style="margin-top:8px">${tfis.map(f => `<div class="li click" data-act="tfi-edit" data-v="${esc(f.id)}" role="button"><span class="chip">${esc(f.round || '')}</span><div class="grow"><div class="t">T1 ${f.t1 ?? '—'}% · T2 ${f.t2 ?? '—'}% · T3 ${f.t3 ?? '—'}%</div><div class="s">${fmtD(f.date)} ${f.note ? '· ' + esc(f.note) : ''}</div></div></div>`).join('')}</div>` : ''}</div>
    <div class="card"><div class="card-h"><h3>예산 집행</h3><div class="row"><span class="sub">${won(totalSpent)} / ${won(PLAN.budgetTotal)}원 (${pct(totalSpent, PLAN.budgetTotal)}%)</span><button class="btn sm" data-act="budget-new">${ico('plus')}집행</button></div></div>
      ${PLAN.budget.map((b, i) => `<div class="stack" style="gap:3px;margin-bottom:10px" data-tip="${esc(`<b>${esc(b.name)}</b><br>${esc(b.basis)}<br>집행 시기: ${esc(b.when)}`)}"><div class="row between small"><span><b>${b.k}.</b> ${esc(b.name)}</span><span class="num">${won(spent[i])} / ${won(b.amt)}</span></div><div class="meter ${spent[i] > b.amt ? 'bad' : ''}"><i style="width:${clamp(spent[i] / b.amt * 100, 0, 100)}%"></i></div></div>`).join('')}
      ${DB.budget.length ? `<details><summary class="small" style="cursor:pointer">집행 내역 ${DB.budget.length}건</summary><div class="list">${DB.budget.slice().sort((a, b) => b.date.localeCompare(a.date)).map(x => `<div class="li click" data-act="budget-edit" data-v="${esc(x.id)}" role="button"><span class="chip">${x.area}</span><div class="grow"><div class="t">${esc(x.item || '')}</div><div class="s">${fmtD(x.date)}</div></div><b class="num">${won(x.amount)}</b></div>`).join('')}</div></details>` : ''}</div>
  </section>`;
};

/* ---------------- 운영 가이드 ---------------- */
ACTIONS['tab-guide'] = t => { UI.sub.guide = t.dataset.v; rerender(); };
VIEWS.guide = () => {
  const sub = UI.sub.guide || 'start';
  const head = `<section class="sec-h"><div><div class="eyebrow">${esc(PLAN.dept)}</div><h2>운영 가이드</h2><p>계획서와 이 웹앱 주소만 있으면 운영할 수 있도록 정리한 안내입니다.</p></div></section>
  <div class="tabs">${[['start', '처음 사용'], ['who', '누가·언제·무엇을'], ['rules', '의사결정 기준'], ['plan', '계획 한눈에'], ['install', '설치·관리자']].map(([k, l]) => `<button class="${sub === k ? 'on' : ''}" data-act="tab-guide" data-v="${k}">${l}</button>`).join('')}</div>`;
  if (sub === 'who') return head + guideWho();
  if (sub === 'rules') return head + guideRules();
  if (sub === 'plan') return head + guidePlan();
  if (sub === 'install') return head + guideInstall();
  return head + `<section class="grid g3">${[['1', '이름 고르기', '오른쪽 위 동그라미를 눌러 내 이름과 역할을 고릅니다. 로그인은 없습니다.'], ['2', '기록 버튼 하나만 기억', '화면 오른쪽 아래 <b>기록</b> → 행동사건·DPR·칭찬 토큰. 대부분 터치만으로 1~3분.'], ['3', '홈에서 결정 확인', '계획서 기준(80%·70%·주 3회)으로 자동 판정된 알림과 내 할 일이 홈에 뜹니다.']].map(([n, t, d]) => `<div class="card"><div class="eyebrow">STEP ${n}</div><h3 style="margin:4px 0 6px;font-size:17px">${t}</h3><p class="ink2">${d}</p></div>`).join('')}</section>
  <section class="card"><div class="card-h"><h3>역할별 하루 사용법</h3></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>나는</th><th>매일</th><th>매주·매월</th></tr></thead><tbody>
    <tr><td><b>담임·교과 교사</b></td><td>칭찬 토큰 기록(학급 단위) · 2·3단계 행동 발생 시 BIR · CICO 학생 교시별 점수(0·1·2)</td><td>배움주간·보완교수 체크 · 4:1 상호관찰 · 학기별 ETLP 자기점검</td></tr>
    <tr><td><b>CICO 멘토</b></td><td>홈 ‘오늘 할 일’에서 체크인(08:50)·체크아웃(14:40) · 멘토 한마디 · 가정 알림 문구 복사</td><td>지난주 70% 미만이면 코디네이터와 협의</td></tr>
    <tr><td><b>특수교육지도사</b></td><td>BIR 보고자 ‘지도사’로 기록 · Tier 3 학생 일일 빈도·FCT 기록</td><td>지원 요청함에 현장 애로 남기기</td></tr>
    <tr><td><b>CICO 코디네이터</b></td><td>CICO → 오늘 DPR에서 입력 현황 확인</td><td>금요일 주간 분석·바우처 · 선별 후보 검토 · 월례회의 CICO 브리핑</td></tr>
    <tr><td><b>데이터 분석가</b></td><td>—</td><td>회의 2일 전 Big 5 화면에서 ‘요약 복사’ → 메신저 배포</td></tr>
    <tr><td><b>코치·관리자</b></td><td>홈 ‘결정이 필요한 일’ 확인 · 지원 요청 처리</td><td>월례회의 회의록·해결계획 · TFI 3회 · 로드맵·예산 점검</td></tr>
  </tbody></table></div></section>
  <section class="card"><div class="card-h"><h3>개인정보 보호 수칙</h3></div><ul class="ink2"><li>학생 이름은 <b>성 빼고 이름만</b> 또는 학교가 정한 <b>학생 코드</b>로 등록하세요.</li><li>자료는 학교 구글 계정의 시트에만 저장됩니다. 주소는 교직원 메신저로만 공유하고, 외부에 게시하지 마세요.</li><li>관리자는 설치 때 <b>접속 코드</b>를 설정할 수 있습니다 (설치·관리자 탭).</li><li>메모에는 관찰 사실만 짧게. 진단명·가정사 등 민감정보는 적지 않습니다.</li></ul></section>`;
};
function guideWho() {
  const rows = [
    ['행동사건 BIR (1·2·3단계)', '발생 즉시~당일', '목격한 교직원 누구나', 'Big 5 · 홈 알림 · 회의록'],
    ['CICO 체크인·체크아웃', '매일 08:50 · 14:40', '전담 멘토', 'CICO 학생 카드'],
    ['CICO 교시별 점수', '매 교시 종료 2분 전', '수업 담당 교사', 'DPR 달성률 · 주간 분석'],
    ['칭찬 토큰', '매일 (하루 1회 학급 합계)', '담임·전담·지도사', 'Tier 1 · 우수 학급'],
    ['4:1 관찰', '학기 2회 이상', '교사 자기·상호관찰', 'ETLP 3번 지표'],
    ['직접교수·보완교수', '3·9월 배움주간, 매월 넷째 주 월', '담임', '이행률 90% 목표'],
    ['토큰마켓 운영대장', '매주 금요일', '강화·홍보 담당', 'Tier 1 · 예산'],
    ['Tier 3 일일 기록', '매일 하교 전', '담임·전담 지도사', '감소율 · 심리안정실'],
    ['FBA·BIP / 상담', '4월 FBA, 수시 수정 / 보호자 월 2회', 'Tier 3 전담팀', 'Tier 3 화면'],
    ['주간 분석·바우처', '매주 금요일 오후', 'CICO 코디네이터', '회의 CICO 브리핑'],
    ['월례회의 회의록', '매월 3주 수요일 15:30', '기록자', '해결계획 추적'],
    ['TFI', '3·7·12월', '리더십팀 전원', '성과 대시보드'],
    ['로드맵 과업 체크', '완료 즉시', '각 담당', '진행률 · 지연 알림'],
    ['예산 집행', '집행 시', '학생지원부', '5대 영역 집행률']
  ];
  return `<section class="card"><div class="card-h"><h3>누가 · 언제 · 무엇을 입력하나</h3><span class="sub">입력은 짧게, 판단은 앱이 계획서 기준으로</span></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>입력 항목</th><th>시기</th><th>입력자</th><th>어디에 쓰이나</th></tr></thead><tbody>${rows.map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td class="ink2">${r[3]}</td></tr>`).join('')}</tbody></table></div></section>
  <section class="card"><div class="card-h"><h3>10인 리더십팀 역할</h3><span class="sub">[표 5]</span></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>역할</th><th>배정</th><th>분장 업무</th><th>회의 역할</th></tr></thead><tbody>${PLAN.roles.map(r => `<tr><td><b>${esc(r.role)}</b></td><td>${esc(r.who)}</td><td>${esc(r.task)}</td><td class="ink2">${esc(r.meet)}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function guideRules() {
  const R = [
    ['CICO 선별 후보', '최근 30일 BIR(2단계↑) 2회 이상 또는 7일 내 경미행동 5회 이상, 담임 의뢰', '선별·등록 탭에 후보 표시 → 학부모 동의 후 멘토 매칭', 'warn'],
    ['CICO 유지', '지난주 평균 80% 이상', '현재 지원 유지, 체크아웃에서 구체적 칭찬', 'good'],
    ['CICO 관찰·보완', '지난주 평균 70~79%', '어려운 교시·기대행동 확인 후 체크인 목표 구체화', 'warn'],
    ['CICO 전략 수정', '지난주 평균 70% 미만', '멘토 협의 → 선행사건 수정·강화물 교체', 'bad'],
    ['CICO 자기관리 전환', '4주 연속 주간 평균 80% 이상', '자기점검 카드로 페이딩 → 졸업', 'good'],
    ['Tier 3 의뢰 검토', 'CICO 학생 30일 내 3단계 위기 2회 이상', 'IEP팀 협의, FBA 의뢰', 'bad'],
    ['Tier 3 BIP 긴급 점검', '심리안정실 주 3회 이상 또는 부상 발생', '전담팀 긴급 회의, BIP 수정, 보호자 소통', 'bad'],
    ['다발 장소 보완교수', '이번 달 BIR의 30% 이상이 한 장소', '넷째 주 월요일 보완교수 + Double Token Week', 'warn'],
    ['Tier 3 보호자 상담', '20일 이후 보호자 상담 2회 미만', '월 2회 정기 상담 일정 확보', 'warn'],
    ['해결계획 지연', '회의 해결계획 완료 기한 경과', '책임자 점검, 다음 회의 4번 안건', 'warn']
  ];
  return `<section class="card"><div class="card-h"><h3>자동 의사결정 기준</h3><span class="sub">계획서 수치 그대로 · 홈 ‘결정이 필요한 일’에 표시</span></div><div class="stack">${R.map(([t, c, a, lv]) => `<div class="alert ${lv}"><span class="ic">${lv === 'bad' ? '!' : lv === 'good' ? '✓' : '△'}</span><div><b>${t}</b><div class="why"><b>조건</b> ${c}</div><div class="why"><b>조치</b> ${a}</div></div><span></span></div>`).join('')}</div></section>${crisisCard()}`;
}
function guidePlan() {
  return `<section class="card"><div class="card-h"><h3>${esc(PLAN.title)}</h3><span class="sub">핵심: Tier 1 보편 100% + Tier 2 CICO 5% + Tier 3 초고위기 2명 동시 가동</span></div>
    <div class="grid g3">${PLAN.tiers.map(t => `<div class="stack" style="gap:6px"><span class="chip t${t.n}"><span class="d"></span>${esc(t.name)}</span><b>${esc(t.target)}</b><ul class="small" style="margin:0;padding-left:18px">${t.core.map(c => `<li>${esc(c)}</li>`).join('')}</ul><span class="xs ink2">지표: ${esc(t.goal)}</span></div>`).join('')}</div></section>
  <section class="card"><div class="card-h"><h3>다층 연계 흐름</h3><span class="sub">[그림 5]</span></div><div class="flow"><div class="fx"><b>Tier 1</b><br>매트릭스·직접교수·4:1 칭찬<br><span class="muted xs">경미행동 → 학급 간이체크</span></div><span class="ar">→</span><div class="fx"><b>주 5회↑ 경미 / BIR 2회↑</b><br><span class="muted xs">Big 5 선별</span></div><span class="ar">→</span><div class="fx"><b>Tier 2 CICO</b><br>멘토·DPR·주간 분석<br><span class="muted xs">4주 80% → 자기관리</span></div><span class="ar">→</span><div class="fx"><b>위기 반복·주 3회 안정실</b><br><span class="muted xs">IEP팀 협의</span></div><span class="ar">→</span><div class="fx"><b>Tier 3</b><br>FBA·BIP·1:1 지원<br><span class="muted xs">70% 감소 검증</span></div></div></section>
  <section class="card"><div class="card-h"><h3>5대 영역 예산 (총 ${won(PLAN.budgetTotal)}원)</h3><span class="sub">[표 18]</span></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>영역</th><th>산출 기초</th><th class="r">예산액</th><th>시기</th></tr></thead><tbody>${PLAN.budget.map(b => `<tr><td><b>${b.k}. ${esc(b.name)}</b><br><span class="xs muted">${esc(b.cat)}</span></td><td class="small">${esc(b.basis)}</td><td class="r num">${won(b.amt)}</td><td class="small">${esc(b.when)}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function guideInstall() {
  return `<section class="card"><div class="card-h"><h3>학교 전용 주소 만들기 (관리자 1회 · 약 5분)</h3><span class="sub">무료 · 학교 구글 계정에 자료 저장</span></div>
    <ol class="stack" style="padding-left:20px;margin:0">
      <li><b>구글 시트 새로 만들기</b> — 이름 예: “2026 SW-PBS 운영 데이터”. 학교(교육용) 구글 계정을 권장합니다.</li>
      <li><b>확장 프로그램 → Apps Script</b>를 엽니다.</li>
      <li>기본 <code>Code.gs</code> 내용을 지우고 GitHub 저장소의 <code>gas/Code.gs</code>를 붙여넣습니다.</li>
      <li>왼쪽 <b>＋ → HTML</b>로 파일 이름을 <code>Index</code>로 만들고 <code>gas/Index.html</code> 전체를 붙여넣습니다.</li>
      <li>위쪽 함수 선택에서 <code>setup</code>을 고르고 <b>실행</b> → 권한 허용 (시트 탭 21개가 자동 생성).</li>
      <li><b>배포 → 새 배포 → 웹 앱</b>: 실행 사용자 <b>나</b>, 액세스 권한 <b>학교 도메인 사용자</b>(또는 Google 계정이 있는 모든 사용자) → 배포.</li>
      <li>나온 <b>웹 앱 URL</b>을 계획서와 함께 교직원 메신저로 공유합니다. 끝.</li>
    </ol>
    <div class="alert info" style="margin-top:14px"><span class="ic">i</span><div><b>접속 코드 (선택)</b><div class="why">Apps Script → 프로젝트 설정 → 스크립트 속성에 <code>ACCESS_CODE</code>를 추가하면, 처음 접속할 때 코드를 물어봅니다.</div></div><span></span></div>
    <div class="alert info" style="margin-top:8px"><span class="ic">i</span><div><b>업데이트</b><div class="why">Index.html을 새 버전으로 바꾼 뒤 배포 → 배포 관리 → 수정 → 새 버전. 주소는 그대로 유지됩니다. 자료는 시트에 남습니다.</div></div><span></span></div></section>
  <section class="card"><div class="card-h"><h3>첫 설정 체크리스트</h3></div><ol style="margin:0;padding-left:20px" class="ink2"><li>설정 → 학교 정보 (전교생 수·교직원 수·방학·핫라인)</li><li>설정 → 교직원 명단 붙여넣기 (멘토·리더십팀 표시)</li><li>설정 → 학생 명단 붙여넣기 (학급·의사소통군)</li><li>CICO → 선별·등록 / Tier 3 → 대상 지정</li><li>로드맵 2월 과업 체크 · 성과 → 3월 TFI 기초선</li></ol></section>`;
}

/* ---------------- 설정 · 명단 ---------------- */
ACTIONS['tab-set'] = t => { UI.sub.settings = t.dataset.v; rerender(); };
function adminGate(fn) {
  const pin = SET().adminPin; if (!pin || UI.adminOk) { fn(); return; }
  openModal({ title: '관리자 확인', body: `<div class="field"><label for="ad-pin">관리자 PIN</label><input class="inp" id="ad-pin" type="password" inputmode="numeric" autofocus></div>`, saveLabel: '확인', onSave: b => { if (val(b, '#ad-pin') !== String(pin)) { toast('PIN이 맞지 않습니다'); return false; } UI.adminOk = true; setTimeout(fn, 50); return true; } });
}
VIEWS.settings = () => {
  const sub = UI.sub.settings || 'school';
  const head = `<section class="sec-h"><div><div class="eyebrow">관리자</div><h2>설정 · 명단</h2><p>학교 정보와 명단은 엑셀에서 복사해 붙여넣으면 한 번에 등록됩니다.</p></div></section>
  <div class="tabs">${[['school', '학교 정보'], ['staff', `교직원 ${DB.staff.length}`], ['students', `학생 ${DB.students.length}`], ['data', '자료 관리']].map(([k, l]) => `<button class="${sub === k ? 'on' : ''}" data-act="tab-set" data-v="${k}">${l}</button>`).join('')}</div>`;
  if (sub === 'staff') return head + setStaff();
  if (sub === 'students') return head + setStudents();
  if (sub === 'data') return head + setData();
  const S = SET();
  return head + `<section class="card"><div class="form">
    <div class="f3"><div class="field"><label for="s-school">학교명</label><input class="inp" id="s-school" value="${esc(S.school)}"></div><div class="field"><label for="s-year">학년도</label><input class="inp" type="number" id="s-year" value="${esc(S.year)}"></div><div class="field"><label for="s-cico">CICO 목표 인원 (5%)</label><input class="inp" type="number" id="s-cico" value="${esc(S.cicoTarget)}"></div></div>
    <div class="f3"><div class="field"><label for="s-ts">전교생 수</label><input class="inp" type="number" id="s-ts" value="${esc(S.totalStudents)}"></div><div class="field"><label for="s-tf">교직원 수</label><input class="inp" type="number" id="s-tf" value="${esc(S.totalStaff)}"></div><div class="field"><label for="s-pin">관리자 PIN <span class="hint">설정 화면 보호 · 비우면 해제</span></label><input class="inp" id="s-pin" value="${esc(S.adminPin || '')}" inputmode="numeric"></div></div>
    <div class="f2"><div class="field"><label for="s-ba">실행 동의 인원 (Buy-in)</label><input class="inp" type="number" id="s-ba" value="${esc(S.buyinAgree)}"></div><div class="field"><label for="s-bt">투표 참여 인원</label><input class="inp" type="number" id="s-bt" value="${esc(S.buyinTotal)}"></div></div>
    <div class="field"><label for="s-hot">위기개입 비상 핫라인</label><input class="inp" id="s-hot" value="${esc(S.hotline)}"></div>
    <div class="field"><label for="s-br">방학·휴업 기간 <span class="hint">한 줄에 하나: 2026-07-24~2026-08-16</span></label><textarea class="inp" id="s-br">${esc((S.breaks || []).map(b => b.join('~')).join('\n'))}</textarea></div>
    <div class="row"><button class="btn pri" data-act="set-save">저장</button></div></div></section>`;
};
ACTIONS['set-save'] = () => adminGate(() => {
  const b = $('#view'); const breaks = val(b, '#s-br').split('\n').map(l => l.split('~').map(x => x.trim())).filter(x => x.length === 2 && x[0] && x[1]);
  Store.save('settings', Object.assign({}, SET(), { id: 'main', school: val(b, '#s-school'), year: +val(b, '#s-year') || 2026, cicoTarget: num(b, '#s-cico'), totalStudents: num(b, '#s-ts'), totalStaff: num(b, '#s-tf'), adminPin: val(b, '#s-pin'), buyinAgree: num(b, '#s-ba'), buyinTotal: num(b, '#s-bt'), hotline: val(b, '#s-hot'), breaks }));
  toast('학교 정보를 저장했습니다'); rerender();
});
function setStaff() {
  const L = DB.staff.slice().sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  return `<section class="card"><div class="card-h"><h3>교직원 명단</h3><div class="row"><button class="btn sm" data-act="bulk" data-v="staff">엑셀 붙여넣기</button><button class="btn sm pri" data-act="staff-edit">${ico('plus')}추가</button></div></div>
    ${L.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>이름</th><th>역할</th><th>소속·담당 학급</th><th>CICO 멘토</th><th>리더십팀</th><th class="r">최근 30일 기록</th></tr></thead><tbody>${L.map(s => `<tr class="click" data-act="staff-edit" data-v="${esc(s.id)}"><td><b>${esc(s.name)}</b></td><td>${esc(s.role || '')}</td><td>${esc(s.dept || '')}</td><td>${s.mentor ? '✓' : ''}</td><td>${s.team ? '✓' : ''}</td><td class="r num">${['bir', 'dpr', 'praise', 'obs', 't3log', 'teach'].reduce((n, c) => n + DB[c].filter(r => r.by === s.name && r.date >= addDays(TODAY(), -30)).length, 0)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty"><b>교직원 명단이 비어 있습니다</b>엑셀 붙여넣기로 한 번에 등록하세요.</div>'}</section>`;
}
function setStudents() {
  const L = DB.students.slice().sort((a, b) => (a.cls || '').localeCompare(b.cls || '', 'ko', { numeric: true }) || a.name.localeCompare(b.name, 'ko'));
  return `<section class="card"><div class="card-h"><h3>학생 명단</h3><div class="row"><button class="btn sm" data-act="bulk" data-v="students">엑셀 붙여넣기</button><button class="btn sm pri" data-act="stu-edit">${ico('plus')}추가</button></div></div>
    <p class="xs muted" style="margin-bottom:8px">이름은 성 빼고 이름만 또는 학생 코드로 등록하세요. Tier는 CICO 등록·Tier 3 지정 화면에서 자동으로 바뀝니다.</p>
    ${L.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>이름</th><th>과정</th><th>학급</th><th>의사소통군</th><th>Tier</th><th class="r">BIR(누적)</th></tr></thead><tbody>${L.map(s => `<tr class="click" data-act="stu-edit" data-v="${esc(s.id)}"><td><b>${esc(s.name)}</b></td><td>${esc(s.course || '')}</td><td>${esc(s.cls || '')}</td><td>${esc(s.comm || '')}</td><td><span class="chip t${s.tier || 1}">T${s.tier || 1}</span>${s.cicoStatus ? ` <span class="xs muted">${esc(s.cicoStatus)}</span>` : ''}</td><td class="r num">${DB.bir.filter(b => b.studentId === s.id && +b.level >= 2).length}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty"><b>학생 명단이 비어 있습니다</b>엑셀 붙여넣기로 한 번에 등록하세요.</div>'}</section>`;
}
ACTIONS['staff-edit'] = t => adminGate(() => {
  const s = t.dataset.v ? Object.assign({}, staffById(t.dataset.v)) : {};
  openModal({
    title: s.id ? '교직원 수정' : '교직원 추가',
    body: `<div class="form"><div class="f2"><div class="field"><label for="sf-n">이름</label><input class="inp" id="sf-n" value="${esc(s.name || '')}"></div><div class="field"><label for="sf-r">역할</label><select class="inp" id="sf-r">${PLAN.staffRoles.map(r => `<option ${r === s.role ? 'selected' : ''}>${r}</option>`).join('')}</select></div></div>
      <div class="field"><label for="sf-d">소속·담당 학급</label><input class="inp" id="sf-d" value="${esc(s.dept || '')}" placeholder="예) 초3-1"></div>
      <label class="check"><input type="checkbox" id="sf-m" ${s.mentor ? 'checked' : ''}> CICO 전담 멘토</label><label class="check"><input type="checkbox" id="sf-t" ${s.team ? 'checked' : ''}> 리더십팀 위원</label></div>`,
    foot: `${s.id ? `<button class="btn danger" data-act="staff-del" data-v="${esc(s.id)}" style="margin-right:auto">삭제</button>` : ''}<button class="btn" data-act="modal-close">취소</button><button class="btn pri" data-act="modal-save">저장</button>`,
    onSave: b => { const name = val(b, '#sf-n'); if (!name) { toast('이름을 입력하세요'); return false; } Store.save('staff', Object.assign(s, { name, role: val(b, '#sf-r'), dept: val(b, '#sf-d'), mentor: checked(b, '#sf-m'), team: checked(b, '#sf-t') })); toast('저장했습니다'); return true; }
  });
});
ACTIONS['staff-del'] = t => { const id = t.dataset.v; confirmBox('이 교직원을 명단에서 삭제할까요? 기존 기록의 이름은 유지됩니다.', () => { Store.remove('staff', id); toast('삭제했습니다'); }); };
ACTIONS['stu-edit'] = t => adminGate(() => {
  const s = t.dataset.v ? Object.assign({}, stuById(t.dataset.v)) : { tier: 1 };
  openModal({
    title: s.id ? '학생 수정' : '학생 추가',
    body: `<div class="form"><div class="f2"><div class="field"><label for="st-n">이름 또는 코드</label><input class="inp" id="st-n" value="${esc(s.name || '')}"></div><div class="field"><label for="st-c">학급</label><input class="inp" id="st-c" value="${esc(s.cls || '')}" placeholder="예) 초3-1"></div></div>
      <div class="field"><span class="flabel">과정</span>${choices('st-co', PLAN.courses, s.course)}</div>
      <div class="field"><span class="flabel">의사소통군</span>${choices('st-cm', PLAN.commGroups.map(g => ({ v: g.key, l: g.name })), s.comm)}</div>
      <div class="field"><span class="flabel">지원 단계</span>${choices('st-t', [{ v: 1, l: 'Tier 1' }, { v: 2, l: 'Tier 2 CICO' }, { v: 3, l: 'Tier 3' }], s.tier || 1)}</div></div>`,
    foot: `${s.id ? `<button class="btn danger" data-act="stu-del" data-v="${esc(s.id)}" style="margin-right:auto">삭제</button>` : ''}<button class="btn" data-act="modal-close">취소</button><button class="btn pri" data-act="modal-save">저장</button>`,
    onSave: b => { const name = val(b, '#st-n'); if (!name) { toast('이름을 입력하세요'); return false; } const tier = +readChoice(b, 'st-t') || 1; Store.save('students', Object.assign(s, { name, cls: val(b, '#st-c'), course: readChoice(b, 'st-co'), comm: readChoice(b, 'st-cm'), tier, cicoStatus: tier === 2 ? (s.cicoStatus || '진행') : s.cicoStatus })); toast('저장했습니다'); return true; }
  });
});
ACTIONS['stu-del'] = t => { const id = t.dataset.v; confirmBox('이 학생을 삭제할까요? 행동 기록은 남지만 이름이 “삭제된 학생”으로 보입니다.', () => { Store.remove('students', id); toast('삭제했습니다'); }); };
ACTIONS.bulk = t => adminGate(() => {
  const kind = t.dataset.v;
  const help = kind === 'staff' ? '열 순서: 이름 · 역할 · 소속(학급) · 멘토(O) · 리더십팀(O)' : '열 순서: 이름(또는 코드) · 과정(유치원/초등/중학/고등/전공과) · 학급 · 의사소통군(구어/무발화/중도중복)';
  const ex = kind === 'staff' ? '김하늘\t담임교사\t초3-1\tO\t\n박서준\tCICO 코디네이터\t초등\tO\tO' : '가온\t초등\t초3-1\t무발화\n나래\t중학\t중2-1\t구어';
  openModal({
    title: kind === 'staff' ? '교직원 명단 붙여넣기' : '학생 명단 붙여넣기',
    body: `<div class="form"><p class="ink2">엑셀(또는 나이스 내려받기)에서 열을 맞춘 뒤 표를 통째로 복사해 붙여넣으세요. ${help}</p><textarea class="inp" id="bk" style="min-height:220px;font-family:var(--f-mono);font-size:13px" placeholder="${esc(ex)}"></textarea><p class="xs muted" id="bk-msg">같은 이름(학생은 이름+학급)이 있으면 정보를 갱신합니다.</p></div>`,
    saveLabel: '등록',
    onMount: b => $('#bk', b).addEventListener('input', () => { const n = $('#bk', b).value.split('\n').filter(l => l.trim()).length; $('#bk-msg', b).textContent = `${n}줄 인식됨`; }),
    onSave: b => {
      const lines = val(b, '#bk').split('\n').map(l => l.split(/\t|,/).map(x => x.trim())).filter(c => c[0] && !['이름', '성명'].includes(c[0]));
      if (!lines.length) { toast('붙여넣은 내용이 없습니다'); return false; }
      const yes = v => /^(o|y|예|1|true|✓|v)$/i.test(v || '');
      const recs = lines.map(c => {
        if (kind === 'staff') { const ex2 = DB.staff.find(s => s.name === c[0]); return Object.assign({}, ex2 || {}, { name: c[0], role: PLAN.staffRoles.includes(c[1]) ? c[1] : (c[1] || '담임교사'), dept: c[2] || '', mentor: yes(c[3]), team: yes(c[4]) }); }
        const ex2 = DB.students.find(s => s.name === c[0] && (s.cls || '') === (c[2] || '')); const course = PLAN.courses.find(x => (c[1] || '').startsWith(x.slice(0, 1))) || c[1] || ''; const comm = ['구어', '무발화', '중도중복'].find(x => (c[3] || '').includes(x.slice(0, 2))) || '';
        return Object.assign({ tier: 1 }, ex2 || {}, { name: c[0], course, cls: c[2] || '', comm });
      });
      Store.saveMany(kind, recs); toast(`${recs.length}명 등록했습니다`); return true;
    }
  });
});
function setData() {
  return `<section class="grid g2"><div class="card"><div class="card-h"><h3>저장 위치</h3></div>
    ${Store.mode === 'gas' ? `<p class="ink2">모든 기록은 학교 구글 시트에 탭별로 저장됩니다. 시트의 <b>json</b> 열은 앱이 읽는 원본이므로 수정하지 말고, 오른쪽 열들은 사람이 읽기 좋게 자동 정리된 사본입니다.</p>${Store.sheetUrl ? `<a class="btn" href="${esc(Store.sheetUrl)}" target="_blank" rel="noopener" style="margin-top:10px">원본 구글 시트 열기</a>` : ''}` : `<p class="ink2">지금은 <b>체험판</b>입니다. 예시 자료가 이 브라우저에만 저장되며 다른 선생님과 공유되지 않습니다.</p><div class="row" style="margin-top:10px"><button class="btn" data-act="demo-reset">예시 자료 다시 불러오기</button><button class="btn danger" data-act="demo-clear">빈 상태로 시작</button></div>`}</div>
    <div class="card"><div class="card-h"><h3>백업 · 복원</h3></div><p class="ink2">전체 자료를 텍스트(JSON)로 복사해 보관하거나, 체험판에서 만든 자료를 옮길 수 있습니다.</p><div class="row" style="margin-top:10px"><button class="btn" data-act="backup">${ico('copy')}백업 복사</button><button class="btn" data-act="restore">복원 붙여넣기</button></div></div></section>`;
}
ACTIONS['demo-reset'] = () => confirmBox('예시 자료를 다시 불러올까요? 지금 체험판 자료는 지워집니다.', () => { Store.resetDemo(); toast('예시 자료를 불러왔습니다'); }, '불러오기');
ACTIONS['demo-clear'] = () => confirmBox('체험판 자료를 모두 비울까요?', () => { Store.clearDemo(); toast('빈 상태로 시작합니다. 설정에서 명단을 등록하세요'); }, '비우기');
ACTIONS.backup = () => adminGate(() => copyText(JSON.stringify({ app: 'pbs', v: 1, at: new Date().toISOString(), db: DB })));
ACTIONS.restore = () => adminGate(() => openModal({
  title: '백업 복원', body: `<div class="form"><p class="ink2">백업 텍스트를 붙여넣으세요. 같은 ID의 기록은 덮어쓰고, 나머지는 추가됩니다.</p><textarea class="inp" id="rs" style="min-height:220px;font-family:var(--f-mono);font-size:12px"></textarea></div>`, saveLabel: '복원',
  onSave: b => { let o; try { o = JSON.parse(val(b, '#rs')); } catch (e) { toast('형식이 올바르지 않습니다'); return false; } if (!o || !o.db) { toast('백업 형식이 아닙니다'); return false; } let n = 0; COLS.forEach(c => { const recs = o.db[c] || []; if (recs.length) { Store.saveMany(c, recs.map(r => Object.assign({}, r))); n += recs.length; } }); toast(`${n}건 복원했습니다`); return true; }
}));
