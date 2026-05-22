import ReactMarkdown from 'react-markdown'

interface MarkdownProps {
  children: string
  className?: string
}

export default function Markdown({ children, className = '' }: MarkdownProps) {
  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        components={{
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="w-full text-[12.5px] border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-surface-alt">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="text-left px-2.5 py-1.5 border-b border-border font-semibold text-text-muted text-[11.5px]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-2.5 py-1.5 border-b border-border text-[12.5px]">{children}</td>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-text">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-text-muted">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-4 my-1.5 space-y-0.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-4 my-1.5 space-y-0.5">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-[13px] leading-relaxed">{children}</li>
          ),
          hr: () => <hr className="border-border my-3" />,
          h1: ({ children }) => (
            <h1 className="text-base font-bold mt-3 mb-1.5">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[15px] font-bold mt-2.5 mb-1">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[14px] font-semibold mt-2 mb-1">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="my-1.5 leading-relaxed">{children}</p>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 bg-surface-alt rounded text-[12px] font-mono text-accent-deep">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-accent pl-3 my-2 text-text-muted italic">
              {children}
            </blockquote>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
