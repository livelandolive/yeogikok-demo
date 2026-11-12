/*! 여기콕 도움 버튼 0.6.5 (2026-11-12) — 병원 예약 화면 위에 어르신용 안내 버튼을 띄워요.
 * 넣는 법: <script src="…/yeogikok.js" data-hospital="anam" defer></script>
 * 병원 화면과 입력 내용은 바꾸지도, 저장하지도, 어디로 보내지도 않아요. 빼려면 이 한 줄만 지우면 돼요. */
(function () {
  if (window.__ykLoaded) { window.dispatchEvent(new Event('yk-open')); return; }
  var me = document.currentScript || document.querySelector('script[src*="yeogikok"]');
  var want = (me && me.getAttribute('data-hospital')) || '';
  var open = !!(me && me.getAttribute('data-open') === '1');
  var host = location.hostname;
  var HOSTS = { anam: /(^|\.)anam\.kumc\.or\.kr$/, snuh: /(^|\.)snuh\.org$/, bumin: /(^|\.)bumin\.co\.kr$/ };
  var TABLES = {
    anam: function () {
/*
 * 고려대학교 안암병원 안내표 (anam.kumc.or.kr) — v2.1, 2026-11-12
 *
 * 어르신이 가는 세 갈래 길
 *   1) 처음 오셨어요      → 첫방문 간편예약: 동의 → 이름 → 전화번호 → 신청. 로그인 없이, 상담원이 전화로 예약을 잡아줘요.
 *   2) 다녀갔고 아이디 있음 → 온라인 예약 → 아이디·비밀번호 → 로그인 → 진료과 → 의료진 → 날짜·시간 → (증상·사전문진) → 예약하기 → 완료
 *   3) 다녀갔는데 아이디 없음 → 회원가입(일반) → 약관 동의 → 휴대폰 본인인증 → 정보 입력. 어려우면 전화 1577-0083.
 *
 * 확인한 것: 로그인 전 화면 전부(PC·휴대폰). 로그인 뒤 예약 화면(실명인증 → 진료과 → 의료진 → 날짜 → 시간 → 예약하기 →
 * 사전문진 → 증상 → 마지막 예약하기)은 2026-11-12 실제 계정으로 확인했어요. 예약완료 화면만 아직 못 봤어요 (★ 표시).
 * 이 표에 없는 화면은 공통 예약 지도(stages.js)가 이어받고, 그래도 모르면 "준비 중 + 전화"를 보여줘요.
 *
 * 각 줄: when(이 화면 상태일 때) → find(짚을 곳, 앞에서부터 찾음) → msg(할 말) → sub(자세히)
 * 버튼을 짚는 줄은 그 위의 빈 칸이 남아 있으면 그 칸부터 안내해요 (stages.js의 공통 규칙). fill:false는 그 규칙을 끄는 표시예요.
 */
(function () {
  const $$ = (sel) => { try { return [...document.querySelectorAll(sel)]; } catch (e) { return []; } };
  const txt = (e) => (e && (e.textContent || '') || '').replace(/\s+/g, ' ').trim();
  const labelOf = (inp) => (inp.id && document.querySelector('label[for="' + inp.id + '"]')) || inp.closest('label');
  // a "동의합니다 / 동의하지 않습니다" pair inside this box: is 동의합니다 the one picked?
  const agreed = (root) => $$(root + ' input[type="radio"], ' + root + ' input[type="checkbox"]').some((r) => r.checked && /동의합니다|동의하기/.test(txt(labelOf(r))) && !/않|미동의/.test(txt(labelOf(r))));
  const agreeLabel = (root) => $$(root + ' label').find((l) => /^동의합니다\.?$/.test(txt(l)));
  const QUICK = '#simplReservationInputModal';
  // 컴퓨터(마우스)에서는 첫 화면 칸이 마우스를 올리면 펼쳐지고, 누르면 그 자리에 다른 버튼(챗봇 예약)이 와요.
  // 그래서 컴퓨터에서는 "올려 두세요", 휴대폰에서는 "누르세요"라고 말해요.
  const HOVER = !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);

  // 첫 화면의 첫방문 칸에서 ‘예약신청’을 누르면 뜨는 확인 창 (동의 → 간편예약 신청). 이름·번호를 넣는 창(QUICK)과는 다른 창이에요.
  // (2026-11-12 팀원 시험: 이 창이 안내표에 없어서 첫방문 흐름이 중간에 끊겼어요)
  const CONFIRM = '.modal_outer:not(#simplReservationInputModal) .modal_wrap.modal-first';
  const confirmSteps = [
    { st: '첫방문 확인 창: 동의', when: (h) => h.shown(CONFIRM) && !h.checked('modal-user-authAgree-Y'),
      find: [{ sel: CONFIRM + ' label[for="modal-user-authAgree-Y"]' }],
      msg: '‘동의합니다’를 누르세요.', sub: '병원이 전화로 예약을 도와드리려고 이름과 휴대폰 번호를 받아요. 3년 뒤 지워져요.', fill: false },
    { st: '첫방문 확인 창: 신청', when: (h) => h.shown(CONFIRM),
      find: [{ sel: CONFIRM + ' a[title="확인"]' }, { sel: CONFIRM + ' a', text: '간편예약 신청' }],
      msg: '‘간편예약 신청’을 누르세요.', sub: '누르면 신청이 끝나요. ‘신청되었습니다’ 같은 알림이 뜨면 ‘확인’을 누르세요.', fill: false }
  ];
  // 신청을 마쳤는지: ‘간편예약 신청’을 누른 뒤 그 창이 닫혔으면 끝난 거예요 (3분 동안 기억). 그래야 다시 “성명을 넣으세요”로 돌아가지 않아요.
  let quickSentAt = 0;
  try { quickSentAt = +sessionStorage.getItem('yk-anam-quicksent') || 0; } catch (e) {}
  document.addEventListener('click', (e) => {
    const b = e.target && e.target.closest && e.target.closest('.modal-first a');
    if (!b || !/간편예약 신청/.test(txt(b))) return;
    const m = b.closest('.modal-first');
    const yes = m && [...m.querySelectorAll('input[type="radio"]')].find((x) => /Y$/.test(x.id));
    if (yes && yes.checked) { quickSentAt = Date.now(); try { sessionStorage.setItem('yk-anam-quicksent', String(quickSentAt)); } catch (er) {} }
  }, true);
  const quickDone = () => quickSentAt && Date.now() - quickSentAt < 180000 && Date.now() - quickSentAt > 1500 && !$$('.modal-first').some((m) => m.getClientRects().length > 0);
  const doneSteps = [
    { st: '간편예약 신청 끝', when: () => quickDone(),
      find: [{ sel: 'div.box.box01 > a.title' }, { sel: 'a[href*="quickReservationInput"]' }, { sel: 'h1, h2, .logo' }],
      msg: '간편예약 신청이 끝났어요. 이제 병원 전화를 기다리세요.', sub: '상담원이 평일 오전 8시~오후 5시(토요일 오전 8시 30분~12시 30분)에 전화해서 날짜를 잡아드려요. 모르는 번호여도 받아 주세요. 더 누를 것은 없어요.', fill: false }
  ];

  // 첫방문 간편예약 창 (메인·로그인·진료예약 안내 화면 어디서나 열려요)
  const quickSteps = [
    ...confirmSteps, ...doneSteps,
    { st: '간편예약: 동의 전', when: (h) => h.shown(QUICK) && !agreed(QUICK),
      find: [{ fn: () => agreeLabel(QUICK) }, { sel: 'label[for="modal-user-authAgree-input-Y"]' }],
      msg: '‘동의합니다’를 누르세요.', sub: '병원이 전화로 예약을 도와드리려고 이름과 휴대폰 번호를 받아요. 3년 뒤 지워져요.' },
    { st: '간편예약: 이름', when: (h) => h.shown(QUICK) && !h.filled('modal-first-authName'),
      find: [{ sel: '#modal-first-authName' }], msg: '‘이름’ 칸에 이름을 넣으세요.', sub: '진료받을 분의 이름이에요.' },
    { st: '간편예약: 번호 앞', when: (h) => h.shown(QUICK) && !h.filled('modal-first-authNum01'),
      find: [{ sel: '#modal-first-authNum01' }], msg: '휴대폰 번호 앞 3자리를 넣으세요.', sub: '예: 010' },
    { st: '간편예약: 번호 가운데', when: (h) => h.shown(QUICK) && !h.filled('modal-first-authNum02'),
      find: [{ sel: '#modal-first-authNum02' }], msg: '휴대폰 번호 가운데 4자리를 넣으세요.', sub: '예: 010-1234-5678이면 1234' },
    { st: '간편예약: 번호 끝', when: (h) => h.shown(QUICK) && !h.filled('modal-first-authNum03'),
      find: [{ sel: '#modal-first-authNum03' }], msg: '휴대폰 번호 끝 4자리를 넣으세요.', sub: '예: 010-1234-5678이면 5678' },
    { st: '간편예약: 신청', when: (h) => h.shown(QUICK),
      find: [{ sel: QUICK + ' a', text: '간편예약 신청' }],
      msg: '‘간편예약 신청’을 누르세요.', sub: '상담원이 평일 오전 8시~오후 5시(토요일 오전 8시 30분~12시 30분)에 전화해서 날짜를 잡아드려요. 모르는 번호여도 받아 주세요.' }
  ];

  // 회원가입: 아이디 '중복확인'을 누른 그 아이디를 기억해요 (아이디를 바꾸면 다시 중복확인)
  document.addEventListener('click', (e) => {
    const b = e.target && e.target.closest && e.target.closest('a, button');
    if (b && /중복확인/.test(txt(b))) { const id = document.getElementById('Signin_id01'); checkedId = id ? id.value.trim() : ''; }
  }, true);
  let checkedId = ''; // 이 화면이 열려 있는 동안만 기억하고, 어디에도 저장하지 않아요
  const idChecked = () => { const id = document.getElementById('Signin_id01'); return !!id && !!id.value.trim() && checkedId === id.value.trim(); };
  const byAria = (a) => $$('input[aria-label="' + a + '"]').find((i) => !i.readOnly && i.offsetParent !== null);
  const emptyAria = (a) => { const i = byAria(a); return !!i && (!String(i.value || '').trim() || (i === document.activeElement && !(i.maxLength > 0 && i.value.length >= i.maxLength))); };
  const pwMismatch = () => $$('p.color_main.hiddentxt').some((p) => /일치하지 않습니다/.test(txt(p)) && p.offsetParent !== null && getComputedStyle(p).display !== 'none');

  // 자동 로그아웃 안내 창: 로그인하고 오래 가만히 있으면 어느 화면에서나 떠요 (어르신은 천천히 하시니 자주 만나요)
  const keepSteps = [
    { st: '자동 로그아웃 안내', when: (h) => h.shown('#loginExtension'),
      find: [{ sel: '#loginExtension a', text: '로그인 연장' }],
      msg: '‘로그인 연장’을 누르세요.', sub: '오래 가만히 있으면 저절로 로그아웃돼요. 이걸 누르면 하던 것을 그대로 이어서 해요. ‘로그아웃’은 누르지 마세요.', fill: false }
  ];

  // 로그인 뒤 예약 화면 (2026-11-12 실제 계정으로 확인)
  //  진료과 → 의료진 → 날짜 → 시간 → 오른쪽 '예약하기'(창만 열림) → [사전문진] → 증상 창의 '예약하기'(이때 예약이 잡힘)
  const NAME = '#nameCheckModal', QNA = '#doctorQnaModal', RMSG = '#reservationMsgModal';
  const onScreen = (e) => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
  // 왼쪽 STEP01·02·03 중 지금 열린 단계와 그 내용 칸
  const openTitle = (n) => $$('.reservation_stepouter .steptitle.step' + n + 'title.active').find(onScreen);
  const openBox = (n) => { const t = openTitle(n); return t && t.nextElementSibling; };
  // 주민번호 칸: 숫자가 다 찼는지 / 숫자가 아닌 것이 들어 있는지 (값은 이 화면에서 세기만 하고 어디로도 보내지 않아요)
  // 크롬이 저장해 둔 아이디·비밀번호를 이 두 칸에 자동으로 넣는 일이 있어요 (2026-11-12 실제 화면에서 확인).
  const digits = (id, n) => { const e = document.getElementById(id); return !!e && new RegExp('^\\d{' + n + '}$').test(String(e.value || '')); };
  const junk = (id) => { const e = document.getElementById(id); return !!e && /\D/.test(String(e.value || '')); };
  // 목록이 뜨는 동안 잠깐 보이는 "없습니다"를 믿지 않아요: 3초 넘게 그대로일 때만 정말 없는 거예요
  const since = {};
  const stable = (key, cond, ms) => { if (!cond) { since[key] = 0; return false; } if (!since[key]) since[key] = Date.now(); return Date.now() - since[key] >= (ms || 3000); };
  // 과·달이 바뀌면 처음부터 다시 세요
  const docKey = () => 'doc:' + txt(document.querySelector('.reservation_stepouter .steptitle.step1title'));
  const dayKey = () => 'day:' + txt(document.querySelector('.reservation_stepouter .steptitle.step2title')) + txt(document.querySelector('.month_select strong'));
  const noDoctor = () => { const b = openBox(2); return !!b && [...b.querySelectorAll('.nodata, p, div')].some((e) => onScreen(e) && /예약 가능한 의료진이 없습니다/.test(txt(e)) && e.children.length < 3); };
  const dayPicked = () => !!document.querySelector('#calendar td.select');
  const hasOpenDay = () => !!document.querySelector('#calendar td.pos');
  // 예약할 수 있는 날이 없는 달을 몇 번 봤는지 세요 (선생님이 바뀌면 처음부터). 두 달째도 없으면 전화를 권해요.
  // (2026-11-12 팀원 시험: 달력이 꽉 차 있으면 다음 달만 계속 넘기게 돼요)
  const emptyMonths = {};
  const countEmptyMonth = () => { const d = txt(document.querySelector('.reservation_stepouter .steptitle.step2title')); const m = txt(document.querySelector('.month_select strong'));
    (emptyMonths[d] = emptyMonths[d] || new Set()).add(m); return emptyMonths[d].size; };
  const timePicked = () => !!document.querySelector('.select_time li.select');
  // 사전문진: 아직 답하지 않은 첫 질문 (질문마다 '예'·'아니오' 둘 중 하나)
  const qnaNext = () => {
    const names = [...new Set($$(QNA + ' input[type="radio"]').map((r) => r.name).filter(Boolean))];
    const n = names.find((nm) => !$$(QNA + ' input[name="' + nm + '"]').some((r) => r.checked));
    const y = n && document.getElementById(n + '_Y');
    return y && (y.closest('.textabox') || y.closest('.agree_line'));
  };
  // 선생님을 고르는 곳의 모양: 컴퓨터는 이름 왼쪽의 작은 동그라미, 휴대폰은 선생님마다 아래에 있는 넓은 ‘선택’ 막대
  // (2026-11-12 아이폰 실사용 영상으로 확인). 화면에 실제로 그려진 모양을 보고 말을 골라요.
  const pickIsBar = () => {
    const box = openBox(2) || document.querySelector('.reservation_stepouter .gui_wrap');
    const l = box && [...box.querySelectorAll('.agree_line label, label[for^="Select_Doc"]')].find(onScreen);
    // 누르는 부분은 글자표(label) 안의 체크 칸(input)이에요. 휴대폰에서는 그 칸이 넓은 막대로 그려져요: 둘 중 넓은 쪽을 재요.
    const i = l && (l.querySelector('input') || (l.htmlFor && document.getElementById(l.htmlFor)));
    const w = Math.max(l ? l.getBoundingClientRect().width : 0, i ? i.getBoundingClientRect().width : 0);
    if (w >= 100) return true;
    // 병원 화면이 휴대폰 모양으로 바뀌는 폭(750px 이하)이면 ‘선택’ 막대예요 (2026-11-12 아이폰 영상)
    return (window.visualViewport ? visualViewport.width * visualViewport.scale : innerWidth) <= 750;
  };
  const pickMsg = () => pickIsBar() ? '진료받을 선생님 칸의 ‘선택’을 누르세요.' : '선생님 이름 왼쪽의 동그라미를 누르세요.';
  const pickSub = () => (pickIsBar() ? '선생님마다 아래에 ‘선택’ 막대가 있어요. ' : '이름이나 사진을 눌러서는 골라지지 않아요. ') + '맨 위 선생님이 가장 빨리 볼 수 있어요(‘빠른진료’ 날짜). ‘전문진료분야’에 아픈 곳이 적힌 분이면 더 좋아요.';
  // 의료진 예약 탭: 이름 검색
  const docSearch = () => $$('.search_doc input').find(onScreen);
  const docListed = () => $$('.reservation_stepouter li.nbdt').some(onScreen);

  window.__YK_RULES = {
    hospital: '고려대학교 안암병원',
    analyzedOn: '2026-11-12',
    phone: '1577-0083',
    hours: '평일 오전 8시 ~ 오후 6시 · 토요일 오전 8시 30분 ~ 오후 1시 30분',

    pages: [
      {
        name: '메인',
        match: (p) => p === '/' || p === '/kr' || p === '/kr/' || p.startsWith('/kr/index.do'),
        nudge: '처음 오셨으면 ‘도움’을 누르세요',
        steps: [
          ...keepSteps,
          { st: '공지 창', when: (h) => h.shown('.popupModalOuter .popupClose a.close') || h.shown('.popupModalOuter a.close'),
            find: [{ sel: '.popupModalOuter .popupClose a.close', text: '닫기' }, { sel: '.popupModalOuter a.close' }],
            msg: '먼저 이 알림 창의 ‘닫기’를 누르세요.', sub: '병원 공지 창이에요. 닫아야 예약 버튼이 보여요.', fill: false },
          ...quickSteps,
          { st: '처음인지 아직 모름', when: (h) => !h.flag('visitFirst') && !h.flag('visitAgain'),
            ask: [{ label: '처음이에요', flag: 'visitFirst' }, { label: '다녀간 적 있어요', flag: 'visitAgain' }],
            find: [{ sel: 'div.box.box01 > a.title', text: '첫방문' }, { sel: 'div.box.box02 > a.title' }],
            msg: '고대안암병원에 처음 오셨나요?', sub: '처음이면 로그인 없이 상담원이 전화로 예약해 드려요.' },
          // 1) 처음: 첫방문 간편예약 칸(이름·전화번호) → 예약신청
          { st: '처음: 칸이 보임', when: (h) => h.flag('visitFirst') && h.shown('div.box.box01 a.submit'),
            find: [{ sel: 'div.box.box01 a.submit', text: '예약신청' }],
            msg: '‘예약신청’을 누르세요.', sub: '상담원이 전화해서 날짜를 잡아드려요. 모르는 번호여도 받아 주세요.' },
          { st: '처음: 접혀 있음', when: (h) => h.flag('visitFirst'),
            find: [{ sel: 'div.box.box01 > a.title', text: '첫방문' }],
            msg: HOVER ? '마우스를 ‘첫방문 간편예약’ 위에 올려 두세요.' : '‘첫방문 간편예약’을 누르세요.',
            sub: HOVER ? '누르지 않아도 돼요. 올려 두면 이름·전화번호 칸이 나와요.' : '누르면 이름·전화번호 칸이 나와요.', fill: false },
          // 2) 다녀감: 온라인 예약
          { st: '다녀감: 온라인 예약이 보임', when: (h) => h.shown('a.btn_appointment.appointment_e'),
            find: [{ sel: 'a.btn_appointment.appointment_e', text: '온라인 예약' }],
            msg: '‘온라인 예약’을 누르세요.', sub: '‘로그인 후 이용이 가능합니다’라는 작은 창이 뜨면 ‘확인’(휴대폰은 ‘닫기’)을 누르세요. 다음 화면에서 아이디로 로그인해요. 아이디가 없어도 방법을 알려드려요.' },
          { st: '다녀감: 접혀 있음', when: () => true,
            find: [{ sel: 'div.box.box02 > a.title', text: '온라인 진료예약' }],
            msg: HOVER ? '마우스를 ‘온라인 진료예약’ 위에 올려 두세요.' : '‘온라인 진료예약’을 누르세요.',
            sub: HOVER ? '누르지 않아도 돼요. 올려 두면 ‘온라인 예약’ 버튼이 나와요. (‘챗봇 예약’은 누르지 마세요)' : '누르면 아래에 ‘온라인 예약’ 버튼이 나와요.', fill: false }
        ]
      },
      {
        name: '진료예약 안내',
        match: (p) => p.startsWith('/kr/reservation-issue/reservation/med-appointment.do'),
        steps: [
          ...keepSteps,
          ...quickSteps,
          { st: '처음인지 아직 모름', when: (h) => !h.flag('visitFirst') && !h.flag('visitAgain'),
            ask: [{ label: '처음이에요', flag: 'visitFirst' }, { label: '다녀간 적 있어요', flag: 'visitAgain' }],
            find: [{ sel: 'a[href*="quickReservationInput"]' }], msg: '고대안암병원에 처음 오셨나요?', sub: '처음이면 로그인 없이 상담원이 전화로 예약해 드려요.' },
          { st: '처음', when: (h) => h.flag('visitFirst'),
            find: [{ sel: 'a[href*="quickReservationInput"]', text: '간편예약' }],
            msg: '‘간편예약 바로가기’를 누르세요.', sub: '이름과 휴대폰 번호만 넣으면 상담원이 전화해 드려요.', fill: false },
          { st: '다녀감', when: () => true,
            find: [{ sel: 'a[href="/kr/appointment/appointment.do"]', text: '온라인예약' }],
            msg: '‘온라인예약 바로가기’를 누르세요.', sub: '아이디로 로그인해서 예약해요.', fill: false }
        ]
      },
      {
        name: '로그인',
        match: (p) => p.startsWith('/kr/login/login.do'),
        nudge: '아이디가 없으면 ‘도움’을 누르세요',
        steps: [
          ...keepSteps,
          ...quickSteps,
          // 아이디를 넣기 시작했거나 "있어요"라고 답했으면 아이디 로그인
          { st: '아이디 빈칸', when: (h) => (h.flag('hasId') || h.typed('#login_inputID, #login_inputPW')) && !h.filled('login_inputID'),
            find: [{ sel: '#login_inputID' }], msg: '‘아이디’ 칸에 아이디를 넣으세요.', sub: '기억이 안 나시면 오른쪽 ‘아이디 찾기’를 누르세요.' },
          { st: '비밀번호 빈칸', when: (h) => (h.flag('hasId') || h.typed('#login_inputID, #login_inputPW')) && !h.filled('login_inputPW'),
            find: [{ sel: '#login_inputPW' }], msg: '‘비밀번호’ 칸에 비밀번호를 넣으세요.', sub: '눈 모양을 누르면 쓴 글자가 보여요. 기억이 안 나시면 ‘비밀번호 찾기’를 누르세요.' },
          { st: '로그인', when: (h) => h.flag('hasId') || h.typed('#login_inputID, #login_inputPW'),
            find: [{ sel: 'a.loginbtn', text: '로그인' }], msg: '‘로그인’을 누르세요.', sub: '틀렸다고 나오면 다시 넣으면 돼요. 5번 틀리면 잠길 수 있으니 ‘비밀번호 찾기’를 쓰세요.' },
          { st: '아이디 있는지 모름', when: (h) => !h.flag('noId'),
            ask: [{ label: '있어요', flag: 'hasId', was: '아이디 있음' }, { label: '없어요', flag: 'noId', was: '아이디 없음' }],
            find: [{ sel: '#login_inputID' }], msg: '고대병원 홈페이지 아이디가 있으세요?', sub: '안암·구로·안산 고대병원 아이디는 같아요.' },
          // 3) 아이디 없음
          { st: '아이디 없음', when: () => true,
            find: [{ sel: 'a.signinbtn', text: '회원가입' }, { sel: 'a[href="/kr/regist/select.do"]', text: '회원가입' }],
            msg: '‘회원가입’을 누르세요.', sub: '휴대폰 본인인증으로 10분쯤 걸려요. 어려우면 ‘전화로’를 눌러 1577-0083으로 예약하세요. 처음 오시는 분은 첫 화면의 ‘첫방문 간편예약’이 더 쉬워요.', fill: false }
        ]
      },
      {
        name: '회원가입 고르기',
        match: (p) => p.startsWith('/kr/regist/select.do'),
        steps: [
          ...keepSteps,
          { st: '일반 회원가입', when: () => true,
            find: [{ sel: 'a[href="/kr/regist/agree.do"]', text: '회원가입' }],
            msg: '맨 왼쪽 ‘일반 회원가입’의 ‘회원가입’을 누르세요.', sub: '만 14세 이상이면 이걸 눌러요. 휴대폰 본인인증이 필요해요.', fill: false }
        ]
      },
      {
        name: '회원가입 1. 약관동의',
        match: (p) => p.startsWith('/kr/regist/agree.do'),
        steps: [
          ...keepSteps,
          { st: '이용약관', when: (h) => !h.checked('Agree01_service01'),
            find: [{ sel: 'label[for="Agree01_service01"]' }],
            msg: '‘이용약관’ 아래의 ‘동의합니다’를 누르세요.', sub: '홈페이지를 쓰려면 꼭 동의해야 해요. 글이 길어서 다 읽지 않아도 돼요.' },
          { st: '개인정보', when: (h) => !h.checked('Agree02_service01'),
            find: [{ sel: 'label[for="Agree02_service01"]' }],
            msg: '‘개인정보 수집 및 이용’ 아래의 ‘동의합니다’를 누르세요.', sub: '이것도 꼭 동의해야 해요. 그 아래 ‘마케팅’ 동의는 안 해도 돼요.' },
          { st: '다음단계', when: () => true,
            find: [{ sel: 'a.btn.main', text: '다음단계' }],
            msg: '맨 아래 ‘다음단계’를 누르세요.', sub: '다음은 휴대폰 본인인증이에요.', fill: false }
        ]
      },
      {
        name: '회원가입 2. 본인인증',
        match: (p) => p.startsWith('/kr/regist/cert.do'),
        steps: [
          ...keepSteps,
          { st: '본인인증', when: () => true,
            find: [{ fn: () => { const c = document.querySelector('.iconbox.self'); for (let a = c, i = 0; a && i < 4; i++, a = a.parentElement) { const b = [...a.querySelectorAll('a, button')].find((x) => /인증하기/.test(txt(x))); if (b) return b; } return null; } },
                   { sel: 'a, button', text: '인증하기' }],
            msg: '‘본인 인증’ 아래의 ‘인증하기’를 누르세요.',
            sub: '새 창이 열려요. ‘팝업 윈도우를 열려고 시도 중입니다’가 뜨면 꼭 ‘허용’을 누르세요. 새 창에서는 통신사 → 이름 → 생년월일 → 휴대폰 번호 → 그림 속 숫자 → 문자로 온 6자리 순서로 넣어요. 3분 안에 넣어야 해요.', fill: false }
        ]
      },
      {
        name: '회원가입 3. 회원정보 입력',
        match: (p) => p.startsWith('/kr/regist/register.do'),
        steps: [
          ...keepSteps,
          { st: '아이디', when: (h) => !h.filled('Signin_id01'),
            find: [{ sel: '#Signin_id01' }], msg: '쓰고 싶은 ‘아이디’를 만들어 넣으세요.',
            sub: '영어 소문자로 시작해서 영어와 숫자로 3~12자예요. 예: 이름 영어 + 태어난 해. 종이에 적어 두세요.' },
          { st: '중복확인', when: () => !idChecked(),
            find: [{ sel: '.signin_input a, .signin_input button', text: '중복확인' }, { sel: 'a, button', text: '중복확인' }],
            msg: '아이디 옆 ‘중복확인’을 누르세요.', sub: '‘사용하시겠습니까?’가 뜨면 ‘확인’을 누르세요. ‘중복된 아이디’라고 나오면 아이디를 조금 바꿔서 다시 눌러요.', fill: false },
          { st: '비밀번호', when: (h) => !h.filled('Signin_pw01'),
            find: [{ sel: '#Signin_pw01' }], msg: '‘비밀번호’를 만들어 넣으세요.',
            sub: '영어 + 숫자 + 특수문자(! @ 같은 기호)를 섞어 8~12자예요. 같은 글자 4번 연속, 아이디와 같은 글자는 안 돼요. 꼭 종이에 적어 두세요.' },
          { st: '비밀번호 확인', when: (h) => !h.filled('Signin_pw02'),
            find: [{ sel: '#Signin_pw02' }], msg: '‘비밀번호 확인’에 같은 비밀번호를 한 번 더 넣으세요.', sub: '위에 넣은 것과 똑같이 넣어요.' },
          { st: '비밀번호 다름', when: () => pwMismatch(),
            find: [{ sel: '#Signin_pw02' }], msg: '두 비밀번호가 서로 달라요. ‘비밀번호 확인’을 지우고 다시 넣으세요.', sub: '대문자·소문자도 똑같아야 해요. 그래도 안 되면 위 ‘비밀번호’부터 다시 넣어요.' },
          { st: '휴대폰 앞', when: () => emptyAria('휴대전화번호 앞자리'), find: [{ fn: () => byAria('휴대전화번호 앞자리') }], msg: '휴대폰 번호 앞 3자리를 넣으세요.', sub: '예: 010' },
          { st: '휴대폰 가운데', when: () => emptyAria('휴대전화번호 중간자리'), find: [{ fn: () => byAria('휴대전화번호 중간자리') }], msg: '휴대폰 번호 가운데 4자리를 넣으세요.', sub: '예: 010-1234-5678이면 1234' },
          { st: '휴대폰 끝', when: () => emptyAria('휴대전화번호 뒷자리'), find: [{ fn: () => byAria('휴대전화번호 뒷자리') }], msg: '휴대폰 번호 끝 4자리를 넣으세요.', sub: '예: 010-1234-5678이면 5678' },
          { st: '문자 수신', when: (h) => !h.checked('Signin_sel_SMS01') && !h.checked('Signin_sel_SMS02'),
            find: [{ sel: 'label[for="Signin_sel_SMS01"]' }], msg: '‘SMS 수신’을 누르세요.', sub: '예약 날짜를 문자로 알려줘요. 꼭 하나를 골라야 다음으로 가요.' },
          { st: '이메일 앞', when: () => emptyAria('이메일 아이디'), find: [{ fn: () => byAria('이메일 아이디') }],
            msg: '‘이메일’ 앞 칸에 이메일 @ 앞부분을 넣으세요.', sub: '예: hong1950@naver.com이면 hong1950. 이메일이 없으시면 ‘전화로’ 예약하시는 게 빨라요.' },
          { st: '이메일 뒤', when: () => emptyAria('도메인 주소'), find: [{ sel: '#email_sel' }, { fn: () => byAria('도메인 주소') }],
            msg: '옆 목록에서 ‘naver.com’처럼 @ 뒷부분을 고르세요.', sub: '목록에 없으면 ‘직접입력’을 그대로 두고 @ 오른쪽 칸에 직접 써요.' },
          { st: '회원가입', when: () => true,
            find: [{ sel: '.btn_wrap a, .btn_wrap button', text: '회원가입' }],
            msg: '맨 아래 ‘회원가입’을 누르세요.', sub: '주소·유선 전화·뉴스레터는 안 써도 돼요. ‘암호를 저장하겠습니까?’가 뜨면 저장해 두면 다음 로그인이 쉬워요.', fill: false }
        ]
      },
      {
        name: '회원가입 4. 완료',
        match: (p) => p.startsWith('/kr/regist/complete.do'),
        steps: [
          ...keepSteps,
          { st: '완료', when: () => true,
            find: [{ sel: '.btn_wrap a, .btn_wrap button', text: '로그인' }],
            msg: '가입이 끝났어요! 이제 ‘로그인’을 누르세요.', sub: '아이디와 비밀번호를 종이에 적어 두셨는지 한 번 더 보세요.', fill: false }
        ]
      },
      {
        name: '아이디 찾기',
        match: (p) => p.startsWith('/kr/login/idInquiry.do'),
        steps: [
          ...keepSteps,
          // 가장 쉬운 방법: 이름 + 휴대폰 번호
          { st: '이름', when: (h) => !h.filled('certification_Nama01'),
            find: [{ sel: '#certification_Nama01' }], msg: '‘휴대전화 인증’의 ‘이름’ 칸에 이름을 넣으세요.', sub: '가입할 때 쓴 이름과 휴대폰 번호로 아이디를 찾아요.' },
          { st: '번호 앞', when: (h) => !h.filled('certification_Phone01'),
            find: [{ sel: '#certification_Phone01' }], msg: '휴대폰 번호 앞 3자리를 넣으세요.', sub: '예: 010' },
          { st: '번호 가운데', when: (h) => !h.filled('certification_Phone02'),
            find: [{ sel: '#certification_Phone02' }], msg: '휴대폰 번호 가운데 4자리를 넣으세요.', sub: '예: 010-1234-5678이면 1234' },
          { st: '번호 끝', when: (h) => !h.filled('certification_Phone03'),
            find: [{ sel: '#certification_Phone03' }], msg: '휴대폰 번호 끝 4자리를 넣으세요.', sub: '예: 010-1234-5678이면 5678' },
          { st: '찾기', when: () => true,
            find: [{ fn: () => { const n = document.getElementById('certification_Phone03'); for (let a = n && n.parentElement, i = 0; a && i < 6; i++, a = a.parentElement) { const b = [...a.querySelectorAll('a, button')].find((x) => txt(x) === '아이디 찾기'); if (b) return b; } return null; } }],
            msg: '그 아래 ‘아이디 찾기’를 누르세요.', sub: '아이디가 화면에 나오면 종이에 적어 두세요.' }
        ]
      },
      {
        name: '비밀번호 찾기',
        match: (p) => p.startsWith('/kr/login/pwInquiry.do'),
        steps: [...keepSteps] // 공통 지도가 칸 이름을 읽어 안내해요 (본인인증이 필요한 화면)
      },
      {
        // 로그인 뒤 예약 화면: 2026-11-12 실제 계정으로 확인 (증상 창의 '예약하기'는 누르지 않음)
        name: '외래진료예약',
        match: (p) => p.startsWith('/kr/appointment/appointment.do') || p.startsWith('/kr/appointment/appointmentDoctor.do'),
        steps: [
          ...keepSteps,
          // 실명인증 창: 안암병원 환자번호가 아직 없는 회원에게 예약 화면을 열 때마다 떠요
          { st: '실명인증: 동의', when: (h) => h.shown(NAME) && !agreed(NAME),
            find: [{ fn: () => agreeLabel(NAME) }, { sel: 'label[for="modal-user-authAgree"]' }],
            msg: '‘동의합니다’를 누르세요.', sub: '병원이 건강보험을 확인하려고 주민등록번호를 한 번 확인해요. ‘취소’를 누르면 첫 화면으로 돌아가요.' },
          { st: '실명인증: 앞 칸에 다른 글자', when: (h) => h.shown(NAME) && junk('modal-user-authnum01'),
            find: [{ sel: '#modal-user-authnum01' }],
            msg: '주민등록번호 앞 칸에 다른 글자가 들어가 있어요. 모두 지우고 숫자 6자리를 넣으세요.',
            sub: '인터넷(크롬)이 저장해 둔 아이디를 이 칸에 잘못 넣은 거예요. 칸을 누르고 지우기(←)로 모두 지운 뒤, 태어난 해·달·날 6자리를 넣으세요. 예: 1950년 3월 5일이면 500305' },
          { st: '실명인증: 주민번호 앞', when: (h) => h.shown(NAME) && !digits('modal-user-authnum01', 6),
            find: [{ sel: '#modal-user-authnum01' }],
            msg: '주민등록번호 앞 6자리를 넣으세요.', sub: '태어난 해·달·날 6자리예요. 예: 1950년 3월 5일이면 500305. 이름은 이미 들어가 있어요.' },
          { st: '실명인증: 뒤 칸에 다른 글자', when: (h) => h.shown(NAME) && junk('modal-user-authnum02'),
            find: [{ sel: '#modal-user-authnum02' }],
            msg: '주민등록번호 뒤 칸에 다른 것이 들어가 있어요. 모두 지우고 숫자 7자리를 넣으세요.',
            sub: '저장해 둔 비밀번호가 이 칸에 잘못 들어간 거예요. ●●●가 보여도 칸을 누르고 모두 지운 뒤 다시 넣으세요.' },
          { st: '실명인증: 주민번호 뒤', when: (h) => h.shown(NAME) && !digits('modal-user-authnum02', 7),
            find: [{ sel: '#modal-user-authnum02' }],
            msg: '주민등록번호 뒤 7자리를 넣으세요.', sub: '넣으면 ●●●로 가려져 보여요. 맞게 넣은 거예요.' },
          { st: '실명인증: 확인', when: (h) => h.shown(NAME),
            find: [{ sel: NAME + ' a.btn_main', text: '확인' }, { sel: NAME + ' a', text: '확인' }],
            msg: '‘확인’을 누르세요.', sub: '‘잘못된 주민등록번호’라고 나오면 숫자를 다시 보세요.', fill: false },
          // 최근 예약내역 창 (오른쪽 '최근 예약내역 불러오기'를 누르면 떠요): 전에 본 선생님을 그대로 고를 수 있어요
          { st: '최근 예약내역: 고르기', when: (h) => h.shown('#reserveInfonModal') && h.shown('#reserveInfonModal a.tb_btn'),
            find: [{ fn: () => { const a = document.querySelector('#reserveInfonModal a.tb_btn'); return a && (a.closest('table') || a); } }],
            msg: '다시 보고 싶은 선생님 줄의 ‘선택’을 누르세요.', sub: '지난 1년 동안 예약한 내역이에요. 누르면 그 과와 선생님이 바로 골라져요. 여기에 없으면 ‘취소’를 누르세요.', fill: false },
          { st: '최근 예약내역: 없음', when: (h) => h.shown('#reserveInfonModal'),
            find: [{ sel: '#reserveInfonModal .btn_wrap a', text: '취소' }, { sel: '#reserveInfonModal a', text: '취소' }],
            msg: '전에 예약한 내역이 없어요. ‘취소’를 누르세요.', sub: '창이 닫히면 진료과부터 차례로 고르면 돼요.', fill: false },
          // 사전문진 창 (선생님에 따라 떠요): 하나라도 '아니오'면 인터넷 예약이 막혀요
          { st: '사전문진: 아니오를 고름', when: (h) => h.shown(QNA + ' a[title="이전으로"]'),
            find: [{ sel: QNA + ' a', text: '이전으로' }],
            msg: '이 선생님은 인터넷으로 예약할 수 없어요. 전화로 예약하세요.', sub: '‘아니오’를 잘못 누르셨으면 ‘이전으로’를 눌러 다시 고르세요. 맞게 고르셨으면 아래 ‘전화로’를 눌러 1577-0083으로 예약해요.', fill: false },
          { st: '사전문진: 질문', when: (h) => h.shown(QNA),
            find: [{ fn: qnaNext }],
            msg: '질문을 읽고 맞으면 ‘예’, 아니면 ‘아니오’를 누르세요.', sub: '질문이 여러 개면 하나씩 답해요. 모두 ‘예’면 다음 창으로 넘어가요. 잘 모르겠으면 ‘전화로’를 눌러 물어보세요.', fill: false },
          // 증상 창: 여기 '예약하기'를 눌러야 예약이 잡혀요
          // 다 쓴 것으로 보는 때: 칸을 벗어났거나, 휴대폰에서 키보드를 내렸거나, 3초 동안 더 쓰지 않았을 때
          { st: '증상', when: (h) => h.shown('#reservationMsg') && !(h.filled('reservationMsg') || h.settled('reservationMsg', 3000)),
            find: [{ sel: '#reservationMsg' }],
            msg: '어디가 어떻게 아픈지 짧게 쓰세요.', sub: '30자까지 써요. 예: 오른쪽 무릎이 아파서 걷기 힘들어요. 다 쓰고 잠깐 기다리면 다음 할 일을 알려드려요.' },
          { st: '마지막 예약하기', when: (h) => h.shown(RMSG),
            find: [{ sel: RMSG + ' a[title="예약하기"]' }, { sel: RMSG + ' a.btn_main', text: '예약하기' }],
            msg: '마지막이에요. 이 ‘예약하기’를 누르면 진짜로 예약이 잡혀요.', sub: '고른 진료과·선생님·날짜·시간이 맞는지 한 번 더 보세요. 바꾸고 싶으면 ‘취소’를 눌러요. 증상을 고치려면 글 칸을 다시 누르면 돼요.', fill: false },
          // STEP01 진료과
          { st: '진료과 고르기', when: () => !!openTitle(1),
            find: [{ fn: () => openBox(1) }],
            msg: '진료받을 과 이름을 누르세요.', sub: '위의 ㄱ·ㄴ·ㄷ을 누르면 그 글자로 시작하는 과만 보여요. 전에 예약한 선생님께 다시 가시면 오른쪽 ‘최근 예약내역 불러오기’가 쉬워요. 어느 과인지 모르면 ‘전화로’를 누르세요.', fill: false },
          // 의료진 예약 탭: 선생님 이름으로 찾기
          { st: '의료진 이름 넣기', when: () => !openTitle(3) && !!docSearch() && !docListed() && String(docSearch().value || '').trim().length < 2,
            find: [{ fn: docSearch }],
            msg: '선생님 이름을 두 글자 이상 넣으세요.', sub: '예: 홍길동 선생님이면 ‘홍길동’. 이름을 모르시면 위의 ‘진료과 예약’을 누르세요.' },
          { st: '의료진 검색', when: () => !openTitle(3) && !!docSearch() && !docListed(),
            find: [{ fn: () => $$('.search_docbtn a, .search_docbtn button').find((b) => txt(b) === '검색') }],
            msg: '‘검색’을 누르세요.', sub: '‘검색된 의료진이 없습니다’가 나오면 이름을 다시 보세요.', fill: false },
          { st: '의료진 고르기(검색)', when: () => !openTitle(3) && docListed(),
            find: [{ fn: () => { const li = $$('.reservation_stepouter li.nbdt').find(onScreen); return li && li.parentElement; } }],
            get msg() { return pickIsBar() ? '찾는 선생님 칸의 ‘선택’을 누르세요.' : '찾는 선생님 이름 왼쪽의 동그라미를 누르세요.'; }, sub: '이름이나 사진을 눌러서는 골라지지 않아요.', fill: false },
          // STEP02 의료진
          { st: '의료진 불러오는 중', when: () => !!openTitle(2) && noDoctor() && !stable(docKey(), true),
            find: [{ fn: () => openBox(2) }],
            msg: '선생님 목록을 불러오고 있어요. 잠시만 기다리세요.', sub: '몇 초 걸려요. 아무것도 누르지 않아도 돼요.', fill: false },
          { st: '의료진 없음', when: () => !!openTitle(2) && stable(docKey(), noDoctor()),
            find: [{ fn: () => openBox(2) }],
            msg: '이 과는 인터넷으로 예약할 수 있는 선생님이 없어요.', sub: '위의 ‘STEP01’을 눌러 다른 과를 고르거나, ‘전화로’를 눌러 1577-0083으로 예약하세요.', fill: false },
          { st: '의료진 고르기', when: () => { stable(docKey(), false); return !!openTitle(2); },
            find: [{ fn: () => openBox(2) }],
            get msg() { return pickMsg(); }, get sub() { return pickSub(); }, fill: false },
          // STEP03 날짜 → 시간 → 예약하기
          { st: '달력 불러오는 중', when: () => !!openTitle(3) && !dayPicked() && !hasOpenDay() && !stable(dayKey(), true),
            find: [{ sel: '#calendar' }],
            msg: '달력을 불러오고 있어요. 잠시만 기다리세요.', sub: '몇 초 걸려요. 아무것도 누르지 않아도 돼요.', fill: false },
          { st: '계속 빈 날 없음', when: () => !!openTitle(3) && !dayPicked() && stable(dayKey(), !hasOpenDay()) && countEmptyMonth() >= 2,
            find: [{ sel: '#calendar' }],
            msg: '다음 달에도 예약할 수 있는 날이 없어요. 병원에 전화로 물어보세요.',
            sub: '아래 ‘📞 전화로’를 누르면 예약센터 번호(1577-0083)가 나와요. 전화하면 더 빠른 날짜나 다른 선생님을 안내받을 수 있어요. 다른 선생님으로 직접 바꾸려면 화면을 위로 올려 ‘STEP02’를 누르세요.', fill: false },
          { st: '이번 달 빈 날 없음', when: () => !!openTitle(3) && !dayPicked() && stable(dayKey(), !hasOpenDay()),
            find: [{ sel: '.month_select a.month_next' }],
            msg: '이번 달은 예약할 수 있는 날이 없어요. 달력 위 ‘>’를 눌러 다음 달을 보세요.', sub: '다른 선생님으로 바꾸려면 화면을 위로 올려 ‘STEP02’를 누르세요. 다음 달에도 없으면 ‘전화로’를 눌러 물어보세요.', fill: false },
          { st: '날짜 고르기', when: () => { stable(dayKey(), false); return !!openTitle(3) && !dayPicked(); },
            find: [{ sel: '#calendar' }],
            msg: '연한 주황색으로 칠해진 날짜를 누르세요.', sub: '그 날이 예약할 수 있는 날이에요(달력 아래 ‘예약가능’). 빨간 테두리는 오늘이에요. 다른 달은 달력 위 ‘<’ ‘>’를 눌러요.', fill: false },
          { st: '시간 고르기', when: () => !!openTitle(3) && dayPicked() && !timePicked(),
            find: [{ sel: '.select_time .time_inner' }, { sel: '.select_time' }],
            msg: HOVER ? '달력 오른쪽에 나온 시간을 누르세요.' : '달력 아래에 나온 시간을 누르세요.', sub: '시간이 하나뿐이면 그걸 눌러요. 시간이 안 보이면 다른 날짜를 눌러 보세요.', fill: false },
          { st: '예약하기(창 열기)', when: () => !!openTitle(3) && dayPicked() && timePicked(),
            find: [{ sel: 'a.btn_finish' }],
            msg: '‘예약하기’를 누르세요.', sub: '아직 예약이 잡히지는 않아요. 다음 창에서 증상을 쓰고 한 번 더 ‘예약하기’를 눌러야 끝나요.', fill: false }
        ]
      },
      {
        // ★ 실제 예약을 만들지 않아서 아직 화면을 보지 못함 (사이트 코드로 확인: 진료과·의료진·날짜·시간을 보여줌)
        name: '예약완료',
        match: (p) => p.startsWith('/kr/appointment/appointmentSuccess.do'),
        steps: [
          ...keepSteps,
          { st: '완료', when: () => true,
            find: [{ fn: () => [...document.querySelectorAll('h2, h3, p, span, strong')].find((e) => /정상적으로 완료되었습니다/.test(txt(e)) && e.children.length < 3) },
                   { fn: () => [...document.querySelectorAll('h2, h3, p, span, strong')].find((e) => /예약.*완료/.test(txt(e)) && e.children.length < 3) }],
            msg: '예약이 끝났어요.', sub: '날짜·시간·선생님을 종이에 적어 두세요. 예약 날짜는 문자로도 와요. 처음 가시면 동네 병원 진료의뢰서를 챙기세요(보험 혜택). 당일 취소는 전화로만 돼요.', fill: false }
        ]
      }
    ],

    fallback: {
      find: [{ sel: 'a.btn_appointment.appointment_e', text: '온라인 예약' }],
      msg: '예약하시려면 ‘온라인 예약’을 누르세요.', sub: '이 화면은 아직 자세한 안내가 준비 중이에요.'
    }
  };
})();

    },
    snuh: function () {
/*
 * 서울대학교병원 모바일·PC 웹 안내표 (www.snuh.org)
 * 2026-11-11에 공개 화면(인트로, 메인, 로그인, 예약안내)의 화면 구조를 분석해 만든 표예요.
 * 휴대폰 화면과 PC 화면이 같은 요소 id를 써서 표 하나로 둘 다 안내해요.
 * 로그인 뒤 화면(진료회원 인증, ①~⑤ 예약)은 아직 분석하지 못해서 "준비 중"으로 안내해요.
 *
 * 각 줄: 이 화면에서(when 조건이 맞을 때) → 짚을 곳(find) → 할 말(msg) → 자세히(sub)
 * find: { sel: CSS 선택자, text: 이 글자가 들어간 것만 } 여러 개면 앞에서부터 찾아요.
 */
window.__YK_RULES = {
  hospital: '서울대학교병원',
  analyzedOn: '2026-11-11',
  phone: '1588-5700',
  hours: '평일 오전 9시 ~ 오후 6시 · 토요일 오전 9시 ~ 오후 1시',

  pages: [
    {
      name: '병원 고르기',
      match: (p) => p === '/' || p.startsWith('/intro.do'),
      steps: [
        { st: '항상', when: () => true,
          find: [{ sel: 'a[href*="www.snuh.org/main.do"]', text: '서울대학교병원' }],
          msg: '‘서울대학교병원’을 누르세요.', sub: '어린이는 어린이병원, 암 진료는 암병원을 누르세요.' }
      ]
    },
    {
      name: '메인',
      match: (p) => p.startsWith('/main.do'),
      nudge: '처음 오셨으면 ‘도움’을 누르세요',
      steps: [
        // the screen cannot tell a first visit from a return visit, so ask once (two answers only)
        { st: '처음인지 아직 모름', when: (h) => !h.flag('visitFirst') && !h.flag('visitAgain'), ask: [{ label: '처음이에요', flag: 'visitFirst' }, { label: '다녀간 적 있어요', flag: 'visitAgain' }],
          find: [{ sel: '.mainCol01.bgColor02', text: '인터넷 진료예약' }],
          msg: '이 병원에 처음 오셨나요?', sub: '처음이면 ‘첫예약상담’, 다녀간 적이 있으면 ‘진료예약’으로 가요.' },
        { st: '처음 왔다고 답함', when: (h) => h.flag('visitFirst'),
          find: [{ sel: 'a[onclick*="goFirstReserve"]', text: '첫예약상담' }],
          msg: '‘첫예약상담’을 누르세요.', sub: '처음 오시는 분은 상담 간호사와 통화해서 예약해요. 동네 병원 진료의뢰서를 옆에 두세요.' },
        { st: '항상', when: () => true,
          find: [{ sel: '.mainCol01 .btnWrap a[href="/reservation/reservation.do"]', text: '진료예약' },
                 { sel: 'a[href="/reservation/reservation.do"]', text: '진료예약' }],
          msg: '‘인터넷 진료예약’ 칸의 ‘진료예약’을 누르세요.', sub: '이 병원이 처음이시면 바로 옆의 ‘첫예약상담’을 누르세요.' }
      ]
    },
    {
      name: '로그인',
      match: (p) => p.startsWith('/login.do'),
      nudge: '아이디가 없으면 ‘도움’을 누르세요',
      steps: [
        // 아이디로 로그인하는 중이면 그 길을 따라가요 (비회원 칸을 아직 안 건드렸을 때만)
        { st: '아이디 로그인: 아이디 빈칸', when: (h) => h.memberMode() && !h.filled('id'),
          find: [{ sel: '#id' }], msg: '아이디나 진찰권 번호를 넣으세요.', sub: '진찰권 번호는 병원 카드 앞면에 있는 숫자예요.' },
        { st: '아이디 로그인: 비밀번호 빈칸', when: (h) => h.memberMode() && !h.filled('pass'),
          find: [{ sel: '#pass' }], msg: '비밀번호를 넣으세요.', sub: '기억이 안 나시면 ‘아이디/비밀번호찾기’를 누르세요.' },
        { st: '아이디 로그인: 다 넣음', when: (h) => h.memberMode(),
          find: [{ sel: '#loginBtn' }], msg: '‘로그인’을 누르세요.', sub: '틀려도 다시 넣으면 돼요.' },
        // 기본은 가장 간단한 비회원 로그인으로 안내해요
        { st: '비회원: 이름 빈칸', when: (h) => !h.filled('ptnm'),
          find: [{ sel: '#ptnm' }], msg: '아래 ‘비회원 로그인’에 이름을 넣으세요.',
          sub: '회원가입을 안 하셨어도 진찰권 번호만 있으면 돼요. 아이디가 있으시면 위에서 로그인해도 돼요.' },
        { st: '비회원: 진찰권 번호 빈칸', when: (h) => !h.filled('pt_no'),
          find: [{ sel: '#pt_no' }], msg: '진찰권 번호를 넣으세요.',
          sub: '병원 카드 앞면이나 예약 문자에 있는 번호예요. 모르시면 아래 ‘진찰권 번호(환자번호)를 잊으셨나요?’를 누르세요.' },
        { st: '비회원: 휴대폰 빈칸', when: (h) => !h.filled('hpno'),
          find: [{ sel: '#hpno' }], msg: '휴대폰 번호를 넣으세요.', sub: '병원에 등록된 번호예요.' },
        // fill: false — this button comes before the 승인번호 field, so do not send them to empty fields first
        { st: '비회원: 승인 안 누름', fill: false, when: (h) => !h.flag('smsSent') && !h.filled('userNum02'),
          find: [{ sel: 'button[onclick*="smsSend"]' }], msg: '휴대폰 번호 옆의 ‘승인’을 누르세요.',
          sub: '문자로 승인번호가 와요. 병원은 이 번호를 전화로 묻지 않아요.' },
        { st: '비회원: 승인번호 빈칸', when: (h) => !h.filled('userNum02'),
          find: [{ sel: '#userNum02' }], msg: '문자로 온 승인번호를 넣으세요.', sub: '문자를 보러 나갔다 와도 괜찮아요. 넣던 칸은 그대로 있어요.' },
        { st: '비회원: 동의 안 함', when: (h) => !h.checked('userCheck01'),
          find: [{ sel: 'label[for="userCheck01"]' }, { sel: '.userCheck' }, { sel: '#userCheck01' }],
          msg: '동의 칸을 눌러 체크하세요.', sub: '체크해야 로그인할 수 있어요.' },
        { st: '비회원: 다 넣음', when: () => true,
          find: [{ sel: '#confirmBtn' }], msg: '‘비회원 로그인’을 누르세요.', sub: '틀리면 다시 넣으면 돼요.' }
      ]
    },
    {
      name: '예약안내',
      match: (p) => p.startsWith('/content/M001004005.do'),
      steps: [
        { st: '항상', when: () => true,
          find: [{ sel: 'a', text: '인터넷 예약하기' }],
          msg: '‘인터넷 예약하기’를 누르세요.', sub: '회원가입을 안 하셨으면 아래 ‘비회원 인터넷 예약하기’를 누르세요.' }
      ]
    }
  ],

  // 표에 없는 화면: 예약 버튼이 보이면 그걸 짚고, 없으면 "준비 중"으로 안내해요
  fallback: {
    find: [{ sel: '.bottom-bar a[href="/reservation/reservation.do"]' }, { sel: '.mainCol01 a[href="/reservation/reservation.do"]' }],
    msg: '예약하시려면 ‘진료예약’을 누르세요.', sub: '이 화면은 아직 자세한 안내가 준비 중이에요.'
  }
};

    },
    bumin: function () {
/*
 * 서울부민병원 안내표 (bumin.co.kr) — v1, 2026-11-12
 * 두 번째 병원으로 "안내표 하나에 시간이 얼마나 드는지" 재 보려고 만들었어요 (로그인 없는 화면만).
 *
 * 이 병원의 온라인 예약은 두 갈래예요.
 *   1) 편한예약     → 다른 회사(exona)의 챗봇 창. 그 안은 안내하지 못해요.
 *   2) 간편상담예약 → 이름·휴대폰·전화 받을 시간만 남기면 상담원이 전화해서 예약을 잡아줘요. 어르신께는 이쪽을 안내해요.
 * 첫 화면(공지 창 닫기 → ‘온라인진료예약’)은 공통 예약 지도(stages.js)가 맡아요.
 */
(function () {
  const $$ = (sel) => { try { return [...document.querySelectorAll(sel)]; } catch (e) { return []; } };
  const txt = (e) => (e && (e.textContent || '') || '').replace(/\s+/g, ' ').trim();
  const onScreen = (e) => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden';
  const timePicked = () => $$('input[name="callTimeTp"]').some((r) => r.checked);

  window.__YK_RULES = {
    hospital: '서울부민병원',
    analyzedOn: '2026-11-12',
    phone: '1577-7582',
    hours: '운영 시간은 병원 홈페이지에서 확인하세요',
    pages: [
      {
        name: '온라인 진료예약',
        match: (p) => p.includes('/reserveM/step0.do'),
        steps: [
          { st: '간편상담예약 버튼', when: () => $$('a[href*="resvOfflineList1.do"]').some(onScreen),
            find: [{ sel: 'a[href*="resvOfflineList1.do"]' }],
            msg: '아래 ‘간편상담예약’을 누르세요.', sub: '이름과 휴대폰 번호만 남기면 상담원이 전화해서 예약을 잡아드려요. 회원가입이 필요 없어요.', fill: false },
          { st: '간편상담예약 탭', when: () => true,
            find: [{ fn: () => $$('a[href*="fn_MoveMedicalInfoTab(\'2\')"]').find(onScreen) }, { fn: () => $$('a, button').filter((e) => txt(e) === '간편상담예약' && onScreen(e))[0] }],
            msg: '위쪽 ‘간편상담예약’을 누르세요.', sub: '‘편한예약’은 채팅으로 묻고 답하는 창이 따로 열려요. 전화로 도움받는 ‘간편상담예약’이 더 쉬워요.', fill: false }
        ]
      },
      {
        name: '간편상담예약',
        match: (p) => p.includes('/reserve/resvOfflineList1.do'),
        steps: [
          { st: '이름', when: (h) => !h.filled('resvUserNm'),
            find: [{ sel: '#resvUserNm' }], msg: '‘이름’ 칸에 이름을 넣으세요.', sub: '진료받을 분의 이름이에요.' },
          { st: '번호 가운데', when: (h) => !h.filled('resvMobileNo2'),
            find: [{ sel: '#resvMobileNo2' }], msg: '휴대폰 번호 가운데 4자리를 넣으세요.', sub: '앞자리는 010으로 골라져 있어요. 예: 010-1234-5678이면 1234' },
          { st: '번호 끝', when: (h) => !h.filled('resvMobileNo3'),
            find: [{ sel: '#resvMobileNo3' }], msg: '휴대폰 번호 끝 4자리를 넣으세요.', sub: '예: 010-1234-5678이면 5678' },
          { st: '전화 받을 시간', when: () => !timePicked(),
            find: [{ fn: () => { const r = document.getElementById('callTimeTp4'); return r && (r.closest('ul, dl, .time, td, div') || r.parentElement); } }],
            msg: '전화 받기 편한 시간을 하나 누르세요.', sub: '상담원이 그 시간에 전화해요. 아무 때나 괜찮으면 가장 이른 시간을 고르세요.', fill: false },
          { st: '개인정보 동의', when: (h) => !h.checked('accessPerYn'),
            find: [{ sel: 'label[for="accessPerYn"]' }],
            msg: '‘개인정보의 수집·이용에 동의합니다’를 누르세요.', sub: '병원이 전화를 드리려고 이름과 번호를 받아요. 꼭 동의해야 신청돼요.', fill: false },
          { st: '신청', when: () => true,
            find: [{ sel: 'a.btn_appli', text: '간편상담예약신청' }, { sel: 'a, button', text: '간편상담예약신청' }],
            msg: '‘간편상담예약신청’을 누르세요.', sub: '상담원이 전화해서 진료과·선생님·날짜를 같이 정해드려요. 모르는 번호여도 받아 주세요.', fill: false }
        ]
      }
    ],
    fallback: { find: [], msg: '', sub: '' }
  };
})();

    }
  };
  // 이 주소에 맞는 안내표를 골라요. data-hospital에 적힌 병원이 이 주소와 맞지 않으면 그 표는 쓰지 않아요.
  var pick = (TABLES[want] && HOSTS[want].test(host)) ? want : Object.keys(HOSTS).filter(function (k) { return HOSTS[k].test(host); })[0];
  // 북마크로 켠 경우(병원이 아직 코드를 넣지 않은 시안): 화면이 통째로 바뀌면 꺼진다는 것을 미리 알려줘요
  if (open) window.__YK_DEMO = true;
  function start() {
    if (window.__ykLoaded) return;
    if (pick) TABLES[pick]();
    else { window.__YK_FORCE = true; // 병원이 직접 넣은 것이니, 병원 사이트인지 따로 묻지 않아요
/*
 * 공통 안내표 — 안내표를 따로 만들지 않은 모든 병원 사이트용.
 * 병원별 단계는 없고, 공통 예약 지도(stages.js)로 화면을 읽어 안내해요.
 * 병원 사이트처럼 보이는 곳에서만 켜져요. 병원 이름과 예약 전화번호는 그 페이지에서 찾고, 못 찾으면 짐작하지 않아요.
 */
(function () {
  if (window.__YK_RULES) return; // a hospital with its own guide table already set one
  const title = document.title || '';
  const site = (document.querySelector('meta[property="og:site_name"]') || {}).content || '';
  const text = (document.body && document.body.innerText) || '';
  const HOSP = /병원|의료원|의원|메디컬|메디칼|클리닉|한의원|치과|보건소|의료재단/;
  // only on hospital sites (or when the person pressed the 여기콕 icon)
  const looksLikeHospital = HOSP.test(title + ' ' + site) && /예약|진료/.test(text.slice(0, 20000));
  if (!looksLikeHospital && !window.__YK_FORCE) return;
  const name = (title + '|' + site).split(/[|\-–:·>]/).map((t) => t.trim()).find((t) => HOSP.test(t)) || '';
  // reservation phone: a number written near the word 예약 or 대표 (e.g. 1588-0000, 02-000-0000)
  const near = text.match(/(예약|대표)[^\d\n]{0,12}((1\d{3}|0\d{1,2})-\d{3,4}(-\d{4})?)/);
  const any = text.match(/\b1[5-9]\d{2}-\d{4}\b/);
  window.__YK_RULES = {
    hospital: name || '이 병원',
    analyzedOn: '공통 예약 지도',
    phone: (near && near[2]) || (any && any[0]) || '',
    hours: '운영 시간은 병원 홈페이지에서 확인하세요',
    pages: [],
    fallback: { find: [], msg: '', sub: '' }
  };
})();

    }
/*
 * 여기콕 공통 예약 지도 — 모든 병원에 공통으로 쓰는 단계 판별기.
 *
 * 병원 예약은 이름과 모양만 다를 뿐 거의 같은 길이에요.
 *   첫 화면 → 처음/재방문 → 로그인(회원·비회원) → 본인인증 → 진료과 → 의료진 → 날짜 → 시간 → 확인 → 완료
 * 이 파일은 지금 화면이 그 길의 어느 단계인지, 화면에 적힌 말과 모양으로 알아내요.
 * 그리고 그 단계에 맞는 안내 한 줄과 짚을 곳을 돌려줘요.
 * 확실하지 않으면 아무것도 돌려주지 않아요 (도움 버튼은 "준비 중 + 전화"를 보여줘요).
 *
 * 쓰는 곳: helper.js (도움 버튼), score.mjs (여러 병원 자동 성적표)
 */
(function () {
  if (window.__YK_U) return;

  /* ---------- reading the page ---------- */
  const seen = (el) => {
    if (!el || !el.getBoundingClientRect) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    if (r.bottom < -2000 || r.right < 0 || r.left > innerWidth) return false;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let scrolls = false; // once inside a box you can scroll, anything further out cannot hide it for good
    for (let a = el; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) < 0.05) return false;
      if (a !== el && /auto|scroll/.test(s.overflowX + s.overflowY)) { scrolls = true; continue; }
      if (scrolls) continue;
      // a box that cuts off what sticks out (a closed fold-out menu). a box you can scroll does not hide anything.
      const cutX = /hidden|clip/.test(s.overflowX), cutY = /hidden|clip/.test(s.overflowY);
      if (a !== el && (cutX || cutY)) {
        const ar = a.getBoundingClientRect();
        if (ar.width < 2 || ar.height < 2) return false;
        if (cutX && (cx < ar.left || cx > ar.right)) return false;
        if (cutY && (cy < ar.top || cy > ar.bottom)) return false;
      }
    }
    return true;
  };
  const textOf = (el) => (el.textContent || el.value || '').replace(/\s+/g, ' ').trim();
  const squash = (t) => String(t).replace(/\s+/g, '');
  const isWord = (t, list) => list.some((w) => squash(w) === squash(t));
  const josa = (w) => { const c = w.charCodeAt(w.length - 1); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 ? '을' : '를'; };
  const MENU = 'header, nav, #header, .header, [role="search"], .gnb, .siteMap_mo, footer, #footer, .footer';
  const inMenu = (el) => !!el.closest(MENU);
  const SKIP = (el) => inMenu(el) || /search|totalsearch|keyword|srch/i.test((el.id || '') + ' ' + (el.name || ''));
  const FILLABLE = 'input:not([type]), input[type="text"], input[type="tel"], input[type="number"], input[type="email"], input[type="password"], input[type="search"], textarea, select';
  let lastInputAt = 0, baseH = innerHeight;
  document.addEventListener('input', () => { lastInputAt = Date.now(); }, true);
  const TOUCH = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
  const typingOver = () => { const v = window.visualViewport; baseH = Math.max(baseH, innerHeight);
    return TOUCH && !!v && !(v.height * v.scale < baseH - 100) && Date.now() - lastInputAt > 1200; };
  const isEmpty = (el) => {
    if (el.tagName === 'SELECT') return el.selectedIndex <= 0 && placeholderOption(el);
    const v = String(el.value || '').trim();
    if (!v) return true;
    // still typing counts as not done, unless a fixed-length box is already full (주민번호 앞 6자리)
    // or, on a phone, the keyboard has been put away (the cursor stays in the box, but the person has stopped typing)
    return el === document.activeElement && !(el.maxLength > 0 && v.length >= el.maxLength) && !typingOver();
  };
  // the first choice of a list is a "please choose" line, not a real answer
  const placeholderOption = (sel) => { const o = sel.options && sel.options[0]; return !o || !o.value || /선택|--|::|choose|select/i.test(o.textContent || ''); };
  const isButton = (el) => /^(A|BUTTON)$/.test(el.tagName) || (el.tagName === 'INPUT' && /submit|button|image/.test(el.type)) || el.getAttribute('role') === 'button';
  const pageText = () => (document.body && document.body.innerText) || '';

  /* ---------- the words hospitals use (모은 말 목록 · 병원을 볼수록 늘어나요) ---------- */
  const WORDS = {
    reserve: ['진료예약', '진료 예약', '인터넷 진료예약', '인터넷진료예약', '온라인 진료예약', '온라인 예약', '온라인예약', '인터넷 예약', '인터넷예약',
      '예약하기', '외래예약', '외래 예약', '외래진료예약', '진료예약하기', '진료예약 바로가기', '예약 바로가기', '인터넷 예약하기', '온라인 예약하기',
      '진료예약/조회', '진료예약 / 조회', '예약/조회', '예약·조회', '진료예약·조회', '진료 예약하기', '본인 진료예약',
      '바로 예약', '바로예약', '예약 시작', '예약 시작하기', '예약신청', '예약 신청', '인터넷 진료 예약', '온라인 진료 예약'],
    first: ['첫방문 간편예약', '첫방문예약', '첫방문 예약', '첫 방문 예약', '첫예약상담', '첫 예약 상담', '초진예약', '초진 예약', '초진환자 예약', '초진 환자 예약',
      '첫진료 예약', '첫 진료 예약', '처음 오셨나요', '처음 오셨나요?', '처음 방문', '처음 방문하시나요', '신환예약', '신환 예약', '첫방문', '첫 방문', '처음이세요?',
      '처음 오시는 분', '처음 오신 분', '첫 방문 고객', '첫방문 고객', '초진', '전화 예약 신청', '예약 상담 신청', '상담예약', '상담 예약'],
    go: ['다음', '다음 단계', '확인', '신청', '예약신청', '예약하기', '로그인', '인증', '완료', '등록', '조회', '선택완료', '선택 완료', '선택', '본인확인', '본인 확인'],
    login: ['로그인', 'LOGIN', 'Login', '로그 인'],
    nonmember: ['비회원', '비회원 로그인', '비회원로그인', '비회원 예약', '비회원예약', '비회원 진료예약', '비회원 인증', '비회원 본인인증', '본인인증 로그인', '간편 로그인', '간편로그인', '간편인증', '간편 인증', '진료회원 로그인', '환자번호 로그인'],
    signup: ['회원가입', '회원 가입', '가입하기', '신규 회원가입'],
    verify: ['휴대폰 인증', '휴대폰인증', '휴대폰 본인인증', '휴대폰본인인증', '휴대전화 인증', '휴대전화인증', '본인인증', '본인 인증', '본인인증하기', '인증하기',
      '인증번호 받기', '인증번호 발송', '인증번호발송', '인증번호 요청', '인증요청', '인증 요청', '승인', '승인번호 받기', '문자 인증', '문자인증', 'PASS 인증', '간편인증하기'],
    close: ['닫기', '창닫기', '창 닫기', '오늘 하루 열지 않기', '오늘하루 열지않기', '오늘 하루 보지 않기', '오늘하루 보지않기', '하루동안 보지 않기', '오늘 하루 그만 보기', '확인', '×', 'X', 'x', 'close', 'Close', 'CLOSE'],
    confirm: ['예약확정', '예약 확정', '예약확정하기', '예약 확정하기', '확정', '예약하기', '예약신청', '예약 신청', '예약완료', '예약 완료', '확인']
  };
  // 진료과 이름 (병원마다 조금씩 달라도 대부분 이 안에 있어요)
  const DEPTS = ['내과', '외과', '소화기내과', '순환기내과', '심장내과', '호흡기내과', '내분비내과', '신장내과', '혈액종양내과', '감염내과', '류마티스내과', '알레르기내과',
    '정형외과', '신경과', '신경외과', '피부과', '안과', '이비인후과', '비뇨의학과', '비뇨기과', '산부인과', '소아청소년과', '소아과', '재활의학과', '가정의학과', '흉부외과',
    '심장혈관흉부외과', '성형외과', '정신건강의학과', '정신과', '치과', '영상의학과', '방사선종양학과', '마취통증의학과', '응급의학과', '핵의학과', '진단검사의학과',
    '병리과', '직업환경의학과', '구강악안면외과', '치주과', '교정과', '대장항문외과', '유방외과', '갑상선외과', '간담췌외과', '위장관외과', '이식외과', '혈관외과',
    '소아외과', '노년내과', '통증클리닉', '한방내과', '침구과', '한방재활의학과'];
  const DEPT_SET = new Set(DEPTS.map(squash));
  // beyond the exact lists: names built from the same parts ("진료 예약/안내", "처음진료 빠른예약", "외래진료 예약")
  const tidy = (t) => squash(t).replace(/^[#>›]+/, '').replace(/(바로가기|[/·](안내|조회|확인|조회하기|안내하기))$/, '').replace(/예약(안내|조회|확인)$/, '예약');
  const LIKE = {
    reserve: (t) => { const x = tidy(t); return x.length <= 12 && /예약/.test(x) && !/^(암|검진|소아|어린이|국제|외국인)/.test(x) && /(진료|외래|온라인|인터넷|본인|빠른|바로|간편)/.test(x) &&
      !/(검진|건강|결과|증명|서류|조회|취소|변경|확인|대리|비회원|처음|첫|초진|신환|상담|안내|문의|전화|방법)/.test(x.replace(/[/·](조회|안내|확인)$/, '')); },
    first: (t) => { const x = tidy(t); return x.length <= 14 && /(처음|첫|초진|신환)/.test(x) && /(예약|진료|방문|상담|고객|오시는|오신)/.test(x) && !/(검진|가이드|안내$|이용안내)/.test(x); },
    nonmember: (t) => { const x = tidy(t); return x.length <= 12 && /비회원/.test(x) && /(예약|로그인|진료|인증)/.test(x) && !/(조회|취소|확인)/.test(x); },
    member: (t) => { const x = tidy(t); return x.length <= 12 && /^(본인|회원|아이디|인터넷|온라인)/.test(x) && /(예약|로그인)/.test(x) && !/(비회원|대리|조회|취소|확인|가입)/.test(x); }
  };

  /* ---------- finding things ---------- */
  // elements whose own text passes the test (checked by text first, so it stays fast on big pages)
  function leaves(test, sel) {
    const out = [];
    for (const el of document.querySelectorAll(sel || 'a, button, input[type="button"], input[type="submit"], li, td, th, span, div, p, strong, b, em, dt, dd, label, h1, h2, h3, h4, h5, img')) {
      if (el.closest('#yk-help-root')) continue;
      const leaf = el.children.length === 0 || /^(A|BUTTON)$/.test(el.tagName);
      if (!leaf) continue;
      const t = el.tagName === 'IMG' ? (el.alt || '') : textOf(el);
      if (!t || t.length > 40 || !test(t, el)) continue;
      if (seen(el)) out.push(el);
    }
    return out;
  }
  // the nearest thing a finger can press: a link, a button, or a card the site made clickable
  function clickable(el) {
    for (let a = el, i = 0; a && i < 5; i++, a = a.parentElement) if (isButton(a) || a.hasAttribute('onclick')) return a;
    // a card the site made pressable only by its pointer cursor: take the outermost box that still has it
    let hit = null;
    for (let a = el, i = 0; a && i < 5; i++, a = a.parentElement) { if (getComputedStyle(a).cursor === 'pointer') hit = a; else if (hit) break; }
    return hit;
  }
  // a pressable thing named with one of the words; content first, the site menu only as a last resort
  function findByWords(words, opts = {}) {
    const like = opts.like || (words === WORDS.reserve ? LIKE.reserve : words === WORDS.first ? LIKE.first : null);
    const exact = leaves((t) => isWord(t, words));
    const hits = exact.concat(like ? leaves((t) => like(t) && !isWord(t, words)) : []);
    const order = (list) => opts.allowMenu ? [...list.filter((e) => !inMenu(e)), ...list.filter(inMenu)] : list.filter((e) => !inMenu(e));
    for (const t of order(hits)) {
      const c = clickable(t);
      const hit = c && seen(c) && { el: c, word: t.tagName === 'IMG' ? t.alt : textOf(t) };
      if (hit && (!opts.ok || opts.ok(hit))) return hit;
    }
    return null;
  }
  // the smallest box that holds all the given elements
  function groupBox(els) {
    if (!els.length) return null;
    let box = els[0].parentElement;
    while (box && !els.every((e) => box.contains(e))) box = box.parentElement;
    if (!box || box === document.body || box === document.documentElement) return els[0];
    const r = box.getBoundingClientRect();
    return r.height > innerHeight * 3 ? els[0] : box;
  }
  function fieldsIn(box) {
    return [...box.querySelectorAll(FILLABLE)].filter((i) => !SKIP(i) && !i.disabled && !i.readOnly && i.type !== 'hidden' && seen(i));
  }
  // the name of a field exactly as the page shows it ("성명 입력" → "성명")
  function fieldName(el) {
    let t = '';
    if (el.id) { try { const l = document.querySelector('label[for="' + CSS.escape(el.id) + '"]'); if (l) t = textOf(l); } catch (e) {} }
    if (!t) { const l = el.closest('label'); if (l) t = textOf(l); }
    t = t || el.getAttribute('aria-label') || el.placeholder || el.title || '';
    if (!t && el.getAttribute('aria-labelledby')) t = el.getAttribute('aria-labelledby').split(/\s+/).map((id) => { const n = document.getElementById(id); return n ? textOf(n) : ''; }).join(' ');
    if (!t) t = rowName(el);
    t = cleanName(t);
    if (!t || t.length > 16) t = hintName(el);
    return t;
  }
  const cleanName = (t) => String(t || '').replace(/[*※:：]/g, '').replace(/\(필수\)|필수|\[필수\]/g, '').replace(/(을|를)?\s*입력(해\s*주세요|하세요|해주세요|하십시오)?\.?$/, '')
    .replace(/\s*\(.*?\)\s*$/, '').replace(/^(\d+\.|\d+\))\s*/, '').trim();
  // the name a form row gives the field in front of it: <th>성명</th><td><input></td>, <dt>휴대폰</dt><dd>…, <label>생년월일</label><div><input>
  function rowName(el) {
    const tr = el.closest('tr');
    if (tr) { const th = tr.querySelector('th'); if (th && !th.contains(el)) return textOf(th); }
    const dd = el.closest('dd');
    if (dd) { let p = dd.previousElementSibling; while (p && p.tagName !== 'DT') p = p.previousElementSibling; if (p) return textOf(p); }
    for (let a = el.parentElement, i = 0; a && i < 3; i++, a = a.parentElement) {
      for (let p = a.previousElementSibling, j = 0; p && j < 2; j++, p = p.previousElementSibling) {
        if (p.querySelector && p.querySelector(FILLABLE)) break;
        const t = textOf(p); if (t && t.length <= 20) return t;
      }
      const own = [...a.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
      if (own && own.length <= 20) return own;
    }
    return '';
  }
  // last resort: what the page's own code calls the field (id/name like "userName", "jumin1", "hp2")
  function hintName(el) {
    const k = ((el.id || '') + ' ' + (el.name || '')).toLowerCase();
    if (el.type === 'password') return '비밀번호';
    if (/jumin|rrn|ssn|resno|regno|idno|juminno/.test(k)) return '주민등록번호';
    if (/birth|brth|bday|birthday/.test(k)) return '생년월일';
    if (/hp|phone|mobile|cell|tel/.test(k)) return '휴대폰 번호';
    if (/mail/.test(k)) return '이메일';
    if (/cert|auth|otp|code|smsno/.test(k)) return '인증번호';
    if (/(^|[^a-z])(nm|name|usernm|patnm|ptnm)/.test(k) || /name/.test(k)) return '이름';
    if (/ptno|patno|pt_no|chartno|medino|hospno/.test(k)) return '등록번호';
    if (/(^|[^a-z])id([^a-z]|$)|userid|loginid/.test(k)) return '아이디';
    return '';
  }

  /* ---------- 칸 채우기 규칙: 버튼보다 먼저 위의 빈 칸 ---------- */
  // every control a person fills in: text boxes, lists, choices (radio), tick boxes
  function controlsIn(box) {
    const out = [], radios = new Set();
    for (const el of box.querySelectorAll(FILLABLE + ', input[type="checkbox"], input[type="radio"], input[type="date"]')) {
      if (el.disabled || el.readOnly || el.type === 'hidden' || SKIP(el) || el.closest('#yk-help-root')) continue;
      const kind = el.type === 'radio' ? 'radio' : el.type === 'checkbox' ? 'check' : el.tagName === 'SELECT' ? 'select' : 'text';
      // custom tick boxes hide the real input and show a styled label instead
      const lab = labelOf(el);
      const at = seen(el) ? el : lab && seen(lab) ? lab : null;
      if (!at) continue;
      if (kind === 'radio') { const g = el.name || el.id; if (radios.has(g)) continue; radios.add(g); }
      out.push({ el, at, kind, lab });
    }
    return out;
  }
  function labelOf(el) {
    if (el.id) { try { const l = document.querySelector('label[for="' + CSS.escape(el.id) + '"]'); if (l) return l; } catch (e) {} }
    return el.closest('label');
  }
  const precedes = (a, b) => !!(b.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_PRECEDING) || b.contains(a);
  // marked as must-fill: required, aria-required, or a * / 필수 next to its name
  function mustFill(c) {
    const el = c.el;
    if (el.required || el.getAttribute('aria-required') === 'true') return true;
    const row = el.closest('tr, li, dd, .row, .form-group, .input-group, .item');
    const head = row && row.tagName === 'DD' ? (row.previousElementSibling ? textOf(row.previousElementSibling) : '') : row ? textOf(row).slice(0, 30) : '';
    return /\*|필수/.test(head + ' ' + (c.lab ? textOf(c.lab) : ''));
  }
  function done(c) {
    if (c.kind === 'radio') {
      const g = c.el.name, group = g ? [...document.getElementsByName(g)] : [c.el];
      const on = group.find((r) => r.checked); if (!on) return false;
      // "동의하지 않습니다" picked while "동의합니다" is offered: that blocks the next step, so it is not done
      const lab = (r) => { const l = labelOf(r); return l ? textOf(l) : ''; };
      return !(/동의하지|미동의|비동의/.test(lab(on)) && group.some((r) => /동의합니다|동의하기|^동의$/.test(lab(r))));
    }
    if (c.kind === 'check') return c.el.checked;
    return !isEmpty(c.el);
  }
  // a tick box that must be ticked to go on (agreeing to the use of personal information)
  const mustTick = (c) => c.kind === 'check' && (c.el.required || /동의/.test(c.lab ? textOf(c.lab) : rowName(c.el))) && !/선택|마케팅|광고|수신/.test(c.lab ? textOf(c.lab) : '');
  // main buttons of a form (not helpers like 인증번호 받기, 주소 찾기, 중복확인)
  const HELPER_BTN = /(인증번호|승인번호|받기|발송|요청|재전송|중복|주소|우편|검색|찾기|전체\s?동의|보기|열기|닫기)/;
  const SUBMIT_RE = /^(확인|다음|다음\s?단계|신청|예약신청|예약\s?신청|예약하기|로그인|비회원\s?로그인|인증|본인\s?인증|본인\s?확인|완료|등록|조회|선택\s?완료|예약\s?확정(하기)?|확정|동의|동의하고\s?다음|본인인증하기|인증하기|확인하기)$/;
  const submitLike = (b) => { const t = squash(btnText(b)); return (!!t && t.length <= 12 && SUBMIT_RE.test(t)) || (b.tagName === 'INPUT' && b.type === 'submit') || (b.tagName === 'BUTTON' && b.type === 'submit' && t.length <= 12); };
  const mainButtonsIn = (box) => [...box.querySelectorAll('a, button, input[type="button"], input[type="submit"], input[type="image"]')]
    .filter((b) => seen(b) && submitLike(b) && !HELPER_BTN.test(btnText(b)));
  // the part of the page that belongs to this button: its form, or the boxes around it until another form's main button shows up
  function regionOf(btn) {
    const form = btn.closest('form');
    if (form && !form.querySelector('header, footer, #header, #footer, .gnb') && controlsIn(form).length <= 40) return form;
    let a = btn.parentElement, best = null;
    for (let i = 0; a && a !== document.body && a !== document.documentElement && i < 10; i++, a = a.parentElement) {
      if (a.matches && a.matches('header, footer, nav, #header, #footer')) break;
      const ctrls = controlsIn(a).filter((c) => precedes(c.el, btn));
      if (ctrls.length > 40) break;
      const others = mainButtonsIn(a).filter((b) => b !== btn && !b.contains(btn) && !btn.contains(b));
      if (ctrls.length) { if (best && others.length) break; best = a; if (others.length) break; }
    }
    return best;
  }
  // the first thing above this button that still needs filling in, or null when all is done
  function pendingBefore(btn) {
    const region = regionOf(btn); if (!region) return null;
    let ctrls = controlsIn(region).filter((c) => precedes(c.el, btn) && c.el !== btn);
    const marked = ctrls.filter(mustFill);
    // when the form marks must-fill boxes, the unmarked ones are optional (but agreeing boxes always count)
    if (marked.length) ctrls = ctrls.filter((c) => marked.includes(c) || mustTick(c));
    else ctrls = ctrls.filter((c) => c.kind !== 'check' || mustTick(c));
    return ctrls.find((c) => !done(c)) || null;
  }
  // how to say it: the page's own words for the box, and which part when a number is split over several boxes
  function controlStep(c) {
    if (c.kind === 'check') {
      const l = c.lab ? textOf(c.lab) : '';
      const name = l && l.length <= 18 ? l : '동의합니다';
      return { el: c.at, msg: `‘${name}’에 체크하세요.`, sub: '체크해야 다음으로 넘어갈 수 있어요. 내용은 ‘보기’를 누르면 읽을 수 있어요.' };
    }
    const name = fieldName(c.el) || rowName(c.el) && cleanName(rowName(c.el));
    if (c.kind === 'radio') {
      const n = cleanName(rowName(c.el)) || (c.el.closest('fieldset') && c.el.closest('fieldset').querySelector('legend') ? textOf(c.el.closest('fieldset').querySelector('legend')) : '');
      return { el: c.el.closest('td, dd, fieldset, li, div') || c.at, msg: n && n.length <= 16 ? `‘${n}’에서 하나를 고르세요.` : '아래 보기 중 하나를 고르세요.', sub: '맞는 것 하나를 누르면 돼요.' };
    }
    if (c.kind === 'select') return { el: c.at, msg: name ? `‘${name}’에서 고르세요.` : '노란 테두리 칸을 눌러 고르세요.', sub: '누르면 목록이 나와요. 맞는 것을 고르세요.' };
    // a number split over several boxes (주민번호 앞/뒤, 휴대폰 010-1234-5678)
    const row = c.el.closest('td, dd, li, .row, .form-group') || c.el.parentElement;
    // only boxes that carry the same name (or none) are parts of one number; 성명 next to 전화번호 is not
    const own = (i) => { const n = fieldName(i); return n === name || !n; };
    const parts = row ? [...row.querySelectorAll(FILLABLE)].filter((i) => i.type !== 'hidden' && seen(i) && own(i)) : [];
    let part = '';
    if (parts.length === 2) part = parts.indexOf(c.el) === 0 ? ' 앞자리' : ' 뒷자리';
    if (parts.length === 3) part = [' 첫째', ' 둘째', ' 셋째'][parts.indexOf(c.el)] || '';
    const n = name || '노란 테두리';
    const msg = parts.length > 1 && part ? `‘${n}’${part} 칸에 넣으세요.` : `‘${n}’ 칸에 넣으세요.`;
    let sub = '다 쓰고 그 칸을 벗어나면 다음 할 일을 알려드려요.';
    if (/주민/.test(n)) sub = '주민등록번호는 병원 화면에만 들어가요. 여기콕은 읽지도 보내지도 않아요.';
    else if (/휴대|전화|연락/.test(n)) sub = '본인 휴대폰 번호를 넣으세요. 인증 문자가 이 번호로 와요.';
    else if (/생년|생일/.test(n)) sub = c.el.maxLength === 6 ? '태어난 해 끝 두 자리, 월, 일 순서로 6자리예요. 예: 1950년 1월 1일 → 500101' : '예: 1950년 1월 1일 → 19500101';
    return { el: c.at, msg, sub };
  }
  // the rule every button goes through: if something above it is still empty, point there first
  function gate(btn) {
    if (!btn || !(isButton(btn) || btn.hasAttribute('onclick'))) return null;
    const t = squash(btnText(btn));
    if (!submitLike(btn) && !isWord(t, WORDS.verify) && !(t.length <= 12 && /인증|확인|신청|로그인|다음|조회|예약하기/.test(t))) return null;
    if (HELPER_BTN.test(t) && !isWord(t, WORDS.verify)) return null;
    const c = pendingBefore(btn);
    return c ? controlStep(c) : null;
  }
  function fieldStep(box, st) {
    const c = controlsIn(box).filter((x) => x.kind !== 'check' || mustTick(x)).find((x) => !done(x));
    if (!c) return null;
    return Object.assign({ st: st || '빈 칸' }, controlStep(c));
  }
  // the smallest box around a button that also holds fields to fill in (a form, a card, a fold-out panel)
  function boxAround(btn, depth = 3) {
    const form = btn.closest('form'); if (form && fieldsIn(form).length && fieldsIn(form).length <= 12) return form;
    let a = btn.parentElement;
    for (let i = 0; a && i < depth; i++, a = a.parentElement) { const f = fieldsIn(a); if (f.length && f.length <= 8) return a; }
    return null;
  }
  function sendsFields(btn) {
    let a = btn.parentElement;
    for (let i = 0; a && i < 4; i++, a = a.parentElement) {
      if (!fieldsIn(a).length) continue;
      const btns = [...a.querySelectorAll('a, button, input[type="button"], input[type="submit"]')].filter(seen);
      return btns.length <= 3;
    }
    return false;
  }
  // a link to the page we are already on (a page title, a breadcrumb)
  const samePage = (el) => {
    const a = el.closest('a'); const raw = a && (a.getAttribute('href') || '');
    if (!raw || /^(#|javascript)/i.test(raw)) return false; // a button made from a link: it does something on this page
    return a.href.split('#')[0] === location.href.split('#')[0];
  };
  // something laid over the page (a notice popup, a confirm box)
  function overlayOf(el) {
    for (let a = el, i = 0; a && i < 10; i++, a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.position === 'fixed' || (s.position === 'absolute' && parseInt(s.zIndex, 10) >= 50)) {
        const r = a.getBoundingClientRect();
        if (r.width * r.height > innerWidth * innerHeight * 0.08) return a;
      }
      if (a.tagName === 'DIALOG' || a.getAttribute('role') === 'dialog' || a.getAttribute('aria-modal') === 'true') return a;
    }
    return null;
  }
  const btnText = (el) => textOf(el) || el.getAttribute('aria-label') || el.title || el.value || (el.querySelector('img') && el.querySelector('img').alt) || '';
  const reservePage = () => /예약|reserv|appoint|booking/i.test(location.href + ' ' + document.title) ||
    /진료\s?예약|예약\s?(하기|신청|진행|단계)/.test(pageText().slice(0, 4000));


  /* ---------- 고르는 단계 (진료과 · 의료진 · 날짜 · 시간) ---------- */
  // something in this box is already picked (sites mark it with a class like on/active/selected, or a checked radio)
  const chosen = (box) => !!box.querySelector('.on, .active, .selected, .sel, .checked, .choice, .is-selected, .is-active, [aria-selected="true"], [aria-pressed="true"], [aria-checked="true"], [aria-current="true"], input[type="radio"]:checked');
  // this tab or button is the one already open (no need to press it again)
  const chosenSelf = (el) => /(^|\s)(on|active|selected|current|is-active|is-selected)(\s|$)/.test(el.className || '') || el.getAttribute('aria-selected') === 'true' || el.getAttribute('aria-current') === 'page';
  const free = (e) => !e.disabled && !/disabled|dim|off|closed|full|마감|soldout/i.test(e.className || '') && e.getAttribute('aria-disabled') !== 'true';
  // the one box that holds most of these elements (a stray clock or step number elsewhere does not count)
  function densest(els, min) {
    const by = new Map();
    for (const e of els) { const p = e.tagName === 'TABLE' ? e : e.parentElement; if (p) by.set(p, (by.get(p) || 0) + 1); }
    let best = null, n = 0;
    for (const [p, c] of by) if (c > n) { best = p; n = c; }
    if (n >= min) return best;
    // items wrapped one level deeper (<li><button>9:00</button></li>)
    const by2 = new Map();
    for (const e of els) { const p = e.parentElement && e.parentElement.parentElement; if (p) by2.set(p, (by2.get(p) || 0) + 1); }
    for (const [p, c] of by2) if (c > n) { best = p; n = c; }
    return n >= min ? best : null;
  }
  const PICKS = [
    { id: 'dept', name: '진료과 고르기', msg: '진료받을 과를 누르세요.', sub: '어느 과인지 모르면 ‘전화로’를 눌러 물어보세요. 예: 무릎은 정형외과, 어지러움은 신경과.',
      find() { const d = [...new Set(leaves((t) => DEPT_SET.has(squash(t))).map((e) => clickable(e)).filter((e) => e && !inMenu(e)))]; return d.length >= 4 ? groupBox(d) : null; } },
    { id: 'doctor', name: '의료진 고르기', msg: '진료받을 의사 선생님을 누르세요.', sub: '이름 옆 ‘전문분야’에 불편한 곳이 적힌 선생님을 고르면 돼요. 잘 모르면 ‘전화로’를 누르세요.',
      find() { const d = leaves((t) => /^\S{2,4}\s?(교수|의사|원장|과장|전문의)(님)?$/.test(t)); return d.length >= 2 && /전문분야|진료분야|세부전공|전문 분야|진료 분야|진료일정|진료 일정/.test(pageText()) ? groupBox(d) : null; } },
    { id: 'date', name: '날짜 고르기', msg: '진료받을 날짜를 누르세요.', sub: '진하게 보이는 날만 예약할 수 있어요.',
      find() {
        const days = leaves((t) => /^\d{1,2}$/.test(t) && +t >= 1 && +t <= 31, 'td, button, a, span, div, li, em, strong');
        const week = leaves((t) => /^(일|월|화|수|목|금|토)(요일)?$/.test(t) || /^(SUN|MON|TUE|WED|THU|FRI|SAT)$/i.test(t), 'th, td, span, div, li, em, strong, abbr');
        if (week.length < 5) return null;
        // the calendar is the one box holding most of the numbers 1–31 (step numbers elsewhere do not count)
        return densest(days.map((d) => d.closest('tr') ? d.closest('table') : d), 20);
      } },
    { id: 'time', name: '시간 고르기', msg: '원하는 시간을 하나 누르세요.', sub: '회색이나 흐린 시간은 이미 찼어요.',
      find() { const t = leaves((x) => /^(오전|오후)?\s*\d{1,2}\s*:\s*\d{2}(\s*~\s*\d{1,2}:\d{2})?$/.test(x)).map((e) => clickable(e) || e).filter(free); return densest(t, 3); } }
  ];

  // first-visit words (long enough not to match by accident)
  const FIRST_RE = new RegExp(WORDS.first.map(squash).filter((w) => w.length >= 3).map((w) => w.replace(/[?]/g, '\\?')).join('|'));
  // what the person has pressed on this page
  const pressed = new WeakSet();
  document.addEventListener('click', (e) => { const c = e.target && e.target.nodeType === 1 && clickable(e.target); if (c) pressed.add(c); }, true);

  /* ---------- the stages ---------- */
  // each stage: look(f) → null, or { el, msg, sub, ask? }.  f = flags the person answered (처음/재방문, 아이디 있음/없음)
  const STAGES = [
    { id: 'done', name: '예약 완료', look() {
      const t = pageText();
      if (!/예약이\s?(정상적으로\s?)?(완료|접수|확정)\s?되었습니다|예약(이)?\s?완료되었|예약되었습니다|예약 신청이 완료/.test(t)) return null;
      const hit = leaves((x) => /완료|되었습니다/.test(x) && /예약/.test(x))[0];
      return hit ? { el: hit, msg: '예약이 끝났어요.', sub: '날짜와 시간을 종이에 적어 두세요. 문자로도 와요.' } : null;
    } },
    { id: 'popup', name: '안내 창 닫기', look() {
      const closers = [...document.querySelectorAll('a, button, input[type="button"], [role="button"], span, img')]
        .filter((b) => { const t = squash(btnText(b)); const cls = (b.className && b.className.baseVal !== undefined ? b.className.baseVal : b.className) + ' ' + b.id;
          return (t && t.length <= 14 && (isWord(t, WORDS.close) || /^(닫기|close)$/i.test(b.getAttribute('aria-label') || ''))) ||
            (/^(A|BUTTON)$/.test(b.tagName) && t.length <= 6 && /(^|[\s_-])(close|btn_?close|pop_?close|layer_?close|closeBtn|btnClose|x_?btn)([\s_-]|$)/i.test(cls)); })
        .filter((b) => seen(b) && !inMenu(b))
        // plain 닫기 first: "오늘 하루 열지 않기" is often only a tick box
        .sort((a, b) => (/하루|오늘/.test(btnText(a)) ? 1 : 0) - (/하루|오늘/.test(btnText(b)) ? 1 : 0));
      for (const b of closers) {
        const c = clickable(b) || b, box = overlayOf(c);
        if (!box || !seen(box)) continue;
        if (/예약하시겠|예약을 확정|예약 내용/.test(textOf(box))) continue; // a confirm box, not a notice
        if (fieldsIn(box).length) continue;
        const t = btnText(b), word = !t || /^[×xX]$/.test(t) || t.length > 14 ? '닫기(×)' : t;
        return { el: c, msg: `먼저 이 안내 창을 닫아요. ‘${word}’${josa(word)} 누르세요.`, sub: '병원 공지 창이에요. 닫아도 예약에는 문제없어요.' };
      }
      return null;
    } },
    { id: 'confirm', name: '예약 확인', look() {
      const Q = /예약\s?하시겠습니까|예약을 (확정|신청)하시겠|아래 내용으로 예약|예약 내용을 확인/;
      const boxes = [...document.querySelectorAll('p, div, section, [role="dialog"], dialog, td, li')]
        .filter((e) => !e.closest('#yk-help-root') && e.textContent.length < 300 && Q.test(e.textContent) && seen(e))
        .sort((a, b) => a.textContent.length - b.textContent.length);
      for (const q of boxes) {
        const box = overlayOf(q) || q.closest('form, section, article, div');
        const btn = box && [...box.querySelectorAll('a, button, input[type="button"], input[type="submit"]')].find((b) => seen(b) && isWord(btnText(b), WORDS.confirm));
        if (btn) { const t = btnText(btn); return { el: btn, msg: `내용이 맞으면 ‘${t}’${josa(t)} 누르세요.`, sub: '이걸 눌러야 예약이 끝나요. 틀린 곳이 있으면 이전으로 돌아가요.' }; }
      }
      return null;
    } },
    { id: 'login', name: '로그인', look(f) {
      const pw = [...document.querySelectorAll('input[type="password"]')].filter((i) => !inMenu(i) && seen(i));
      const nonmemberForm = fieldsIn(document.body).filter((i) => i.type !== 'password' && /이름|성명|생년월일|휴대폰|휴대전화|진찰권|환자번호|등록번호|병원등록번호/.test(fieldName(i)));
      const onLoginPage = /login|logon|signin|로그인/i.test(location.pathname + ' ' + document.title);
      if (!pw.length && !(onLoginPage && nonmemberForm.length)) return null;
      // a home page with a small login box: the reservation button matters more there
      if (!onLoginPage && findByWords(WORDS.reserve) && !nonmemberForm.length) return null;
      const form = pw[0] && (boxAround(pw[0]) || pw[0].closest('form'));
      const typedId = form && fieldsIn(form).some((i) => i.type !== 'password' && String(i.value || '').trim());
      const nonBtn = findByWords(WORDS.nonmember);
      const signup = findByWords(WORDS.signup, { allowMenu: true });
      // already on the non-member (본인확인) form: walk its fields, then its button
      const nmShown = nonmemberForm.filter((i) => !form || !form.contains(i));
      if (nmShown.length && (f.noId || !pw.length)) {
        // the button that sends the non-member boxes (the common rule points at any empty box above it first)
        const go = mainButtonsIn(document.body).concat(findByWords(WORDS.verify) ? [findByWords(WORDS.verify).el] : [])
          .find((b) => { const r = regionOf(b); return r && nmShown.some((i) => r.contains(i)) && (!form || !form.contains(b)); });
        if (go) { const t = btnText(go); return { el: go, msg: `칸을 다 채웠어요. ‘${t}’${josa(t)} 누르세요.`, sub: '휴대폰으로 숫자가 오면 그 숫자를 넣어요.' }; }
        const s = fieldStep(groupBox(nmShown).parentElement || groupBox(nmShown), '비회원 칸');
        if (s) return s;
      }
      if (typedId || f.hasId) {
        const go = form && [...form.querySelectorAll('a, button, input[type="button"], input[type="submit"], input[type="image"]')].find((b) => seen(b) && isWord(btnText(b), WORDS.login));
        if (go) return { el: go, msg: `‘${btnText(go)}’을 누르세요.`, sub: '아이디와 비밀번호를 다 넣었어요.' };
        const s = form && fieldStep(form, '아이디 로그인');
        return s || null;
      }
      if (f.noId) {
        if (nonBtn) return { el: nonBtn.el, msg: `‘${nonBtn.word}’${josa(nonBtn.word)} 누르세요.`, sub: '아이디가 없어도 이름과 휴대폰 번호로 예약할 수 있어요.' };
        if (signup) return { el: signup.el, msg: '이 병원은 아이디가 있어야 인터넷 예약이 돼요.', sub: `‘${signup.word}’로 아이디를 만들거나, 아래 ‘전화로’를 눌러 전화로 예약하세요.` };
        return null;
      }
      const el = (pw[0] && fieldsIn(form || document.body).find((i) => i.type !== 'password')) || pw[0] || nmShown[0];
      return el ? { el, msg: '이 병원 아이디가 있으세요?', ask: [{ label: '있어요', flag: 'hasId' }, { label: '없어요', flag: 'noId' }],
        sub: nonBtn ? '없어도 괜찮아요. 이름과 휴대폰으로 하는 방법을 알려드려요.' : '' } : null;
    } },
    { id: 'verify', name: '본인인증', look() {
      if (!/본인\s?인증|인증번호|휴대폰\s?인증|승인번호/.test(pageText())) return null;
      const code = fieldsIn(document.body).find((i) => /인증번호|승인번호|인증 번호/.test(fieldName(i)));
      if (code && isEmpty(code)) return { el: code, msg: '휴대폰 문자로 온 숫자를 이 칸에 넣으세요.', sub: '문자가 안 오면 1~2분 기다려요. 시간이 지나면 다시 받기를 누르면 돼요.' };
      const b = findByWords(WORDS.verify);
      if (!b) return null;
      return { el: b.el, msg: `‘${b.word}’${josa(b.word)} 누르세요.`, sub: '새 창이 열리면 이름과 휴대폰 번호를 넣고, 문자로 온 숫자를 넣으면 돼요.' };
    } },
    { id: 'pick', name: '고르기', look() {
      // 진료과 → 의료진 → 날짜 → 시간: some hospitals show them one page each, some all on one page.
      // point at the first one that has not been chosen yet; when all are chosen, at the button that goes on.
      const openTab = leaves((t) => isWord(t, WORDS.reserve) || LIKE.reserve(t)).some((e) => chosenSelf(clickable(e) || e));
      if (!/예약|reserv|appoint|booking|resv|rsv/i.test(location.href + ' ' + document.title) && !openTab) return null;
      const found = PICKS.map((p) => ({ p, box: p.find() })).filter((x) => x.box);
      if (!found.length) return null;
      const next = found.find((x) => !chosen(x.box));
      if (next) return { el: next.box, msg: next.p.msg, sub: next.p.sub, sid: next.p.id, sname: next.p.name };
      const go = [...document.querySelectorAll('a, button, input[type="button"], input[type="submit"]')]
        .find((b) => seen(b) && !inMenu(b) && !found.some((x) => x.box.contains(b)) && !/^선택/.test(btnText(b)) && (isWord(btnText(b), WORDS.go) || isWord(btnText(b), WORDS.confirm)));
      if (!go) return null;
      const t = btnText(go);
      return { el: go, msg: `다 골랐어요. ‘${t}’${josa(t)} 누르세요.`, sub: '고른 내용을 한 번 더 보여줘요.', sid: 'pick-done', sname: '다음으로' };
    } },
    { id: 'form', name: '칸 채우기', look(f) {
      // main buttons that send what is written above them (확인, 다음, 신청, 인증…)
      const btns = mainButtonsIn(document.body).filter((b) => !SKIP(b) && !inMenu(b));
      const cands = [];
      for (const b of btns) {
        const region = regionOf(b); if (!region) continue;
        const ctrls = controlsIn(region).filter((c) => precedes(c.el, b));
        if (!ctrls.length) continue;
        // a first-visit form: only for people who said this is their first time (otherwise 예약 시작 asks first)
        let firstBox = false;
        for (let a = b.parentElement, i = 0; a && i < 5; i++, a = a.parentElement) {
          const t = textOf(a); if (t.length > 300) break;
          if (FIRST_RE.test(squash(t)) || /(처음|첫|초진)\s?(진료|방문|오신|오시는)/.test(t)) { firstBox = true; break; }
        }
        if (firstBox && !f.visitFirst) continue;
        // the form the person is working in comes first
        const busy = ctrls.some((c) => c.el === document.activeElement || (c.kind === 'text' && String(c.el.value || '').trim()));
        cands.push({ b, busy });
      }
      const pick = cands.find((c) => c.busy) || cands[0];
      if (!pick) return null;
      const t = btnText(pick.b);
      return { el: pick.b, msg: `칸을 다 채웠어요. ‘${t}’${josa(t)} 누르세요.`, sub: '이 버튼을 누르면 다음으로 넘어가요.' };
    } },
    { id: 'choice', name: '예약 방법 고르기', look(f) {
      // "회원 예약 / 비회원 예약 / 첫방문 예약" side by side (아산, 세브란스, 보라매…)
      const pick = (like) => { for (const e of leaves(like)) { const c = clickable(e); if (c && seen(c) && !inMenu(c) && !chosenSelf(c) && !chosenSelf(e) && !samePage(c)) return { el: c, word: textOf(e) }; } return null; };
      const non = pick(LIKE.nonmember), mem = pick(LIKE.member), first = pick(LIKE.first);
      if (!non || !(mem || first)) return null;
      if (first && f.visitFirst) return { el: first.el, msg: `‘${first.word}’${josa(first.word)} 누르세요.`, sub: '처음 오신 분은 이쪽이 더 간단해요.' };
      if (f.noId) return { el: non.el, msg: `‘${non.word}’${josa(non.word)} 누르세요.`, sub: '아이디가 없어도 이름과 휴대폰 번호로 예약할 수 있어요.' };
      if (f.hasId && mem) return { el: mem.el, msg: `‘${mem.word}’${josa(mem.word)} 누르세요.`, sub: '아이디로 로그인해서 예약해요.' };
      return { el: (mem || non).el, msg: '이 병원 아이디가 있으세요?', ask: [{ label: '있어요', flag: 'hasId' }, { label: '없어요', flag: 'noId' }],
        sub: '없어도 괜찮아요. 이름과 휴대폰으로 하는 방법을 알려드려요.' };
    } },
    { id: 'home', name: '예약 시작', look(f) {
      // skip the tab that is already open, and a button that sends a form (that is the 칸 채우기 stage's job)
      const ok = (x) => !chosenSelf(x.el) && !sendsFields(x.el) && !samePage(x.el) && !x.el.closest('h1, .location, .breadcrumb, .navi, .path');
      // a button the person already pressed (it opened a panel) gives way to the new one that appeared
      const fresh = (x) => ok(x) && !pressed.has(x.el);
      const onReservePage = /예약|reserv|resv|rsv|appoint|booking/i.test(location.pathname + location.search + ' ' + document.title);
      const res = findByWords(WORDS.reserve, { ok: fresh }) || findByWords(WORDS.reserve, { ok }) ||
        (!onReservePage && (findByWords(WORDS.reserve, { allowMenu: true, ok: fresh }) || findByWords(WORDS.reserve, { allowMenu: true, ok })));
      const first = findByWords(WORDS.first);
      if (first && res && first.el !== res.el && !f.visitFirst && !f.visitAgain)
        return { el: res.el, msg: '이 병원에 처음 오셨나요?', ask: [{ label: '처음이에요', flag: 'visitFirst' }, { label: '다녀간 적 있어요', flag: 'visitAgain' }] };
      if (first && f.visitFirst) return { el: first.el, msg: `‘${first.word}’${josa(first.word)} 누르세요.`, sub: '처음 오신 분은 이쪽이 더 간단해요.' };
      if (res) return { el: res.el, msg: `‘${res.word}’${josa(res.word)} 누르세요.`, sub: inMenu(res.el) ? '화면 맨 위 메뉴에 있어요.' : '병원마다 이름은 달라도 예약을 시작하는 버튼이에요.' };
      return null;
    } },
    { id: 'branch', name: '병원 고르기', look() {
      // one group runs several hospitals (을지 노원·대전·강남, 서울대 본원·분당·보라매): pick yours first
      if (findByWords(WORDS.reserve, { allowMenu: true })) return null;
      const names = leaves((t) => /\S{1,8}(병원|의료원)$/.test(squash(t)) && squash(t).length <= 16).map((e) => clickable(e)).filter((e) => e && !inMenu(e));
      const uniq = [...new Set(names)];
      if (uniq.length < 2) return null;
      const box = densest(uniq, 2);
      return box ? { el: box, msg: '다니실 병원을 누르세요.', sub: '같은 이름의 병원이 여러 곳이에요. 가실 곳을 먼저 골라요.' } : null;
    } }
  ];

  // which stage is this screen, and what to say. null = not sure.
  function detect(flags) {
    const f = flags || {};
    for (const s of STAGES) {
      let r = null;
      try { r = s.look(f); } catch (e) { r = null; }
      if (!r || !r.el) continue;
      if (!r.ask && s.id !== 'popup') {
        let g = null; try { g = gate(r.el); } catch (e) { g = null; }
        if (g) return { stage: 'fields', name: '칸 채우기', step: { st: '공통: 칸 채우기', msg: g.msg, sub: g.sub || '' }, el: g.el, after: s.id };
      }
      return { stage: r.sid || s.id, name: r.sname || s.name, step: { st: '공통: ' + s.name, msg: r.msg, sub: r.sub || '', ask: r.ask }, el: r.el };
    }
    return null;
  }

  window.__YK_U = { detect, gate, pendingBefore, regionOf, controlsIn, submitLike, STAGES, PICKS, chosen, WORDS, DEPTS, seen, textOf, isWord, squash, josa, findByWords, fieldStep, boxAround, fieldsIn, fieldName, isButton, clickable };
})();

/*
 * 여기콕 도움 버튼 (시연용 크롬 확장)
 * 병원 사이트에 "코드 한 줄"이 들어간 상태를 흉내 내요. 병원 화면은 바꾸지 않고, 그 위에 도움 버튼만 얹어요.
 * - 입력한 내용을 읽기만 하고(빈칸인지 확인), 어디로도 보내지 않아요.
 * - 안내 문장은 병원별 안내표(rules-*.js)가 있으면 그걸, 없으면 공통 예약 지도(stages.js)를 써요.
 */
(function () {
  if (window.__ykLoaded || !window.__YK_RULES) return;
  window.__ykLoaded = true;
  const R = window.__YK_RULES;
  const KEY = 'yk-help-on', FLAGS = 'yk-flags';

  /* ---------- reading the page ---------- */
  const $ = (sel, root = document) => { try { return root.querySelector(sel); } catch (e) { return null; } };
  const visible = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect(), s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
  };
  // stricter than `visible`: the element must not be see-through, and must not sit outside a box that cuts it off
  // (e.g. a fold-out menu that is still closed, or a hover panel that is not open yet).
  // A box you can scroll does not hide anything: a pop-up window whose lower half needs scrolling
  // (고대안암 실명인증 창: 동의·주민번호 칸이 창 아래쪽) still counts. Same rule as stages.js.
  const seen = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let scrolls = false;
    for (let a = el; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) < 0.05) return false;
      if (a !== el && /auto|scroll/.test(s.overflowX + s.overflowY)) { scrolls = true; continue; }
      if (scrolls || a === el) continue;
      const cutX = /hidden|clip/.test(s.overflowX), cutY = /hidden|clip/.test(s.overflowY);
      if (cutX || cutY) {
        const ar = a.getBoundingClientRect();
        if (ar.width < 2 || ar.height < 2) return false;
        if (cutX && (cx < ar.left || cx > ar.right)) return false;
        if (cutY && (cy < ar.top || cy > ar.bottom)) return false;
      }
    }
    return true;
  };
  // the element sits in a box that scrolls on its own, but is scrolled out of that box's view right now
  const outOfScroller = (el) => {
    const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + Math.min(r.height / 2, 20);
    for (let a = el.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (!/auto|scroll/.test(s.overflowX + s.overflowY)) continue;
      const ar = a.getBoundingClientRect();
      if (cx < ar.left || cx > ar.right || cy < ar.top || cy > ar.bottom) return true;
    }
    return false;
  };
  // a layer over the page: something fixed that fills at least half the screen (a pop-up window's dark background)
  // (the outermost one: a window's dark background and the window itself belong to the same layer)
  const layerOf = (n) => {
    let top = null;
    for (let a = n; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
      if (getComputedStyle(a).position !== 'fixed') continue;
      const r = a.getBoundingClientRect();
      if (r.width * r.height >= innerWidth * innerHeight * 0.5) top = a;
    }
    return top;
  };
  // never point at something that a pop-up window is lying on top of (the person cannot press it)
  const covered = (el) => {
    const r = el.getBoundingClientRect();
    const x1 = Math.max(r.left, 0), x2 = Math.min(r.right, innerWidth), y1 = Math.max(r.top, 0), y2 = Math.min(r.bottom, innerHeight);
    if (x2 - x1 < 2 || y2 - y1 < 2) return false; // off screen: cannot tell, scrolling will show it
    const pts = [[0.5, 0.5], [0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]];
    let judged = 0, blocked = 0;
    for (const [fx, fy] of pts) {
      const hit = document.elementFromPoint(x1 + (x2 - x1) * fx, y1 + (y2 - y1) * fy);
      if (!hit || hit.id === 'yk-help-root') continue; // our own strip: look past it
      judged++;
      if (el.contains(hit) || hit.contains(el)) continue;
      const L = layerOf(hit);
      if (L && !L.contains(el)) blocked++;
    }
    return judged > 0 && blocked / judged >= 0.6;
  };
  const flags = () => { try { return JSON.parse(sessionStorage.getItem(FLAGS) || '{}'); } catch (e) { return {}; } };
  const setFlag = (k) => { try { const f = flags(); f[k] = true; sessionStorage.setItem(FLAGS, JSON.stringify(f)); } catch (e) {} };
  // an answer to one of our questions ("처음이에요" / "다녀간 적 있어요"): kept for this tab, and the person can change it any time
  const ANSWERS = 'yk-answers';
  const answers = () => { try { return JSON.parse(sessionStorage.getItem(ANSWERS) || '{}'); } catch (e) { return {}; } };
  function saveAnswer(flag, label, group) {
    try { const f = flags(); group.forEach((g) => { delete f[g]; }); f[flag] = true; sessionStorage.setItem(FLAGS, JSON.stringify(f));
      const a = answers(); group.forEach((g) => { delete a[g]; }); a[flag] = { label, group, path: location.pathname }; sessionStorage.setItem(ANSWERS, JSON.stringify(a)); } catch (e) {}
  }
  // the answer that decides what this screen says now: { label, group } or null
  function answerHere() {
    const f = flags(), page = R.pages.find((p) => p.match(location.pathname));
    for (const s of (page ? page.steps : [])) {
      const hit = (s.ask || []).find((a) => f[a.flag]);
      if (hit) return { label: hit.was || hit.label, group: s.ask.map((a) => a.flag) };
    }
    const a = answers();
    for (const k of Object.keys(a)) if (f[k] && a[k].path === location.pathname) return { label: a[k].label, group: a[k].group || [k] };
    return null;
  }
  function forgetAnswer() {
    const h = answerHere(); if (!h) return;
    try { const f = flags(), a = answers(); h.group.forEach((g) => { delete f[g]; delete a[g]; });
      sessionStorage.setItem(FLAGS, JSON.stringify(f)); sessionStorage.setItem(ANSWERS, JSON.stringify(a)); } catch (e) {}
  }
  // when something was last typed anywhere on the page
  let lastInputAt = 0;
  document.addEventListener('input', () => { lastInputAt = Date.now(); }, true);
  // a phone: the on-screen keyboard takes part of the screen while someone is typing
  const TOUCH = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
  let baseH = innerHeight;
  const keyboardOpen = () => { const v = window.visualViewport; baseH = Math.max(baseH, innerHeight); return !!v && v.height * v.scale < baseH - 100; };
  // on a phone the cursor stays in the box after the keyboard is put away: that is "done typing", not "still typing"
  const typingOver = () => TOUCH && !keyboardOpen() && Date.now() - lastInputAt > 1200;
  const H = {
    val: (id) => { const el = document.getElementById(id); return el ? String(el.value || '').trim() : ''; },
    // a field counts as done only after the person has left it (still typing "홍" of "홍길동" is not done)
    filled: (id) => {
      const el = document.getElementById(id); if (!el) return false;
      const v = String(el.value || '').trim(); if (!v) return false;
      // a fixed-length box that is full counts as done even while the cursor is still in it (010, 주민번호 앞 6자리)
      return el !== document.activeElement || (el.maxLength > 0 && v.length >= el.maxLength) || typingOver();
    },
    // something is written in the box and nothing has been typed for a while (free text with no fixed length)
    settled: (id, ms) => { const el = document.getElementById(id); return !!el && !!String(el.value || '').trim() && Date.now() - lastInputAt >= (ms || 3000); },
    checked: (id) => { const el = document.getElementById(id); return !!(el && el.checked); },
    flag: (k) => !!flags()[k],
    shown: (sel) => { try { return [...document.querySelectorAll(sel)].some(seen); } catch (e) { return false; } },
    // a visible box among these with something typed in it
    typed: (sel) => { try { return [...document.querySelectorAll(sel)].some((e) => seen(e) && String(e.value || '').trim()); } catch (e) { return false; } },
    path: () => location.pathname,
    memberMode: () => !!(H.val('id') || H.val('pass')) && !(H.val('ptnm') || H.val('pt_no') || H.val('hpno') || H.val('userNum02') || H.checked('userCheck01'))
  };
  function findOne(list) {
    for (const f of list || []) {
      // a guide table may also find its element with a small function (e.g. "the box after the step title that is open")
      if (f.fn) { let el = null; try { el = f.fn(); } catch (e) { el = null; } if (el && seen(el) && !covered(el)) return el; continue; }
      let nodes = [];
      try { nodes = [...document.querySelectorAll(f.sel)]; } catch (e) { nodes = []; }
      const hit = nodes.find((n) => seen(n) && (!f.text || n.textContent.replace(/\s+/g, ' ').includes(f.text)) && !covered(n));
      if (hit) return hit;
    }
    return null;
  }
  /* ---------- general rules: work on any hospital page, using the words printed on that page ---------- */
  // words hospitals use for the same things
  const WORDS = {
    reserve: ['진료예약', '진료 예약', '인터넷 진료예약', '온라인 진료예약', '온라인 예약', '인터넷 예약', '예약하기', '외래예약', '외래 예약', '외래진료예약', '진료예약하기'],
    go: ['다음', '확인', '신청', '예약신청', '예약하기', '로그인', '인증', '완료', '등록', '조회', '선택완료']
  };
  const SKIP = (el) => !!el.closest('header, nav, #header, .header, [role="search"], .gnb, .siteMap_mo, footer') ||
    /search|totalsearch/i.test((el.id || '') + ' ' + (el.name || ''));
  const FILLABLE = 'input:not([type]), input[type="text"], input[type="tel"], input[type="number"], input[type="email"], input[type="password"], input[type="search"], textarea, select';
  const isEmpty = (el) => !String(el.value || '').trim() || el === document.activeElement; // still typing counts as not done
  const textOf = (el) => (el.textContent || el.value || '').replace(/\s+/g, ' ').trim();
  // compare words with spaces ignored: '온라인 진료 예약' and '온라인 진료예약' are the same button
  const squash = (t) => t.replace(/\s+/g, '');
  const isWord = (t, list) => list.some((w) => squash(w) === squash(t));
  // the name of a field exactly as the page shows it ("성명 입력" → "성명")
  function fieldName(el) {
    let t = '';
    if (el.id) { const l = document.querySelector('label[for="' + CSS.escape(el.id) + '"]'); if (l) t = textOf(l); }
    if (!t) { const l = el.closest('label'); if (l) t = textOf(l); }
    t = t || el.getAttribute('aria-label') || el.placeholder || el.title || '';
    t = t.replace(/[*※]/g, '').replace(/\(필수\)|필수/g, '').replace(/(을|를)?\s*입력(해\s*주세요|하세요|해주세요)?\.?$/, '').replace(/\s*\(.*?\)\s*$/, '').trim();
    return t.length > 0 && t.length <= 16 ? t : '';
  }
  const josa = (w) => { const c = w.charCodeAt(w.length - 1); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 ? '을' : '를'; };
  function fieldsIn(box) {
    return [...box.querySelectorAll(FILLABLE)].filter((i) => seen(i) && !SKIP(i) && !i.disabled && !i.readOnly && i.type !== 'hidden');
  }
  // the smallest box around a button that also holds fields to fill in (a form, a card, a fold-out panel)
  function boxAround(btn) {
    const form = btn.closest('form'); if (form && fieldsIn(form).length) return form;
    let a = btn.parentElement;
    for (let i = 0; a && i < 3; i++, a = a.parentElement) { const f = fieldsIn(a); if (f.length && f.length <= 8) return a; }
    return null;
  }
  // a step for the first empty field, worded with the page's own field name; null when we are not sure
  function fieldStep(box) {
    const empty = fieldsIn(box).find(isEmpty);
    if (!empty) return null;
    const name = fieldName(empty);
    if (!name) return null; // a field without a readable name: do not guess
    return { st: '기본 규칙: 빈 칸', msg: `‘${name}’ 칸에 넣으세요.`, sub: '다 쓰고 그 칸을 벗어나면 다음 할 일을 알려드려요.', el: empty };
  }
  const isButton = (el) => /^(A|BUTTON)$/.test(el.tagName) || (el.tagName === 'INPUT' && /submit|button/.test(el.type));
  // a page that is not in the guide table: find a form with a clear main button and walk it
  function generalStep() {
    const btns = [...document.querySelectorAll('a, button, input[type="submit"], input[type="button"]')]
      .filter((b) => seen(b) && !SKIP(b) && isWord(textOf(b), WORDS.go));
    for (const b of btns) {
      const box = boxAround(b); if (!box) continue;
      const f = fieldStep(box); if (f) return f;
      const t = textOf(b);
      return { st: '기본 규칙: 주 버튼', msg: `‘${t}’${josa(t)} 누르세요.`, sub: '칸을 다 채웠어요. 이 버튼을 누르면 다음으로 넘어가요.', el: b };
    }
    const r = findByWords(WORDS.reserve);
    if (r) { const t = r.word; return { st: '기본 규칙: 예약 버튼', msg: `‘${t}’${josa(t)} 누르세요.`, sub: '병원마다 이름은 달라도 예약을 시작하는 버튼이에요.', el: r.el }; }
    return null;
  }
  // the nearest thing a finger can press: a link, a button, or a card the site made clickable
  function clickable(el) {
    for (let a = el, i = 0; a && i < 4; i++, a = a.parentElement) {
      if (/^(A|BUTTON)$/.test(a.tagName) || a.hasAttribute('onclick') || a.getAttribute('role') === 'button' || getComputedStyle(a).cursor === 'pointer') return a;
    }
    return null;
  }
  // a button, or a card whose title is one of the words (some sites make whole cards clickable without a link)
  function findByWords(words) {
    const exact = [...document.querySelectorAll('a, button')].find((b) => seen(b) && !SKIP(b) && isWord(textOf(b), words));
    if (exact) return { el: exact, word: textOf(exact) };
    const titles = [...document.querySelectorAll('h1, h2, h3, h4, strong, b, span, p, dt, div, li')]
      .filter((t) => t.children.length === 0 && isWord(textOf(t), words) && seen(t) && !SKIP(t));
    for (const t of titles) { const c = clickable(t); if (c && seen(c) && !SKIP(c)) return { el: c, word: textOf(t) }; }
    return null;
  }

  function current() {
    const path = location.pathname;
    // 본인인증 같은 새 창이 막혔을 때: 무엇보다 먼저 푸는 방법을 보여줘요
    if (popupBlocked && Date.now() - popupBlocked < 180000 && location.href === popupHref) {
      return { page: '새 창 막힘', step: popupStep(), el: popupBtn && popupBtn.isConnected ? popupBtn : null, known: true, force: true };
    }
    const page = R.pages.find((p) => p.match(path));
    if (page) {
      // the first line of the table that fits this screen and whose button is really on it
      let step = null, el = null;
      for (const s of page.steps) {
        let ok = false; try { ok = s.when(H); } catch (e) { ok = false; }
        if (!ok) continue;
        const hit = findOne(s.find);
        if (hit) { step = s; el = hit; break; }
      }
      if (!step) {
        // nothing in the table fits: the shared map may still know this screen; otherwise stop and offer the phone
        const u = window.__YK_U && window.__YK_U.detect(flags());
        if (u && !(u.el && covered(u.el))) return { page: page.name + ' · 공통 지도: ' + u.name, step: u.step, el: u.el, known: true, weak: true };
        return { page: page.name, step: null, el: null, known: true, weak: true };
      }
      // the table says "press this button": if the same box still has empty fields, guide those first
      if (el && isButton(el) && !step.ask && step.fill !== false) {
        // the common rule (stages.js): every box above the button in its form, in order, before the button
        const g = window.__YK_U && window.__YK_U.gate(el);
        if (g) return { page: page.name, step: { st: '칸 채우기', msg: g.msg, sub: g.sub }, el: g.el, known: true };
        const box = boxAround(el), f = box && fieldStep(box);
        if (f) return { page: page.name, step: f, el: f.el, known: true };
      }
      return { page: page.name, step, el, known: true };
    }
    // not in this hospital's table: use the shared reservation map (stages.js), which works on any hospital
    const u = window.__YK_U && window.__YK_U.detect(flags());
    if (u && !(u.el && covered(u.el))) return { page: '공통 지도: ' + u.name, step: u.step, el: u.el, known: false };
    // (the older word-only rule is not used any more: it could point at a button before its boxes were filled)
    const el = findOne(R.fallback.find);
    return { page: '안내표에 없는 화면', step: el ? R.fallback : null, el, known: false };
  }

  // remember that the SMS approval was requested (the page gives no other sign of it)
  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('button[onclick*="smsSend"]')) setFlag('smsSent');
  }, true);

  /* ---------- our layer (shadow DOM, so the hospital's styles never mix with ours) ---------- */
  const host = document.createElement('div');
  host.id = 'yk-help-root';
  host.setAttribute('data-yk-version', '0.6.5');
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483000;pointer-events:none;';
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `
  <style>
    :host { all: initial; }
    * { box-sizing: border-box; font-family: "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif; }
    .ring { position: fixed; border-radius: 8px; outline: 4px solid #f6c21c; outline-offset: 3px;
      box-shadow: 0 0 0 9999px rgba(18, 26, 44, .38); pointer-events: none; }
    .ring.nodim { box-shadow: none; }
    .ui { position: fixed; left: 0; top: 0; width: 100vw; height: 100vh; transform-origin: 0 0; transform: translate(0px, 0px) scale(1); pointer-events: none; }
    .ring { transition: opacity .25s ease; }
    .ring.away { opacity: 0; }
    .where { position: fixed; left: 50%; transform: translateX(-50%); pointer-events: auto; min-height: 44px; padding: 0 18px; border: 0; border-radius: 22px;
      background: #18202e; color: #fff; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,.3); white-space: nowrap; }
    @keyframes ring { 50% { outline-color: #ffe17a; } }
    .ring { animation: ring 1.8s ease-in-out infinite; }
    .fab { position: fixed; right: 14px; bottom: 84px; pointer-events: auto; height: 54px; padding: 0 18px 0 10px; border: 0; border-radius: 27px;
      background: #f6c21c; color: #3d2c00; font-size: 19px; font-weight: 800; display: flex; align-items: center; gap: 8px;
      box-shadow: 0 6px 16px rgba(0,0,0,.25); cursor: pointer; }
    .fab .q { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: #fff; font-size: 18px; }
    .strip { position: fixed; left: 8px; right: 8px; margin: 0 auto; max-width: 460px; pointer-events: auto;
      background: #fff; color: #18202e; border-radius: 14px; border-left: 6px solid #f6c21c;
      padding: 12px 10px 10px 14px; box-shadow: 0 10px 28px rgba(0,0,0,.25); display: flex; flex-direction: column; gap: 8px; }
    .strip.paused { border-left-color: #b4361f; }
    .msg { margin: 0; font-size: 19px; font-weight: 800; line-height: 1.4; }
    .sub { margin: 0; font-size: 16px; line-height: 1.5; color: #5d6779; }
    .bar { display: flex; align-items: center; gap: 6px; }
    .txt { min-height: 40px; padding: 0 12px; border-radius: 20px; border: 1px solid #d3d9e4; background: #f3f5f9; font-size: 15px; font-weight: 700; color: #18202e; cursor: pointer; }
    .sp { flex: 1; }
    .ic { width: 44px; height: 44px; border-radius: 50%; border: 0; background: #f3f5f9; font-size: 18px; cursor: pointer; padding: 0; }
    .ic.say { background: #f6c21c; }
    .tag { font-size: 12px; color: #8a96aa; margin: 0; }
    .was { margin: 0; font-size: 14px; color: #5d6779; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .lnk { min-height: 34px; padding: 0 12px; border-radius: 17px; border: 1px solid #c3cada; background: #fff; font-size: 14px; font-weight: 700; color: #18202e; cursor: pointer; }
    .exit { position: fixed; left: 8px; right: 8px; top: 12px; bottom: 12px; margin: 0 auto; max-width: 460px; pointer-events: auto; overflow: auto;
      background: #fff; color: #18202e; border-radius: 16px; border-top: 6px solid #2f5bb7; padding: 18px 16px; box-shadow: 0 10px 28px rgba(0,0,0,.3);
      display: flex; flex-direction: column; gap: 12px; }
    .exit h3 { margin: 0; font-size: 21px; }
    .call { padding: 14px; border-radius: 12px; background: #2f5bb7; color: #fff; text-align: center; font-size: 15px; }
    .call b { display: block; font-size: 28px; user-select: all; }
    .row { display: flex; gap: 8px; }
    .row button { flex: 1; min-height: 50px; border-radius: 10px; border: 1px solid #d3d9e4; background: #fff; font-size: 16px; font-weight: 700; cursor: pointer; }
    .row .say { background: #f6c21c; border-color: #f6c21c; }
    .nudge { position: fixed; right: 150px; pointer-events: auto; max-width: 240px; padding: 10px 12px; border: 0; border-radius: 12px;
      background: #18202e; color: #fff; font-size: 16px; font-weight: 700; line-height: 1.35; text-align: left; cursor: pointer;
      box-shadow: 0 6px 16px rgba(0,0,0,.25); }
    .nudge::after { content: ""; position: absolute; right: -8px; top: 50%; margin-top: -8px; border: 8px solid transparent; border-right: 0; border-left-color: #18202e; }
    [hidden] { display: none !important; }
    :focus-visible { outline: 3px solid #4c7dff; outline-offset: 2px; }
  </style>
  <div class="ring" hidden></div>
  <div class="ui">
  <button class="fab" type="button" aria-label="도움 안내 켜기"><span class="q">?</span>도움</button>
  <div class="strip" hidden role="dialog" aria-live="polite"></div>
  <div class="exit" hidden role="dialog"></div>
  <button class="nudge" type="button" hidden></button>
  <button class="where" type="button" hidden data-g="goto"></button>
  </div>`;
  document.documentElement.appendChild(host);
  const ring = $('.ring', root), fab = $('.fab', root), strip = $('.strip', root), exitBox = $('.exit', root), nudge = $('.nudge', root), where = $('.where', root), ui = $('.ui', root);

  let on = false, more = false, exitOpen = false, lastKey = '', target = null;
  let lastGood = Date.now(), lastHref = location.href;
  const HOLD = 2500;
  // the site's own "loading" cover is on the screen (고대안암: #loading_back): the page is not ready yet
  const LOADING_RE = /loading|loader|spinner/i;
  const loadingNow = () => {
    for (const [fx, fy] of [[0.5, 0.5], [0.25, 0.3], [0.75, 0.7]]) {
      for (let a = document.elementFromPoint(innerWidth * fx, innerHeight * fy), i = 0; a && a !== document.body && i < 4; i++, a = a.parentElement) {
        if (a.id === 'yk-help-root') break;
        if (LOADING_RE.test((a.id || '') + ' ' + (typeof a.className === 'string' ? a.className : ''))) return true;
      }
    }
    return false;
  };
  const LOADING_MSG = '화면을 불러오고 있어요. 잠시만 기다리세요.';
  try { on = sessionStorage.getItem(KEY) === '1'; } catch (e) {}

  /* ---------- layout ---------- */
  // a bar pinned to the top or bottom edge of the screen (site header, bottom menu), found on any site
  function pinnedAt(y) {
    const pts = [innerWidth * 0.25, innerWidth * 0.5, innerWidth * 0.75];
    for (const x of pts) {
      let el = document.elementFromPoint(x, y);
      for (; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
        if (el === host) break;
        const pos = getComputedStyle(el).position, r = el.getBoundingClientRect();
        if ((pos === 'fixed' || pos === 'sticky') && r.width > innerWidth * 0.6 && r.height < 160) return r;
      }
    }
    return null;
  }
  function headerBottom() {
    const r = pinnedAt(4);
    return r && r.top <= 4 && r.bottom > 0 ? r.bottom + 6 : 8;
  }
  function bottomBarHeight() {
    const r = pinnedAt(innerHeight - 4);
    return r && r.bottom >= innerHeight - 4 ? r.height : 0;
  }
  // A phone zooms the page when a box is tapped (and people pinch to zoom). The page grows, but our guide must not:
  // keep our layer exactly over the part of the page that is on screen, at its normal size.
  // (2026-11-12 아이폰 실사용 영상: 칸을 누르면 화면이 확대되면서 안내 창이 커져 잘리고, 노란 테두리가 다른 곳에 그려졌어요)
  let zoomed = false;
  function fitUi() {
    const v = window.visualViewport;
    const sc = v ? v.scale : 1, ox = v ? v.offsetLeft : 0, oy = v ? v.offsetTop : 0;
    ui.style.width = (v ? v.width * sc : innerWidth) + 'px';
    ui.style.height = (v ? v.height * sc : innerHeight) + 'px';
    ui.style.transform = 'translate(' + ox + 'px, ' + oy + 'px) scale(' + (1 / sc) + ')';
    zoomed = sc > 1.02 || oy > 2 || ox > 2;
  }
  // the part of the page that is on screen, in the same numbers getBoundingClientRect() gives
  function screenBox() {
    const v = window.visualViewport, o = host.getBoundingClientRect();
    if (!v) return { top: 0, left: 0, bottom: innerHeight, right: innerWidth, scale: 1 };
    return { top: o.top + v.offsetTop, left: o.left + v.offsetLeft, bottom: o.top + v.offsetTop + v.height, right: o.left + v.offsetLeft + v.width, scale: v.scale };
  }
  function placeChrome() {
    fitUi();
    const bar = zoomed ? 0 : bottomBarHeight();
    fab.style.bottom = (bar + 14) + 'px';
    nudge.style.bottom = (bar + 18) + 'px';
    nudge.style.right = (fab.offsetWidth + 28) + 'px';
    strip.style.top = (zoomed ? 8 : headerBottom()) + 'px';
  }
  // where the place we point at went when it is not on screen: 'up' | 'down' | '' (it is on screen)
  function awayDir(el) {
    const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + Math.min(r.height / 2, 20);
    for (let a = el.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (!/auto|scroll/.test(s.overflowX + s.overflowY)) continue;
      const ar = a.getBoundingClientRect();
      if (cy < ar.top) return 'up';
      if (cy > ar.bottom || cx < ar.left || cx > ar.right) return 'down';
    }
    const b = screenBox(), m = 40 / b.scale;
    if (r.bottom < b.top + m) return 'up';
    if (r.top > b.bottom - m) return 'down';
    return '';
  }
  function placeRing() {
    if (!on || exitOpen || !target || !target.isConnected || !seen(target)) { ring.hidden = true; where.hidden = true; return; }
    const r = target.getBoundingClientRect();
    ring.hidden = false;
    const o = host.getBoundingClientRect();
    ring.style.top = (r.top - o.top) + 'px'; ring.style.left = (r.left - o.left) + 'px';
    ring.style.width = r.width + 'px'; ring.style.height = r.height + 'px';
    // scrolled away (the page, or the inside of a pop-up window): the dark cover fades out instead of flipping,
    // and a small button says which way the place is and brings it back when pressed
    const dir = awayDir(target);
    ring.classList.toggle('away', !!dir);
    where.hidden = !dir;
    if (dir) {
      where.textContent = dir === 'up' ? '↑ 누를 곳이 위에 있어요' : '↓ 누를 곳이 아래에 있어요';
      where.style.top = dir === 'up' ? (strip.offsetTop + strip.offsetHeight + 10) + 'px' : '';
      where.style.bottom = dir === 'up' ? '' : ((zoomed ? 0 : bottomBarHeight()) + 16) + 'px';
    }
  }
  // bring the target into the free area under the strip (only when the step changes)
  // The person moves the page themself (finger, wheel, arrow keys): from then on we do not move it for them.
  // We only say which way the place is ("↓ 누를 곳이 아래에 있어요"). Pressing something on the page lets us lead again.
  // (2026-11-12 아이폰 실사용: 위로 올리려고 해도 짚는 곳으로 자꾸 다시 내려갔어요)
  let lastUserScrollAt = 0, lastAutoTarget = null;
  const userMoved = () => { lastUserScrollAt = Date.now(); };
  ['touchmove', 'wheel'].forEach((t) => document.addEventListener(t, userMoved, { passive: true, capture: true }));
  document.addEventListener('keydown', (e) => { if (/^(Arrow|Page|Home|End| $)/.test(e.key)) userMoved(); }, true);
  document.addEventListener('click', (e) => { if (!(e.composedPath && e.composedPath().includes(host))) lastUserScrollAt = 0; }, true);
  function scrollToTarget() {
    if (!target) return;
    if (Date.now() - lastUserScrollAt < 6000) return;
    lastAutoTarget = target;
    // never move the page while the person is typing in a field
    // (a tick box or a choice button that was just pressed is not typing: those may scroll on to the next step)
    const a = document.activeElement;
    if (a && (a.tagName === 'TEXTAREA' || (a.tagName === 'INPUT' && !/^(radio|checkbox|button|submit|image|reset)$/.test(a.type)))) return;
    // the target is inside a box that scrolls on its own (a list, an app-like page): scroll that box
    // (also a pop-up window whose lower half scrolls: bring the box we point at into that window's view)
    if (!seen(target) || outOfScroller(target)) { try { target.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {} return; }
    if (zoomed) { if (awayDir(target)) { try { target.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {} } return; }
    const top = strip.getBoundingClientRect().bottom + 10;
    const bottom = innerHeight - bottomBarHeight() - 10;
    const r = target.getBoundingClientRect();
    if (r.top >= top && r.bottom <= bottom) return;
    const want = r.height < bottom - top ? (r.top + r.bottom) / 2 - (top + bottom) / 2 : r.top - top;
    window.scrollBy({ top: want, behavior: 'smooth' });
  }

  /* ---------- drawing ---------- */
  const tools = '<span class="sp"></span><button type="button" class="ic say" data-g="speak" aria-label="소리로 듣기">🔊</button><button type="button" class="ic" data-g="off" aria-label="안내 끄기">✕</button>';
  function draw(force) {
    placeChrome();
    if (!on) { strip.hidden = true; exitBox.hidden = true; ring.hidden = true; fab.hidden = false; return; }
    fab.hidden = true;
    if (exitOpen) { strip.hidden = true; ring.hidden = true; exitBox.hidden = false; return; }
    exitBox.hidden = true;
    const c = current();
    // a page of this hospital's own table that fits no line right now: the screen is most likely still changing
    // (a list loading, a window opening). Keep what we said for up to 2 seconds instead of flashing a wrong or "paused" message.
    if (location.href !== lastHref) { lastHref = location.href; lastGood = Date.now(); }
    // (while the site's loading cover is up we wait longer, and say so)
    const busy = c.weak && loadingNow();
    if (c.weak && !force && (Date.now() - lastGood < HOLD || (busy && Date.now() - lastGood < 20000))) {
      if (!strip.innerHTML || busy) {
        strip.className = 'strip';
        strip.innerHTML = `<p class="msg">${busy ? LOADING_MSG : '화면을 읽고 있어요. 잠시만 기다리세요.'}</p><div class="bar"><button type="button" class="txt" data-g="exit">📞 전화로</button>${tools}</div>`;
        lastKey = ''; // what comes next is drawn fresh
      }
      strip.hidden = false;
      placeRing(); return;
    }
    if (!c.weak) lastGood = Date.now();
    const key = c.page + '|' + (c.step ? c.step.st + (c.step.msg || '') : '-') + '|' + (c.el ? 1 : 0) + '|' + more + '|' + JSON.stringify(flags());
    if (!force && key === lastKey && c.el === target) { placeRing(); return; }
    const stepChanged = key.split('|').slice(0, 2).join('|') !== lastKey.split('|').slice(0, 2).join('|');
    lastKey = key; target = c.el;
    // test runs (scorecard/walk.mjs) read which element is pointed at; normal use never sets this
    try { if (sessionStorage.getItem('yk-test') === '1') { document.querySelectorAll('[data-yk-target]').forEach((n) => n.removeAttribute('data-yk-target')); if (target) target.setAttribute('data-yk-target', c.step ? (c.step.st || '') : ''); } } catch (e) {}
    // team test runs on a real site: keep a list of what the button said at each step (wording and which button only, never typed values)
    try {
      if (stepChanged && sessionStorage.getItem('yk-test') === '1') {
        const log = JSON.parse(sessionStorage.getItem('yk-log') || '[]');
        const el = c.el;
        log.push({ at: new Date().toTimeString().slice(0, 8), path: location.pathname, page: c.page, st: c.step ? (c.step.st || '') : '(안내 없음)', msg: c.step ? c.step.msg : '',
          el: el ? el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.title ? '[' + el.title + ']' : '') + (/^(A|BUTTON|LABEL)$/.test(el.tagName) ? ' “' + (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 20) + '”' : '') : '' });
        sessionStorage.setItem('yk-log', JSON.stringify(log.slice(-300)));
      }
    } catch (e) {}
    // an earlier answer decides what we say here: show it, with a button to change it (so the question never just disappears)
    const ah = c.step && c.step.ask ? null : answerHere();
    const was = ah ? `<p class="was">‘${ah.label}’ 기준으로 안내 중이에요.<button type="button" class="lnk" data-g="reask">답 바꾸기</button></p>` : '';
    // 시안(북마크로 켠 경우)에서만: 로그인하면 병원 화면이 통째로 새로 열려서 이 도움 버튼이 꺼져요. 미리 알려줘요.
    // (병원이 코드 한 줄을 넣으면 모든 화면에서 저절로 뜨니 이 안내는 나오지 않아요)
    const demo = window.__YK_DEMO && /login/i.test(location.pathname) ? '<p class="was">시안 안내: 로그인하면 화면이 새로 열려서 도움 버튼이 꺼져요. 그때 북마크의 ‘여기콕’을 한 번 더 눌러 주세요.</p>' : '';
    if (c.step && c.el && c.step.ask) {
      strip.className = 'strip';
      strip.innerHTML = `<p class="msg">${c.step.msg}</p>
        <div class="row">${c.step.ask.map((a, i) => `<button type="button" class="${i === 0 ? 'say' : ''}" data-g="answer" data-flag="${a.flag}" data-was="${a.was || a.label}">${a.label}</button>`).join('')}</div>
        ${demo}<div class="bar"><button type="button" class="txt" data-g="exit">📞 전화로</button>${tools}</div>`;
    } else if (c.step && (c.el || c.force)) {
      strip.className = 'strip';
      strip.innerHTML = `<p class="msg">${c.step.msg}</p>${more ? `<p class="sub">${c.step.sub}</p>` : ''}${was}${demo}
        <div class="bar">${c.step.sub ? `<button type="button" class="txt" data-g="more">${more ? '접기' : '자세히'}</button>` : ''}
        <button type="button" class="txt" data-g="exit">📞 전화로</button>${tools}</div>`;
    } else {
      // the guide table does not match this screen: never point at a wrong place
      strip.className = 'strip paused';
      strip.innerHTML = `<p class="msg">${c.known ? '병원 화면이 바뀌어서 안내를 잠시 멈췄어요.' : '이 화면은 아직 안내가 준비 중이에요.'}</p>${was}
        <div class="bar"><button type="button" class="txt" data-g="exit">📞 전화로 하기</button>${tools}</div>`;
      if (c.known) console.warn('[여기콕] 팀 알림: 안내표가 가리키는 곳을 찾지 못했어요 →', c.page, c.step && c.step.st);
    }
    strip.hidden = false;
    placeRing();
    // move the page only when we start pointing at a different place (not when only the wording changes)
    if (stepChanged && target !== lastAutoTarget) setTimeout(scrollToTarget, 30);
  }
  function openExit() {
    exitOpen = true;
    exitBox.innerHTML = `<h3>전화로 이어서 할게요</h3>
      ${R.phone ? `<div class="call">${R.hospital} 예약센터<b>${R.phone}</b>${R.hours}</div>` : `<div class="call">${R.hospital}<b style="font-size:20px">예약 전화번호</b>홈페이지 맨 위나 맨 아래에 적힌 ‘예약’ 또는 ‘대표전화’ 번호로 전화하세요</div>`}
      <p class="sub">상담원에게 “인터넷 예약이 어려워서 전화했어요”라고 말씀하시면 돼요.</p>
      <div class="row"><button type="button" class="say" data-g="speak">🔊 소리로 듣기</button><button type="button" data-g="back">돌아가기</button></div>
      <p class="tag">여기콕 도움 (시연) ${host.getAttribute('data-yk-version')} · 안내표 ${R.analyzedOn} 기준</p>`;
    draw(true);
  }
  function speak() {
    const c = current();
    const text = exitOpen ? (R.phone ? `${R.hospital} 예약센터 번호는 ${R.phone.split('').join(' ')} 이에요.` : '홈페이지에 적힌 예약 전화번호로 전화하세요.')
      : c.step && (c.el || c.force) ? `${c.step.msg} ${c.step.sub}` : '이 화면은 아직 안내가 준비 중이에요. 전화로 도와드릴게요.';
    try { const u = new SpeechSynthesisUtterance(text); u.lang = 'ko-KR'; u.rate = 0.9; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {}
  }
  function setOn(v) {
    on = v; exitOpen = false; more = false; lastKey = '';
    if (v) { nudge.hidden = true; }
    try { sessionStorage.setItem(KEY, v ? '1' : '0'); } catch (e) {}
    if (!v) { try { speechSynthesis.cancel(); } catch (e) {} }
    draw(true);
  }

  /* ---------- 새 창(본인인증·PASS)이 막혔는지 알아채기 ---------- */
  // 새 창이 열리면 이 화면은 잠깐 뒤로 가요(blur·visibilitychange). 4초 동안 아무 일도 없으면 막힌 거예요.
  const POPUP_RE = /인증하기|본인인증|휴대폰인증|휴대전화인증|아이핀|공동인증서|PASS인증|간편인증/;
  let popupWatch = 0, popupBlocked = 0, popupBtn = null, popupHref = '';
  function popupStep() {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) return { st: '새 창 막힘', msg: '새 창이 막혔어요. 아이폰 설정에서 ‘팝업 차단’을 꺼야 해요.',
      sub: '① 화면에 ‘팝업 윈도우…’ 창이 떠 있으면 ‘허용’을 누르세요. ② 안 떠 있으면: 설정 앱 → (앱) → Safari → ‘팝업 차단’을 눌러 끄세요. ③ 이 화면으로 돌아와 ‘인증하기’를 다시 누르세요.' };
    if (/Android/.test(ua)) return { st: '새 창 막힘', msg: '새 창이 막혔어요. ‘팝업 차단됨’을 눌러 허용해야 해요.',
      sub: '① 화면 아래나 주소창에 ‘팝업 차단됨’이 보이면 누르고 ‘항상 허용’을 고르세요. ② 이 화면에서 ‘인증하기’를 다시 누르세요.' };
    return { st: '새 창 막힘', msg: '새 창이 막혔어요. 주소창 오른쪽의 ‘팝업 차단됨’을 눌러 허용하세요.',
      sub: '① 주소창 오른쪽 끝의 작은 창 모양을 누르세요. ② ‘항상 허용’을 고르고 ‘완료’. ③ ‘인증하기’를 다시 누르세요.' };
  }
  document.addEventListener('click', (e) => {
    if (e.composedPath && e.composedPath().includes(host)) return;
    const b = e.target && e.target.closest && e.target.closest('a, button, input[type="button"], input[type="submit"]');
    if (!b || !POPUP_RE.test(String(b.textContent || b.value || '').replace(/\s+/g, ''))) return;
    const at = Date.now(); popupWatch = at; popupBlocked = 0;
    let left = false; const away = () => { left = true; };
    window.addEventListener('blur', away);
    document.addEventListener('visibilitychange', away);
    const href = location.href;
    setTimeout(() => {
      window.removeEventListener('blur', away); document.removeEventListener('visibilitychange', away);
      if (popupWatch !== at || left || location.href !== href || document.hidden) return;
      popupBlocked = Date.now(); popupBtn = b; popupHref = href;
      if (on) { more = true; lastKey = ''; draw(true); }
    }, 4000);
  }, true);

  fab.addEventListener('click', () => setOn(true));
  window.addEventListener('yk-open', () => setOn(true));
  root.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-g]'); if (!b) return;
    const g = b.dataset.g;
    if (g === 'off') return setOn(false);
    if (g === 'speak') return speak();
    if (g === 'more') { more = !more; return draw(true); }
    if (g === 'exit') return openExit();
    if (g === 'back') { exitOpen = false; lastKey = ''; return draw(true); }
    if (g === 'answer') {
      const group = [...b.parentElement.querySelectorAll('[data-g="answer"]')].map((x) => x.dataset.flag);
      saveAnswer(b.dataset.flag, b.dataset.was || b.textContent, group); lastKey = ''; return draw(true);
    }
    if (g === 'reask') { forgetAnswer(); lastKey = ''; return draw(true); }
    if (g === 'goto') { lastUserScrollAt = 0; try { target && target.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (er) {} return; }
  });

  // follow what the person does on the page
  ['input', 'change', 'click', 'keyup', 'focusout'].forEach((t) => document.addEventListener(t, () => setTimeout(() => draw(false), 60), true));
  setInterval(() => draw(false), 700);
  let raf = 0;
  const follow = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { placeChrome(); placeRing(); }); };
  addEventListener('scroll', follow, { passive: true, capture: true });
  // a size change (turning the phone, the keyboard opening) can push the target out of view
  let rt = 0;
  // (on a phone the screen size changes every time the browser's bars slide in and out while scrolling: only redraw, never move the page)
  const onResize = () => { follow(); clearTimeout(rt); rt = setTimeout(() => { if (on && !exitOpen) draw(false); }, 250); };
  addEventListener('resize', onResize);
  if (window.visualViewport) { visualViewport.addEventListener('resize', onResize); visualViewport.addEventListener('scroll', follow); }

  // some hospital pages move by animation instead of scrolling (no scroll events):
  // keep the ring on its target every frame so it never drifts away from the button
  const loop = () => { if (on && !exitOpen && target) placeRing(); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);

  const NUDGE_MS = 12000;
  let nudgeTimer = 0;
  const nudgeKey = () => 'yk-nudged:' + location.pathname;
  function armNudge() {
    clearTimeout(nudgeTimer); nudge.hidden = true;
    let done = false; try { done = sessionStorage.getItem(nudgeKey()) === '1'; } catch (e) {}
    if (on || done) return;
    nudgeTimer = setTimeout(() => {
      if (on) return;
      const page = R.pages.find((p) => p.match(location.pathname));
      nudge.textContent = (page && page.nudge) || '어려우면 ‘도움’을 누르세요';
      placeChrome(); nudge.hidden = false;
      try { sessionStorage.setItem(nudgeKey(), '1'); } catch (e) {}
    }, NUDGE_MS);
  }
  nudge.addEventListener('click', () => { nudge.hidden = true; setOn(true); });
  ['pointerdown', 'keydown', 'input'].forEach((t) => document.addEventListener(t, (e) => {
    if (e.composedPath && e.composedPath().includes(host)) return; // taps on our own layer
    armNudge();
  }, true));
  armNudge();

  draw(true);
})();

    if (open) window.dispatchEvent(new Event('yk-open'));
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
