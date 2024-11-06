import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function TerminalComponent() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (input.trim() === '') return;

      setOutput((prev) => [...prev, `$ ${input}`]);
      try {
        const response = await axios.post('/api/commands/run', { command: input });
        setOutput((prev) => [...prev, response.data.output]);
      } catch (error) {
        setOutput((prev) => [...prev, `Error: ${error.response.data.message || 'Unknown error'}`]);
      }
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 font-mono">
      <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-700 px-4 py-2 flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-2 text-sm">zsh-terminal</span>
        </div>
        <div ref={outputRef} className="p-4 h-[60vh] overflow-y-auto">
          {output.map((line, index) => (
            <div key={index} className="mb-1">
              <SyntaxHighlighter language="bash" style={atomOneDark} customStyle={{ background: 'transparent', padding: 0 }}>
                {line}
              </SyntaxHighlighter>
            </div>
          ))}
        </div>
        <div className="bg-gray-700 p-4 flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="flex-grow bg-transparent outline-none"
          />
        </div>
      </div>
    </div>
  );
}
