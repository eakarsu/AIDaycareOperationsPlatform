import React from 'react';
import { FaBrain } from 'react-icons/fa';

const AIOutput = ({ loading, data }) => {
  if (loading) {
    return (
      <div className="ai-output-container">
        <div className="ai-output-header">
          <FaBrain /> AI Analysis
        </div>
        <div className="ai-loading">
          <div className="spinner"></div>
          <p>AI is analyzing the data...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const formatAIText = (text) => {
    if (!text) return null;
    if (typeof text === 'object') {
      text = JSON.stringify(text, null, 2);
    }
    const str = String(text);
    const lines = str.split('\n');
    const elements = [];
    let key = 0;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        elements.push(<br key={key++} />);
      } else if (trimmed.startsWith('###')) {
        elements.push(<h3 key={key++}>{trimmed.replace(/^###\s*/, '')}</h3>);
      } else if (trimmed.startsWith('##')) {
        elements.push(<h3 key={key++}>{trimmed.replace(/^##\s*/, '')}</h3>);
      } else if (trimmed.startsWith('#')) {
        elements.push(<h3 key={key++}>{trimmed.replace(/^#\s*/, '')}</h3>);
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.match(/^\d+\./)) {
        const bulletText = trimmed.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '');
        elements.push(
          <ul key={key++}><li>{formatBold(bulletText)}</li></ul>
        );
      } else if (trimmed.includes(':') && trimmed.indexOf(':') < 40 && !trimmed.startsWith('http')) {
        const colonIdx = trimmed.indexOf(':');
        const label = trimmed.substring(0, colonIdx);
        const value = trimmed.substring(colonIdx + 1).trim();
        elements.push(
          <p key={key++}><strong>{label}:</strong> {value}</p>
        );
      } else {
        elements.push(<p key={key++}>{formatBold(trimmed)}</p>);
      }
    });

    return elements;
  };

  const formatBold = (text) => {
    if (!text) return text;
    const parts = text.split(/\*\*(.*?)\*\*/g);
    if (parts.length === 1) return text;
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  };

  const content = typeof data === 'object'
    ? data.analysis || data.result || data.response || data.recommendation || data.message || JSON.stringify(data, null, 2)
    : data;

  return (
    <div className="ai-output-container animate-in">
      <div className="ai-output-header">
        <FaBrain /> AI Analysis Results
      </div>
      <div className="ai-output-body">
        {formatAIText(content)}
      </div>
    </div>
  );
};

export default AIOutput;
