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
            Calculator
          </button>
          <button className={view === 'compound' ? 'active' : ''} onClick={() => setView('compound')}>
            <TrendingUp size={18} style={{ marginRight: 6 }} />
            Interest
          </button>
          <button className={view === 'about' ? 'active' : ''} onClick={() => setView('about')}>
            <Info size={18} style={{ marginRight: 6 }} />
            About
          </button>
          <button className={view === 'privacy' ? 'active' : ''} onClick={() => setView('privacy')}>
            <ShieldCheck size={18} style={{ marginRight: 6 }} />
            Privacy
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
                <h2>Scientific Calculator</h2>
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
                  Keyboard supported: 0-9, + - * / . ( ) ^, Enter(=), Backspace, Esc.
                </p>
              </section>

              <section className="info-section">
                <h3>What this calculator is for</h3>
                <p>
                  This site provides a practical scientific calculator and a daily compound interest simulator.
                  The pages are for educational and planning use only. Results are provided for guidance and should be
                  verified before real-world financial use.
                </p>
                <h4>How to use</h4>
                <ul>
                  <li>Use the calculator with functions like sin, cos, log, and ln.</li>
                  <li>Use the Interest page to check capital growth over daily compounding cycles.</li>
                  <li>All calculations are done in-browser. No formulas are sent to any server.</li>
                </ul>
              </section>
            </div>
          )}

          {view === 'compound' && (
            <section className="content-grid">
              <div className="calculator">
                <h2>Compound Interest Simulator</h2>
                <div className="compound-form">
                  <label>
                    Initial amount
                    <input
                      type="text"
                      value={formatNumber(principal)}
                      onChange={(event) => handlePrincipalChange(event.target.value)}
                      inputMode="numeric"
                      placeholder="ex) 1,000,000"
                    />
                  </label>
                  <label>
                    Days
                    <input
                      type="number"
                      value={days}
                      onChange={(event) => setDays(event.target.value)}
                      inputMode="numeric"
                      min="1"
                      placeholder="ex) 30"
                    />
                  </label>
                  <label>
                    Daily rate (%)
                    <input
                      type="number"
                      step="0.01"
                      value={rate}
                      onChange={(event) => setRate(event.target.value)}
                      min="0"
                      placeholder="ex) 0.8"
                    />
                  </label>
                  <div className="display" style={{ marginTop: 16 }}>
                    <div className="expression">Estimated total</div>
                    <div className="result">{compoundResult.total}</div>
                    <div className="expression" style={{ color: 'var(--accent-color)' }}>
                      Estimated interest: {compoundResult.interest}
                    </div>
                  </div>
                </div>
                {compoundResult.table.length > 0 && (
                  <div className="result-table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Day</th>
                          <th>Daily Interest</th>
                          <th>Balance</th>
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
              <h2>About</h2>
              <p>
                Calculator EAC is built to provide lightweight tools for everyday math and personal planning.
                All features are developed with direct purpose: calculations should be fast, predictable, and transparent.
              </p>
              <div className="card-grid">
                <article className="policy-card">
                  <h3>Site purpose</h3>
                  <p>We focus on calculators for study, finance learning, and casual analysis.</p>
                </article>
                <article className="policy-card">
                  <h3>Content policy</h3>
                  <p>
                    We do not host copied content. The site uses original explanatory text, and every output is generated from user inputs.
                  </p>
                </article>
                <article className="policy-card">
                  <h3>Update policy</h3>
                  <p>
                    Core features and terms are maintained regularly. If anything is inaccurate, users can report through email.
                  </p>
                </article>
              </div>
            </section>
          )}

          {view === 'privacy' && (
            <section className="legal-content">
              <h2>Privacy Policy</h2>
              <p>Effective date: 2026-02-01</p>
              <p>
                We collect only the minimum data necessary to run this website, such as technical logs that may be automatically
                generated by the platform for operations. We do not sell personal information.
              </p>
              <ul>
                <li>All calculations happen in your browser.</li>
                <li>We do not collect your calculation input values for marketing.</li>
                <li>Cookies are used only for basic site operation and analytics where enabled.</li>
                <li>Google Analytics is configured only for aggregate performance metrics.</li>
                <li>Users may request data deletion by contacting the address below.</li>
              </ul>
              <p>Contact: admin@calculator-eac.pages.dev</p>
            </section>
          )}

          {view === 'terms' && (
            <section className="legal-content">
              <h2>Terms of Use</h2>
              <p>
                By using this site, users agree that generated results are for reference and may contain rounding differences.
                The owner is not liable for any direct or indirect losses from real-world decisions.
              </p>
              <ul>
                <li>Do not use results as formal financial advice.</li>
                <li>Do not attempt to upload harmful or misleading content through links or forms.</li>
                <li>Abuse, spam, or unauthorized automation is restricted.</li>
              </ul>
            </section>
          )}

          {view === 'contact' && (
            <section className="legal-content">
              <h2>Contact</h2>
              <p>For policy questions or content corrections, contact us by email.</p>
              <p>
                <a href="mailto:admin@calculator-eac.pages.dev">admin@calculator-eac.pages.dev</a>
              </p>
              <div className="card-grid">
                <article className="policy-card">
                  <h3>Review response contact</h3>
                  <p>When you get a policy notice, respond with version and issue date and requested fix confirmation.</p>
                </article>
                <article className="policy-card">
                  <h3>Operation owner</h3>
                  <p>Owner contact is available on this page. All notices are answered on business days.</p>
                </article>
              </div>
            </section>
          )}
        </main>

        {view === 'calculator' && (
          <aside className="history">
            <h3><RotateCcw size={18} style={{ marginRight: 8 }} /> Recent calculations</h3>
            {history.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No history yet.</p>
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
        )}
      </div>

      <footer className="site-footer">
        <div className="footer-links">
          <button onClick={() => setView('about')}><Info size={14} /> About</button>
          <button onClick={() => setView('privacy')}><ShieldCheck size={14} /> Privacy</button>
          <button onClick={() => setView('terms')}><Gavel size={14} /> Terms</button>
          <button onClick={() => setView('contact')}><Mail size={14} /> Contact</button>
          <button onClick={() => setView('calculator')}><BookOpenText size={14} /> Calculator</button>
        </div>
        <p>© {currentYear} Calculator EAC. All rights reserved.</p>
        <p style={{ fontSize: '0.8rem', marginTop: 8 }}>
          This is a content-first utility site. Ads are placed only after policy approval and in a compliant position.
        </p>
      </footer>
    </div>
  );
}

export default App;
