/* ================================================================
   행동사건보고서(BIR) 입력 · Big 5 분석
   ================================================================ */
function openBir(rec) {
  const r = rec || { date: TODAY(), time: nowTime(), level: 2, types: [], ante: [], func: [], resp: [], post: [], reporterRole: ME.role() === '특수교육지도사' ? '지도사' : '담임' };
  const B = PLAN.bir;
  const body = `<div class="form">
    <div class="field"><label for="bir-q">학생 <span class="hint">이름 일부를 입력하면 목록이 좁혀집니다</span></label>
      <div class="f2"><input class="inp" id="bir-q" placeholder="이름·반 검색" autocomplete="off"><select class="inp" id="bir-stu">${stuOptions(r.studentId)}</select></div></div>
    <div class="f2"><div class="field"><label for="bir-date">발생 날짜</label><input class="inp" type="date" id="bir-date" value="${esc(r.date)}"></div>
      <div class="field"><label for="bir-time">시각</label><input class="inp" type="time" id="bir-time" value="${esc(r.time || '')}"></div></div>
    <div class="field"><span class="flabel">행동 강도 단계 <span class="hint">계획서 3단계 대응 기준</span></span>
      ${choices('level', B.levels.map(l => ({ v: l.v, l: `${l.name} (${l.en})`, c: 'lv' + l.v })), r.level)}
      <p class="xs muted" id="bir-lvdesc">${esc((B.levels.find(l => l.v == r.level) || B.levels[1]).desc)}</p></div>
    <div class="field"><span class="flabel">발생 장소 (Where)</span>${choices('loc', B.locations, r.location)}</div>
    <div class="field"><span class="flabel">활동·맥락 (When)</span>${choices('ctx', B.contexts, r.context)}</div>
    <div class="field" id="bir-types"><span class="flabel">주요 행동 유형 (What) <span class="hint">핵심 1~2개</span></span>${choices('types', +r.level === 1 ? B.typesMinor : B.types, r.types, { multi: true })}</div>
    <div class="field"><span class="flabel">직전 선행사건 (Antecedent)</span>${choices('ante', B.antecedents, r.ante, { multi: true })}</div>
    <div class="field"><span class="flabel">추정 행동 기능 (Why)</span>${choices('func', B.functions.map(f => ({ v: f.v, l: `${f.g}: ${f.v}` })), r.func, { multi: true })}</div>
    <div class="field"><span class="flabel">교육적·안전 조치</span>${choices('resp', B.responses, r.resp, { multi: true })}</div>
    <div class="field" id="bir-postf" ${+r.level === 1 ? 'hidden' : ''}><span class="flabel">심리안정실 및 사후 조치</span>${choices('post', B.post, r.post, { multi: true })}
      <div class="f2" style="margin-top:6px"><div class="field"><label for="bir-in">심리안정실 입실</label><input class="inp" type="time" id="bir-in" value="${esc(r.calmIn || '')}"></div><div class="field"><label for="bir-out">퇴실 <span class="hint">최대 20분 · 1:1 관찰</span></label><input class="inp" type="time" id="bir-out" value="${esc(r.calmOut || '')}"></div></div></div>
    <div class="field"><span class="flabel">보고자 구분</span>${choices('role', B.reporterRoles, r.reporterRole)}</div>
    <div class="field"><label for="bir-memo">메모 <span class="hint">관찰 사실만 짧게 (선택)</span></label><textarea class="inp" id="bir-memo" placeholder="예) 급식 대기 3분 경과 후 앞 친구 밀침. 시각 타이머 제시 후 진정.">${esc(r.memo || '')}</textarea></div>
  </div>`;
  openModal({
    title: rec ? '행동사건 기록 수정' : '행동사건 기록 (BIR)', body, wide: true,
    foot: `${rec ? `<button class="btn danger" data-act="bir-del" data-v="${esc(rec.id)}" style="margin-right:auto">삭제</button>` : ''}<button class="btn" data-act="modal-close">취소</button><button class="btn pri" data-act="modal-save">저장</button>`,
    onMount: b => {
      const q = $('#bir-q', b), sel = $('#bir-stu', b);
      q.addEventListener('input', () => { const k = q.value.trim(); $$('option', sel).forEach(o => { o.hidden = k && o.value && !o.textContent.includes(k); }); const first = $$('option', sel).find(o => o.value && !o.hidden); if (k && first) sel.value = first.value; });
      b.addEventListener('change', e => {
        if (e.target.dataset && e.target.dataset.choice === 'level') {
          const lv = +readChoice(b, 'level') || 2; const prev = readChoice(b, 'types') || [];
          $('#bir-types', b).innerHTML = `<span class="flabel">주요 행동 유형 (What) <span class="hint">핵심 1~2개</span></span>` + choices('types', lv === 1 ? B.typesMinor : B.types, prev, { multi: true });
          $('#bir-postf', b).hidden = lv === 1;
          $('#bir-lvdesc', b).textContent = (B.levels.find(l => l.v === lv) || {}).desc || '';
        }
      });
    },
    onSave: b => {
      const studentId = val(b, '#bir-stu'), level = +readChoice(b, 'level'), location = readChoice(b, 'loc');
      if (!studentId) { toast('학생을 선택하세요'); return false; }
      if (!level) { toast('행동 강도 단계를 고르세요'); return false; }
      if (!location) { toast('발생 장소를 고르세요'); return false; }
      const rec2 = Object.assign({}, r, { studentId, level, location, date: val(b, '#bir-date') || TODAY(), time: val(b, '#bir-time'), context: readChoice(b, 'ctx'), types: readChoice(b, 'types'), ante: readChoice(b, 'ante'), func: readChoice(b, 'func'), resp: readChoice(b, 'resp'), post: level > 1 ? readChoice(b, 'post') : [], calmIn: val(b, '#bir-in'), calmOut: val(b, '#bir-out'), reporterRole: readChoice(b, 'role'), memo: val(b, '#bir-memo') });
      Store.save('bir', rec2);
      const s = stuById(studentId); const n30 = birIn(addDays(TODAY(), -30), TODAY(), 2).filter(x => x.studentId === studentId).length;
      if (level === 3) toast('3단계 기록 완료 · 보건실 점검·보호자 소통·Tier 3 전담팀 회의를 확인하세요');
      else if (s && +s.tier === 1 && level >= 2 && n30 >= 2) toast(`${s.name}: 30일 BIR ${n30}회 → CICO 선별 후보로 표시됩니다`);
      else toast('기록했습니다. 월례회의 Big 5에 자동 반영됩니다');
      return true;
    }
  });
}
ACTIONS['bir-del'] = t => { const id = t.dataset.v; confirmBox('이 행동사건 기록을 삭제할까요? 되돌릴 수 없습니다.', () => { Store.remove('bir', id); toast('삭제했습니다'); }); };
ACTIONS['bir-edit'] = t => { const r = DB.bir.find(x => x.id === t.dataset.v); if (r) openBir(JSON.parse(JSON.stringify(r))); };

