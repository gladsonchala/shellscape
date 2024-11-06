import React, { useState, useRef, useEffect } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { ChevronRight, Wifi, WifiOff } from 'lucide-react';
import { io } from 'socket.io-client';

SyntaxHighlighter.registerLanguage('bash', bash);

const socket = io('http://localhost:3000');

export default function Terminal() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isConnected, setIsConnected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      setOutput(prev => [...prev, '🟢 Connected to terminal server']);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setOutput(prev => [...prev, '🔴 Disconnected from terminal server']);
    });

    socket.on('output', (data: string) => {
      setOutput(prev => [...prev, data]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('output');
    };
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateHistory('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateHistory('down');
    }
  };

  const navigateHistory = (direction: 'up' | 'down') => {
    if (direction === 'up' && historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setInput(history[history.length - 1 - historyIndex - 1]);
    } else if (direction === 'down' && historyIndex >= 0) {
      setHistoryIndex(historyIndex - 1);
      setInput(historyIndex === 0 ? '' : history[history.length - 1 - historyIndex + 1]);
    }
  };

  const executeCommand = () => {
    if (input.trim() === '') return;
    if (!isConnected) {
      setOutput(prev => [...prev, '🔴 Not connected to server']);
      return;
    }

    setOutput(prev => [...prev, `$ ${input}`]);
    setHistory(prev => [...prev, input]);
    setHistoryIndex(-1);

    socket.emit('command', input);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 font-mono">
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-700 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-sm">secure-terminal</span>
          </div>
          <div className="flex items-center">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>
        <div
          ref={outputRef}
          className="p-4 h-[60vh] overflow-y-auto"
          aria-live="polite"
          aria-label="Terminal output"
        >
          {output.map((line, index) => (
            <div key={index} className="mb-1">
              {line.startsWith('$') ? (
                <SyntaxHighlighter
                  language="bash"
                  style={atomOneDark}
                  customStyle={{ background: 'transparent', padding: 0 }}
                >
                  {line}
                </SyntaxHighlighter>
              ) : (
                <pre className="whitespace-pre-wrap">{line}</pre>
              )}
            </div>
          ))}
        </div>
        <div className="bg-gray-700 p-4 flex items-center">
          <ChevronRight className="text-green-400 mr-2" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            className="flex-grow bg-transparent outline-none"
            aria-label="Command input"
            placeholder={isConnected ? 'Type a command...' : 'Disconnected...'}
            disabled={!isConnected}
          />
        </div>
      </div>
    </div>
  );
}
