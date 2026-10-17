/* ================================================================
   Tier 1 보편 예방 · Tier 2 CICO
   ================================================================ */
function classOptions(sel) {
  const cl = classList();
  return `<option value="">학급 선택</option>${cl.map(c => `<option ${c === sel ? 'selected' : ''}>${esc(c)}</option>`).join('')}<option value="__other">직접 입력…</option>`;
}
function readClass(b, sel, other) { const v = val(b, sel); return v === '__other' ? val(b, other) : v; }
function myClass() { const m = ME.get(); const st = m && DB.staff.find(s => s.name === m.name); return st && st.dept && classList().includes(st.dept) ? st.dept : ''; }

/* ---------- 칭찬 토큰 ---------- */
function openPraise() {
  let n = 0;
  openModal({
    title: '칭찬 토큰 기록', saveLabel: '기록하기',
    body: `<div class="form"><div class="f2"><div class="field"><label for="pr-cls">학급</label><select class="inp" id="pr-cls">${classOptions(myClass())}</select><input class="inp hidden" id="pr-cls2" placeholder="학급명"></div><div class="field"><label for="pr-date">날짜</label><input class="inp" type="date" id="pr-date" value="${TODAY()}"></div></div>
      <div class="field"><span class="flabel">오늘 배부한 ‘경은 칭찬 토큰’ 수</span>
        <div class="dpr-total" style="justify-content:space-between"><span class="big num" id="pr-n">0</span><div class="row">${[1, 5, 10].map(k => `<button type="button" class="btn big" data-pr="${k}">+${k}</button>`).join('')}<button type="button" class="btn big ghost" data-pr="-1">−1</button></div></div></div>
      <div class="field"><label for="pr-gold">그중 CICO 골드 토큰 <span class="hint">선택</span></label><input class="inp" type="number" min="0" id="pr-gold" value="0"></div>
      <div class="field"><label for="pr-memo">칭찬한 장면 한 줄 <span class="hint">소식지·우수 학급 선정에 활용</span></label><input class="inp" id="pr-memo" placeholder="예) 급식실 퇴식구에 식판을 스스로 넣음"></div>
      <p class="xs muted">구체적 행동 명칭 + 기대행동 연결: “${esc(PLAN.scripts.praise[Math.floor(Math.random() * PLAN.scripts.praise.length)])}”</p></div>`,
    onMount: b => {
      b.addEventListener('click', e => { const k = e.target.closest('[data-pr]'); if (!k) return; n = Math.max(0, n + +k.dataset.pr); $('#pr-n', b).textContent = n; });
      $('#pr-cls', b).addEventListener('change', e => $('#pr-cls2', b).classList.toggle('hidden', e.target.value !== '__other'));
    },
    onSave: b => {
      const cls = readClass(b, '#pr-cls', '#pr-cls2'); if (!cls) { toast('학급을 선택하세요'); return false; }
      if (!n) { toast('토큰 수를 눌러 입력하세요'); return false; }
      Store.save('praise', { date: val(b, '#pr-date') || TODAY(), cls, tokens: n, gold: num(b, '#pr-gold'), memo: val(b, '#pr-memo') });
      toast(`토큰 ${n}개 기록 · 이번 주 학교 전체 ${won(sum(DB.praise.filter(p => p.date >= weekStart(TODAY())).map(p => p.tokens)))}개`); return true;
    }
  });
}

/* ---------- 4:1 관찰 카운터 ---------- */
function openTally() {
  let p = 0, c = 0, left = 15 * 60, timer = null, running = false;
  const paint = () => {
    $('#t-p').textContent = p; $('#t-c').textContent = c;
    const ratio = c ? r1(p / c) : (p ? p : 0);
    $('#t-r').textContent = c ? `${ratio} : 1` : (p ? `${p} : 0` : '— : —');
    $('#t-r').style.color = (c ? p / c >= 4 : p > 0) ? 'var(--good)' : 'var(--ink)';
    $('#t-time').textContent = `${pad(Math.floor(left / 60))}:${pad(left % 60)}`;
  };
  openModal({
    title: '4:1 칭찬 관찰 (15분)', saveLabel: '관찰 결과 저장',
    body: `<div class="form"><div class="row between"><div><div class="eyebrow">남은 시간</div><div class="ratio-big num" id="t-time">15:00</div></div><div style="text-align:right"><div class="eyebrow">칭찬 : 교정</div><div class="ratio-big num" id="t-r">— : —</div></div></div>
      <div class="row"><button type="button" class="btn" id="t-start">${ico('clock')}타이머 시작</button><span class="xs muted">교사 자기관찰 또는 동료 상호관찰 (ETLP 3번 지표: 15분 4:1 유지)</span></div>
      <div class="tally"><button type="button" class="pr" id="t-pb"><span class="n num" id="t-p">0</span>구체적 칭찬 +1</button><button type="button" class="co" id="t-cb"><span class="n num" id="t-c">0</span>교정·지적 +1</button></div>
      <div class="row"><button type="button" class="btn sm ghost" id="t-undo">마지막 칭찬 취소</button><button type="button" class="btn sm ghost" id="t-undo2">마지막 교정 취소</button></div>
      <div class="f2"><div class="field"><label for="t-cls">학급·장소</label><select class="inp" id="t-cls">${classOptions(myClass())}</select><input class="inp hidden" id="t-cls2" placeholder="학급·장소"></div><div class="field"><label for="t-who">관찰 대상 교사</label><select class="inp" id="t-who">${staffOptions(ME.name(), null, '본인(자기관찰)')}</select></div></div>
      <div class="field"><label for="t-memo">메모</label><input class="inp" id="t-memo" placeholder="예) 전환 시간 교정이 몰림 → 시각 타이머 사전 예고"></div></div>`,
    onMount: b => {
      paint();
      $('#t-pb', b).onclick = () => { p++; paint(); }; $('#t-cb', b).onclick = () => { c++; paint(); };
      $('#t-undo', b).onclick = () => { p = Math.max(0, p - 1); paint(); }; $('#t-undo2', b).onclick = () => { c = Math.max(0, c - 1); paint(); };
      $('#t-cls', b).addEventListener('change', e => $('#t-cls2', b).classList.toggle('hidden', e.target.value !== '__other'));
      $('#t-start', b).onclick = e => {
        running = !running; e.currentTarget.innerHTML = running ? `${ico('clock')}일시정지` : `${ico('clock')}이어서 시작`;
        clearInterval(timer); if (running) timer = setInterval(() => { if (!$('#t-time')) { clearInterval(timer); return; } left = Math.max(0, left - 1); paint(); if (!left) { clearInterval(timer); running = false; toast('15분 관찰 종료 — 결과를 저장하세요'); } }, 1000);
      };
    },
    onClose: () => clearInterval(timer),
    onSave: b => {
      clearInterval(timer);
      if (!p && !c) { toast('칭찬 또는 교정을 한 번 이상 기록하세요'); return false; }
      const minutes = Math.max(1, Math.round((15 * 60 - left) / 60)) || 15;
      Store.save('obs', { date: TODAY(), cls: readClass(b, '#t-cls', '#t-cls2'), target: val(b, '#t-who') || ME.name(), praise: p, correct: c, minutes: left === 15 * 60 ? 15 : minutes, ratio: c ? r1(p / c) : p, memo: val(b, '#t-memo') });
      toast(c && p / c >= 4 ? `4:1 달성 (${r1(p / c)}:1) — 멋집니다!` : '저장했습니다. 다음 관찰에서 칭찬을 한 번 더!'); return true;
    }
  });
}