function big5Range() {
  const today = TODAY(), mk = monthKey(today), y = SET().year;
  switch (UI.filters.big5Range) {
    case 'prev': { const [s, e] = monthRange(addMonths(mk, -1)); return [s, e, '지난 달']; }
    case 'sem1': return [`${y}-03-01`, `${y}-07-31`, '1학기'];
    case 'sem2': return [`${y}-08-01`, `${y + 1}-02-28`, '2학기'];
    case 'year': return [`${y}-03-01`, `${y + 1}-02-28`, '올해 전체'];
    default: { const [s, e] = monthRange(mk); return [s, e, '이번 달']; }
  }
}
SEG_HANDLERS.big5Range = v => { UI.filters.big5Range = v; rerender(); };
SEG_HANDLERS.big5Lv = v => { UI.filters.big5Lv = +v; rerender(); };
SEG_HANDLERS.big5Course = v => { UI.filters.big5Course = v; rerender(); };

function problemStatement(b) {
  if (!b.n) return '';
  const top = a => (a[0] || [])[0];
  const course = top(b.course), loc = top(b.loc), ctx = top(b.ctx), type = top(b.type), fn = top(b.func);
  const fg = (PLAN.bir.functions.find(f => f.v === fn) || {}).g;
  const why = !fn ? '기능 미상' : fg === '얻기' ? `${fn} 얻기` : fn;
  return `${course || '전'} 과정 학생들이 ${loc || '—'}에서 ${ctx || '—'} 중에 ${type || '문제행동'} 행동을 보이며, 이는 ${why} 기능으로 추정된다.`;
}

