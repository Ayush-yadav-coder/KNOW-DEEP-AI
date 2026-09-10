import React from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { CodeBlock } from "./CodeBlock";

interface StreamingMessageProps {
  content: string;
  isStreaming?: boolean;
}

export function StreamingMessage({ content, isStreaming = false }: StreamingMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="max-w-[85%] md:max-w-[70%] rounded-2xl shadow-md bg-white/70 dark:bg-muted/50 backdrop-blur-md border border-white/50 dark:border-border/50 p-4">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const isInline = !match && !String(children).includes("\n");
                
                if (isInline) {
                  return (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  );
                }
                
                return (
                  <CodeBlock language={match?.[1]} className={className}>
                    {String(children)}
                  </CodeBlock>
                );
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full divide-y divide-border">
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children }) {
                return (
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/50">
                    {children}
                  </th>
                );
              },
              td({ children }) {
                return (
                  <td className="px-3 py-2 text-sm whitespace-nowrap">
                    {children}
                  </td>
                );
              },
              strong({ children }) {
                return (
                  <strong className="font-semibold text-foreground bg-primary/10 px-0.5 rounded">
                    {children}
                  </strong>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
          
          {/* Streaming cursor */}
          {isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-2 h-5 bg-primary ml-1 align-middle"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
