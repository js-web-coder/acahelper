import React from "react";
import { cn } from "@/lib/utils";

interface LoadingDotsProps {
  className?: string;
  text?: string;
  color?: string;
}

export function LoadingDots({ 
  className,
  text = "Loading",
  color = "primary" 
}: LoadingDotsProps) {
  return (
    <span className={cn("relative after:absolute after:animate-loading-dots", className)}>
      {text}
    </span>
  );
}

// Add this to your CSS file or in a style tag
const styles = `
@keyframes dots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60% { content: '...'; }
  80%, 100% { content: ''; }
}

.animate-loading-dots:after {
  content: '.';
  animation: dots 1.5s steps(5, end) infinite;
}
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}