VIEWS.big5 = () => {
  const [from, to, rl] = big5Range(); const F = UI.filters;
  const flt = F.big5Course ? (b => (stuById(b.studentId) || {}).course === F.big5Course) : null;
  const lvMin = F.big5Lv === 3 ? 3 : F.big5Lv === 1 ? 1 : 2;
  const list = birIn(from, to, lvMin, flt);
  const b = big5(list); const pd = perDay(list, from, to);
  const mk = monthKey(TODAY());
  let prevPd = null;
  if (F.big5Range === 'month' || F.big5Range === 'prev') { const pm = addMonths(monthKey(from), -1); const [ps, pe] = monthRange(pm); prevPd = perDay(birIn(ps, pe, lvMin, flt), ps, pe); }
  const mb = monthlyBir(lvMin, flt);
  const calm = list.filter(x => (x.post || []).includes('심리안정실 이동·안정') || x.calmIn).length;
  const hours = [8, 9, 10, 11, 12, 13, 14, 15];
  const ps = problemStatement(b);
  return `
  <section class="sec-h"><div><div class="eyebrow">MO SW-PBS 데이터 기반 의사결정</div><h2>행동데이터 Big 5</h2><p>건수 · 유형 · 장소 · 시간 · 학생. 매월 3주 수요일 회의 2일 전 이 화면으로 브리핑합니다.</p></div>
    <button class="btn pri" data-act="new-bir">${ico('plus')}행동사건 기록</button></section>
  <div class="row no-print">${seg('big5Range', [{ v: 'month', l: '이번 달' }, { v: 'prev', l: '지난 달' }, { v: 'sem1', l: '1학기' }, { v: 'sem2', l: '2학기' }, { v: 'year', l: '전체' }], F.big5Range)}
    ${seg('big5Lv', [{ v: 2, l: '2·3단계' }, { v: 1, l: '경미 포함' }, { v: 3, l: '3단계만' }], F.big5Lv)}
    ${seg('big5Course', [{ v: '', l: '전 과정' }].concat(PLAN.courses.map(c => ({ v: c, l: c }))), F.big5Course)}</div>

  <section class="grid g4">
    <div class="card kpi acc"><span class="lab">(1) 하루 평균 발생</span><span class="val">${r1(pd)}<small>건/일</small></span>${prevPd != null ? deltaHtml(pd, prevPd, true) : `<span class="delta flat">${rl}</span>`}<span class="xs muted">${rl} 총 ${b.n}건 · 수업일 ${schoolDays(from, to > TODAY() ? TODAY() : to).length}일</span></div>
    <div class="card kpi tier3"><span class="lab">3단계 위기행동</span><span class="val">${list.filter(x => +x.level === 3).length}<small>건</small></span><span class="xs muted">심리안정실 이동 ${calm}건</span></div>
    <div class="card kpi"><span class="lab">관련 학생</span><span class="val">${b.stu.length}<small>명</small></span><span class="xs muted">상위 3명이 ${pct(sum(b.stu.slice(0, 3).map(x => x[1])), b.n)}% 차지</span></div>
    <div class="card kpi"><span class="lab">최다 장소</span><span class="val" style="font-size:20px;line-height:1.3">${esc((b.loc[0] || ['—'])[0])}</span><span class="xs muted">${b.loc[0] ? pct(b.loc[0][1], b.n) + '% 집중' : '기록 없음'}${b.loc[0] && b.loc[0][1] / b.n >= .3 ? ' · 보완교수 대상' : ''}</span></div>
  </section>

  <section class="card"><div class="card-h"><h3>월별 행동사건 추이</h3><span class="sub">목표: CICO 학생 BIR 50%↓, Tier 3 위기행동 70%↓</span></div>
    ${legend([['2단계 주요', 'var(--s4)', 1], ['3단계 위기', 'var(--s8)', 1]].concat(lvMin === 1 ? [['1단계 경미', 'var(--s3)', 1]] : []))}
    ${chart({ type: 'col', h: 220, labels: mb.map(x => fmtM(x.m)), tipLabels: mb.map(x => `${fmtM(x.m)} · 하루 ${r1(x.pd)}건`), series: (lvMin === 1 ? [{ name: '1단계', color: 'var(--s3)', values: mb.map(x => x.n - x.l2 - x.l3) }] : []).concat(lvMin <= 2 ? [{ name: '2단계', color: 'var(--s4)', values: mb.map(x => x.l2) }] : []).concat([{ name: '3단계', color: 'var(--s8)', values: mb.map(x => x.l3) }]) })}
  </section>

  <section class="grid g2">
    <div class="card"><div class="card-h"><h3>(2) 행동 유형 What</h3><span class="sub">${rl}</span></div>${hbars(b.type, { total: b.n })}</div>
    <div class="card"><div class="card-h"><h3>(3) 발생 장소 Where</h3><span class="sub">30% 이상이면 보완교수</span></div>${hbars(b.loc, { total: b.n, showPct: true })}</div>
    <div class="card"><div class="card-h"><h3>(4) 발생 시간 When</h3><span class="sub">시각대별 건수</span></div>
      ${chart({ type: 'col', h: 170, labels: hours.map(h => h + '시'), series: [{ name: '건수', color: 'var(--s1)', values: hours.map(h => b.hour[h] || 0) }] })}
      <div style="margin-top:8px">${hbars(b.ctx, { total: b.n, limit: 4 })}</div></div>
    <div class="card"><div class="card-h"><h3>(5) 다발 학생 Who</h3><span class="sub">Tier 연계 판단</span></div>
      ${b.stu.length ? `<div class="list">${b.stu.slice(0, 7).map(([id, n]) => { const s = stuById(id) || {}; const tr = +s.tier || 1; return `<div class="li"><span class="chip t${tr}"><span class="d"></span>T${tr}</span><div class="grow"><div class="t">${esc(s.name || '(삭제)')}</div><div class="s">${esc(s.cls || '')} · ${n}건</div></div>${tr === 1 && n >= 2 ? `<button class="btn sm" data-act="cico-enroll" data-v="${esc(id)}">CICO 선별</button>` : tr === 2 ? `<button class="btn sm" data-go="cico" data-sub="stu:${esc(id)}">DPR 보기</button>` : tr === 3 ? `<button class="btn sm" data-go="tier3" data-sub="stu:${esc(id)}">BIP</button>` : ''}</div>`; }).join('')}</div>` : '<div class="empty">기록 없음</div>'}</div>
  </section>

  <section class="grid g2">
    <div class="card"><div class="card-h"><h3>장소 × 활동 맥락</h3><span class="sub">진할수록 많이 발생</span></div><div style="overflow-x:auto">${heatmap(PLAN.bir.locations, PLAN.bir.contexts, (r, c) => list.filter(x => x.location === r && x.context === c).length, { colLabel: c => c.replace('·', '·​') })}</div></div>
    <div class="card"><div class="card-h"><h3>추정 기능 · 선행사건</h3><span class="sub">중재 방향 결정</span></div>${hbars(b.func, { total: b.n, limit: 5, color: 'var(--s7)', hiTop: false })}<div style="height:10px"></div>${hbars(b.ante, { total: b.n, limit: 4, color: 'var(--s3)', hiTop: false })}</div>
  </section>

  ${ps ? `<section class="card" style="border-color:var(--accent)"><div class="card-h"><h3>정밀 문제 진술 초안</h3><span class="sub">누가 + 어디서 + 언제 + 무엇을 + 왜</span></div><p style="font-size:16px;font-weight:600">${esc(ps)}</p><div class="row" style="margin-top:12px"><button class="btn pri" data-act="meeting-new">${ico('flag')}이 진술로 월례회의 해결계획 작성</button><button class="btn" data-act="copy-big5">${ico('copy')}Big 5 요약 복사</button></div></section>` : ''}

  <section class="card"><div class="card-h"><h3>최근 기록</h3><span class="sub">눌러서 수정</span></div>${birTable(list.slice().sort((a, b) => (b.date + (b.time || '')).localeCompare(a.date + (a.time || ''))).slice(0, 30))}</section>`;
};
function birTable(rows) {
  if (!rows.length) return `<div class="empty"><b>이 기간에 기록이 없습니다</b>오른쪽 아래 <b>기록</b> 버튼 → 행동사건(BIR)으로 3분 안에 입력하세요.</div>`;
  return `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>날짜</th><th>학생</th><th>단계</th><th>장소</th><th>유형</th><th>기능</th><th>보고</th></tr></thead><tbody>${rows.map(r => `<tr class="click" data-act="bir-edit" data-v="${esc(r.id)}"><td class="tab">${fmtD(r.date)} ${esc(r.time || '')}</td><td>${esc(stuName(r.studentId))}</td><td><span class="chip t${r.level}">${r.level}단계</span></td><td>${esc(r.location || '')}</td><td>${esc((r.types || []).join(', '))}</td><td>${esc((r.func || []).join(', '))}</td><td class="muted">${esc(r.by || '')}</td></tr>`).join('')}</tbody></table></div>`;
}
function big5Text(mk) {
  const [s, e] = monthRange(mk); const l = birIn(s, e, 2); const b = big5(l);
  const pm = addMonths(mk, -1); const [ps, pe] = monthRange(pm); const pl = birIn(ps, pe, 2);
  const pd = perDay(l, s, e), ppd = perDay(pl, ps, pe);
  const top2 = (a) => a.slice(0, 2).map((x, i) => `${i + 1}위 ${x[0]}(${pct(x[1], b.n)}%)`).join(' / ') || '없음';
  return `[${fmtM(mk)} Big 5 행동데이터 요약]\n(1) 일평균 발생 건수(BIR): 일평균 ${r1(pd)}건 (전월 대비 ${ppd ? Math.round((pd - ppd) / ppd * 100) + '%' : '—'} 증감), 총 ${b.n}건\n(2) 최다 행동 유형(What): ${top2(b.type)}\n(3) 최다 발생 장소(Where): ${top2(b.loc)}\n(4) 최다 발생 시간(When): ${top2(b.ctx)}\n(5) 다발 학생(Who): ${b.stu.slice(0, 3).map(x => `${stuName(x[0])}(${x[1]}건)`).join(', ') || '없음'}\n정밀 문제 진술(초안): ${problemStatement(b)}`;
}
ACTIONS['copy-big5'] = () => copyText(big5Text(monthKey(big5Range()[0])));
