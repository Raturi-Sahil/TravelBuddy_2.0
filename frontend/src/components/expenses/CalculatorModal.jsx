import { Delete, X } from 'lucide-react';
import { useState } from 'react';

export default function CalculatorModal({ isOpen, onClose }) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  if (!isOpen) return null;

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const backspace = () => {
    if (display.length === 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const toggleSign = () => {
    setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
  };

  const percentage = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let result;

      switch (operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          result = inputValue !== 0 ? currentValue / inputValue : 'Error';
          break;
        default:
          result = inputValue;
      }

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = () => {
    if (!operation || previousValue === null) return;

    const inputValue = parseFloat(display);
    let result;

    switch (operation) {
      case '+':
        result = previousValue + inputValue;
        break;
      case '-':
        result = previousValue - inputValue;
        break;
      case '×':
        result = previousValue * inputValue;
        break;
      case '÷':
        result = inputValue !== 0 ? previousValue / inputValue : 'Error';
        break;
      default:
        result = inputValue;
    }

    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  const Button = ({ onClick, className, children, span = 1 }) => (
    <button
      onClick={onClick}
      className={`h-16 rounded-2xl font-semibold text-xl transition-all duration-200 active:scale-95 ${className} ${
        span === 2 ? 'col-span-2' : ''
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-500 to-indigo-600">
          <h2 className="text-lg font-bold text-white">Calculator</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Display */}
        <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="text-right">
            {operation && (
              <div className="text-gray-400 text-sm mb-1">
                {previousValue} {operation}
              </div>
            )}
            <div className="text-white text-4xl font-light tracking-tight overflow-hidden text-ellipsis">
              {display.length > 12 ? parseFloat(display).toExponential(6) : display}
            </div>
          </div>
        </div>

        {/* Keypad */}
        <div className="p-4 bg-gray-50 grid grid-cols-4 gap-3">
          {/* Row 1 */}
          <Button onClick={clear} className="bg-red-100 text-red-600 hover:bg-red-200">
            AC
          </Button>
          <Button onClick={toggleSign} className="bg-gray-200 text-gray-700 hover:bg-gray-300">
            ±
          </Button>
          <Button onClick={percentage} className="bg-gray-200 text-gray-700 hover:bg-gray-300">
            %
          </Button>
          <Button onClick={() => performOperation('÷')} className={`${operation === '÷' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'} hover:bg-purple-200`}>
            ÷
          </Button>

          {/* Row 2 */}
          <Button onClick={() => inputDigit('7')} className="bg-white shadow-sm text-gray-800 hover:bg-gray-100">
            7
          </Button>
          <Button onClick={() => inputDigit('8')} className="bg-white shadow-sm text-gray-800 hover:bg-gray-100">
            8
          </Button>
          <Button onClick={() => inputDigit('9')} className="bg-white shadow-sm text-gray-800 hover:bg-gray-100">
            9
          </Button>
          <Button onClick={() => performOperation('×')} className={`${operation === '×' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'} hover:bg-purple-200`}>
            ×
          </Button>

          {/* Row 3 */}
          <Button onClick={() => inputDigit('4')} className="bg-white shadow-sm text-gray-800 hover:bg-gray-100">
            4
          </Button>
          <Button onClick={() => inputDigit('5')} className="bg-white shadow-sm text-gray-800 hover:bg-gray-100">
            5
          </Button>
          <Button onClick={() => inputDigit('6')} className="bg-white shadow-sm text-gray-800 hover:bg-gray-100">
            6
          </Button>
          <Button onClick={() => performOperation('-')} className={`${operation === '-' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'} hover:bg-purple-200`}>
            −
          </Button>

          {/* Row 4 */}
          <Button onClick={() => inputDigit('1')} className="bg-white shadow-sm text-gray-800 hover:bg-gray-100">
            1
          </Button>
          <Button onClick={() => inputDigit('2')} className="bg-white shadow-sm text-gray-800 hover:bg-gray-100">
            2
          </Button>
          <Button onClick={() => inputDigit('3')} className="bg-white shadow-sm text-gray-800 hover:bg-gray-100">
            3
          </Button>
          <Button onClick={() => performOperation('+')} className={`${operation === '+' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600'} hover:bg-purple-200`}>
            +
          </Button>

          {/* Row 5 */}
          <Button onClick={() => inputDigit('0')} span={2} className="bg-white shadow-sm text-gray-800 hover:bg-gray-100">
            0
          </Button>
          <Button onClick={inputDecimal} className="bg-white shadow-sm text-gray-800 hover:bg-gray-100">
            .
          </Button>
          <Button onClick={calculate} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/30">
            =
          </Button>
        </div>

        {/* Backspace */}
        <div className="p-4 pt-0 bg-gray-50">
          <button
            onClick={backspace}
            className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <Delete className="w-5 h-5" />
            Backspace
          </button>
        </div>
      </div>
    </div>
  );
}
