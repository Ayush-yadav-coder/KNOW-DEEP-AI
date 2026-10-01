import React, { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

interface CodeStudioPrismHighlightProps {
  code: string;
  language: string;
  className?: string;
}

export const CodeStudioPrismHighlight: React.FC<CodeStudioPrismHighlightProps> = ({
  code,
  language,
  className = "",
}) => {
  const codeRef = useRef<HTMLElement>(null);

  const getPrismLang = (lang: string) => {
    switch (lang.toLowerCase()) {
      case "typescript":
      case "ts":
      case "tsx":
        return "typescript";
      case "python":
      case "py":
        return "python";
      case "sql":
        return "sql";
      case "json":
        return "json";
      case "html":
      case "xml":
      case "markup":
        return "markup";
      case "css":
        return "css";
      case "javascript":
      case "js":
      case "jsx":
      default:
        return "javascript";
    }
  };

  const prismLang = getPrismLang(language);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  return (
    <pre className={`p-3 rounded-xl bg-slate-950 font-mono text-xs overflow-x-auto border border-slate-800 text-slate-100 ${className}`}>
      <code ref={codeRef} className={`language-${prismLang}`}>
        {code}
      </code>
    </pre>
  );
};
