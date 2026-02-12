import { useState, useEffect, useCallback } from 'react';
import { evaluate } from 'mathjs';
import { Sun, Moon, RotateCcw, Calculator, TrendingUp } from 'lucide-react';
import './App.css';

interface HistoryItem {
  expression: string;
  result: string;
}

type ViewMode = 'scientific' | 'compound';

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
  const [compoundResult, setCompoundResult] = useState({ total: '0', interest: '0' });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Scientific Calculator Handlers
  const handleScientificClick = useCallback((value: string) => {
    if (value === '=') {
      try {
        if (!expression) return;
        let balancedExpr = expression;
        const openBrackets = (balancedExpr.match(/\(/g) || []).length;
        const closeBrackets = (balancedExpr.match(/\)/g) || []).length;
        if (openBrackets > closeBrackets) {
          balancedExpr += ')'.repeat(openBrackets - closeBrackets);
        }
        const evalResult = evaluate(balancedExpr).toString();
        setResult(evalResult);
        setHistory(prev => [{ expression: balancedExpr, result: evalResult }, ...prev].slice(0, 5));
        setExpression(evalResult);
      } catch (error) {
        setResult('Error');
      }
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

  // Compound Interest Logic
  const formatNumber = (num: string) => {
    const cleanNum = num.replace(/,/g, '');
    if (!cleanNum || isNaN(Number(cleanNum))) return '';
    return Number(cleanNum).toLocaleString('ko-KR');
  };

  const handlePrincipalChange = (val: string) => {
    const cleanVal = val.replace(/,/g, '');
    if (/^\d*$/.test(cleanVal)) setPrincipal(cleanVal);
  };

  useEffect(() => {
    const P = Number(principal);
    const D = Number(days);
    const R = Number(rate) / 100;
    if (P > 0 && D > 0 && R > 0) {
      // Daily Compounding Formula: A = P(1 + r/365)^t
      const total = P * Math.pow((1 + R / 365), D);
      setCompoundResult({
        total: Math.round(total).toLocaleString('ko-KR'),
        interest: Math.round(total - P).toLocaleString('ko-KR')
      });
    } else {
      setCompoundResult({ total: '0', interest: '0' });
    }
  }, [principal, days, rate]);

  return (
    <div className="layout">
      <nav>
        <div className="nav-links">
          <button className={view === 'scientific' ? 'active' : ''} onClick={() => setView('scientific')}>
            <Calculator size={18} style={{marginRight: 8, verticalAlign: 'middle'}} />
            공학용 계산기
          </button>
          <button className={view === 'compound' ? 'active' : ''} onClick={() => setView('compound')}>
            <TrendingUp size={18} style={{marginRight: 8, verticalAlign: 'middle'}} />
            복리 계산기
          </button>
        </div>
        <button className="theme-toggle" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </nav>

      <div className="container">
        <div className="main-content">
          {view === 'scientific' ? (
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
          ) : (
            <div className="calculator">
              <div className="compound-form">
                <h2 style={{marginTop: 0}}>일복리 계산기</h2>
                <div className="input-group">
                  <label>투자 원금 (원)</label>
                  <input type="text" value={formatNumber(principal)} onChange={(e) => handlePrincipalChange(e.target.value)} placeholder="예: 1,000,000" />
                </div>
                <div className="input-group">
                  <label>투자 기간 (일)</label>
                  <input type="number" value={days} onChange={(e) => setDays(e.target.value)} placeholder="예: 365" />
                </div>
                <div className="input-group">
                  <label>연이율 (%)</label>
                  <input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="예: 5" />
                </div>
                <div className="display" style={{marginTop: 20}}>
                  <div className="expression">최종 금액 (원금+이자)</div>
                  <div className="result">{compoundResult.total} 원</div>
                  <div className="expression" style={{marginTop: 10}}>총 이자: {compoundResult.interest} 원</div>
                </div>
              </div>
            </div>
          )}

          <div className="info-section">
            {view === 'scientific' ? (
              <>
                <h3>공학용 계산기 가이드</h3>
                <p>본 계산기는 삼각함수(sin, cos, tan), 로그(log, ln), 제곱근(sqrt) 등 복잡한 수학 연산을 지원합니다. 키보드 숫패드와 엔터키를 사용하여 더 빠르게 계산할 수 있습니다.</p>
                <ul>
                  <li><strong>mod</strong>: 나머지 연산 (예: 10 mod 3 = 1)</li>
                  <li><strong>^</strong>: 거듭제곱 (예: 2 ^ 3 = 8)</li>
                  <li><strong>pi / e</strong>: 수학 상수 파이와 자연상수</li>
                </ul>
              </>
            ) : (
              <>
                <h3>복리 계산기 사용법 및 원리</h3>
                <p>복리란 원금에 대해서만 이자가 붙는 단리와 달리, 발생한 이자가 다시 원금이 되어 이자가 붙는 방식입니다. '72의 법칙'에 따르면 자산이 두 배가 되는 시간은 (72 ÷ 연이율)로 계산할 수 있습니다.</p>
                <p>본 계산기는 <strong>일복리(Daily Compounding)</strong> 방식을 기준으로 계산하며, 공식은 다음과 같습니다: <code>A = P(1 + r/365)^t</code></p>
                <ul>
                  <li>원금에 1,000단위 쉼표가 자동으로 적용되어 금액 확인이 쉽습니다.</li>
                  <li>실시간으로 계산 결과가 업데이트되어 목표 금액 설정을 도와줍니다.</li>
                </ul>
              </>
            )}
          </div>
        </div>

        {view === 'scientific' && (
          <div className="history">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:15}}>
              <h3 style={{margin:0}}>최근 기록</h3>
              <RotateCcw size={18} onClick={() => setHistory([])} style={{cursor:'pointer', opacity:0.6}} />
            </div>
            {history.length === 0 ? (
              <p style={{opacity:0.5, fontSize:'0.9rem'}}>기록이 없습니다.</p>
            ) : (
              history.map((item, i) => (
                <div key={i} className="history-item" style={{padding:'10px 0', borderBottom:'1px solid var(--button-bg)', cursor:'pointer'}} onClick={() => {setExpression(item.expression); setResult(item.result);}}>
                  <div style={{fontSize:'0.8rem', opacity:0.7}}>{item.expression} =</div>
                  <div style={{fontWeight:'bold', fontSize:'1.1rem'}}>{item.result}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