/* ---------- 직접교수·보완교수 ---------- */
function openTeach(rec) {
  const r = rec || { date: TODAY(), round: +TODAY().slice(5, 7) >= 8 ? '2학기 배움주간' : '1학기 배움주간', spaces: [] };
  openModal({
    title: '직접교수 · 보완교수 기록',
    body: `<div class="form"><div class="field"><span class="flabel">구분</span>${choices('round', ['1학기 배움주간', '2학기 배움주간', '보완교수(Booster)', '행사 전 사전교수'], r.round)}</div>
      <div class="f2"><div class="field"><label for="te-cls">학급</label><select class="inp" id="te-cls">${classOptions(r.cls || myClass())}</select><input class="inp hidden" id="te-cls2" placeholder="학급명"></div><div class="field"><label for="te-date">날짜</label><input class="inp" type="date" id="te-date" value="${esc(r.date)}"></div></div>
      <div class="field"><span class="flabel">교수한 공간 <span class="hint">4단계: 도입 → 시범 → 연습 → 피드백</span></span>${choices('spaces', PLAN.matrix.map(m => m.space), r.spaces, { multi: true })}</div>
      <div class="field"><label for="te-memo">메모</label><input class="inp" id="te-memo" value="${esc(r.memo || '')}" placeholder="예) 급식 대기선 연습 3회, 토큰 100% 지급"></div></div>`,
    onMount: b => $('#te-cls', b).addEventListener('change', e => $('#te-cls2', b).classList.toggle('hidden', e.target.value !== '__other')),
    onSave: b => {
      const cls = readClass(b, '#te-cls', '#te-cls2'), spaces = readChoice(b, 'spaces');
      if (!cls) { toast('학급을 선택하세요'); return false; } if (!spaces.length) { toast('교수한 공간을 하나 이상 고르세요'); return false; }
      Store.save('teach', Object.assign({}, r, { round: readChoice(b, 'round'), cls, date: val(b, '#te-date'), spaces, memo: val(b, '#te-memo') }));
      toast('직접교수 이행을 기록했습니다'); return true;
    }
  });
}
function openMarket(rec) {
  const r = rec || { date: TODAY() };
  openModal({
    title: '경은마트·마루 토큰마켓 운영대장',
    body: `<div class="form"><div class="f2"><div class="field"><label for="mk-date">운영일 (금요일)</label><input class="inp" type="date" id="mk-date" value="${esc(r.date)}"></div><div class="field"><label for="mk-p">참여 학생 수</label><input class="inp" type="number" min="0" id="mk-p" value="${esc(r.participants ?? '')}"></div></div>
      <div class="f2"><div class="field"><label for="mk-t">교환된 토큰 수</label><input class="inp" type="number" min="0" id="mk-t" value="${esc(r.tokens ?? '')}"></div><div class="field"><label for="mk-g">CICO 골드 토큰·바우처</label><input class="inp" type="number" min="0" id="mk-g" value="${esc(r.gold ?? '')}"></div></div>
      <div class="field"><label for="mk-m">인기 품목·특이사항</label><input class="inp" id="mk-m" value="${esc(r.memo || '')}" placeholder="예) 경은마루 음료 쿠폰, 문구류 품절"></div></div>`,
    onSave: b => { Store.save('market', Object.assign({}, r, { date: val(b, '#mk-date'), participants: num(b, '#mk-p'), tokens: num(b, '#mk-t'), gold: num(b, '#mk-g'), memo: val(b, '#mk-m') })); toast('토큰마켓 운영대장 저장'); return true; }
  });
}

