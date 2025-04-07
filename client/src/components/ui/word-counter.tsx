import { useEffect, useState } from "react";

interface WordCounterProps {
  text: string;
  className?: string;
}

export function WordCounter({ text, className = "" }: WordCounterProps) {
  const [wordCount, setWordCount] = useState(0);
  
  useEffect(() => {
    if (!text) {
      setWordCount(0);
      return;
    }
    
    // Count words by splitting on whitespace and filtering out empty strings
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [text]);
  
  return (
    <div className={`text-xs text-muted-foreground ${className}`}>
      {wordCount} {wordCount === 1 ? 'word' : 'words'}
    </div>
  );
}