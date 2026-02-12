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
        const evalResult = evaluate(expression).toString();
        setResult(evalResult);
        const newHistory = [{ expression, result: evalResult }, ...history].slice(0, 5);
        setHistory(newHistory);
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
  }, [expression, history]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleButtonClick(e.key);
      if (['+', '-', '*', '/', '.', '(', ')'].includes(e.key)) handleButtonClick(e.key);
      if (e.key === 'Enter') handleButtonClick('=');
      if (e.key === 'Backspace') handleButtonClick('DEL');
      if (e.key === 'Escape') handleButtonClick('C');
      if (e.key === '^') handleButtonClick('^');
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

  const formatBtnText = (btn: string) => {
    if (btn.endsWith('(') && btn.length > 1) return btn.replace('(', '');
    return btn;
  };

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
          <div className="expression">{expression || '\u00A0'}</div>
          <div className="result">{result}</div>
        </div>

        <div className="buttons scientific">
          {buttons.map((btn) => (
            <button
              key={btn}
              onClick={() => handleButtonClick(btn)}
              className={btn === '=' ? 'operator' : (['C', 'DEL'].includes(btn) ? 'operator' : '')}
              style={btn === '=' ? {gridColumn: 'span 3'} : {}}
            >
              {formatBtnText(btn)}
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
