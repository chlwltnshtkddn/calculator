import { useState, useEffect, useCallback } from 'react';
import { evaluate } from 'mathjs';
import { Sun, Moon, RotateCcw, Calculator, TrendingUp, Info, ShieldCheck } from 'lucide-react';
import './App.css';

interface HistoryItem {
  expression: string;
  result: string;
}

type ViewMode = 'scientific' | 'compound' | 'privacy' | 'about';

function App() {
  const [view, setView] = useState<ViewMode>('scientific');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Scientific State
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Compound Interest State
  const [principal, setPrincipal] = useState('');
  const [days, setDays] = useState('');
  const [rate, setRate] = useState('');
  const [compoundResult, setCompoundResult] = useState({ total: '0', interest: '0', table: [] as any[] });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleScientificClick = useCallback((value: string) => {
    if (value === '=') {
      try {
        if (!expression) return;
        let balancedExpr = expression;
        const openBrackets = (balancedExpr.match(/\(/g) || []).length;
        const closeBrackets = (balancedExpr.match(/\)/g) || []).length;
        if (openBrackets > closeBrackets) balancedExpr += ')'.repeat(openBrackets - closeBrackets);
        const evalResult = evaluate(balancedExpr).toString();
        setResult(evalResult);
        setHistory(prev => [{ expression: balancedExpr, result: evalResult }, ...prev].slice(0, 5));
        setExpression(evalResult);
      } catch (error) { setResult('Error'); }
    } else if (value === 'C') {
      setExpression('');
      setResult('0');
    } else if (value === 'DEL') {
      setExpression(prev => prev.slice(0, -1));
    } else {
      setExpression(prev => prev + value);
    }
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }, [expression]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view !== 'scientific') return;
      const keys = ['0','1','2','3','4','5','6','7','8','9','+','-','*','/','.', '(', ')', '^', 'Enter', 'Backspace', 'Escape'];
      if (keys.includes(e.key)) e.preventDefault();
      if (e.key >= '0' && e.key <= '9') handleScientificClick(e.key);
      else if (['+', '-', '*', '/', '.', '(', ')', '^'].includes(e.key)) handleScientificClick(e.key);
      else if (e.key === 'Enter') handleScientificClick('=');
      else if (e.key === 'Backspace') handleScientificClick('DEL');
      else if (e.key === 'Escape') handleScientificClick('C');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleScientificClick, view]);

  const formatNumber = (num: string | number) => {
    const val = typeof num === 'string' ? num.replace(/,/g, '') : num.toString();
    if (!val || isNaN(Number(val))) return '';
    return Math.round(Number(val)).toLocaleString('ko-KR');
  };

  const handlePrincipalChange = (val: string) => {
    const cleanVal = val.replace(/,/g, '');
    if (/^\d*$/.test(cleanVal)) setPrincipal(cleanVal);
  };

  useEffect(() => {
    const P = Number(principal);
    const D = Number(days);
    const R = Number(rate) / 100;
    if (P > 0 && D > 0 && R !== 0) {
      let currentTotal = P;
      const tableData = [];
      for (let i = 1; i <= D; i++) {
        const interest = currentTotal * R;
        currentTotal += interest;
        if (i <= 365) tableData.push({ day: i, profit: Math.round(interest), total: Math.round(currentTotal) });
      }
      setCompoundResult({ total: formatNumber(currentTotal), interest: formatNumber(currentTotal - P), table: tableData });
    } else { setCompoundResult({ total: '0', interest: '0', table: [] }); }
  }, [principal, days, rate]);

  return (
    <div className="layout">
      <nav>
        <div className="nav-links">
          <button className={view === 'scientific' ? 'active' : ''} onClick={() => setView('scientific')}>
            <Calculator size={18} style={{marginRight: 6, verticalAlign: 'middle'}} />
            공학용
          </button>
          <button className={view === 'compound' ? 'active' : ''} onClick={() => setView('compound')}>
            <TrendingUp size={18} style={{marginRight: 6, verticalAlign: 'middle'}} />
            주식 복리
          </button>
        </div>
        <button className="theme-toggle" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </nav>

      <div className="container">
        {view === 'scientific' && (
          <div className="main-content">
            <div className="calculator">
              <div className="display">
                <div className="expression">{expression || '\u00A0'}</div>
                <div className="result">{result}</div>
              </div>
              <div className="buttons">
                {['sin(', 'cos(', 'tan(', 'log(', 'ln(', '(', ')', 'mod', 'pi', 'e', '7', '8', '9', '/', 'sqrt(', '4', '5', '6', '*', '^', '1', '2', '3', '-', 'abs(', '0', '.', 'DEL', '+', '!', 'C', 'exp(', '='].map((btn, i) => (
                  <button key={i} onClick={() => handleScientificClick(btn)} className={btn === '=' ? 'operator wide' : (['C','DEL'].includes(btn) ? 'operator' : '')} style={btn === '=' ? {gridColumn: 'span 3'} : {}}>
                    {btn === '(' ? '(' : btn.replace('(', '')}
                  </button>
                ))}
              </div>
            </div>
            <div className="info-section">
              <h3>전문 공학용 계산기 가이드</h3>
              <p>본 온라인 공학용 계산기는 복잡한 수학적 문제 해결을 위해 설계되었습니다. 일반적인 사칙연산부터 고급 삼각함수, 로그 연산까지 모든 기능을 무료로 이용할 수 있습니다.</p>
              <p>특히 키보드 입력을 완벽하게 지원하여 데스크톱 환경에서도 빠른 작업이 가능합니다. 엔터(Enter) 키로 결과를 확인하고, 백스페이스(Backspace)로 입력을 수정할 수 있습니다.</p>
              <h4>주요 기능 설명</h4>
              <ul>
                <li><strong>삼각함수</strong>: sin, cos, tan 등 공학 분야에서 필수적인 함수를 제공합니다.</li>
                <li><strong>로그 및 거듭제곱</strong>: log, ln 연산과 ^ 기호를 통한 거듭제곱 계산이 가능합니다.</li>
                <li><strong>수학 상수</strong>: 파이(pi)와 자연상수(e)가 내장되어 있어 정밀한 값을 얻을 수 있습니다.</li>
              </ul>
            </div>
          </div>
        )}

        {view === 'compound' && (
          <div className="main-content">
            <div className="calculator">
              <div className="compound-form">
                <h2 style={{marginTop: 0}}>주식 일복리 계산 시뮬레이터</h2>
                <div className="input-group">
                  <label>투자 원금 (원)</label>
                  <input type="text" value={formatNumber(principal)} onChange={(e) => handlePrincipalChange(e.target.value)} placeholder="예: 1,000,000" />
                </div>
                <div className="input-group">
                  <label>투자 기간 (일)</label>
                  <input type="number" value={days} onChange={(e) => setDays(e.target.value)} placeholder="예: 100" />
                </div>
                <div className="input-group">
                  <label>목표 일일 수익률 (%)</label>
                  <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="예: 1" />
                </div>
                <div className="display" style={{marginTop: 20}}>
                  <div className="expression">최종 예상 자산</div>
                  <div className="result">{compoundResult.total} 원</div>
                  <div className="expression" style={{marginTop: 10, color: 'var(--accent-color)'}}>총 수익: {compoundResult.interest} 원</div>
                </div>

                {compoundResult.table.length > 0 && (
                  <div className="result-table-container" style={{marginTop: 30, maxHeight: 400, overflowY: 'auto', border: '1px solid var(--button-bg)', borderRadius: 12}}>
                    <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'right'}}>
                      <thead style={{position: 'sticky', top: 0, backgroundColor: 'var(--calculator-bg)', borderBottom: '2px solid var(--accent-color)'}}>
                        <tr>
                          <th style={{padding: 12, textAlign: 'center'}}>일차</th>
                          <th style={{padding: 12}}>수익금</th>
                          <th style={{padding: 12}}>총액</th>
                        </tr>
                      </thead>
                      <tbody>
                        {compoundResult.table.map((row) => (
                          <tr key={row.day} style={{borderBottom: '1px solid var(--button-bg)'}}>
                            <td style={{padding: 10, textAlign: 'center', opacity: 0.7}}>{row.day}일차</td>
                            <td style={{padding: 10, color: '#e03131'}}>+{formatNumber(row.profit)}</td>
                            <td style={{padding: 10, fontWeight: 600}}>{formatNumber(row.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            <div className="info-section">
              <h3>복리의 마법과 주식 투자 전략</h3>
              <p>전설적인 물리학자 알베르트 아인슈타인은 복리를 '세계 8대 불가사의'라고 불렀습니다. 주식 투자에서 매일 일정한 수익률을 기록하는 것은 매우 어렵지만, 그 가능성을 확인하는 것은 투자 전략 수립에 큰 도움이 됩니다.</p>
              <p>본 계산기는 일일 복리(Daily Compounding)를 기준으로 하며, 투자 원금이 매일 설정한 수익률만큼 증가한다고 가정합니다. 이는 스캘핑(Scalping)이나 데이트레이딩을 하는 투자자들이 목표를 설정할 때 유용합니다.</p>
              <h4>투자 시 주의사항</h4>
              <p>실제 주식 시장에서는 거래 수수료, 세금(증권거래세), 슬리피지 등의 비용이 발생하며, 매일 수익을 내는 것은 현실적으로 불가능에 가깝습니다. 본 시뮬레이터는 수학적 모델을 통한 예측값임을 유의하시기 바랍니다.</p>
            </div>
          </div>
        )}

        {view === 'privacy' && (
          <div className="main-content legal-content">
            <h2>개인정보처리방침</h2>
            <p>본 사이트는 사용자의 어떠한 개인정보도 서버에 저장하거나 수집하지 않습니다. 모든 계산 로직은 사용자의 브라우저(Client-side)에서만 동작합니다.</p>
            <p>단, 구글 애드센스(Google AdSense) 광고 게재를 위해 쿠키가 사용될 수 있으며, 광고주는 사용자의 관심사에 기반한 광고를 제공하기 위해 정보를 수집할 수 있습니다. 사용자는 브라우저 설정에서 쿠키 수집을 거부할 수 있습니다.</p>
            <p><strong>시행일</strong>: 2026년 2월 12일</p>
          </div>
        )}

        {view === 'about' && (
          <div className="main-content legal-content">
            <h2>사이트 소개 (About Us)</h2>
            <p>프로 계산기 서비스는 전 세계 사용자들에게 정밀하고 빠른 계산 도구를 제공하기 위해 만들어졌습니다. 우리는 복잡한 수식을 누구나 쉽게 풀 수 있도록 인터페이스를 개선하고 있습니다.</p>
            <p>주요 목적은 교육 및 투자 시뮬레이션이며, 지속적인 업데이트를 통해 더 많은 계산 기능을 추가할 예정입니다. 문의 사항이 있으시면 chlwltnshtkddn@github.com으로 연락주시기 바랍니다.</p>
          </div>
        )}

        {(view === 'scientific' || view === 'compound') && view === 'scientific' && (
          <div className="history">
            <h3 style={{marginBottom: 15, display: 'flex', alignItems: 'center'}}>
              <RotateCcw size={18} style={{marginRight: 8}} /> 최근 기록
            </h3>
            {history.length === 0 ? <p style={{opacity:0.5}}>기록이 없습니다.</p> : history.map((item, i) => (
              <div key={i} className="history-item" onClick={() => {setExpression(item.expression); setResult(item.result);}}>
                <div style={{fontSize:'0.8rem', opacity:0.7}}>{item.expression} =</div>
                <div style={{fontWeight:'bold'}}>{item.result}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer>
        <div className="footer-links">
          <button onClick={() => setView('about')}><Info size={14} /> 소개</button>
          <button onClick={() => setView('privacy')}><ShieldCheck size={14} /> 개인정보처리방침</button>
          <button onClick={() => setView('scientific')}>홈으로</button>
        </div>
        <p>© 2026 Professional Calculator. All rights reserved.</p>
        <p style={{fontSize: '0.8rem', marginTop: 10}}>본 사이트에서 제공하는 계산 결과는 수학적 추정치이며, 실제 투자 결과에 대해 책임을 지지 않습니다.</p>
      </footer>
    </div>
  );
}

export default App;
