import React, { useState } from 'react';
import axios from 'axios';
import './styles/terminal.css';

const TerminalComponent: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/commands/run', { command: input });
      setOutput(response.data.output);
    } catch (error) {
      setOutput('Error: ' + (error.response?.data?.error || 'Command failed'));
    }
  };

  return (
    <div className="terminal">
      <form onSubmit={handleCommandSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter command"
        />
        <button type="submit">Run</button>
      </form>
      <pre>{output}</pre>
    </div>
  );
};

export default TerminalComponent;
