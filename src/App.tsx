import { useCallback, useEffect, useState } from 'react';
import { evaluate } from 'mathjs';
import { BookOpenText, Calculator, Gavel, Info, Mail, Moon, RotateCcw, ShieldCheck, Sun, TrendingUp } from 'lucide-react';
import './App.css';

type ViewMode = 'calculator' | 'compound' | 'about' | 'privacy' | 'terms' | 'contact';

interface HistoryItem {
  expression: string;
  result: string;
}

interface CompoundRow {
  day: number;
  profit: number;
  total: number;
}

function App() {
  const [view, setView] = useState<ViewMode>('calculator');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [principal, setPrincipal] = useState('');
  const [days, setDays] = useState('');
  const [rate, setRate] = useState('');
  const [compoundResult, setCompoundResult] = useState({ total: '0', interest: '0', table: [] as CompoundRow[] });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const parseNumericInput = (value: string) => value.replace(/,/g, '');

  const formatNumber = (value: string | number) => {
    const raw = typeof value === 'number' ? value.toString() : value.replace(/,/g, '');
    const num = Number(raw);
    if (!Number.isFinite(num)) return '';
    return Math.round(num).toLocaleString('ko-KR');
  };

  const handlePrincipalChange = (val: string) => {
    const clean = parseNumericInput(val);
    if (/^\d*$/.test(clean)) setPrincipal(clean);
  };

  const handleScientificClick = useCallback((value: string) => {
    if (value === '=') {
      try {
        if (!expression.trim()) return;
        let processedExpr = expression
          .replace(/mod/g, '%')
          .replace(/ln\(/g, 'log(')
          .replace(/log\(/g, 'log10(');

        const openBrackets = (processedExpr.match(/\(/g) || []).length;
        const closeBrackets = (processedExpr.match(/\)/g) || []).length;
        if (openBrackets > closeBrackets) {
          processedExpr += ')'.repeat(openBrackets - closeBrackets);
        }

        const evaluated = evaluate(processedExpr).toString();
        setResult(evaluated);
        setHistory((prev) => [{ expression, result: evaluated }, ...prev].slice(0, 8));
        setExpression(evaluated);
      } catch (error) {
        setResult('Error');
      }
      return;
    }

    if (value === 'AC') {
      setExpression('');
      setResult('0');
      return;
    }

    if (value === 'DEL') {
      setExpression((prev) => prev.slice(0, -1));
      return;
    }

    setExpression((prev) => prev + value);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [expression]);

  useEffect(() => {
    if (view !== 'calculator') return;

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      const allowedNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '+', '-', '*', '/', '(', ')', '^'];
      if (allowedNumbers.includes(key)) {
        event.preventDefault();
        handleScientificClick(key);
        return;
      }

      if (key === 'Enter') {
        event.preventDefault();
        handleScientificClick('=');
      }
      if (key === 'Backspace') {
        event.preventDefault();
        handleScientificClick('DEL');
      }
      if (key === 'Escape') {
        event.preventDefault();
        handleScientificClick('AC');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleScientificClick, view]);

  useEffect(() => {
    const p = Number(parseNumericInput(principal));
    const d = Number(parseNumericInput(days));
    const r = Number(parseNumericInput(rate)) / 100;

    if (p <= 0 || d <= 0 || rate.trim() === '') {
      setCompoundResult({ total: '0', interest: '0', table: [] });
      return;
    }

    const table: CompoundRow[] = [];
    let currentTotal = p;
    for (let i = 1; i <= d; i += 1) {
      const dailyInterest = currentTotal * r;
      currentTotal += dailyInterest;
      if (i <= 365) {
        table.push({ day: i, profit: Math.round(dailyInterest), total: Math.round(currentTotal) });
      }
    }

    setCompoundResult({
      total: formatNumber(currentTotal),
      interest: formatNumber(currentTotal - p),
      table,
    });
  }, [days, principal, rate]);

  const scientificButtons = [
    '7', '8', '9', '/', 'sin(',
    '4', '5', '6', '*', 'cos(',
    '1', '2', '3', '-', 'tan(',
    '0', '.', 'DEL', '+', '=',
    '(', ')', 'mod', 'pi', 'e',
    'log(', 'ln(', 'sqrt(', '^', 'exp(',
    'abs(', '!', 'C', 'AC',
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className="layout">
      <nav className="top-nav">
        <div className="logo">
          <Calculator size={20} />
          <span>Calculator EAC</span>
        </div>
        <div className="nav-links">
          <button className={view === 'calculator' ? 'active' : ''} onClick={() => setView('calculator')}>
            <Calculator size={18} style={{ marginRight: 6 }} />
            계산기
          </button>
          <button className={view === 'compound' ? 'active' : ''} onClick={() => setView('compound')}>
            <TrendingUp size={18} style={{ marginRight: 6 }} />
            복리이자
          </button>
          <button className={view === 'about' ? 'active' : ''} onClick={() => setView('about')}>
            <Info size={18} style={{ marginRight: 6 }} />
            소개
          </button>
          <button className={view === 'privacy' ? 'active' : ''} onClick={() => setView('privacy')}>
            <ShieldCheck size={18} style={{ marginRight: 6 }} />
            개인정보
          </button>
        </div>
        <button className="theme-toggle" onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </nav>

      <div className="container">
        <main className="main-content">
          {view === 'calculator' && (
            <div className="content-grid">
              <section className="calculator">
                <h2>과학 계산기</h2>
                <div className="display" aria-live="polite">
                  <div className="expression">{expression || ' '}</div>
                  <div className="result">{result}</div>
                </div>
                <div className="buttons">
                  {scientificButtons.map((btn) => (
                    <button
                      key={btn}
                      onClick={() => handleScientificClick(btn === 'C' ? 'AC' : btn)}
                      className={['AC', 'C', 'DEL', '='].includes(btn) ? 'operator' : ''}
                    >
                      {btn}
                    </button>
                  ))}
                </div>
                <p className="hint">
                  키보드 입력: 0-9, + - * / . ( ) ^, Enter(=), Backspace, Esc.
                </p>
              </section>

              <aside className="history">
                <h3><RotateCcw size={18} style={{ marginRight: 8 }} /> Recent Calculations</h3>
                {history.length === 0 ? (
                  <p style={{ opacity: 0.6 }}>기록이 없습니다.</p>
                ) : (
                  history.map((item, index) => (
                    <button
                      type="button"
                      key={`${item.expression}-${index}`}
                      className="history-item"
                      onClick={() => {
                        setExpression(item.expression);
                        setResult(item.result);
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', opacity: 0.7 }}>{item.expression}</div>
                      <div style={{ fontWeight: 700 }}>{item.result}</div>
                    </button>
                  ))
                )}
              </aside>

              <section className="info-section">
                <h3>이 계산기의 용도</h3>
                <p>
                  과학 계산기와 일일 복리 이자 시뮬레이터를 제공하는 유틸리티 페이지입니다.
                  교육용 및 계획 수립 용도로만 사용되며, 실제 금융 판단 이전에 반드시 검토해야 합니다.
                </p>
                <h4>사용 방법</h4>
                <ul>
                  <li>sin, cos, tan, log, ln 함수와 + - * / ( ) 같은 연산자를 사용할 수 있습니다.</li>
                  <li>복리 페이지에서 기간, 초기 금액, 일일 이율을 입력하면 누적 수익을 확인할 수 있습니다.</li>
                  <li>모든 계산은 브라우저에서 처리되며 수식 데이터가 서버로 전송되지 않습니다.</li>
                </ul>
              </section>
            </div>
          )}

          {view === 'compound' && (
            <section className="content-grid">
              <div className="calculator">
                <h2>복리 이자 시뮬레이터</h2>
                <div className="compound-form">
                  <label>
                    초기 금액
                    <input
                      type="text"
                      value={formatNumber(principal)}
                      onChange={(event) => handlePrincipalChange(event.target.value)}
                      inputMode="numeric"
                      placeholder="예) 1,000,000"
                    />
                  </label>
                  <label>
                    일수
                    <input
                      type="number"
                      value={days}
                      onChange={(event) => setDays(event.target.value)}
                      inputMode="numeric"
                      min="1"
                      placeholder="예) 30"
                    />
                  </label>
                  <label>
                    일일 이율 (%)
                    <input
                      type="number"
                      step="0.01"
                      value={rate}
                      onChange={(event) => setRate(event.target.value)}
                      min="0"
                      placeholder="예) 0.8"
                    />
                  </label>
                  <div className="display" style={{ marginTop: 16 }}>
                    <div className="expression">예상 최종 금액</div>
                    <div className="result">{compoundResult.total}</div>
                    <div className="expression" style={{ color: 'var(--accent-color)' }}>
                      예상 이자: {compoundResult.interest}
                    </div>
                  </div>
                </div>
                {compoundResult.table.length > 0 && (
                  <div className="result-table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>일수</th>
                          <th>일일 이자</th>
                          <th>잔액</th>
                        </tr>
                      </thead>
                      <tbody>
                        {compoundResult.table.map((row) => (
                          <tr key={row.day}>
                            <td>{row.day}</td>
                            <td>{formatNumber(row.profit)}</td>
                            <td>{formatNumber(row.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          )}

          {view === 'about' && (
            <section className="legal-content">
              <h2>소개</h2>
              <p>
                Calculator EAC는 일상적인 계산과 개인 계획 수립을 돕기 위해 만든 경량 유틸리티 페이지입니다.
                빠르고 예측 가능한 계산 결과를 중요하게 다룹니다.
              </p>
              <div className="card-grid">
                <article className="policy-card">
                  <h3>서비스 목적</h3>
                  <p>학습용 계산, 금융 공부, 간단한 개인 분석에 필요한 계산기를 제공합니다.</p>
                </article>
                <article className="policy-card">
                  <h3>콘텐츠 정책</h3>
                  <p>타사 콘텐츠의 단순 복사본은 사용하지 않으며, 원본 설명은 자체 제작합니다.</p>
                </article>
                <article className="policy-card">
                  <h3>운영 정책</h3>
                  <p>주요 기능과 안내문은 수시로 점검하고, 오타/오류는 신고 채널로 반영합니다.</p>
                </article>
              </div>
            </section>
          )}

          {view === 'privacy' && (
            <section className="legal-content">
              <h2>개인정보 처리방침</h2>
              <p>시행일: 2026-02-01</p>
              <p>
                최소한의 운영 데이터만 처리합니다. 플랫폼이 자동 생성하는 기술 로그가 있을 수 있습니다.
                수집된 개인 데이터는 판매하지 않습니다.
              </p>
              <ul>
                <li>모든 계산은 사용자의 브라우저에서 처리됩니다.</li>
                <li>마케팅 목적으로 계산 입력값은 수집하지 않습니다.</li>
                <li>쿠키는 기본 운영 및 분석 범위 내에서만 사용됩니다.</li>
                <li>Google Analytics는 집계 지표 분석 목적입니다.</li>
                <li>데이터 삭제 요청은 아래 메일로 접수 가능합니다.</li>
              </ul>
              <p>문의: admin@calculator-eac.pages.dev</p>
            </section>
          )}

          {view === 'terms' && (
            <section className="legal-content">
              <h2>이용약관</h2>
              <p>
                본 사이트의 계산 결과는 참고용이며 반올림 오차가 발생할 수 있습니다.
                실사용 결정의 책임은 사용자에게 있습니다.
              </p>
              <ul>
                <li>결과를 공식 투자 자문으로 사용하지 마세요.</li>
                <li>유해하거나 오해를 유발하는 콘텐츠 업로드를 금지합니다.</li>
                <li>스팸, 악성 사용, 비인가 자동화는 제한됩니다.</li>
              </ul>
            </section>
          )}

          {view === 'contact' && (
            <section className="legal-content">
              <h2>문의</h2>
              <p>정책 질문 또는 콘텐츠 수정 요청은 아래로 보내주세요.</p>
              <p>
                <a href="mailto:admin@calculator-eac.pages.dev">admin@calculator-eac.pages.dev</a>
              </p>
              <div className="card-grid">
                <article className="policy-card">
                  <h3>심사 대응</h3>
                  <p>정책 메일 수신 시, 반영 버전/요청일자/수정 완료 내용을 함께 회신해 주세요.</p>
                </article>
                <article className="policy-card">
                  <h3>운영자</h3>
                  <p>운영자 연락은 이 페이지에서 확인 가능합니다.</p>
                </article>
              </div>
            </section>
          )}
        </main>
      </div>

      <footer className="site-footer">
        <div className="footer-links">
          <button onClick={() => setView('about')}><Info size={14} /> 소개</button>
          <button onClick={() => setView('privacy')}><ShieldCheck size={14} /> 개인정보</button>
          <button onClick={() => setView('terms')}><Gavel size={14} /> 이용약관</button>
          <button onClick={() => setView('contact')}><Mail size={14} /> 문의</button>
          <button onClick={() => setView('calculator')}><BookOpenText size={14} /> 계산기</button>
        </div>
        <p>© {currentYear} Calculator EAC. All rights reserved.</p>
        <p style={{ fontSize: '0.8rem', marginTop: 8 }}>
          본 사이트는 콘텐츠 우선형 유틸리티 페이지이며, 정책 승인 후에 광고를 노출합니다.
        </p>
      </footer>
    </div>
  );
}

export default App;
