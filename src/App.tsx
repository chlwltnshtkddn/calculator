import { useState, useEffect } from 'react';
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

  const handleButtonClick = (value: string) => {
    if (value === '=') {
      try {
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
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const restoreHistory = (item: HistoryItem) => {
    setExpression(item.expression);
    setResult(item.result);
  };

  const buttons = [
    '(', ')', 'C', 'DEL',
    'sin(', 'cos(', 'tan(', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', 'log(', '=',
    'pi', 'e', 'sqrt(', '^'
  ];

  return (
    <div className="container">
      <div className="calculator">
        <div className="header">
          <h2>Scientific</h2>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
        
        <div className="display">
          <div className="expression">{expression}</div>
          <div className="result">{result}</div>
        </div>

        <div className="buttons scientific">
          {buttons.map((btn) => (
            <button
              key={btn}
              onClick={() => handleButtonClick(btn)}
              className={btn === '=' ? 'operator' : ''}
            >
              {btn}
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
