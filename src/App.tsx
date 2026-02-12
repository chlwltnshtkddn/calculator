import { useState, useEffect, useCallback } from 'react';
import { evaluate } from 'mathjs';
import { Sun, Moon, RotateCcw } from 'lucide-react';
import './App.css';

interface HistoryItem {
  expression: string;
  result: string;
}

function App() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleButtonClick = useCallback((value: string) => {
    if (value === '=') {
      try {
        if (!expression) return;
        // Basic safety: match parentheses
        let balancedExpr = expression;
        const openBrackets = (balancedExpr.match(/\(/g) || []).length;
        const closeBrackets = (balancedExpr.match(/\)/g) || []).length;
        if (openBrackets > closeBrackets) {
          balancedExpr += ')'.repeat(openBrackets - closeBrackets);
        }
        
        const evalResult = evaluate(balancedExpr).toString();
        setResult(evalResult);
        setHistory(prev => [{ expression: balancedExpr, result: evalResult }, ...prev].slice(0, 5));
        setExpression(evalResult); // Set result as current expression for further calculations
      } catch (error) {
        setResult('Error');
      }
    } else if (value === 'C') {
      setExpression('');
      setResult('0');
    } else if (value === 'DEL') {
      setExpression(prev => prev.slice(0, -1));
    } else {
      setExpression(prev => {
        // Prevent multiple operators or leading zeros if necessary
        return prev + value;
      });
    }
    
    // Remove focus from any active element to prevent Enter repeating last click
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [expression]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default browser actions for calculator keys
      const keys = ['0','1','2','3','4','5','6','7','8','9','+','-','*','/','.', '(', ')', '^', 'Enter', 'Backspace', 'Escape'];
      if (keys.includes(e.key)) {
        e.preventDefault();
      }

      if (e.key >= '0' && e.key <= '9') handleButtonClick(e.key);
      else if (['+', '-', '*', '/', '.', '(', ')', '^'].includes(e.key)) handleButtonClick(e.key);
      else if (e.key === 'Enter') handleButtonClick('=');
      else if (e.key === 'Backspace') handleButtonClick('DEL');
      else if (e.key === 'Escape') handleButtonClick('C');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleButtonClick]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const restoreHistory = (item: HistoryItem) => {
    setExpression(item.expression);
    setResult(item.result);
  };

  const buttons = [
    'sin(', 'cos(', 'tan(', 'log(', 'ln(',
    '(', ')', 'mod', 'pi', 'e',
    '7', '8', '9', '/', 'sqrt(',
    '4', '5', '6', '*', '^',
    '1', '2', '3', '-', 'abs(',
    '0', '.', 'DEL', '+', '!',
    'C', 'exp(', '=',
  ];

  return (
    <div className="container">
      <div className="calculator">
        <div className="header">
          <h2 style={{margin: 0}}>Scientific Calculator</h2>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
        
        <div className="display">
          <div className="expression" style={{wordBreak: 'break-all'}}>{expression || '\u00A0'}</div>
          <div className="result">{result}</div>
        </div>

        <div className="buttons scientific">
          {buttons.map((btn, idx) => (
            <button
              key={`${btn}-${idx}`}
              onClick={() => handleButtonClick(btn)}
              className={btn === '=' ? 'operator' : (['C', 'DEL'].includes(btn) ? 'operator' : '')}
              style={btn === '=' ? {gridColumn: 'span 3'} : {}}
            >
              {/* Ensure '(' is displayed correctly for both standalone and functions */}
              {btn === '(' ? '(' : btn.replace('(', '')}
            </button>
          ))}
        </div>
      </div>

      <div className="history">
        <div className="header">
          <h3>History</h3>
          <RotateCcw size={18} onClick={() => setHistory([])} style={{cursor: 'pointer'}} />
        </div>
        <div className="history-list">
          {history.length === 0 ? (
            <p style={{opacity: 0.5, fontSize: '0.9rem'}}>No history yet</p>
          ) : (
            history.map((item, index) => (
              <div 
                key={index} 
                className="history-item" 
                onClick={() => restoreHistory(item)}
              >
                <div className="history-exp">{item.expression} =</div>
                <div className="history-res">{item.result}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
