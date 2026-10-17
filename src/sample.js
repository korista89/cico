/* ================================================================
   체험판 예시 자료 — 모두 가상의 학생·교직원 (실제 인물 아님)
   ================================================================ */
function buildSample() {
  let seed = 20260302;
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pick = a => a[Math.floor(rnd() * a.length)];
  const pickW = (a, w) => { const s = sum(w); let r = rnd() * s; for (let i = 0; i < a.length; i++) { r -= w[i]; if (r <= 0) return a[i]; } return a[a.length - 1]; };
  const poisson = l => { const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= rnd(); } while (p > L); return k - 1; };
  const ts = new Date().toISOString();
  const mk = (o, by) => Object.assign({ id: uid() + Math.floor(rnd() * 1e6).toString(36), updatedAt: ts, by }, o);
  COLS.forEach(c => { DB[c] = []; });
  const Y = 2026; const START = `${Y}-03-03`; const today = TODAY(); const END = today < `${Y + 1}-02-26` ? today : `${Y + 1}-02-26`;
  DB.settings.push(Object.assign({}, DEFAULT_SET, { buyinAgree: 61, buyinTotal: 68, hotline: '교감 내선 201 / 행동중재 코치 내선 315 / 보건실 내선 120' }));

  // 교직원 (가상)
  const staffDef = [
    ['윤정민', '관리자', '교감', 0, 1], ['박지호', '내부 코치(학생지원부장)', '학생지원부', 0, 1], ['김서연', 'CICO 코디네이터', '초등', 0, 1], ['이도윤', '데이터 분석가', '중·고등', 0, 1],
    ['최유나', '기록자', '유·초 저학년', 0, 1], ['정우진', '기록자', '전공과', 0, 1], ['한지민', '강화·홍보 담당', '중등 교과', 0, 1], ['오세훈', '강화·홍보 담당', '전공과 직업', 0, 1],
    ['강민지', '보건교사', '보건실', 0, 1], ['서하은', '특수교육지도사', '지도사 대표', 0, 1],
    ['임수빈', '교과·전담교사', '음악', 1, 0], ['장예린', '교과·전담교사', '미술', 1, 0], ['송민재', '교과·전담교사', '체육', 1, 0], ['배수아', '교과·전담교사', '진로', 1, 0], ['홍지후', '교과·전담교사', '정보', 1, 0],
    ['문채원', '담임교사', '초2-1', 1, 0], ['신동현', '담임교사', '중1-2', 1, 0], ['유가은', '담임교사', '고2-1', 1, 0], ['조하율', '담임교사', '초4-2', 1, 0], ['권태윤', '담임교사', '전공과1-1', 1, 0],
    ['황보람', '담임교사', '초3-1', 0, 0], ['노윤서', '담임교사', '중2-1', 0, 0], ['구본희', '담임교사', '초5-2', 0, 0], ['백승우', '담임교사', '고1-1', 0, 0],
    ['안소율', '특수교육지도사', '초등', 0, 0], ['전하린', '특수교육지도사', '중등', 0, 0], ['방준호', '사회복무요원', '통학', 0, 0], ['나경민', '담임교사', '초1-1', 0, 0]
  ];
  staffDef.forEach(([name, role, dept, mentor, team]) => DB.staff.push(mk({ name, role, dept, mentor: !!mentor, team: !!team }, '체험판')));
  const staffNames = DB.staff.map(s => s.name).slice(0, 24); // 일부 교직원은 아직 미참여로 두어 참여율 지표가 보이게 함

  // 학급 32 · 학생 190 (가상 이름)
  const classes = ['유-1', '유-2'];
  for (let g = 1; g <= 6; g++) classes.push(`초${g}-1`, `초${g}-2`);
  for (let g = 1; g <= 3; g++) classes.push(`중${g}-1`, `중${g}-2`);
  classes.push('고1-1', '고1-2', '고2-1', '고2-2', '고3-1', '고3-2', '고3-3', '전공과1-1', '전공과1-2', '전공과2-1', '전공과2-2', '전공과2-3');
  const courseOf = c => c.startsWith('유') ? '유치원' : c.startsWith('초') ? '초등' : c.startsWith('중') ? '중학' : c.startsWith('고') ? '고등' : '전공과';
  const quota = { 유치원: 2, 초등: 72, 중학: 40, 고등: 44, 전공과: 32 };
  const names = '가온 나래 다온 라온 마루 바다 새봄 아라 자람 하늘 한결 해솔 도담 미리내 소담 여름 은솔 윤슬 이든 지안 가람 나린 다솜 보람 서진 세움 솔빛 시온 아린 예솔 온유 우주 유하 이룸 재이 지우 채온 초롱 하준 해온 별하 누리 단비 리안 무진 빛나 산들 슬기 아토 여울 은찬 이안 주원 찬솔 태오 하랑 한빛 해찬 다인 시우'.split(' ');
  let ni = 0;
  PLAN.courses.forEach(co => {
    const cl = classes.filter(c => courseOf(c) === co); let left = quota[co];
    cl.forEach((c, i) => { const n = Math.round(left / (cl.length - i)); left -= n; for (let k = 0; k < n; k++) { const comm = pickW(['구어', '무발화', '중도중복'], co === '고등' || co === '전공과' ? [55, 30, 15] : [25, 52, 23]); DB.students.push(mk({ name: names[ni++ % names.length], course: co, cls: c, comm, tier: 1 }, '체험판')); } });
  });
  const S = DB.students;
  const byCls = c => S.filter(s => s.cls === c);
  // Tier 3 두 명
  const tA = byCls('초3-1')[0]; Object.assign(tA, { name: '하람', tier: 3, comm: '무발화', t3Start: `${Y}-03-09` });
  const tB = byCls('중2-1')[0]; Object.assign(tB, { name: '로운', tier: 3, comm: '구어', t3Start: `${Y}-03-09` });
  // CICO
  const cicoDef = [['초2-1', '문채원', 88], ['초3-2', '임수빈', 90], ['초4-1', '조하율', 86], ['초5-1', '장예린', 84], ['초6-2', '송민재', 82], ['중1-1', '신동현', 83], ['중3-1', '배수아', 85], ['고1-2', '유가은', 81], ['고2-2', '홍지후', 74], ['전공과1-2', '권태윤', 63]];
  const cico = cicoDef.map(([c, m, goal], i) => { const s = byCls(c)[1] || byCls(c)[0]; Object.assign(s, { tier: 2, mentor: m, cicoStart: `${Y}-03-23`, cicoStatus: '진행', consent: true, _goal: goal, _i: i }); return s; });
  cico[0].cicoStatus = '자기관리'; cico[0]._stop = `${Y}-07-10`;
  cico[1].cicoStatus = '자기관리'; cico[1]._stop = `${Y}-07-10`;
  cico[2].cicoStatus = '졸업'; cico[2].tier = 1; cico[2].cicoEnd = `${Y}-09-18`; cico[2]._stop = `${Y}-09-18`;
  const late1 = byCls('초1-2')[1], late2 = byCls('중2-2')[1];
  [[late1, '권태윤', 80], [late2, '홍지후', 78]].forEach(([s, m, g], k) => { Object.assign(s, { tier: 2, mentor: m, cicoStart: `${Y}-09-07`, cicoStatus: '진행', consent: k === 0, _goal: g }); cico.push(s); });
  const days = schoolDays(START, END);
  const monthRate = { 3: 2.8, 4: 2.45, 5: 2.05, 6: 1.75, 7: 1.55, 8: 1.45, 9: 1.45, 10: 1.15, 11: 1.0, 12: .9, 1: .85, 2: .85 };
  const B = PLAN.bir;
  const ctxOf = loc => ({ '급식실': '점심 급식·대기', '복도·계단·엘리베이터': '수업 간 전환·이동', '통학버스·승하차장': '등·하교 이동', '진로직업실(경은마트 등)': '직업 실습', '화장실': '쉬는 시간' }[loc] || pickW(['교실 수업', '수업 간 전환·이동', '쉬는 시간', '특별행사'], [60, 20, 15, 5]));
  const timeOf = ctx => ({ '등·하교 이동': pick(['08:52', '08:57', '09:03', '14:45', '14:52']), '점심 급식·대기': `12:${pad(5 + Math.floor(rnd() * 45))}` }[ctx] || `${pad(pick([9, 10, 10, 11, 11, 13, 13, 14]))}:${pad(Math.floor(rnd() * 60))}`);
  const anteFn = ctx => ctx === '점심 급식·대기' ? [['대기 시간 지속'], [pick(['선호물·감각', '성인 관심', '또래 관심'])]] : ctx === '수업 간 전환·이동' ? [['활동 종료·전환 요구'], ['과제·지시 회피']] : ctx === '교실 수업' ? [[pick(['어려운 과제·지시', '어려운 과제·지시', '선호물·활동 제지'])], [pick(['과제·지시 회피', '과제·지시 회피', '성인 관심'])]] : [[pick(['감각 자극(소음·혼잡)', '신체 컨디션(수면·투약)', '선호물·활동 제지'])], [pick(['불편한 감각·장소 회피', '선호물·감각'])]];
  days.forEach(d => {
    const m = +d.slice(5, 7); const t = (parseD(d) - parseD(START)) / 864e5;
    const n = poisson(monthRate[m] || 1.2);
    for (let k = 0; k < n; k++) {
      const decayA = Math.max(.25, 1 - Math.max(0, t - 60) / 220), decayC = Math.max(.35, 1 - Math.max(0, t - 20) / 160);
      const who = pickW(['A', 'B', 'C', 'O'], [.17 * decayA, .14 * decayA, .3 * decayC, .55]);
      let s = who === 'A' ? tA : who === 'B' ? tB : who === 'C' ? pick(cico.filter(x => x.cicoStart <= d && (!x._stop || x._stop >= d)).concat([pick(S)])) : pick(S);
      if (!s) s = pick(S);
      const level = s === tA || s === tB ? (rnd() < .6 ? 3 : 2) : (rnd() < .08 ? 3 : 2);
      const booster = d >= `${Y}-05-25`;
      const loc = s === tA ? pickW(['보통교실', '특별실(체육·유희·어울방)', '급식실', '복도·계단·엘리베이터'], [45, 25, 15, 15]) : pickW(B.locations, [30, 10, 12, booster ? 14 : 30, 6, 5, 7]);
      const ctx = ctxOf(loc); const [ante, func] = anteFn(ctx);
      const types = s === tA ? ['자해'] : s === tB ? [pick(['타해·신체 공격', '타해·신체 공격', '기물 파손'])] : level === 3 ? [pick(['타해·신체 공격', '기물 파손', '자해', '무단 이탈'])] : [pickW(['고강도 수업 마비', '타해·신체 공격', '무단 이탈', '기물 파손', '부적절한 신체 접촉·기타'], [40, 22, 14, 14, 10])];
      const time = timeOf(ctx);
      const rec = { date: d, time, studentId: s.id, level, location: loc, context: ctx, types, ante: s === tA ? ['감각 자극(소음·혼잡)', '어려운 과제·지시'].slice(0, 1 + (rnd() < .4 ? 1 : 0)) : s === tB ? [pick(['대기 시간 지속', '선호물·활동 제지'])] : ante, func: s === tA ? ['과제·지시 회피', '불편한 감각·장소 회피'].slice(0, 1 + (rnd() < .5 ? 1 : 0)) : s === tB ? [pick(['성인 관심', '선호물·감각'])] : func, resp: level === 3 ? ['어울방 분리 진정', '부장·코치 합류 지원'] : [pick(B.responses.slice(0, 3)), pick(['AAC 대체표현 유도', '어울방 분리 진정'])], post: level === 3 ? ['심리안정실 이동·안정', '보호자 당일 소통'].concat(rnd() < .3 ? ['보건실 외상 점검'] : []) : (rnd() < .3 ? ['Tier 2·3 연계 검토'] : []), reporterRole: pickW(B.reporterRoles, [55, 15, 25, 5]), memo: '' };
      if (level === 3) { const hh = +time.slice(0, 2), mm = +time.slice(3, 5) + 3; rec.calmIn = `${pad(hh + Math.floor(mm / 60))}:${pad(mm % 60)}`; const m2 = mm + 8 + Math.floor(rnd() * 12); rec.calmOut = `${pad(hh + Math.floor(m2 / 60))}:${pad(m2 % 60)}`; }
      DB.bir.push(mk(rec, pick(staffNames)));
    }
    const nm = poisson(Math.max(.6, 2.2 - t / 140));
    for (let k = 0; k < nm; k++) { const s = rnd() < .3 ? pick(cico) : pick(S); const loc = pickW(B.locations, [45, 10, 18, 15, 5, 3, 4]); DB.bir.push(mk({ date: d, time: timeOf(ctxOf(loc)), studentId: s.id, level: 1, location: loc, context: ctxOf(loc), types: [pick(B.typesMinor)], ante: [], func: [], resp: [pick(B.responses.slice(0, 3))], post: [], reporterRole: '담임' }, pick(staffNames))); }
  });

  // DPR
  const memos = ['3교시 체육에서 차례를 끝까지 기다렸어요', '급식실에서 식판을 두 손으로 들었어요', '도움 카드를 스스로 건넸어요', '전환할 때 타이머 보고 바로 이동했어요', '친구에게 먼저 인사했어요', '오늘은 4교시가 힘들었지만 다시 앉았어요'];
  cico.forEach(s => {
    const sd = days.filter(d => d >= s.cicoStart && (!s._stop || d <= s._stop));
    sd.forEach((d, i) => {
      if (d === today && rnd() < .45) return;
      const prog = Math.min(1, i / 45); const g = s._goal;
      const base = (g >= 80 ? 58 : g >= 70 ? 60 : 58) + (g - 58) * prog + (rnd() - .5) * 14;
      const sc = PLAN.periods.map((p, pi) => {
        if (rnd() < .03) return null;
        const p0 = clamp((base - (pi === 3 ? 12 : pi === 2 ? 5 : 0) + (rnd() - .5) * 18) / 100, .05, .99);
        return [0, 1, 2].map(j => { const pj = clamp(p0 + (j === 0 ? .04 : j === 2 ? -.04 : 0), .02, .99); const r = rnd(); return r < pj * pj ? 2 : r < pj * pj + 2 * pj * (1 - pj) ? 1 : 0; });
      });
      const c = dprCalc(sc);
      DB.dpr.push(mk({ studentId: s.id, date: d, sc, ci: rnd() < .95, co: d === today ? false : rnd() < .93, token: c.pct >= PLAN.cicoGoal, parent: rnd() < .7, memo: rnd() < .35 ? pick(memos) : '', total: c.total, max: c.max, pct: c.pct }, s.mentor));
    });
  });
  cico.forEach(s => { delete s._goal; delete s._i; delete s._stop; });

  // 주간 분석
  const fridays = days.filter(d => dow(d) === 5 && d >= `${Y}-03-27` && d < today);
  fridays.forEach(f => { const w = weekStart(f); const rows = cico.filter(s => s.cicoStart <= f).map(s => { const ds = DB.dpr.filter(x => x.studentId === s.id && weekStart(x.date) === w); const a = ds.length ? Math.round(avg(ds.map(x => x.pct))) : null; return { sid: s.id, days: ds.length, avg: a, voucher: a != null && a >= 80 }; }).filter(r => r.days); if (rows.length) DB.weekly.push(mk({ week: w, date: f, rows }, '김서연')); });

  // Tier 3 일일 기록
  [[tA, 5.2, .35, .3, .75, .4, 6.5], [tB, .3, 2.6, 1.1, .55, .5, 4.2]].forEach(([s, sib, agg, dest, calm, keep, fctMax]) => {
    days.filter(d => d >= `${Y}-03-09`).forEach(d => {
      const t = (parseD(d) - parseD(`${Y}-05-04`)) / 864e5; const f = t <= 0 ? 1 : Math.max(keep * (s === tA ? .62 : 1), 1 - t / (s === tA ? 140 : 170));
      const fct = t <= 0 ? 0 : Math.round(Math.min(fctMax, t / 18) * (.6 + rnd() * .8));
      const cl = poisson(calm * f);
      DB.t3log.push(mk({ studentId: s.id, date: d, sib: poisson(sib * f), agg: poisson(agg * f), dest: poisson(dest * f), calm: cl, calmMin: cl * (10 + Math.floor(rnd() * 10)), fct, injury: (d < `${Y}-05-01` && rnd() < .03) || d === `${Y}-06-17` && s === tB, memo: rnd() < .15 ? pick(['헤드셋 선제 제공 후 진정', '휴식카드 자발 사용', '대기 타이머 보고 기다림', '전환 5분 전 예고 효과 있음', '수면 부족 보고(보호자)']) : '' }, s === tA ? '안소율' : '전하린'));
    });
  });
  DB.t3plan.push(mk({ studentId: tA.id, profile: '초등 3학년, 자폐성장애, 무발화, 감각 과민 (가상 사례)', a: '소음, 복잡한 과제, 활동 전환 지시', b: '자신의 머리를 벽·책상에 박기, 손 물기', c: '과제 중단 및 격리', fn: '어려운 과제 회피 및 과도한 감각 자극 회피', ant: 'TEACCH식 시각 바구니 과제 구조화, 10분 과제 후 2분 감각휴식, 소음차단 헤드셋 상시 착용', rep: "'쉬고 싶어요' 빅맥 스위치 및 빨간색 휴식카드 건네기 훈련(FCT)", rein: '스위치 누를 시 과제 즉시 3분 면제 + 트램펄린 감각 보상', safe: '특수교육지도사 1:1 밀착 동행, 책상 모서리 안전가드, 심리안정실 안전매트 상시 대기', baseline: '', bcba: '외부 BCBA 컨설턴트', aide: '안소율(특수교육지도사)' }, '박지호'));
  DB.t3plan.push(mk({ studentId: tB.id, profile: '중학 2학년, 지적·뇌병변, 언어표현 제한, 충동성 (가상 사례)', a: '대기 요구, 선호물 거절, 관심 단절', b: '또래·교사 밀치기, 뺨 때리기, 책상 전도', c: '교사 관심 집중, 선호물 제공', fn: '성인 관심 얻기 및 선호 물건·활동 획득', ant: '대기 시간 시각 타이머(Time Timer), 선호활동 전환 5분 전 예고, 비조건적 관심 선제 제공', rep: "'더 주세요', '기다려요' AAC 카드 및 주먹 인사 대체 훈련", rein: '적절한 요구 시 칭찬토큰 2배 및 경은마루 음료 우선 이용권', safe: '과정 부장교사·위기개입팀 핫라인, 어울방 완충지대 즉시 이동, 보호자 일일 소통', baseline: '', bcba: '외부 BCBA 컨설턴트', aide: '전하린(특수교육지도사)' }, '박지호'));
  [tA, tB].forEach(s => {
    DB.consult.push(mk({ studentId: s.id, date: `${Y}-03-11`, type: 'IEP팀 회의', content: 'Tier 3 대상 선정 협의, 보호자 동의', next: '4월 외부 전문가 FBA' }, '박지호'));
    DB.consult.push(mk({ studentId: s.id, date: `${Y}-04-15`, type: '외부 전문가 컨설팅', content: '정밀 관찰 및 FBA 가설 검증', next: 'BIP 초안 작성 (5월 적용)' }, '박지호'));
    DB.consult.push(mk({ studentId: s.id, date: `${Y}-06-10`, type: '외부 전문가 컨설팅', content: 'BIP 6주차 데이터 검토, 강화 스케줄 조정', next: '감각조절 교구 보강' }, '박지호'));
    for (let m = 3; m <= 12; m++) { if (m === 8) continue; [9, 23].forEach(dd => { const d = `${Y}-${pad(m)}-${pad(dd)}`; if (d < today) DB.consult.push(mk({ studentId: s.id, date: d, type: '보호자 상담', content: pick(['가정 내 휴식카드 사용 공유', '수면·투약 변화 확인', '주간 빈도 그래프 공유', '방학 중 가정연계 계획', '대기 타이머 가정 적용 안내']), next: '' }, s === tA ? '황보람' : '노윤서')); }); }
  });
  DB.consult.push(mk({ studentId: tB.id, date: `${Y}-04-22`, type: '전담팀 긴급회의', content: '교사 대상 타해 2회 발생 — 대기 상황 재구조화', next: '어울방 완충지대 즉시 이동 절차 합의' }, '윤정민'));

  // 칭찬 토큰 · 4:1 관찰
  days.forEach(d => {
    const t = (parseD(d) - parseD(START)) / 864e5; const n = 6 + Math.floor(rnd() * 8 + t / 40);
    for (let k = 0; k < n; k++) DB.praise.push(mk({ date: d, cls: pick(classes), tokens: 6 + Math.floor(rnd() * 18 + t / 25), gold: 0, memo: '' }, pick(staffNames)));
    if (rnd() < .5) { const ratio = 1.8 + Math.min(3, t / 70) + (rnd() - .5); const c = 3 + Math.floor(rnd() * 5); DB.obs.push(mk({ date: d, cls: pick(classes), target: pick(staffNames), praise: Math.round(c * ratio), correct: c, minutes: 15, ratio: r1(ratio), memo: '' }, pick(staffNames))); }
  });
  // 직접교수
  [['1학기 배움주간', `${Y}-03-04`, .93], ['2학기 배움주간', `${Y}-09-02`, .86]].forEach(([round, d, p]) => { if (d > today) return; classes.forEach(c => { const sp = PLAN.matrix.map(m => m.space).filter(() => rnd() < p); if (sp.length) DB.teach.push(mk({ date: addDays(d, Math.floor(rnd() * 7)), round, cls: c, spaces: sp, memo: '' }, pick(staffNames))); }); });
  [`${Y}-05-25`, `${Y}-06-22`, `${Y}-07-20`, `${Y}-09-28`].filter(d => d < today).forEach(d => classes.filter(() => rnd() < .35).forEach(c => DB.teach.push(mk({ date: d, round: '보완교수(Booster)', cls: c, spaces: ['급식실', '복도·계단·엘리베이터'].slice(0, 1 + (rnd() < .4 ? 1 : 0)), memo: 'Big 5 다발 구역 · Double Token Week' }, pick(staffNames)))));
  // 토큰마켓
  days.filter(d => dow(d) === 5 && d >= `${Y}-03-20` && d <= today).forEach((d, i) => DB.market.push(mk({ date: d, participants: Math.min(176, 70 + i * 3 + Math.floor(rnd() * 20)), tokens: 900 + i * 40 + Math.floor(rnd() * 300), gold: 4 + Math.floor(rnd() * 5), memo: pick(['경은마루 음료 인기', '문구류 보충 필요', '전공과 학생 계산 실습 원활', '']) }, '오세훈')));

  // 로드맵
  DB.tasks = roadmapTasks().map(t => { const done = t.due < today ? t.id !== 'task-6-1' : (t.start <= today && rnd() < .35); return Object.assign(t, { updatedAt: ts, done, doneBy: done ? pick(['박지호', '김서연', '이도윤', '윤정민']) : '', doneAt: done ? (t.due < today ? addDays(t.due, -2) : today) : '' }); });

  // 충실도
  const mkItems = (n, p) => Array.from({ length: n }, () => { const r = rnd(); return r < p * p ? 2 : r < p * p + 2 * p * (1 - p) ? 1 : 0; });
  [[`${Y}-03-12`, '1차 기초선(3월)', .42, .3, .25], [`${Y}-07-15`, '2차 중간(7월)', .68, .6, .52]].filter(x => x[0] < today).forEach(([d, round, a, b2, c]) => { const items = { 1: mkItems(15, a), 2: mkItems(13, b2), 3: mkItems(17, c) }; const pc = t => Math.round(sum(items[t]) / (items[t].length * 2) * 100); DB.fidelity.push(mk({ date: d, type: 'TFI', round, items, t1: pc(1), t2: pc(2), t3: pc(3), note: round.startsWith('1') ? 'SAS(2월) 우선순위: 학급 절차, 데이터 기반 의사결정' : '배움주간·토큰마켓 정착, 데이터 회의 정례화' }, '박지호')); });
  // ETLP · 코칭 · 요청 · 감사 · 예산
  staffNames.slice(0, 22).forEach(n => DB.etlp.push(mk({ date: `${Y}-06-${pad(10 + Math.floor(rnd() * 10))}`, sem: 1, scores: PLAN.etlp.map((e, i) => Math.min(2, Math.floor(rnd() * 2.4 + (i === 2 ? .2 : i === 5 ? -.3 : .4)))) }, n)));
  [['박지호', '황보람', PLAN.etlp[2].t, '4주 뒤 15분 관찰에서 4:1', '현재 1.8:1, 전환 시간 교정 집중', '전환 2분 전 시각 타이머 + 칭찬 문장 카드', '내일 1교시부터 칭찬 카드 사용', '완료'], ['박지호', '노윤서', 'Tier 3 BIP 실행', '대기 상황 타해 0회', '대기 3분 넘으면 밀치기', '타임타이머·기다려요 카드', '급식 대기 시 카드 먼저 제시', '완료'], ['김서연', '임수빈', 'CICO 멘토링', '체크인 5분 이내 정착', '체크인 지각 잦음', '어울방 대신 교실 앞 체크인', '내일부터 교실 앞에서', '완료'], ['박지호', '구본희', PLAN.etlp[5].t, '무발화 학생 반응 기회 분당 3회', '구어 질문 위주', '그림카드 들기·스위치', '국어 시간 카드 세트 도입', '진행'], ['박지호', '백승우', PLAN.etlp[1].t, '전환 혼란 3분 이내', '전환 6분 소요', '시각일과표 + 예고벨', '아침 조회에 일과 브리핑', '진행'], ['김서연', '홍지후', 'CICO 멘토링', '담당 학생 주간 80%', '지난주 72%', '4교시 선행사건 수정', '급식 대기 자리 지정', '진행']]
    .forEach(([coach, teacher, focus, g, r, o, w, status], i) => DB.coaching.push(mk({ date: addDays(`${Y}-05-12`, i * 21), coach, teacher, focus, g, r, o, w, followUp: addDays(`${Y}-05-26`, i * 21), status }, coach)));
  const ref = S.find(s => +s.tier === 1 && s.cls === '초6-1') || S[50];
  [['CICO 의뢰', ref.id, '전환 시간마다 10분 이상 거부가 3주째 반복됩니다. 아침 멘토가 필요합니다.', '접수', '', '나경민'], ['코칭 요청', '', '4:1 칭찬이 수업 중에 잘 안 됩니다. 동료 관찰 부탁드립니다.', '검토중', '박지호 코치 10월 4주 관찰 예정', '백승우'], ['강화물·물품', '', '경은마트 문구류(스티커) 보충 요청', '완료', '10/2 구입 완료', '오세훈'], ['Tier 3 의뢰', tB.id, '주 3회 이상 타해로 수업 마비', '완료', 'IEP팀 협의 후 Tier 3 지정(3/11)', '노윤서'], ['위기 지원', tA.id, '머리박기 후 보건실 연계 필요', '완료', '보건교사 상시 대기 체계 마련', '황보람'], ['기타', '', '통학버스 동승자용 토큰 추가 배부 요청', '접수', '', '방준호']]
    .forEach(([type, studentId, detail, status, reply, by], i) => DB.requests.push(mk({ date: addDays(today, -[2, 6, 15, 210, 190, 1][i]), type, studentId, detail, status, reply }, by)));
  const kmsg = ['급식실 시차 배식 때 우리 반 학생을 끝까지 기다려 주셔서 고맙습니다!', '체크인 때 늘 웃으며 맞아주셔서 아이가 아침을 기다려요.', '위기 상황에서 바로 와 주셔서 든든했습니다.', '토큰마켓 준비 정말 고생 많으셨어요.', '데이터 정리 덕분에 회의가 30분 만에 끝났어요!', '통학버스에서 칭찬 토큰 챙겨 주셔서 감사해요.', '보건실 연계가 빨라서 큰 사고를 막았습니다.', '배움주간 급식실 시범 최고였어요.'];
  for (let i = 0; i < 22; i++) { const from = pick(staffNames); let to = pick(staffNames); if (to === from) to = staffNames[(staffNames.indexOf(from) + 3) % staffNames.length]; const d = days[Math.max(0, days.length - 1 - Math.floor(rnd() * 60))] || today; DB.kudos.push(mk({ date: d, to, msg: pick(kmsg) }, from)); }
  [[1, `${Y}-02-24`, 1400000, '6대 공간 매트릭스 포스터 35개소'], [1, `${Y}-03-05`, 980000, '바닥 유도 스티커·AAC 표지'], [2, `${Y}-02-26`, 800000, '칭찬토큰 목걸이 80명'], [3, `${Y}-03-20`, 300000, 'DPR 카드키트 10명'], [4, `${Y}-04-15`, 800000, '외부 BCBA 컨설팅 1차(2명)'], [4, `${Y}-06-10`, 800000, '외부 BCBA 컨설팅 2차(2명)'], [4, `${Y}-05-20`, 760000, '감각교구·안전쿠션'], [5, `${Y}-02-20`, 300000, '전 교직원 워크숍 강사료'], [5, `${Y}-03-10`, 900000, '핸드북·가정용 매트릭스 190가구'], [5, `${Y}-08-12`, 300000, '2학기 워크숍 강사료']]
    .filter(x => x[1] <= today).forEach(([area, date, amount, item]) => DB.budget.push(mk({ area, date, amount, item }, '박지호')));
  for (let m = 3; m <= 12; m++) { const d = `${Y}-${pad(m)}-27`; if (d > today) break; DB.budget.push(mk({ area: 2, date: d, amount: 240000, item: `${m}월 경은마트 강화물품` }, '오세훈')); if (m >= 3) DB.budget.push(mk({ area: 3, date: d, amount: 130000, item: `${m}월 CICO 리워드` }, '김서연')); }

  // 월례회의 (데이터가 쌓인 뒤 스냅샷)
  const plans = {
    3: ['초등 과정 학생들이 급식실에서 점심 급식·대기 중 타해 행동을 보이며, 선호물 얻기 기능으로 추정된다.', '급식 대기선 발자국 스티커, 과정별 10분 시차 입실', 'CICO 대상 10명 확정, 멘토 매칭', 'Tier 3 2명 IEP 협의, FBA 의뢰'],
    4: ['중학 과정 학생들이 급식실에서 대기 중 밀치기를 보이며, 선호물·관심 얻기 기능으로 추정된다.', '급식실 퇴식구 사진 분류표·토큰 배부 담당 지정', '4교시 점수가 낮은 학생 3명 급식 자리 지정', '로운: 대기 타이머·기다려요 카드 도입'],
    5: ['초등 과정 학생들이 보통교실에서 교실 수업 중 고강도 수업 마비를 보이며, 과제 회피 기능으로 추정된다.', '넷째 주 월요일 급식실 보완교수, Double Token Week', '70% 미만 학생 멘토 협의', '하람: 10분 과제 후 2분 감각휴식'],
    6: ['고등 과정 학생들이 복도에서 전환 중 무단 이탈을 보이며, 과제 회피 기능으로 추정된다.', '전환 시간 복도 거점 능동적 감독표 배포', '자기관리 전환 후보 2명 검토', 'BIP 6주차 데이터 검토, 감각교구 보강'],
    7: ['초등 과정 학생들이 보통교실에서 교실 수업 중 고강도 수업 마비를 보이며, 과제 회피 기능으로 추정된다.', '2학기 매트릭스 보완안 마련', '2명 자기관리 전환, 방학 중 가정 연계 안내', '방학 가정연계 중재 계획 배포'],
    9: ['중학 과정 학생들이 보통교실에서 수업 간 전환 중 고강도 수업 마비를 보이며, 과제 회피 기능으로 추정된다.', '2학기 배움주간 재교수 후 전환 예고벨 전 학급 적용', '신규 2명 등록·기존 학생 재가동', '로운: 선호활동 전환 5분 전 예고 강화'],
    10: ['고등 과정 학생들이 보통교실에서 교실 수업 중 고강도 수업 마비를 보이며, 과제 회피 기능으로 추정된다.', '현장체험학습 사전교수 매트릭스', '70% 미만 학생 강화물 메뉴 교체', '하람: 일반화 훈련(특별실)']
  };
  for (let m = 3; m <= 12; m++) {
    if (m === 8 || !plans[m]) continue; const mkk = `${Y}-${pad(m)}`; const d = meetingDate(mkk); if (d >= today) break;
    const p = plans[m];
    DB.meeting.push(mk({ date: d, attend: 8 + Math.floor(rnd() * 3), members: 10, facil: '박지호', recorder: m % 2 ? '최유나' : '정우진', timer: m % 2 ? '정우진' : '최유나', predist: true, problem: p[0], funcs: [p[0].includes('회피') ? '과제/지시 회피' : '선호 물건/활동 얻기'], p1: p[1], p2: p[2], p3: p[3], owner: pick(['한지민', '김서연', '이도윤', '박지호']), due: addDays(d, 23), targets: '다발구역 BIR 20% 감소 · CICO DPR 80% 이상 유지 · 심리안정실 이용 주 1회 이하', prevStatus: m === 3 ? null : '완료', prevGoal: m === 3 ? null : pick(['달성', '추가 보완 필요']), planStatus: '완료', kudos: `우수 학급 ${pick(classes)} · 우수 멘토 ${pick(['임수빈', '문채원', '조하율'])}`, notice: '', snap: meetingSnapshot(mkk) }, '최유나'));
  }
  const lastM = DB.meeting[DB.meeting.length - 1]; if (lastM) lastM.planStatus = '진행';
}