SEG_HANDLERS.tier1 = v => { UI.sub.tier1 = v; rerender(); };
VIEWS.tier1 = () => {
  const sub = UI.sub.tier1 || 'matrix'; const today = TODAY(); const mk = monthKey(today);
  const tokM = sum(DB.praise.filter(p => monthKey(p.date) === mk).map(p => p.tokens));
  const obsR = DB.obs.filter(o => o.date >= addDays(today, -60));
  const ratio = obsR.length ? r1(sum(obsR.map(o => o.praise)) / Math.max(1, sum(obsR.map(o => o.correct)))) : null;
  const sem = +today.slice(5, 7) >= 8 ? '2학기 배움주간' : '1학기 배움주간';
  const tc = teachCoverage(sem);
  const mkt = DB.market.filter(m => monthKey(m.date) === mk);
  const head = `<section class="sec-h"><div><div class="eyebrow">MO SW-PBS 핵심요소 3·4·5 · 전교생 100%</div><h2>Tier 1 보편적 예방</h2><p>3대 기대행동 × 6대 공간 매트릭스, 직접교수, 4:1 칭찬과 토큰마켓을 한곳에서 관리합니다.</p></div>
    <div class="row"><button class="btn" data-act="new-tally">${ico('clock')}4:1 관찰</button><button class="btn pri" data-act="new-praise">${ico('coin')}토큰 기록</button></div></section>
  <section class="grid g4">
    <div class="card kpi tier1"><span class="lab">이번 달 칭찬 토큰</span><span class="val">${won(tokM)}<small>개</small></span><span class="xs muted">기록 ${DB.praise.filter(p => monthKey(p.date) === mk).length}건</span></div>
    <div class="card kpi tier1"><span class="lab">칭찬 : 교정 (최근 60일)</span><span class="val">${ratio == null ? '—' : ratio}<small>: 1</small></span><span class="delta ${ratio >= 4 ? 'up-good' : 'flat'}">목표 4 : 1 · 관찰 ${obsR.length}회</span></div>
    <div class="card kpi tier1"><span class="lab">${sem} 직접교수 이행</span><span class="val">${tc.pct}<small>%</small></span><div class="meter ${tc.pct >= 90 ? 'good' : 't1'}"><i style="width:${tc.pct}%"></i></div><span class="xs muted">목표 90% · ${tc.done}/${tc.total} 학급·공간</span></div>
    <div class="card kpi tier1"><span class="lab">이번 달 토큰마켓</span><span class="val">${sum(mkt.map(m => m.participants))}<small>명</small></span><span class="xs muted">${mkt.length}회 운영 · 교환 ${won(sum(mkt.map(m => m.tokens)))}개</span></div>
  </section>
  <div class="tabs" role="tablist">${[['matrix', '매트릭스·사전교정'], ['praise', '칭찬·4:1'], ['teach', '직접교수'], ['market', '토큰마켓']].map(([k, l]) => `<button class="${sub === k ? 'on' : ''}" data-act="tab-t1" data-v="${k}">${l}</button>`).join('')}</div>`;
  let body = '';
  if (sub === 'matrix') body = tier1Matrix();
  if (sub === 'praise') body = tier1Praise();
  if (sub === 'teach') body = tier1Teach(sem, tc);
  if (sub === 'market') body = tier1Market();
  return head + body;
};
ACTIONS['tab-t1'] = t => { UI.sub.tier1 = t.dataset.v; rerender(); };
function teachCoverage(round) {
  const cls = classList(); const total = cls.length * PLAN.matrix.length;
  const done = new Set(); DB.teach.filter(t => t.round === round).forEach(t => (t.spaces || []).forEach(s => done.add(t.cls + '|' + s)));
  return { total, done: done.size, pct: total ? Math.min(100, pct(done.size, total)) : 0, set: done };
}
function tier1Matrix() {
  const today = TODAY(); const di = schoolDays(`${SET().year}-03-02`, today).length;
  const e = PLAN.expectations[di % 3]; const sp = PLAN.matrix[Math.floor(di / 5) % PLAN.matrix.length];
  return `<section class="card" style="border-color:var(--t1)"><div class="card-h"><h3>오늘의 중점 기대행동 · 아침 조회 5분 사전교정</h3><span class="sub">${fmtD(today)} · 날마다 자동 순환</span></div>
    <div class="row" style="gap:18px;align-items:flex-start"><div style="min-width:160px"><div class="eyebrow">${esc(e.en)}</div><div style="font-family:var(--f-display);font-size:26px;font-weight:700">${esc(e.full)}</div><div class="small muted">이번 주 집중 공간: ${esc(sp.space)}</div></div>
    <div class="grow" style="flex:1;min-width:220px"><ul style="margin:0;padding-left:18px;font-size:16px;line-height:1.8">${sp.b[PLAN.expectations.indexOf(e)].map(x => `<li>${esc(x)}</li>`).join('')}</ul><p class="small ink2" style="margin-top:6px">교직원 수칙: ${esc(sp.staff.join(' · '))}</p></div></div></section>
  <section class="card"><div class="card-h"><h3>[표 6] 3대 기대행동 × 6대 공간 행동 매트릭스</h3><span class="sub">전교 공통 · AAC·실물사진 포스터로 게시</span></div>
    <div class="mx"><div class="mh">공간</div>${PLAN.expectations.map((x, i) => `<div class="mh e${i + 1}">${i + 1}. ${esc(x.full)}<br><span class="muted xs">${esc(x.en)}</span></div>`).join('')}<div class="mh">교직원·지원인력 수칙</div>
    ${PLAN.matrix.map(m => `<div class="sp">${esc(m.space)}<br><span class="xs muted" style="font-weight:400">${esc(m.note)}</span></div>${m.b.map((bb, i) => `<div><span class="xs muted" style="display:none">${esc(PLAN.expectations[i].label)}</span><ul>${bb.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}<div><ul>${m.staff.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div></section>
  <section class="card"><div class="card-h"><h3>[표 7] 의사소통군별 다중양식 지원</h3><span class="sub">학생 명단의 의사소통군과 연결</span></div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>의사소통군</th><th>기대행동 단서</th><th>학생 표현 방식</th><th>강화·CICO 적용</th><th class="r">학생 수</th></tr></thead><tbody>${PLAN.commGroups.map(g => `<tr><td><b>${esc(g.name)}</b><br><span class="xs muted">${esc(g.who)}</span></td><td>${esc(g.cue)}</td><td>${esc(g.express)}</td><td>${esc(g.cico)}</td><td class="r num">${DB.students.filter(s => s.comm === g.key).length}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function tier1Praise() {
  const wk = weekStart(TODAY()); const weeks = Array.from({ length: 12 }, (_, i) => addDays(wk, -7 * (11 - i)));
  const mk = monthKey(TODAY());
  const byCls = sortedEntries(DB.praise.filter(p => monthKey(p.date) === mk).reduce((m, p) => { m[p.cls] = (m[p.cls] || 0) + (+p.tokens || 0); return m; }, {}));
  const obs = DB.obs.slice().sort((a, b) => a.date < b.date ? -1 : 1);
  const obsM = groupBy(obs, o => monthKey(o.date)); const om = Object.keys(obsM).sort();
  return `<section class="grid g2">
    <div class="card"><div class="card-h"><h3>주간 칭찬 토큰 배부</h3><span class="sub">최근 12주</span></div>${chart({ type: 'col', h: 200, labels: weeks.map(fmtDs), tipLabels: weeks.map(w => `${fmtDs(w)} 주`), series: [{ name: '토큰', color: 'var(--t1)', values: weeks.map(w => sum(DB.praise.filter(p => weekStart(p.date) === w).map(p => p.tokens))) }] })}</div>
    <div class="card"><div class="card-h"><h3>칭찬 : 교정 비율 (월 평균)</h3><span class="sub">점선 = 4 : 1 목표</span></div>${chart({ type: 'line', h: 200, labels: om.map(fmtM), goal: 4, goalLabel: '4:1', yFmt: v => r1(v) + '', series: [{ name: '칭찬/교정', color: 'var(--t1)', values: om.map(m => r1(sum(obsM[m].map(o => o.praise)) / Math.max(1, sum(obsM[m].map(o => o.correct))))) }] })}</div>
    <div class="card"><div class="card-h"><h3>이번 달 학급별 토큰</h3><span class="sub">우수 실천 학급 후보</span></div>${hbars(byCls, { limit: 10, color: 'var(--t1)', hiTop: false, empty: '이번 달 토큰 기록이 없습니다' })}</div>
    <div class="card"><div class="card-h"><h3>최근 4:1 관찰</h3><button class="btn sm" data-act="new-tally">관찰 시작</button></div>${obs.length ? `<div class="list">${obs.slice(-6).reverse().map(o => `<div class="li"><span class="chip ${o.correct && o.praise / o.correct >= 4 ? 'good' : 'warn'}">${o.correct ? r1(o.praise / o.correct) : o.praise}:1</span><div class="grow"><div class="t">${esc(o.target || '')} · ${esc(o.cls || '')}</div><div class="s">${fmtD(o.date)} · 칭찬 ${o.praise} / 교정 ${o.correct} · ${o.minutes || 15}분 ${o.memo ? '· ' + esc(o.memo) : ''}</div></div></div>`).join('')}</div>` : '<div class="empty"><b>관찰 기록 없음</b>15분 타이머로 동료와 상호 관찰해 보세요.</div>'}</div>
  </section>`;
}
function tier1Teach(sem, tc) {
  const cls = classList(); const boost = DB.teach.filter(t => t.round !== '1학기 배움주간' && t.round !== '2학기 배움주간').sort((a, b) => b.date.localeCompare(a.date));
  return `<section class="card"><div class="card-h"><h3>${sem} 학급 × 공간 직접교수 현황</h3><div class="row"><span class="sub">✓ = 4단계 교수 완료</span><button class="btn sm pri" data-act="new-teach">${ico('plus')}기록</button></div></div>
    ${cls.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>학급</th>${PLAN.matrix.map(m => `<th>${esc(m.space.split(' ')[0])}</th>`).join('')}<th class="r">이행</th></tr></thead><tbody>${cls.map(c => { const n = PLAN.matrix.filter(m => tc.set.has(c + '|' + m.space)).length; return `<tr><td><b>${esc(c)}</b></td>${PLAN.matrix.map(m => `<td style="text-align:center">${tc.set.has(c + '|' + m.space) ? `<span style="color:var(--good);font-weight:800">✓</span>` : '<span class="muted">·</span>'}</td>`).join('')}<td class="r num"><span class="chip ${n === 6 ? 'good' : n >= 3 ? 'warn' : 'bad'}">${n}/6</span></td></tr>`; }).join('')}</tbody></table></div>` : '<div class="empty">학생 명단을 등록하면 학급 목록이 생깁니다 (설정 → 명단)</div>'}
  </section>
  <section class="card"><div class="card-h"><h3>보완교수(Booster) · 행사 전 사전교수</h3><span class="sub">매월 넷째 주 월요일 · Big 5 다발 구역</span></div>
    ${boost.length ? `<div class="list">${boost.slice(0, 10).map(t => `<div class="li"><span class="chip t1">${esc(t.round.replace('(Booster)', ''))}</span><div class="grow"><div class="t">${esc(t.cls)} · ${esc((t.spaces || []).join(', '))}</div><div class="s">${fmtD(t.date)} ${t.memo ? '· ' + esc(t.memo) : ''} · ${esc(t.by || '')}</div></div></div>`).join('')}</div>` : '<div class="empty">보완교수 기록이 없습니다</div>'}
  </section>`;
}
function tier1Market() {
  const rows = DB.market.slice().sort((a, b) => a.date.localeCompare(b.date));
  return `<section class="card"><div class="card-h"><h3>토큰마켓 참여 추이</h3><button class="btn sm pri" data-act="new-market">${ico('plus')}운영대장 기록</button></div>
    ${chart({ type: 'col', h: 200, labels: rows.slice(-16).map(r => fmtDs(r.date)), series: [{ name: '참여 학생', color: 'var(--t1)', values: rows.slice(-16).map(r => r.participants) }] })}</section>
  <section class="card"><div class="card-h"><h3>운영대장</h3><span class="sub">매주 금요일 오전 · 전공과 직업훈련실</span></div>
    ${rows.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>날짜</th><th class="r">참여</th><th class="r">토큰</th><th class="r">골드·바우처</th><th>메모</th></tr></thead><tbody>${rows.slice().reverse().slice(0, 20).map(r => `<tr class="click" data-act="market-edit" data-v="${esc(r.id)}"><td>${fmtD(r.date)}</td><td class="r num">${r.participants}</td><td class="r num">${won(r.tokens)}</td><td class="r num">${r.gold || 0}</td><td>${esc(r.memo || '')}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">운영 기록이 없습니다</div>'}</section>`;
}
ACTIONS['market-edit'] = t => { const r = DB.market.find(x => x.id === t.dataset.v); if (r) openMarket(Object.assign({}, r)); };

/* ================================================================
   Tier 2 CICO
   ================================================================ */
function dprEditor(sid, date) {
  const ex = DB.dpr.find(d => d.studentId === sid && d.date === date);
  const r = ex || { sc: PLAN.periods.map(() => [null, null, null]), acts: PLAN.periodActs.slice(), ci: false, co: false, token: false, parent: false, memo: '' };
  const s = stuById(sid) || {};
  return `<div class="stack" data-dpr="${esc(sid)}" data-date="${esc(date)}" data-id="${esc(ex ? ex.id : '')}">
    <div class="row between"><div><b style="font-size:17px">${esc(s.name || '')}</b> <span class="muted small">${esc(s.cls || '')} · 멘토 ${esc(s.mentor || '미지정')}</span></div><span class="chip t2">${fmtD(date)}</span></div>
    <label class="check"><input type="checkbox" class="d-ci" ${r.ci ? 'checked' : ''}> 아침 체크인 완료 (08:50~09:10 · 인사·컨디션·목표 다짐)</label>
    <div class="dpr" role="group" aria-label="교시별 점수"><div class="h">교시 <span class="xs muted">(눌러 결측)</span></div>${PLAN.expectations.map(e => `<div class="h">${esc(e.label)}</div>`).join('')}
    ${PLAN.periods.map((p, i) => { const sc = r.sc[i]; const abs = sc === null; return `<div class="p ${abs ? 'abs' : ''}" data-pi="${i}"><b role="button" tabindex="0" data-act="dpr-abs" data-v="${i}">${p}${abs ? ' · 결측' : ''}</b><input aria-label="${p} 활동" value="${esc((r.acts || [])[i] || PLAN.periodActs[i])}" class="d-act"></div>${PLAN.expectations.map((e, j) => `<div class="sc" data-i="${i}" data-j="${j}">${[0, 1, 2].map(v => `<button type="button" class="v${v} ${sc && sc[j] === v ? 'on' : ''}" aria-label="${p} ${e.label} ${v}점">${v}</button>`).join('')}</div>`).join('')}`; }).join('')}</div>
    <div class="dpr-total"><div><div class="eyebrow">당일 총점</div><span class="big num d-tot">0</span><span class="muted"> / <span class="d-max">36</span>점</span></div>${'<span class="d-ring"></span>'}<div class="stack" style="gap:2px;flex:1;min-width:160px"><b class="d-msg">점수를 눌러 입력하세요</b><span class="xs muted">목표: ${PLAN.cicoGoal}% (36점 기준 29점) 이상 → 칭찬토큰 1.5배</span></div></div>
    <div class="f2"><label class="check"><input type="checkbox" class="d-co" ${r.co ? 'checked' : ''}> 하교 체크아웃 완료</label><label class="check"><input type="checkbox" class="d-tok" ${r.token ? 'checked' : ''}> 토큰 1.5배 지급</label><label class="check"><input type="checkbox" class="d-par" ${r.parent ? 'checked' : ''}> 가정 알림장 보호자 서명</label></div>
    <div class="field"><label>멘토 칭찬 한마디</label><input class="inp d-memo" value="${esc(r.memo || '')}" placeholder="예) 3교시 체육에서 차례를 끝까지 기다렸어요!"></div>
  </div>`;
}
function bindDpr(root) {
  const box = root.querySelector('[data-dpr]'); if (!box) return;
  const upd = () => {
    const sc = readDprScores(box); const c = dprCalc(sc);
    $('.d-tot', box).textContent = c.total; $('.d-max', box).textContent = c.max;
    $('.d-ring', box).innerHTML = ring(c.pct || 0, 58, c.pct >= PLAN.cicoGoal ? 'var(--good)' : 'var(--t2)');
    const m = $('.d-msg', box);
    m.textContent = c.pct == null ? '점수를 눌러 입력하세요' : c.pct >= PLAN.cicoGoal ? `목표 달성! (${c.pct}%) 토큰 1.5배 지급` : `${c.pct}% — 노력 요망. 잘한 교시를 찾아 칭찬해 주세요`;
    if (c.pct >= PLAN.cicoGoal) $('.d-tok', box).checked = true;
  };
  box.addEventListener('change', upd); upd();
}
function readDprScores(box) {
  return PLAN.periods.map((p, i) => {
    const cell = box.querySelector(`.p[data-pi="${i}"]`); if (cell && cell.classList.contains('abs')) return null;
    const row = [0, 1, 2].map(j => { const on = box.querySelector(`.sc[data-i="${i}"][data-j="${j}"] button.on`); return on ? +on.textContent : null; });
    return row.every(v => v == null) ? null : row;
  });
}
function saveDpr(root) {
  const box = root.querySelector('[data-dpr]'); const sc = readDprScores(box); const c = dprCalc(sc);
  const ci = $('.d-ci', box).checked;
  if (c.max === 0 && !ci) { toast('점수를 한 칸 이상 입력하거나 체크인을 표시하세요'); return null; }
  const rec = { id: box.dataset.id || undefined, studentId: box.dataset.dpr, date: box.dataset.date, sc, acts: $$('.d-act', box).map(i => i.value.trim()), ci, co: $('.d-co', box).checked, token: $('.d-tok', box).checked, parent: $('.d-par', box).checked, memo: $('.d-memo', box).value.trim(), total: c.total, max: c.max, pct: c.pct };
  if (!rec.id) delete rec.id;
  Store.save('dpr', rec);
  return rec;
}
ACTIONS['dpr-abs'] = t => { const cell = t.closest('.p'); cell.classList.toggle('abs'); t.textContent = PLAN.periods[+t.dataset.v] + (cell.classList.contains('abs') ? ' · 결측' : ''); const i = +t.dataset.v; if (cell.classList.contains('abs')) $$(`.sc[data-i="${i}"] button`, cell.parentElement).forEach(b => b.classList.remove('on')); cell.closest('[data-dpr]').dispatchEvent(new Event('change')); };

function openDpr(sid, date) {
  const L = cicoStudents();
  if (!L.length) { toast('CICO 참여 학생이 없습니다. CICO → 선별에서 등록하세요'); go('cico', 'screen'); return; }
  const me = ME.name();
  sid = sid || (L.find(s => s.mentor === me) || L[0]).id; date = date || TODAY();
  const body = () => `<div class="stack"><div class="row"><select class="inp" id="dp-stu" style="max-width:280px">${stuOptions(sid, L, 'CICO 학생')}</select><input class="inp" type="date" id="dp-date" value="${date}" style="max-width:180px"></div><div id="dp-ed">${dprEditor(sid, date)}</div></div>`;
  openModal({
    title: 'CICO 일일 행동점검표 (DPR)', wide: true, body: body(),
    foot: `<button class="btn" data-act="modal-close">닫기</button><button class="btn" data-act="dpr-save-next">저장 후 다음 학생</button><button class="btn pri" data-act="modal-save">저장</button>`,
    onMount: b => {
      bindDpr(b);
      const reload = () => { sid = val(b, '#dp-stu'); date = val(b, '#dp-date') || TODAY(); $('#dp-ed', b).innerHTML = dprEditor(sid, date); bindDpr(b); };
      $('#dp-stu', b).addEventListener('change', reload); $('#dp-date', b).addEventListener('change', reload);
    },
    onSave: b => { const r = saveDpr(b); if (!r) return false; toast(r.pct >= PLAN.cicoGoal ? `${stuName(r.studentId)} ${r.pct}% 목표 달성 — 토큰 1.5배!` : `${stuName(r.studentId)} ${r.pct ?? 0}% 저장`); return true; }
  });
}
ACTIONS['dpr-save-next'] = () => {
  const b = $('#sheet-b'); const r = saveDpr(b); if (!r) return;
  const L = cicoStudents(); const i = L.findIndex(s => s.id === r.studentId); const nx = L[(i + 1) % L.length];
  toast(`${stuName(r.studentId)} 저장 · 다음: ${nx.name}`);
  $('#dp-stu', b).value = nx.id; $('#dp-stu', b).dispatchEvent(new Event('change'));
};

function cicoBirDrop(s) {
  if (!s.cicoStart) return null;
  const before = birIn(addDays(s.cicoStart, -28), addDays(s.cicoStart, -1), 2).filter(b => b.studentId === s.id).length;
  const after = birIn(addDays(TODAY(), -27), TODAY(), 2).filter(b => b.studentId === s.id).length;
  if (!before) return null; return { before, after, drop: Math.round((1 - after / before) * 100) };
}

VIEWS.cico = () => {
  const sub = UI.sub.cico || 'roster';
  const L = cicoStudents(); const today = TODAY();
  const stats = L.map(s => ({ s, st: cicoStats(s.id) }));
  const entered = L.filter(s => DB.dpr.some(d => d.studentId === s.id && d.date === today)).length;
  const wkAvg = avg(stats.map(x => (x.st.cur || x.st.last || {}).avg));
  const grads = DB.students.filter(s => ['자기관리', '졸업'].includes(s.cicoStatus)).length;
  const head = `<section class="sec-h"><div><div class="eyebrow">Tier 2 표적지원 · 전교생 5%</div><h2>CICO 등하교 체크인·체크아웃</h2><p>체크인 → 교시별 DPR → 체크아웃 → 금요일 주간 분석. 목표 ${PLAN.cicoGoal}% · ${PLAN.cicoGradWeeks}주 연속 달성 시 자기관리 전환.</p></div>
    <button class="btn pri" data-act="new-dpr">${ico('check')}DPR 입력</button></section>
  <section class="grid g4">
    <div class="card kpi tier2"><span class="lab">참여 학생</span><span class="val">${L.length}<small>/ ${SET().cicoTarget}명</small></span><span class="xs muted">자기관리·졸업 ${grads}명</span></div>
    <div class="card kpi tier2"><span class="lab">이번 주 평균 달성률</span><span class="val">${wkAvg == null ? '—' : Math.round(wkAvg)}<small>%</small></span><div class="meter t2"><i style="width:${clamp(wkAvg || 0, 0, 100)}%"></i></div></div>
    <div class="card kpi tier2"><span class="lab">오늘 DPR 입력</span><span class="val">${entered}<small>/ ${L.length}</small></span><span class="xs muted">${isSchoolDay(today) ? '수업일' : '휴업일'}</span></div>
    <div class="card kpi tier2"><span class="lab">목표 달성 학생</span><span class="val">${stats.filter(x => (x.st.cur || x.st.last || {}).avg >= PLAN.cicoGoal).length}<small>명</small></span><span class="xs muted">목표: 참여 학생의 80% 이상</span></div>
  </section>
  <div class="tabs">${[['roster', '참여 학생'], ['dpr', '오늘 DPR'], ['screen', '선별·등록'], ['weekly', '금요일 주간 분석']].map(([k, l]) => `<button class="${sub === k || (sub === 'stu' && k === 'roster') ? 'on' : ''}" data-act="tab-cico" data-v="${k}">${l}</button>`).join('')}</div>`;
  if (sub === 'stu' && UI.cicoSel) return head + cicoDetail(UI.cicoSel);
  if (sub === 'dpr') return head + cicoToday(L);
  if (sub === 'screen') return head + cicoScreen();
  if (sub === 'weekly') return head + cicoWeekly(L);
  return head + cicoRoster(stats);
};
ACTIONS['tab-cico'] = t => { UI.sub.cico = t.dataset.v; rerender(); };
function cicoRoster(stats) {
  if (!stats.length) return `<div class="empty"><b>CICO 참여 학생이 없습니다</b>선별·등록 탭에서 Big 5 기반 후보를 확인하고 등록하세요.<br><br><button class="btn pri" data-act="tab-cico" data-v="screen">선별·등록으로</button></div>`;
  const allW = Array.from(new Set(stats.flatMap(x => x.st.wk.map(w => w.w)))).sort().slice(-16);
  return `<section class="card"><div class="card-h"><h3>CICO 전체 주간 평균 달성률</h3><span class="sub">점선 = 목표 ${PLAN.cicoGoal}%</span></div>
    ${chart({ type: 'line', h: 200, labels: allW.map(fmtDs), tipLabels: allW.map(w => fmtDs(w) + ' 주'), goal: PLAN.cicoGoal, goalLabel: '목표 80%', yMax: 100, yFmt: v => Math.round(v) + '%', series: [{ name: '평균', color: 'var(--t2)', values: allW.map(w => { const v = avg(stats.map(x => (x.st.wk.find(k => k.w === w) || {}).avg)); return v == null ? null : Math.round(v); }) }] })}</section>
  <section class="grid g-auto">${stats.map(({ s, st }) => { const dc = cicoDecision(st, s); const w = st.cur || st.last; return `<div class="card stu" data-go="cico" data-sub="stu:${esc(s.id)}" role="button" tabindex="0">
    <div class="row between"><div><div class="nm">${esc(s.name)}</div><div class="small muted">${esc(s.cls || '')} · 멘토 ${esc(s.mentor || '미지정')}</div></div><span class="chip ${dc.lv === 'bad' ? 'bad' : dc.lv === 'warn' ? 'warn' : 'good'}">${esc(dc.t)}</span></div>
    <div class="row between"><div><span style="font-size:26px;font-weight:800" class="num">${w ? w.avg : '—'}</span><span class="muted">%</span> <span class="xs muted">${st.cur ? '이번 주' : '지난주'}</span></div><div class="xs muted" style="text-align:right">연속 달성 ${st.streak}주<br>오늘 ${st.today ? `${st.today.pct}%` : '미입력'}</div></div>
    <div>${chart({ type: 'spark', h: 36, values: st.rows.slice(-20).map(r => r.pct), goal: PLAN.cicoGoal, yMax: 100, color: 'var(--t2)' })}</div>
    <div class="xs muted">${esc(dc.why)}</div></div>`; }).join('')}</section>`;
}
function cicoToday(L) {
  const today = TODAY();
  return `<section class="card"><div class="card-h"><h3>${fmtD(today)} DPR 현황</h3><span class="sub">학생을 눌러 바로 입력</span></div>
  <div class="tbl-wrap"><table class="tbl"><thead><tr><th>학생</th><th>멘토</th><th>체크인</th><th class="r">점수</th><th class="r">달성률</th><th>체크아웃</th><th>토큰</th><th></th></tr></thead><tbody>${L.map(s => { const d = DB.dpr.find(x => x.studentId === s.id && x.date === today); return `<tr><td><b>${esc(s.name)}</b> <span class="muted xs">${esc(s.cls || '')}</span>${s.cicoStatus === '자기관리' ? ' <span class="chip">자기관리</span>' : ''}</td><td>${esc(s.mentor || '')}</td><td>${d && d.ci ? '✓' : '<span class="muted">—</span>'}</td><td class="r num">${d ? `${d.total}/${d.max}` : '—'}</td><td class="r num">${d && d.pct != null ? `<span class="chip ${d.pct >= PLAN.cicoGoal ? 'good' : 'warn'}">${d.pct}%</span>` : '—'}</td><td>${d && d.co ? '✓' : '<span class="muted">—</span>'}</td><td>${d && d.token ? '✓' : ''}</td><td><button class="btn sm ${d ? '' : 'pri'}" data-act="dpr-open" data-v="${esc(s.id)}">${d ? '수정' : '입력'}</button></td></tr>`; }).join('')}</tbody></table></div></section>
  <section class="card"><div class="card-h"><h3>멘토 스크립트</h3><span class="sub">따뜻한 3~5분</span></div><div class="grid g2"><div><b>아침 체크인</b><ul>${PLAN.scripts.checkin.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div><div><b>하교 체크아웃</b><ul>${PLAN.scripts.checkout.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></div></section>`;
}
ACTIONS['dpr-open'] = t => openDpr(t.dataset.v);
function cicoDetail(sid) {
  const s = stuById(sid); if (!s) return '<div class="empty">학생을 찾을 수 없습니다</div>';
  const st = cicoStats(sid); const dc = cicoDecision(st, s); const bd = cicoBirDrop(s);
  const rows = st.rows.slice(-40);
  const weakP = st.byPeriod.map((v, i) => [i, v]).filter(x => x[1] != null).sort((a, b) => a[1] - b[1])[0];
  const weakE = st.byExp.map((v, i) => [i, v]).filter(x => x[1] != null).sort((a, b) => a[1] - b[1])[0];
  return `<section class="card"><div class="row between"><div class="row"><button class="btn sm ghost" data-act="tab-cico" data-v="roster">← 목록</button><div><h2 style="font-family:var(--f-display);font-size:22px">${esc(s.name)}</h2><div class="small muted">${esc(s.cls || '')} · ${esc(s.comm || '')} · 멘토 <b>${esc(s.mentor || '미지정')}</b> · 시작 ${s.cicoStart ? fmtD(s.cicoStart) : '—'} · 보호자 동의 ${s.consent ? '✓' : '미확인'}</div></div></div>
    <div class="row"><button class="btn" data-act="cico-edit" data-v="${esc(sid)}">${ico('edit')}상태·멘토</button><button class="btn" data-act="copy-dpr-home" data-v="${esc(sid)}">${ico('copy')}가정 알림 문구</button><button class="btn pri" data-act="dpr-open" data-v="${esc(sid)}">DPR 입력</button></div></div></section>
  <section class="grid g4">
    <div class="card kpi tier2"><span class="lab">최근 10일 평균</span><span class="val">${st.recentAvg == null ? '—' : Math.round(st.recentAvg)}<small>%</small></span></div>
    <div class="card kpi tier2"><span class="lab">목표 달성일 비율</span><span class="val">${st.metRate ?? '—'}<small>%</small></span><span class="xs muted">${st.rows.length}일 기록</span></div>
    <div class="card kpi tier2"><span class="lab">연속 달성 주</span><span class="val">${st.streak}<small>/ ${PLAN.cicoGradWeeks}주</small></span><div class="meter good"><i style="width:${clamp(st.streak / PLAN.cicoGradWeeks * 100, 0, 100)}%"></i></div></div>
    <div class="card kpi tier2"><span class="lab">BIR 변화 (시작 전 4주 → 최근 4주)</span><span class="val">${bd ? `${bd.drop}` : '—'}<small>${bd ? '% 감소' : ''}</small></span><span class="xs muted">${bd ? `${bd.before}건 → ${bd.after}건 · 목표 50%↓` : '시작 전 기록 없음'}</span></div>
  </section>
  <section class="alert ${dc.lv}" style="padding:14px"><span class="ic">${dc.lv === 'bad' ? '!' : dc.lv === 'warn' ? '△' : '✓'}</span><div><b>판단: ${esc(dc.t)}</b><div class="why">${esc(dc.why)}${weakP ? ` · 가장 어려운 교시: <b>${PLAN.periods[weakP[0]]}</b>(${Math.round(weakP[1])}%)` : ''}${weakE ? ` · 가장 낮은 기대행동: <b>${PLAN.expectations[weakE[0]].label}</b>(${Math.round(weakE[1])}%)` : ''}</div>
    <div class="why" style="margin-top:4px">${dc.lv === 'bad' ? '권장: 멘토 협의 → 해당 교시 선행사건 수정(과제 난이도·대기시간), 체크인 시 그 교시 목표를 구체화, 강화물 메뉴 교체' : dc.t.includes('졸업') ? '권장: 자기점검(Self-monitoring) 카드로 전환 → 2주간 학생 자기평정과 교사 평정 일치도 확인 → 졸업 축하' : '권장: 현재 지원 유지, 잘한 교시를 체크아웃에서 구체적으로 칭찬'}</div></div><span></span></section>
  <section class="card"><div class="card-h"><h3>일일 DPR 달성률</h3><span class="sub">최근 ${rows.length}일 · 점선 목표 ${PLAN.cicoGoal}%</span></div>
    ${chart({ type: 'line', h: 220, dots: true, labels: rows.map(r => fmtDs(r.date)), tipLabels: rows.map(r => fmtD(r.date)), goal: PLAN.cicoGoal, goalLabel: '목표 80%', yMax: 100, yFmt: v => Math.round(v) + '%', series: [{ name: '달성률', color: 'var(--t2)', values: rows.map(r => r.pct) }] })}</section>
  <section class="grid g2">
    <div class="card"><div class="card-h"><h3>교시별 평균</h3><span class="sub">최근 20일 · 어려운 시간대 찾기</span></div>${PLAN.periods.map((p, i) => `<div class="hbar"><span class="l">${p} <span class="xs muted">${esc(PLAN.periodActs[i])}</span></span><span class="b"><i style="width:${st.byPeriod[i] || 0}%;background:${(st.byPeriod[i] || 0) >= PLAN.cicoGoal ? 'var(--t1)' : 'var(--t2)'}"></i></span><span class="v">${st.byPeriod[i] == null ? '—' : Math.round(st.byPeriod[i]) + '%'}</span></div>`).join('')}</div>
    <div class="card"><div class="card-h"><h3>기대행동별 평균</h3><span class="sub">체크인 목표 다짐에 활용</span></div>${PLAN.expectations.map((e, i) => `<div class="hbar"><span class="l">${e.full}</span><span class="b"><i style="width:${st.byExp[i] || 0}%;background:var(--s${[3, 1, 7][i]})"></i></span><span class="v">${st.byExp[i] == null ? '—' : Math.round(st.byExp[i]) + '%'}</span></div>`).join('')}
      <div class="xs muted" style="margin-top:10px">체크인율 ${st.ciRate ?? '—'}% · 체크아웃 ${st.rows.length ? pct(st.rows.filter(r => r.co).length, st.rows.length) : '—'}% · 보호자 서명 ${st.rows.length ? pct(st.rows.filter(r => r.parent).length, st.rows.length) : '—'}%</div></div>
  </section>
  <section class="card"><div class="card-h"><h3>DPR 기록</h3><span class="sub">눌러서 수정</span></div>${st.rows.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>날짜</th><th class="r">점수</th><th class="r">달성률</th><th>체크인/아웃</th><th>멘토 한마디</th><th>입력</th></tr></thead><tbody>${st.rows.slice().reverse().slice(0, 25).map(r => `<tr class="click" data-act="dpr-edit" data-v="${esc(r.id)}"><td>${fmtD(r.date)}</td><td class="r num">${r.total}/${r.max}</td><td class="r"><span class="chip ${r.pct >= PLAN.cicoGoal ? 'good' : 'warn'}">${r.pct}%</span></td><td>${r.ci ? '✓' : '—'} / ${r.co ? '✓' : '—'}</td><td>${esc(r.memo || '')}</td><td class="muted">${esc(r.by || '')}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">아직 DPR 기록이 없습니다</div>'}</section>`;
}
ACTIONS['dpr-edit'] = t => { const r = DB.dpr.find(x => x.id === t.dataset.v); if (r) openDpr(r.studentId, r.date); };
ACTIONS['copy-dpr-home'] = t => {
  const s = stuById(t.dataset.v); const st = cicoStats(s.id); const d = st.rows[st.rows.length - 1];
  if (!d) { toast('DPR 기록이 없습니다'); return; }
  const best = (d.sc || []).map((p, i) => [i, p ? sum(p) : -1]).sort((a, b) => b[1] - a[1])[0];
  copyText(`[${s.name} 오늘의 행동 점검표] ${fmtD(d.date)}\n오늘 점수: ${d.total}/${d.max}점 (${d.pct}%) ${d.pct >= PLAN.cicoGoal ? '— 목표 달성! 🎉' : ''}\n특히 잘한 시간: ${PLAN.periods[best[0]]}\n선생님 한마디: ${d.memo || '오늘도 열심히 노력했어요.'}\n가정에서도 오늘 잘한 점을 한 가지 칭찬해 주세요. 서명 부탁드립니다.`);
};
function cicoCandidates() {
  const today = TODAY(); const d30 = addDays(today, -30);
  const cnt = countBy(birIn(d30, today, 2), b => b.studentId); const minor = countBy(birIn(d30, today, 1, b => +b.level === 1), b => b.studentId);
  const refs = DB.requests.filter(r => r.type === 'CICO 의뢰' && r.status !== '완료');
  const ids = new Set(Object.keys(cnt).filter(id => cnt[id] >= 2).concat(Object.keys(minor).filter(id => minor[id] >= 5)).concat(refs.map(r => r.studentId)));
  return Array.from(ids).map(id => ({ s: stuById(id), bir: cnt[id] || 0, minor: minor[id] || 0, ref: refs.find(r => r.studentId === id) })).filter(x => x.s && +x.s.tier === 1).sort((a, b) => b.bir - a.bir || b.minor - a.minor);
}
function cicoScreen() {
  const c = cicoCandidates();
  return `<section class="card"><div class="card-h"><h3>CICO 5단계 일일 사이클</h3><span class="sub">[표 12]</span></div><div class="steps">${PLAN.cicoSteps.map((x, i) => `<div class="step"><span class="n">STEP ${i + 1}</span><b>${esc(x.t)}</b><span class="muted xs">${esc(x.when)}</span><span>${esc(x.d)}</span></div>`).join('')}</div></section>
  <section class="card"><div class="card-h"><h3>선별 후보</h3><span class="sub">최근 30일 BIR 2회↑ · 경미행동 5회↑ · 담임 의뢰</span></div>
    ${c.length ? `<div class="list">${c.map(x => `<div class="li"><span class="chip t1"><span class="d"></span>T1</span><div class="grow"><div class="t">${esc(x.s.name)} <span class="muted small">${esc(x.s.cls || '')}</span></div><div class="s">BIR ${x.bir}회 · 경미 ${x.minor}회${x.ref ? ` · 의뢰: ${esc(x.ref.by || '')} “${esc(x.ref.detail || '')}”` : ''}</div></div><button class="btn sm pri" data-act="cico-enroll" data-v="${esc(x.s.id)}">CICO 등록</button></div>`).join('')}</div>` : '<div class="empty"><b>현재 기준을 넘는 후보가 없습니다</b>담임 추천은 지원 요청 → “CICO 의뢰”로 접수됩니다.</div>'}
    <div class="row" style="margin-top:12px"><button class="btn" data-act="cico-enroll">${ico('plus')}학생 직접 선택해 등록</button></div></section>
  <section class="card"><div class="card-h"><h3>종료·자기관리 학생</h3></div>${(() => { const L = DB.students.filter(s => ['졸업', '중단', '자기관리'].includes(s.cicoStatus)); return L.length ? `<div class="list">${L.map(s => `<div class="li"><span class="chip ${s.cicoStatus === '졸업' ? 'good' : ''}">${esc(s.cicoStatus)}</span><div class="grow"><div class="t">${esc(s.name)}</div><div class="s">${esc(s.cls || '')} · 멘토 ${esc(s.mentor || '')}</div></div><button class="btn sm" data-act="cico-edit" data-v="${esc(s.id)}">변경</button></div>`).join('')}</div>` : '<div class="empty">없음</div>'; })()}</section>`;
}
function openCicoEdit(sid, enroll) {
  const s = sid ? stuById(sid) : null;
  openModal({
    title: enroll ? 'CICO 등록' : 'CICO 상태·멘토 변경',
    body: `<div class="form">${s ? `<div class="flabel">학생: <b style="color:var(--ink)">${esc(s.name)} · ${esc(s.cls || '')}</b></div>` : `<div class="field"><label for="ce-stu">학생</label><select class="inp" id="ce-stu">${stuOptions('', DB.students.filter(x => +x.tier === 1))}</select></div>`}
      <div class="field"><label for="ce-m">전담 멘토교사 <span class="hint">담임 외 교원 1:1</span></label><select class="inp" id="ce-m">${staffOptions(s && s.mentor, null, '멘토 선택')}</select></div>
      <div class="f2"><div class="field"><label for="ce-start">시작일</label><input class="inp" type="date" id="ce-start" value="${esc((s && s.cicoStart) || TODAY())}"></div><div class="field"><span class="flabel">상태</span>${choices('cst', ['진행', '자기관리', '졸업', '중단'], (s && s.cicoStatus) || '진행')}</div></div>
      <label class="check"><input type="checkbox" id="ce-cons" ${s && s.consent ? 'checked' : ''}> 학부모 CICO 운영 안내 및 가정 연계 서약서 접수</label></div>`,
    onSave: b => {
      const st = s || stuById(val(b, '#ce-stu')); if (!st) { toast('학생을 선택하세요'); return false; }
      const status = readChoice(b, 'cst') || '진행';
      const rec = Object.assign({}, st, { mentor: val(b, '#ce-m'), cicoStart: val(b, '#ce-start'), cicoStatus: status, consent: checked(b, '#ce-cons'), tier: status === '졸업' || status === '중단' ? 1 : 2 });
      if (status === '졸업' || status === '중단') rec.cicoEnd = TODAY();
      Store.save('students', rec);
      DB.requests.filter(r => r.type === 'CICO 의뢰' && r.studentId === st.id && r.status !== '완료').forEach(r => Store.save('requests', Object.assign({}, r, { status: '완료', reply: `CICO ${status} (${TODAY()})` })));
      toast(enroll ? `${st.name} CICO 등록 · 멘토 ${rec.mentor || '미지정'}` : '저장했습니다'); return true;
    }
  });
}
ACTIONS['cico-enroll'] = t => openCicoEdit(t.dataset.v, true);
ACTIONS['cico-edit'] = t => openCicoEdit(t.dataset.v, false);
function cicoWeekly(L) {
  const today = TODAY(); const w = dow(today) >= 5 || dow(today) === 0 ? weekStart(today) : addDays(weekStart(today), -7);
  const saved = DB.weekly.find(x => x.week === w);
  const rows = L.map(s => { const ds = DB.dpr.filter(d => d.studentId === s.id && weekStart(d.date) === w && d.pct != null); const a = ds.length ? Math.round(avg(ds.map(d => d.pct))) : null; const st = cicoStats(s.id); const sv = saved && (saved.rows || []).find(r => r.sid === s.id); return { s, days: ds.length, avg: a, met: a != null && a >= PLAN.cicoGoal, streak: st.streak, voucher: sv ? sv.voucher : a != null && a >= PLAN.cicoGoal, action: cicoDecision(st, s) }; });
  return `<section class="card"><div class="card-h"><h3>${fmtD(w)} 주 주간 분석</h3><span class="sub">CICO 코디네이터 · 매주 금요일 오후</span></div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>학생</th><th class="r">입력일</th><th class="r">주간 평균</th><th>80% 달성</th><th class="r">연속</th><th>스페셜 바우처</th><th>다음 조치</th></tr></thead><tbody>${rows.map(r => `<tr><td><b>${esc(r.s.name)}</b><br><span class="xs muted">멘토 ${esc(r.s.mentor || '')}</span></td><td class="r num">${r.days}</td><td class="r num">${r.avg == null ? '—' : r.avg + '%'}</td><td>${r.avg == null ? '—' : r.met ? '<span class="chip good">달성</span>' : r.avg < PLAN.cicoLow ? '<span class="chip bad">70% 미만</span>' : '<span class="chip warn">미달</span>'}</td><td class="r num">${r.streak}주</td><td><label class="check" style="padding:0"><input type="checkbox" class="wk-v" data-sid="${esc(r.s.id)}" ${r.voucher ? 'checked' : ''}> 지급</label></td><td class="small">${esc(r.action.t)}</td></tr>`).join('')}</tbody></table></div>
    <div class="row" style="margin-top:12px"><button class="btn pri" data-act="weekly-save" data-v="${w}">${saved ? '주간 분석 다시 저장' : '주간 분석 저장'}</button><span class="xs muted">${saved ? `저장됨 · ${esc(saved.by || '')}` : '저장하면 월례회의 CICO 브리핑에 반영됩니다'}</span></div></section>`;
}
ACTIONS['weekly-save'] = t => {
  const w = t.dataset.v; const ex = DB.weekly.find(x => x.week === w);
  const rows = cicoStudents().map(s => { const ds = DB.dpr.filter(d => d.studentId === s.id && weekStart(d.date) === w && d.pct != null); const cb = $(`.wk-v[data-sid="${s.id}"]`); return { sid: s.id, days: ds.length, avg: ds.length ? Math.round(avg(ds.map(d => d.pct))) : null, voucher: !!(cb && cb.checked) }; });
  Store.save('weekly', Object.assign({}, ex || {}, { week: w, date: TODAY(), rows }));
  toast(`주간 분석 저장 · 바우처 ${rows.filter(r => r.voucher).length}명`); rerender();
};
