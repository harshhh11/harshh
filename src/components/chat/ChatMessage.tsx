import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Bot, User, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isLoading?: boolean;
  onRegenerate?: () => void;
}

export const ChatMessage = ({
  role,
  content,
  timestamp,
  isLoading,
  onRegenerate,
}: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex gap-3 group",
        role === "user" ? "justify-end" : ""
      )}
    >
      {role === "assistant" && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose to-rose-muted flex items-center justify-center flex-shrink-0 mt-1">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
      
      <div className="flex flex-col max-w-[85%]">
        <div
          className={cn(
            "rounded-2xl p-4",
            role === "assistant"
              ? "bg-muted"
              : "bg-rose text-primary-foreground"
          )}
        >
          {role === "assistant" ? (
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const isInline = !match && !className;
                    
                    if (isInline) {
                      return (
                        <code
                          className="bg-secondary px-1.5 py-0.5 rounded text-sm font-mono text-rose"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    
                    return (
                      <div className="relative my-3 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between bg-secondary/80 px-3 py-1.5 text-xs text-muted-foreground">
                          <span>{match ? match[1] : "code"}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(String(children));
                            }}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match ? match[1] : "text"}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            borderRadius: 0,
                            fontSize: "0.875rem",
                          }}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    );
                  },
                  p({ children }) {
                    return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>;
                  },
                  ul({ children }) {
                    return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
                  },
                  li({ children }) {
                    return <li className="ml-2">{children}</li>;
                  },
                  h1({ children }) {
                    return <h1 className="text-xl font-bold mb-2 mt-3">{children}</h1>;
                  },
                  h2({ children }) {
                    return <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>;
                  },
                  h3({ children }) {
                    return <h3 className="text-base font-bold mb-2 mt-2">{children}</h3>;
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-2 border-rose pl-4 italic my-2 text-muted-foreground">
                        {children}
                      </blockquote>
                    );
                  },
                  a({ href, children }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-rose hover:underline"
                      >
                        {children}
                      </a>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-2">
                        <table className="min-w-full border border-border rounded-lg">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return (
                      <th className="border border-border bg-secondary px-3 py-2 text-left font-semibold">
                        {children}
                      </th>
                    );
                  },
                  td({ children }) {
                    return (
                      <td className="border border-border px-3 py-2">{children}</td>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
              {isLoading && (
                <span className="inline-block w-2 h-4 bg-rose animate-pulse ml-1" />
              )}
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          )}
        </div>

        {/* Actions */}
        <div
          className={cn(
            "flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
            role === "user" ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          {role === "assistant" && !isLoading && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-success" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
              {onRegenerate && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={onRegenerate}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {role === "user" && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
          <User className="h-4 w-4 text-foreground" />
        </div>
      )}
    </div>
  );
};
