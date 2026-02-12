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
  const [compoundResult, setCompoundResult] = useState({ total: '0', interest: '0', table: [] as any[] });

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
      const maxRows = Math.min(D, 1000); // 성능을 위해 최대 1000일까지만 계산

      for (let i = 1; i <= D; i++) {
        const interest = currentTotal * R;
        currentTotal += interest;
        if (i <= maxRows) {
          tableData.push({
            day: i,
            profit: Math.round(interest),
            total: Math.round(currentTotal)
          });
        }
      }

      setCompoundResult({
        total: Math.round(currentTotal).toLocaleString('ko-KR'),
        interest: Math.round(currentTotal - P).toLocaleString('ko-KR'),
        table: tableData
      });
    } else {
      setCompoundResult({ total: '0', interest: '0', table: [] });
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
            주식 복리 계산기
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
                <h2 style={{marginTop: 0}}>주식 복리 시뮬레이터</h2>
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
                  <div className="expression" style={{marginTop: 10, color: 'var(--accent-color)'}}>누적 수익: {compoundResult.interest} 원</div>
                </div>

                {compoundResult.table.length > 0 && (
                  <div className="result-table-container" style={{marginTop: 30, maxHeight: 400, overflowY: 'auto', border: '1px solid var(--button-bg)', borderRadius: 12}}>
                    <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'right'}}>
                      <thead style={{position: 'sticky', top: 0, backgroundColor: 'var(--calculator-bg)', borderBottom: '2px solid var(--accent-color)'}}>
                        <tr>
                          <th style={{padding: 12, textAlign: 'center'}}>일차</th>
                          <th style={{padding: 12}}>수익금</th>
                          <th style={{padding: 12}}>총 원금</th>
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
          )}

          <div className="info-section">
            {view === 'scientific' ? (
              <>
                <h3>공학용 계산기 가이드</h3>
                <p>본 계산기는 삼각함수, 로그, 거듭제곱 등 정밀한 수학 연산을 지원합니다.</p>
                <ul>
                  <li><strong>Enter</strong>: 결과 계산 | <strong>ESC</strong>: 전체 삭제</li>
                  <li>결과값이 나온 후 연산자를 누르면 결과값에 이어서 계산이 가능합니다.</li>
                </ul>
              </>
            ) : (
              <>
                <h3>복리의 마법 (주식 투자)</h3>
                <p>하루에 단 1%의 수익이라도 꾸준히 복리로 쌓이면 엄청난 결과를 만듭니다. 예를 들어 원금 1,000만원으로 매일 1% 수익을 낼 경우, 약 70일이면 원금의 2배가 됩니다.</p>
                <p><strong>일복리 공식</strong>: <code>최종자산 = 원금 * (1 + 이율)^기간</code></p>
                <ul>
                  <li>본 시뮬레이터는 세금 및 수수료를 제외한 순수 복리 증식을 가정합니다.</li>
                  <li>표를 통해 자산이 불어나는 과정을 시각적으로 확인해 보세요.</li>
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
