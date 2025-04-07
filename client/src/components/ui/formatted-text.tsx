import React from 'react';

interface FormattedTextProps {
  content: string;
  className?: string;
}

export function FormattedText({ content, className = "" }: FormattedTextProps) {
  if (!content) return null;

  return (
    <div className={`prose prose-sm dark:prose-invert ${className}`}>
      {content.split('\n').map((line, index) => {
        // Handle markdown-like headers
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-xl font-bold mt-4 mb-2 text-primary">{line.substring(2)}</h1>;
        } else if (line.startsWith('## ')) {
          return <h2 key={index} className="text-lg font-bold mt-3 mb-2 text-primary/90">{line.substring(3)}</h2>;
        } else if (line.startsWith('### ')) {
          return <h3 key={index} className="text-md font-bold mt-2 mb-1 text-primary/80">{line.substring(4)}</h3>;
        } else if (line.startsWith('- ')) {
          return (
            <div key={index} className="flex items-start ml-2 mb-1">
              <div className="text-primary mr-2">•</div>
              <div>{line.substring(2)}</div>
            </div>
          );
        } else if (line.match(/^\d+\.\s/)) {
          const num = line.substring(0, line.indexOf('.'));
          return (
            <div key={index} className="flex items-start ml-2 mb-1">
              <div className="text-primary mr-2 font-medium min-w-[20px]">{num}.</div>
              <div>{line.substring(line.indexOf(' ') + 1)}</div>
            </div>
          );
        } else if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={index} className="font-bold mb-1">{line.substring(2, line.length - 2)}</p>;
        } else if (line.includes('*') && !line.startsWith('*') && !line.endsWith('*')) {
          // Handle inline italics
          const parts = line.split(/(\*[^*]+\*)/g);
          return (
            <p key={index} className="mb-1">
              {parts.map((part, i) => {
                if (part.startsWith('*') && part.endsWith('*')) {
                  return <em key={i} className="italic">{part.substring(1, part.length - 1)}</em>;
                }
                return <span key={i}>{part}</span>;
              })}
            </p>
          );
        } else if (line.trim() === '') {
          return <div key={index} className="h-2"></div>;
        } else {
          return <p key={index} className="mb-1">{line}</p>;
        }
      })}
    </div>
  );
}