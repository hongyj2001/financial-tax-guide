import React, { useState, useMemo } from 'react';

// === PREMIUM SVG ICONS ===
const CoinsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ScaleIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CalcIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const HelpIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('matrix');

  // Calculator inputs state (in unit: 만 원 / Ten-thousand KRW)
  const [inputs, setInputs] = useState({
    domStockGain: 0,      // 국내주식 매매차익
    domStockDiv: 0,        // 국내주식 배당금
    overseasStockGain: 0,  // 해외주식 매매차익
    overseasStockLoss: 0,  // 해외주식 매매차손
    overseasStockDiv: 0,    // 해외주식 배당금
    domListedUsEtfGain: 0, // 국내 상장 미국 ETF 매매차익
    domListedUsEtfDiv: 0,  // 국내 상장 미국 ETF 분배금
    domStockEtfGain: 0,    // 국내 주식형 ETF 매매차익
    domStockEtfDiv: 0,      // 국내 주식형 ETF 분배금
    domOtherEtfGain: 0,    // 국내 기타 ETF 매매차익
    domOtherEtfDiv: 0,      // 국내 기타 ETF 분배금
    krxGoldGain: 0,        // KRX 금현물 매매차익
  });

  // Recommender parameters
  const [recTarget, setRecTarget] = useState('both'); // 'capital' | 'dividend' | 'both'
  const [recVolume, setRecVolume] = useState('medium'); // 'small' (< 10M) | 'medium' (10M~50M) | 'large' (> 50M)
  const [recIasHolder, setRecIsaHolder] = useState('yes'); // 'yes' | 'no'

  // Input Handler
  const handleInputChange = (field, val) => {
    const numVal = val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0);
    setInputs(prev => ({ ...prev, [field]: numVal }));
  };

  // Helper to format currency
  const formatKRW = (manWon) => {
    if (manWon === 0) return '0원';
    const won = manWon * 10000;
    if (won >= 100000000) {
      const eok = Math.floor(won / 100000000);
      const remainder = Math.floor((won % 100000000) / 10000);
      return `${eok}억 ${remainder > 0 ? remainder + '만' : ''}원`;
    }
    return `${manWon.toLocaleString()}만 원`;
  };

  // Tax calculations based on current 2026 guidelines (post-금투세 abolition)
  const calculations = useMemo(() => {
    // 1. 국내주식 (Domestic Stocks)
    // 매매차익: 비과세 (대주주 제외)
    const domStockCapitalTax = 0;
    // 배당금: 15.4% 원천징수
    const domStockDivTax = Math.floor(inputs.domStockDiv * 0.154);

    // 2. 해외주식 & 해외 ETF (US Direct Stock/ETF)
    // 매매차익 & 매매차손 통산
    const netOverseasGain = Math.max(0, inputs.overseasStockGain - inputs.overseasStockLoss);
    // 기본공제 250만 원 적용
    const taxableOverseasGain = Math.max(0, netOverseasGain - 250);
    // 양도소득세 22% (지방소득세 포함)
    const overseasStockCapitalTax = Math.floor(taxableOverseasGain * 0.22);
    // 해외주식 배당금 (US 현지 15% 원천징수 완료 기준, 국내 추가 원천징수 없음)
    const overseasStockDivTax = Math.max(0, Math.floor(inputs.overseasStockDiv * 0.15));

    // 3. 국내 상장 해외(미국) ETF (e.g., KODEX 미국S&P500)
    // 매매차익: 배당소득세 15.4% 과세 (금융소득종합과세 합산 대상)
    const domListedUsEtfCapitalTax = Math.floor(inputs.domListedUsEtfGain * 0.154);
    // 분배금: 배당소득세 15.4%
    const domListedUsEtfDivTax = Math.floor(inputs.domListedUsEtfDiv * 0.154);

    // 4. 국내 주식형 ETF (e.g., KODEX 200)
    // 매매차익: 비과세
    const domStockEtfCapitalTax = 0;
    // 분배금: 배당소득세 15.4%
    const domStockEtfDivTax = Math.floor(inputs.domStockEtfDiv * 0.154);

    // 5. 국내 기타 ETF (e.g., 채권형, 금선물, 레버리지 등)
    // 매매차익: 배당소득세 15.4%
    const domOtherEtfCapitalTax = Math.floor(inputs.domOtherEtfGain * 0.154);
    // 분배금: 배당소득세 15.4%
    const domOtherEtfDivTax = Math.floor(inputs.domOtherEtfDiv * 0.154);

    // 6. KRX 금현물 계좌 (KRX Gold Market)
    // 매매차익: 비과세 (VAT는 실물 인출 시에만 부과되므로 계좌 거래 시 0%)
    const krxGoldCapitalTax = 0;

    // === FINANCIAL COMPREHENSIVE TAX (금융소득종합과세) ANALYSIS ===
    // 종합과세 대상 소득 합산 (국내주식배당 + 해외주식배당 + 국내상장미국ETF매매차익/분배금 + 국내주식형ETF분배금 + 국내기타ETF매매차익/분배금)
    // 주의: 해외주식 '매매차익'은 양도소득세 분류과세이므로 종합과세 합산에서 제외됨!
    const totalFinancialIncome = 
      inputs.domStockDiv + 
      inputs.overseasStockDiv + 
      inputs.domListedUsEtfGain + 
      inputs.domListedUsEtfDiv + 
      inputs.domStockEtfDiv + 
      inputs.domOtherEtfGain + 
      inputs.domOtherEtfDiv;

    const isComprehensiveTaxable = totalFinancialIncome > 2000; // 2,000만 원 초과 기준

    return {
      domStock: { capitalTax: domStockCapitalTax, divTax: domStockDivTax, total: domStockCapitalTax + domStockDivTax },
      overseasStock: { 
        netGain: netOverseasGain, 
        taxableGain: taxableOverseasGain, 
        capitalTax: overseasStockCapitalTax, 
        divTax: overseasStockDivTax, 
        total: overseasStockCapitalTax + overseasStockDivTax 
      },
      domListedUsEtf: { capitalTax: domListedUsEtfCapitalTax, divTax: domListedUsEtfDivTax, total: domListedUsEtfCapitalTax + domListedUsEtfDivTax },
      domStockEtf: { capitalTax: domStockEtfCapitalTax, divTax: domStockEtfDivTax, total: domStockEtfCapitalTax + domStockEtfDivTax },
      domOtherEtf: { capitalTax: domOtherEtfCapitalTax, divTax: domOtherEtfDivTax, total: domOtherEtfCapitalTax + domOtherEtfDivTax },
      krxGold: { capitalTax: krxGoldCapitalTax, total: krxGoldCapitalTax },
      totalFinancialIncome,
      isComprehensiveTaxable,
      grandTotalTax: 
        domStockCapitalTax + domStockDivTax +
        overseasStockCapitalTax + overseasStockDivTax +
        domListedUsEtfCapitalTax + domListedUsEtfDivTax +
        domStockEtfCapitalTax + domStockEtfDivTax +
        domOtherEtfCapitalTax + domOtherEtfDivTax +
        krxGoldCapitalTax
    };
  }, [inputs]);

  // Recommendation engine logic
  const recommendations = useMemo(() => {
    let title = "";
    let mainRoute = "";
    let reason = "";
    let tips = [];

    if (recVolume === 'small') {
      title = "절세 혜택 극대화형: ISA 계좌 최우선 활용";
      mainRoute = "국내 상장 미국 ETF 및 국내 ETF";
      reason = "투자 금액과 예상 수익이 비교적 소규모일 때는, ISA(개인종합자산관리계좌)를 개설하여 국내 상장 해외 ETF에 투자하는 것이 가장 유리합니다. 해외 직접 투자는 250만 원 공제가 있지만, 환전 수수료와 거래 비용을 감안하면 국내 상장 ETF를 ISA 계좌 내에서 매매하는 것이 3~4% 이상의 추가 수익률 효과를 냅니다.";
      tips = [
        "일반형 ISA는 최대 200만 원, 서민형은 400만 원까지 손익 통산 후 전액 비과세 혜택을 줍니다.",
        "비과세 한도를 초과한 분배금/매매차익은 9.9%로 분리과세되어 금융소득종합과세 걱정이 없습니다.",
        "단, ISA 계좌는 최소 3년 의무 가입 기간이 필요하므로 단기 인출 자금은 피하세요."
      ];
    } else if (recVolume === 'medium') {
      if (recTarget === 'capital') {
        title = "해외 직접 투자(직구)와 연금계좌 분산 전략";
        mainRoute = "미국 직상장 ETF/주식 + 국내상장 연금계좌";
        reason = "매매차익 위주로 투자하고 연 250만 원을 초과하는 중규모 수익이 예상되는 경우, 해외 직접 투자와 절세 연금 계좌를 분산하는 것이 최선입니다. 직접 투자는 연 250만 원 비과세 공제를 100% 채우고, 초과하는 자산은 연금저축/IRP를 통해 국내 상장 미국 ETF를 매매하면 세금을 미래로 미루는 '과세이연 효과'를 누릴 수 있습니다.";
        tips = [
          "매년 해외주식을 매도하여 연간 250만 원의 양도소득세 기본공제 혜택을 반드시 챙기세요 (확정수익 실현).",
          "연금저축/IRP 계좌는 매매차익에 대해 즉시 세금을 물지 않고, 먼 미래 만 55세 이후 연금 수령 시 저율(3.3%~5.5%)로 과세됩니다.",
          "연금 계좌는 세액공제 한도(최대 900만 원)까지 우선 납입 후 초과분을 활용하면 자금 묶임 현상을 방지할 수 있습니다."
        ];
      } else {
        title = "ISA 계좌 + 국내 상장 배당 ETF 집중 전략";
        mainRoute = "국내 상장 미국 배당 ETF (ISA 활용)";
        reason = "주기적인 배당 및 분배금 획득이 핵심 목표인 경우, 직접 배당을 받을 때 발생하는 15.4%의 세금이 부담됩니다. 국내 상장 배당형 ETF를 대정비된 2026년형 ISA 계좌에서 운용할 경우, 연간 발생하는 배당소득세를 획기적으로 줄이며 종합과세 기준액인 2천만 원 계산을 원천 차단할 수 있습니다.";
        tips = [
          "ISA 계좌에서 나오는 금융소득은 2천만 원 종합과세 한도에 합산되지 않고 계좌 내에서 분리 과세됩니다.",
          "미국 직투 고배당주의 경우 현지에서 15%를 떼어 가기 때문에 비과세 적용이 불가하지만, ISA에서는 원천징수 자체를 보전해 재투자하는 복리 효과가 생깁니다.",
          "국내 주식형 고배당주나 ETF의 경우도 ISA 내에서 손익통산을 거쳐 세금을 최대로 아낄 수 있습니다."
        ];
      }
    } else { // 대규모 투자 (> 50M)
      title = "금융소득종합과세 회피를 위한 양도소득세(분류과세)형 직구 올인";
      mainRoute = "미국 직상장 주식 및 해외 ETF 직접 투자";
      reason = "투자 규모가 매우 크고 매년 수천만 원 이상의 큰 매매 차익이 기대되는 고자산가라면, 국내 상장 해외 ETF 투자는 독이 될 수 있습니다. 국내 상장의 경우 매매차익이 '배당소득'으로 잡혀 금융소득종합과세(최대 49.5% 세율)에 합산되지만, 해외 직접 투자는 아무리 수익이 커도 22% 단일 양도소득세율로 분류과세되어 종결되기 때문입니다.";
      tips = [
        "수익이 2,000만 원을 초과할 조짐이 보이면 국내상장 미국 ETF 비중을 낮추고 미국 직투로 전환하십시오.",
        "해외 주식 간에는 양도 손익이 통산(합산)되므로, 연말에 평가손실 중인 종목을 매도했다가 재매수하여 과세 표준을 낮추는 연말 포트폴리오 리밸런싱을 시행하십시오.",
        "증여세 면제 한도(배우자 10년간 6억 원)를 활용해 배우자에게 주식을 양도한 뒤 매도하면, 양도 당시 가격으로 취득가액이 재산정되어 양도세를 합법적으로 완전히 회피할 수 있습니다."
      ];
    }

    return { title, mainRoute, reason, tips };
  }, [recTarget, recVolume, recIasHolder]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased p-4 md:p-8">
      {/* HEADER SECTION */}
      <div className="max-w-6xl mx-auto mb-8 text-center md:text-left md:flex md:items-center md:justify-between border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-indigo-950 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-indigo-900">
            <span>2026년 최신 세법 기준 (금투세 폐지 확정 반영)</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
            금융상품별 세금 마스터 가이드
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-400 max-w-2xl">
            국내/해외 주식, 다양한 ETF, 그리고 안전자산인 금현물까지! 세금 차이를 한눈에 직관적으로 비교하고 절세 시뮬레이션을 통해 숨어있는 내 돈을 지키세요.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2 justify-center">
          <div className="bg-slate-800 px-4 py-3 rounded-xl border border-slate-700 text-center shadow-lg">
            <span className="block text-xs text-slate-400">금융소득종합과세 기준</span>
            <span className="text-lg font-bold text-emerald-400">연 2,000만 원</span>
          </div>
          <div className="bg-slate-800 px-4 py-3 rounded-xl border border-slate-700 text-center shadow-lg">
            <span className="block text-xs text-slate-400">해외주식 기본공제</span>
            <span className="text-lg font-bold text-indigo-400">연 250만 원</span>
          </div>
        </div>
      </div>

      {/* CORE NAVIGATION */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto space-x-1">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === 'matrix' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ScaleIcon />
            <span>상품별 세금 비교표</span>
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === 'calculator' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <CalcIcon />
            <span>세금 시뮬레이터</span>
          </button>
          <button
            onClick={() => setActiveTab('recommender')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === 'recommender' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <CoinsIcon />
            <span>맞춤형 절세 추천</span>
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === 'tips' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <HelpIcon />
            <span>절세 꿀팁 모음</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: COMPARISON MATRIX */}
      {activeTab === 'matrix' && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            {/* Mobile Cards (Visible on Small screens) */}
            <div className="block lg:hidden divide-y divide-slate-800">
              <div className="p-4 bg-slate-950 font-bold text-lg text-white">투자 상품별 세제 정리 (모바일 요약)</div>
              
              {/* Card 1 */}
              <div className="p-5 space-y-3 bg-slate-900/50">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-emerald-400">국내 주식</span>
                  <span className="bg-emerald-950 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-medium">거래세 0.20%</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-400">매매차익:</span> <span className="text-white font-semibold">비과세</span> (소액주주)</div>
                  <div><span className="text-slate-400">배당소득:</span> <span className="text-white">15.4% 원천징수</span></div>
                  <div><span className="text-slate-400">손실상계:</span> <span className="text-red-400">불가능</span></div>
                  <div><span className="text-slate-400">종합과세:</span> <span className="text-amber-400">배당만 합산</span> (2천만 초과 시)</div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-5 space-y-3 bg-slate-900/50">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-indigo-400">해외 주식 (미국 직구)</span>
                  <span className="bg-indigo-950 text-indigo-300 text-xs px-2.5 py-0.5 rounded-full font-medium">기본공제 250만 원</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-400">매매차익:</span> <span className="text-white font-semibold">양도세 22%</span> (분류)</div>
                  <div><span className="text-slate-400">배당소득:</span> <span className="text-white">15% 현지징수</span></div>
                  <div><span className="text-slate-400">손실상계:</span> <span className="text-emerald-400 font-semibold">가능 (해외끼리)</span></div>
                  <div><span className="text-slate-400">종합과세:</span> <span className="text-emerald-400 font-semibold">차익 제외 (분류과세)</span></div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-5 space-y-3 bg-slate-900/50">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-purple-400">해외 상장 ETF (e.g. SPY, QQQ)</span>
                  <span className="bg-purple-950 text-purple-300 text-xs px-2.5 py-0.5 rounded-full font-medium">직구와 동일 세제</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-400">매매차익:</span> <span className="text-white font-semibold">양도세 22%</span> (분류)</div>
                  <div><span className="text-slate-400">분배금:</span> <span className="text-white">15.4% 원천징수</span></div>
                  <div><span className="text-slate-400">손실상계:</span> <span className="text-emerald-400 font-semibold">가능 (해외끼리)</span></div>
                  <div><span className="text-slate-400">종합과세:</span> <span className="text-emerald-400 font-semibold">차익 제외 (분류과세)</span></div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="p-5 space-y-3 bg-slate-900/50">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-pink-400">국내상장 해외(미국) ETF</span>
                  <span className="bg-pink-950 text-pink-300 text-xs px-2.5 py-0.5 rounded-full font-medium">연금/ISA 권장</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-400">매매차익:</span> <span className="text-pink-300 font-semibold">배당소득 15.4%</span></div>
                  <div><span className="text-slate-400">분배금:</span> <span className="text-white">15.4% 과세</span></div>
                  <div><span className="text-slate-400">손실상계:</span> <span className="text-red-400">불가능</span></div>
                  <div><span className="text-slate-400">종합과세:</span> <span className="text-red-400 font-semibold">차익까지 전액 합산</span></div>
                </div>
              </div>

              {/* Card 5 */}
              <div className="p-5 space-y-3 bg-slate-900/50">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-amber-400">국내 주식형 ETF</span>
                  <span className="bg-amber-950 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-medium">거래세 없음</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-400">매매차익:</span> <span className="text-white font-semibold">비과세</span></div>
                  <div><span className="text-slate-400">분배금:</span> <span className="text-white">15.4% 과세</span></div>
                  <div><span className="text-slate-400">손실상계:</span> <span className="text-red-400">불가능</span></div>
                  <div><span className="text-slate-400">종합과세:</span> <span className="text-amber-400">분배금만 합산</span></div>
                </div>
              </div>

              {/* Card 6 */}
              <div className="p-5 space-y-3 bg-slate-900/50">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-yellow-500">KRX 금현물 계좌</span>
                  <span className="bg-yellow-950 text-yellow-400 text-xs px-2.5 py-0.5 rounded-full font-medium">비과세 끝판왕</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-400">매매차익:</span> <span className="text-emerald-400 font-semibold">전액 비과세</span></div>
                  <div><span className="text-slate-400">수수료:</span> <span className="text-white">약 0.3% 수준</span></div>
                  <div><span className="text-slate-400">인출 시:</span> <span className="text-white">부가세 10% (실물만)</span></div>
                  <div><span className="text-slate-400">종합과세:</span> <span className="text-emerald-400 font-semibold">대상 제외</span></div>
                </div>
              </div>
            </div>

            {/* Desktop Table (Visible on Large screens) */}
            <table className="hidden lg:table w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-300 uppercase text-xs tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6 font-semibold">투자 상품</th>
                  <th className="py-4 px-4 font-semibold text-center">매매 차익 과세</th>
                  <th className="py-4 px-4 font-semibold text-center">배당 / 분배금 과세</th>
                  <th className="py-4 px-4 font-semibold text-center">기본 공제 한도</th>
                  <th className="py-4 px-4 font-semibold text-center">손실 상계 (통산)</th>
                  <th className="py-4 px-4 font-semibold text-center">금융소득 종합과세</th>
                  <th className="py-4 px-4 font-semibold text-center">증권 거래세</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr className="hover:bg-slate-800/40 transition">
                  <td className="py-5 px-6 font-bold text-white">국내 주식</td>
                  <td className="py-5 px-4 text-center">
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-xs font-semibold px-2 py-1 rounded">비과세</span>
                    <span className="block text-[11px] text-slate-500 mt-1">소액주주 기준</span>
                  </td>
                  <td className="py-5 px-4 text-center font-semibold text-slate-300">15.4% <span className="text-xs font-normal text-slate-400">(지방세 포함)</span></td>
                  <td className="py-5 px-4 text-center text-slate-400">-</td>
                  <td className="py-5 px-4 text-center text-red-400 font-medium">불가</td>
                  <td className="py-5 px-4 text-center text-slate-300">
                    <span className="text-amber-500 font-medium">배당만 합산</span>
                    <span className="block text-[11px] text-slate-500">연 2,000만원 초과 시</span>
                  </td>
                  <td className="py-5 px-4 text-center text-slate-300 font-semibold">0.20% <span className="block text-[11px] text-slate-500">코스피/코스닥</span></td>
                </tr>

                <tr className="hover:bg-slate-800/40 transition">
                  <td className="py-5 px-6 font-bold text-white">해외 주식 <span className="block text-xs text-slate-400 font-normal">미국 직접 매매</span></td>
                  <td className="py-5 px-4 text-center">
                    <span className="bg-indigo-950 text-indigo-400 border border-indigo-900 text-xs font-semibold px-2 py-1 rounded">양도소득세 22%</span>
                    <span className="block text-[11px] text-slate-500 mt-1">분류과세 (단일세율)</span>
                  </td>
                  <td className="py-5 px-4 text-center font-semibold text-slate-300">15% <span className="block text-[11px] text-slate-500 mt-1">미국 현지 원천징수</span></td>
                  <td className="py-5 px-4 text-center text-emerald-400 font-semibold">연 250만 원 <span className="block text-[11px] text-slate-500 font-normal">해외 ETF와 합산</span></td>
                  <td className="py-5 px-4 text-center text-emerald-400 font-semibold">가능 <span className="block text-[11px] text-slate-500 font-normal">연도 내 손익 합산</span></td>
                  <td className="py-5 px-4 text-center text-emerald-400 font-semibold">제외 <span className="block text-[11px] text-slate-500 font-normal">매매차익은 완전 제외</span></td>
                  <td className="py-5 px-4 text-center text-slate-400">없음 <span className="block text-[11px] text-slate-500">SEC fee 미미</span></td>
                </tr>

                <tr className="hover:bg-slate-800/40 transition">
                  <td className="py-5 px-6 font-bold text-white">해외 상장 ETF <span className="block text-xs text-slate-400 font-normal">SPY, QQQ 등</span></td>
                  <td className="py-5 px-4 text-center">
                    <span className="bg-indigo-950 text-indigo-400 border border-indigo-900 text-xs font-semibold px-2 py-1 rounded">양도소득세 22%</span>
                    <span className="block text-[11px] text-slate-500 mt-1">해외 주식과 통합 과세</span>
                  </td>
                  <td className="py-5 px-4 text-center font-semibold text-slate-300">15.4% <span className="block text-[11px] text-slate-500 mt-1">종합과세 대상 포함</span></td>
                  <td className="py-5 px-4 text-center text-emerald-400 font-semibold">연 250만 원 <span className="block text-[11px] text-slate-500 font-normal">해외 주식과 합산</span></td>
                  <td className="py-5 px-4 text-center text-emerald-400 font-semibold">가능 <span className="block text-[11px] text-slate-500 font-normal">해외 주식과 손익통산</span></td>
                  <td className="py-5 px-4 text-center text-emerald-400 font-semibold">제외 <span className="block text-[11px] text-slate-500 font-normal">매매차익은 합산 안 됨</span></td>
                  <td className="py-5 px-4 text-center text-slate-400">없음</td>
                </tr>

                <tr className="hover:bg-slate-800/40 transition bg-indigo-950/10">
                  <td className="py-5 px-6 font-bold text-white">
                    국내상장 미국 ETF
                    <span className="block text-xs text-indigo-400 font-normal">e.g. KODEX 미국 S&P500</span>
                  </td>
                  <td className="py-5 px-4 text-center">
                    <span className="bg-pink-950 text-pink-400 border border-pink-900 text-xs font-semibold px-2 py-1 rounded">배당소득세 15.4%</span>
                    <span className="block text-[11px] text-rose-300 mt-1">매 차익마다 원천징수</span>
                  </td>
                  <td className="py-5 px-4 text-center font-semibold text-slate-300">15.4%</td>
                  <td className="py-5 px-4 text-center text-red-400">없음</td>
                  <td className="py-5 px-4 text-center text-red-400">불가 <span className="block text-[11px] text-slate-500 font-normal">개별 종목별로 과세</span></td>
                  <td className="py-5 px-4 text-center">
                    <span className="text-red-400 font-semibold">차익 + 분배금 전액 합산</span>
                    <span className="block text-[11px] text-rose-300">2천만 원 초과 시 주의!</span>
                  </td>
                  <td className="py-5 px-4 text-center text-emerald-400 font-semibold">없음</td>
                </tr>

                <tr className="hover:bg-slate-800/40 transition">
                  <td className="py-5 px-6 font-bold text-white">국내 주식형 ETF <span className="block text-xs text-slate-400 font-normal">KODEX 200 등</span></td>
                  <td className="py-5 px-4 text-center">
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 text-xs font-semibold px-2 py-1 rounded">비과세</span>
                    <span className="block text-[11px] text-slate-500 mt-1">국내 지수 추종에 한정</span>
                  </td>
                  <td className="py-5 px-4 text-center font-semibold text-slate-300">15.4%</td>
                  <td className="py-5 px-4 text-center text-slate-400">-</td>
                  <td className="py-5 px-4 text-center text-red-400">불가</td>
                  <td className="py-5 px-4 text-center text-slate-300">
                    <span className="text-amber-500 font-medium">분배금만 합산</span>
                    <span className="block text-[11px] text-slate-500">2천만 원 기준 계산</span>
                  </td>
                  <td className="py-5 px-4 text-center text-emerald-400 font-semibold">없음</td>
                </tr>

                <tr className="hover:bg-slate-800/40 transition">
                  <td className="py-5 px-6 font-bold text-white">KRX 금현물 계좌 <span className="block text-xs text-slate-400 font-normal">증권사 전용 계좌 개설</span></td>
                  <td className="py-5 px-4 text-center">
                    <span className="bg-yellow-950 text-yellow-400 border border-yellow-900 text-xs font-semibold px-2 py-1 rounded">비과세</span>
                    <span className="block text-[11px] text-slate-500 mt-1">부가세는 실물 인출 시만</span>
                  </td>
                  <td className="py-5 px-4 text-center text-slate-400">배당 없음</td>
                  <td className="py-5 px-4 text-center text-slate-400">-</td>
                  <td className="py-5 px-4 text-center text-slate-400">-</td>
                  <td className="py-5 px-4 text-center text-emerald-400 font-semibold">완전 제외</td>
                  <td className="py-5 px-4 text-center text-slate-300">수수료만 발생 <span className="block text-[11px] text-slate-500">온라인 거래 시 약 0.3%</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* CRITICAL TAKEAWAY */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-white font-bold text-lg mb-3 flex items-center">
              <span className="bg-indigo-900 text-indigo-400 p-1.5 rounded-lg mr-2">💡</span>
              핵심 세무 인사이트: 왜 직구와 국내 상장을 비교해야 할까?
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-300 leading-relaxed">
              <div>
                <p className="font-semibold text-white mb-1">1. 금융소득종합과세라는 '덫'</p>
                국내 상장 해외 ETF(예: 미국 S&P500)는 투자 수익이 <span className="text-pink-400 font-bold">배당소득</span>으로 잡히므로, 수익이 연 2,000만 원을 초과하면 근로소득 등 다른 소득과 합쳐져 높은 누진세율(최대 49.5%)을 감당해야 합니다. 반면 미국 직구 주식은 <span className="text-indigo-400 font-bold">양도소득세</span>로 분류되어 아무리 많이 벌어도 22% 단일 세율로 세무 의무가 끝나 절대적으로 유리해집니다.
              </div>
              <div>
                <p className="font-semibold text-white mb-1">2. 기본 공제와 손실 통산 활용</p>
                해외 주식과 해외 ETF는 연간 매도한 총이익과 총손실을 합산(<span className="text-emerald-400">손실통산</span>)한 순이익에서 250만 원을 먼저 공제해 줍니다. 반면 국내 상장 ETF는 여러 종목 중 하나가 마이너스여도, 플러스가 난 종목에 대해서는 손익통산 없이 무조건 15.4%를 징수하므로 일반 계좌에서의 세제 비효율성이 매우 큽니다.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: TAX CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Inputs Column (2/3 size) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-lg font-extrabold text-white mb-4 pb-2 border-b border-slate-800 flex justify-between items-center">
                <span>예상 연간 실현 손익 입력</span>
                <span className="text-xs text-slate-400 font-normal">(단위: 만 원 / 세전 실현수익 기준)</span>
              </h3>

              {/* Input Group: Domestic Stocks */}
              <div className="space-y-4 mb-6">
                <h4 className="text-emerald-400 font-semibold text-sm">1. 국내 주식 및 국내 ETF</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">국내 개별주식 매매차익</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputs.domStockGain}
                        onChange={(e) => handleInputChange('domStockGain', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-500">만 원</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">국내 주식 배당금 수령액</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputs.domStockDiv}
                        onChange={(e) => handleInputChange('domStockDiv', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-500">만 원</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">국내 주식형 ETF 매매차익 (KODEX 200 등)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputs.domStockEtfGain}
                        onChange={(e) => handleInputChange('domStockEtfGain', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-500">만 원</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">국내 일반 ETF 분배금</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputs.domStockEtfDiv}
                        onChange={(e) => handleInputChange('domStockEtfDiv', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-500">만 원</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Group: Overseas Direct Investing */}
              <div className="space-y-4 mb-6 border-t border-slate-900 pt-4">
                <h4 className="text-indigo-400 font-semibold text-sm">2. 해외 직접 투자 (미국 상장 주식 & ETF)</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">해외주식/ETF 매매이익 <span className="text-[10px] text-emerald-400">(+)</span></label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputs.overseasStockGain}
                        onChange={(e) => handleInputChange('overseasStockGain', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-500">만 원</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">해외주식/ETF 매매손실 <span className="text-[10px] text-red-400">(-)</span></label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputs.overseasStockLoss}
                        onChange={(e) => handleInputChange('overseasStockLoss', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-500">만 원</span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">해외주식/ETF 연간 배당금 수령액</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputs.overseasStockDiv}
                        onChange={(e) => handleInputChange('overseasStockDiv', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-500">만 원</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Group: Domestic-Listed Foreign ETFs */}
              <div className="space-y-4 mb-6 border-t border-slate-900 pt-4">
                <h4 className="text-pink-400 font-semibold text-sm">3. 국내 상장 해외(미국) ETF & 기타 ETF</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">국내 상장 해외 ETF 매매차익</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputs.domListedUsEtfGain}
                        onChange={(e) => handleInputChange('domListedUsEtfGain', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-500">만 원</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">국내 상장 해외 ETF 분배금</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputs.domListedUsEtfDiv}
                        onChange={(e) => handleInputChange('domListedUsEtfDiv', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-500">만 원</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">국내 기타 ETF 매매차익 (채권, 금선물 등)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputs.domOtherEtfGain}
                        onChange={(e) => handleInputChange('domOtherEtfGain', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-500">만 원</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">국내 기타 ETF 분배금</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputs.domOtherEtfDiv}
                        onChange={(e) => handleInputChange('domOtherEtfDiv', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-500">만 원</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Group: KRX Gold */}
              <div className="space-y-4 border-t border-slate-900 pt-4">
                <h4 className="text-yellow-400 font-semibold text-sm">4. KRX 금현물 시장</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">금현물 계좌 매매차익</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputs.krxGoldGain}
                        onChange={(e) => handleInputChange('krxGoldGain', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-3 top-2 text-xs text-slate-500">만 원</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Results Summary Column (1/3 size) */}
          <div className="space-y-6">
            {/* Total Tax Display */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-950 p-6 rounded-2xl border border-indigo-500/30 shadow-xl text-center">
              <h3 className="text-slate-300 font-bold text-sm uppercase tracking-wider mb-2">예상 총 세금 부담액</h3>
              <div className="text-3xl md:text-4xl font-black text-white my-3">
                {formatKRW(calculations.grandTotalTax)}
              </div>
              <p className="text-xs text-indigo-200">
                수익 발생 시 원천징수 및 자진신고 세금을 포함한 시뮬레이션입니다.
              </p>
            </div>

            {/* Financial Income Warning */}
            <div className={`p-5 rounded-2xl border ${
              calculations.isComprehensiveTaxable 
                ? 'bg-rose-950/40 border-rose-800 text-rose-200' 
                : 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
            }`}>
              <div className="flex items-start">
                <span className="text-lg mr-2">{calculations.isComprehensiveTaxable ? '⚠️' : '✅'}</span>
                <div>
                  <h4 className="font-bold text-sm text-white">금융소득 종합과세 점검</h4>
                  <p className="text-xs mt-1 leading-relaxed">
                    대상 금융소득 합산액: <span className="font-bold underline">{formatKRW(calculations.totalFinancialIncome)}</span>
                  </p>
                  <p className="text-[11px] mt-2 text-slate-300">
                    {calculations.isComprehensiveTaxable 
                      ? '비상! 기준액인 연 2,000만 원을 초과했습니다. 다른 종합 소득(근로, 사업 등)과 합산 과세되므로 세율 구간이 대폭 올라갈 수 있어 연금/ISA 계좌나 해외 직투로의 자금 재배치가 강력하게 요구됩니다.' 
                      : '안전합니다! 2,000만 원 미만이므로 15.4% 원천징수로 깨끗하게 납세 의무가 종결됩니다.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Visual Breakdown */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-white font-bold text-sm border-b border-slate-800 pb-2">세무 주체별 부과금 정보</h4>
              
              <div className="space-y-3 text-xs">
                {/* Domestic Stock */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">국내 주식 (배당만)</span>
                  <div className="text-right">
                    <span className="text-slate-200 font-medium">{formatKRW(calculations.domStock.total)}</span>
                    <span className="block text-[10px] text-slate-500">실효세율 1.3% (배당 15.4%)</span>
                  </div>
                </div>

                {/* Overseas Stock */}
                <div className="flex justify-between items-center border-t border-slate-900 pt-2">
                  <div>
                    <span className="text-slate-400">해외 주식/ETF</span>
                    {inputs.overseasStockLoss > 0 && (
                      <span className="block text-[10px] text-emerald-400">손실 상계 {formatKRW(inputs.overseasStockLoss)} 적용됨</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-slate-200 font-medium">{formatKRW(calculations.overseasStock.total)}</span>
                    <span className="block text-[10px] text-slate-500">
                      양도세: {formatKRW(calculations.overseasStock.capitalTax)} / 배당세: {formatKRW(calculations.overseasStock.divTax)}
                    </span>
                  </div>
                </div>

                {/* Dom-Listed US ETF */}
                <div className="flex justify-between items-center border-t border-slate-900 pt-2">
                  <span className="text-slate-400">국내상장 미국 ETF</span>
                  <div className="text-right">
                    <span className="text-rose-300 font-semibold">{formatKRW(calculations.domListedUsEtf.total)}</span>
                    <span className="block text-[10px] text-slate-500">매매차익 15.4% + 분배금 15.4%</span>
                  </div>
                </div>

                {/* Dom ETF */}
                <div className="flex justify-between items-center border-t border-slate-900 pt-2">
                  <span className="text-slate-400">국내 주식형 ETF</span>
                  <div className="text-right">
                    <span className="text-slate-200 font-medium">{formatKRW(calculations.domStockEtf.total)}</span>
                    <span className="block text-[10px] text-slate-500">차익 비과세 / 분배금 15.4%</span>
                  </div>
                </div>

                {/* Dom Other ETF */}
                <div className="flex justify-between items-center border-t border-slate-900 pt-2">
                  <span className="text-slate-400">국내 기타 ETF (채권 등)</span>
                  <div className="text-right">
                    <span className="text-slate-200 font-medium">{formatKRW(calculations.domOtherEtf.total)}</span>
                    <span className="block text-[10px] text-slate-500">차익 15.4% + 분배금 15.4%</span>
                  </div>
                </div>

                {/* KRX Gold */}
                <div className="flex justify-between items-center border-t border-slate-900 pt-2">
                  <span className="text-slate-400">KRX 금현물 계좌</span>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold">비과세 (0원)</span>
                    <span className="block text-[10px] text-slate-500">수수료 외 일절 세금 없음</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: PERSONAL RECOMMENDATIONS */}
      {activeTab === 'recommender' && (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-lg font-extrabold text-white mb-6 text-center">
              나에게 꼭 맞는 세금 절약 투자 가이드 진단기
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Question 1 */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  1. 핵심 목표 수익 유형
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setRecTarget('capital')}
                    className={`p-3 rounded-xl border text-left text-xs transition ${
                      recTarget === 'capital' 
                        ? 'border-indigo-500 bg-indigo-950/40 text-white' 
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <span className="block font-bold mb-1 text-sm text-white">매매차익 추구</span>
                    싸게 사서 비싸게 파는 성장주, 자본이득 타겟
                  </button>
                  <button
                    onClick={() => setRecTarget('dividend')}
                    className={`p-3 rounded-xl border text-left text-xs transition ${
                      recTarget === 'dividend' 
                        ? 'border-indigo-500 bg-indigo-950/40 text-white' 
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <span className="block font-bold mb-1 text-sm text-white">배당 및 분배금 추구</span>
                    안정적인 고배당, 현금흐름 창출 타겟
                  </button>
                  <button
                    onClick={() => setRecTarget('both')}
                    className={`p-3 rounded-xl border text-left text-xs transition ${
                      recTarget === 'both' 
                        ? 'border-indigo-500 bg-indigo-950/40 text-white' 
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <span className="block font-bold mb-1 text-sm text-white font-medium">하이브리드형</span>
                    차익과 배당을 균형 있게 모두 추구
                  </button>
                </div>
              </div>

              {/* Question 2 */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  2. 연간 예상 투자 수익금
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setRecVolume('small')}
                    className={`p-3 rounded-xl border text-left text-xs transition ${
                      recVolume === 'small' 
                        ? 'border-indigo-500 bg-indigo-950/40 text-white' 
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <span className="block font-bold mb-1 text-sm text-white">연 1,000만 원 미만</span>
                    소규모 재테크 및 적립식 초보 투자자
                  </button>
                  <button
                    onClick={() => setRecVolume('medium')}
                    className={`p-3 rounded-xl border text-left text-xs transition ${
                      recVolume === 'medium' 
                        ? 'border-indigo-500 bg-indigo-950/40 text-white' 
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <span className="block font-bold mb-1 text-sm text-white">연 1,000만~5,000만 원</span>
                    적극적 자산 증식을 노리는 전문 개인 투자자
                  </button>
                  <button
                    onClick={() => setRecVolume('large')}
                    className={`p-3 rounded-xl border text-left text-xs transition ${
                      recVolume === 'large' 
                        ? 'border-indigo-500 bg-indigo-950/40 text-white' 
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <span className="block font-bold mb-1 text-sm text-white">연 5,000만 원 초과</span>
                    고자산가, 종합과세를 선제 회피해야 하는 고수
                  </button>
                </div>
              </div>

              {/* Question 3 */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  3. 절세 만능통장(ISA) 보유 현황
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setRecIsaHolder('yes')}
                    className={`p-3 rounded-xl border text-left text-xs transition ${
                      recIasHolder === 'yes' 
                        ? 'border-indigo-500 bg-indigo-950/40 text-white' 
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <span className="block font-bold mb-1 text-sm text-white">이미 보유 중이거나 개설 예정</span>
                    절세 혜택을 다각도로 활용할 준비가 됨
                  </button>
                  <button
                    onClick={() => setRecIsaHolder('no')}
                    className={`p-3 rounded-xl border text-left text-xs transition ${
                      recIasHolder === 'no' 
                        ? 'border-indigo-500 bg-indigo-950/40 text-white' 
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                  >
                    <span className="block font-bold mb-1 text-sm text-white">없음 (일반 증권계좌 위주)</span>
                    단기 출금에 유연해야 하거나 복잡함 기피
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Diagnosis Result Card */}
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
            
            <span className="bg-indigo-950 text-indigo-400 text-xs px-3 py-1 rounded-full font-bold border border-indigo-900">
              절세 전략 매칭 진단결과
            </span>
            
            <h4 className="text-xl md:text-2xl font-black text-white mt-3">
              {recommendations.title}
            </h4>
            
            <div className="mt-4 flex items-center space-x-2 text-sm text-slate-300">
              <span className="text-slate-400">추천 타겟 포트폴리오:</span>
              <span className="text-indigo-300 font-extrabold underline">{recommendations.mainRoute}</span>
            </div>

            <p className="mt-4 text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {recommendations.reason}
            </p>

            <div className="mt-6 space-y-3">
              <h5 className="text-white font-bold text-sm">실행해야 하는 세무 액션플랜 📌</h5>
              <ul className="space-y-2">
                {recommendations.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start text-xs text-slate-400 leading-relaxed">
                    <span className="text-indigo-400 mr-2 font-bold">({idx + 1})</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: TAX SAVING MASTER TIPS */}
      {activeTab === 'tips' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tip 1 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2 text-indigo-400 mb-3">
                <span className="text-xl">🛡️</span>
                <h4 className="font-bold text-white text-base">ISA 계좌와 연금 계좌의 강력한 콜라보</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                국내상장 해외(미국) ETF는 일반 계좌에서 매수하면 무조건 손해입니다. 
                <span className="font-bold text-white">연금 저축펀드</span>를 통해 거래 시 매매차익에 과세되는 15.4%를 전부 면제하고 먼 미래 연금 수령 시점(3.3%~5.5%)으로 미루는 극단적 절세 효과가 발휘됩니다. 
                매년 연금 한도를 채우고 단기 유동성이 필요하다면 <span className="font-bold text-white">ISA 계좌</span>의 비과세 한도와 무제한 9.9% 분리과세 혜택을 융합하는 것이 똑똑한 포트폴리오 관리법입니다.
              </p>
            </div>

            {/* Tip 2 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2 text-indigo-400 mb-3">
                <span className="text-xl">⚖️</span>
                <h4 className="font-bold text-white text-base">해외주식 '연말 평가 손절' 세금 절약 기술</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                해외 주식 및 해외 ETF는 1월 1일부터 12월 31일까지의 실현된 이익과 손실을 통산하여 다음 해 5월 양도세를 징수합니다. 만약 올해 우량주에서 큰 차익(예: 1,000만 원)이 실현되었고, 다른 잡주에서 평가손실(-500만 원)을 기록 중이라면, <span className="font-bold text-emerald-400">연말에 손실 주식을 매도하여 손실을 실현한 뒤 즉시 재매수</span>하십시오. 실현 손익이 500만 원으로 줄어들어 양도세 부담이 거의 절반 수준으로 경감됩니다.
              </p>
            </div>

            {/* Tip 3 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2 text-indigo-400 mb-3">
                <span className="text-xl">🎁</span>
                <h4 className="font-bold text-white text-base">가족 간 배정 증여세 면제 활용</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                해외 주식 평가액이 너무 커 양도세가 크게 예상될 경우, 배우자(10년 6억 원 면제) 혹은 성인 자녀(10년 5천만 원 면제)에게 <span className="font-bold text-white">해당 주식을 실물로 사전 증여</span>하는 방안을 고려하세요. 증여를 받게 되면 증여 시점의 가치로 '취득 가액'이 업그레이드되므로, 증여받은 사람이 곧바로 주식을 매도해도 차익이 0에 가깝게 재계산되어 양도소득세가 사실상 제로화됩니다.
              </p>
            </div>

            {/* Tip 4 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2 text-indigo-400 mb-3">
                <span className="text-xl">✨</span>
                <h4 className="font-bold text-white text-base">숨겨진 비과세 주역: KRX 금현물</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                금 투자를 할 때 은행 골드뱅킹(매매차익 15.4% 과세)이나 금 ETF(배당소득 15.4% 과세)를 사용하는 것은 세금 면에서 최악의 수입니다. 증여세 부담 없이 금 투자를 하고 싶다면 <span className="font-bold text-yellow-400">KRX 금현물 전용 계좌</span>를 만드세요. 국내에서 유일하게 매매차익에 대해 양도세, 배당세 등 일절 세금을 매기지 않고 매매 차익이 종합소득에도 합산되지 않는 대한민국 최고의 숨겨진 비과세 피난처입니다.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 leading-relaxed text-center">
            ⚠️ 위 시뮬레이터와 설명 자료는 대한민국 현행 소득세법 및 조세 특례 기준(2026)을 참고하여 제작된 단순 교육용 모형입니다. 개인의 직업, 누진과세 구간 및 세법 개정 여부에 따라 실제 산정 세액과는 차이가 있을 수 있으므로 거액의 세무 처리 시 반드시 세무 전문 대리인과의 구체적 상담을 통해 결정하시기 바랍니다.
          </div>
        </div>
      )}
    </div>
  );
}