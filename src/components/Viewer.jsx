import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './Viewer.css'

export default function Viewer({ file, onNavigate }) {
  if (!file) {
    return (
      <main className="viewer empty">
        <div className="empty-state">
          <div className="empty-icon">🧠</div>
          <h2>Welcome to your Second Brain</h2>
          <p>Select a file from the sidebar to start reading</p>
        </div>
      </main>
    )
  }

  // Handle internal links (wiki-style [[links]])
  const processContent = (content) => {
    // Convert [[link]] to markdown links
    return content.replace(/\[\[([^\]]+)\]\]/g, (_, linkText) => {
      const parts = linkText.split('|')
      const target = parts[0].trim()
      const display = parts[1]?.trim() || target
      return `[${display}](#${encodeURIComponent(target)})`
    })
  }

  // Custom link handler
  const handleLinkClick = (href) => {
    if (href.startsWith('#')) {
      // Internal wiki link
      const target = decodeURIComponent(href.slice(1))
      // Try to find the file
      const possiblePaths = [
        `${target}.md`,
        `${target}`,
        // Search in common folders
      ]
      onNavigate(`${target}.md`)
    }
  }

  const fileName = file.path.split('/').pop().replace('.md', '')
  const modified = new Date(file.modified).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <main className="viewer">
      <header className="viewer-header">
        <h1>{fileName}</h1>
        <span className="file-meta">
          <span className="file-path">{file.path}</span>
          <span className="file-modified">Modified: {modified}</span>
        </span>
      </header>
      
      <article className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children }) => {
              if (href?.startsWith('#')) {
                return (
                  <a 
                    href={href}
                    onClick={(e) => {
                      e.preventDefault()
                      handleLinkClick(href)
                    }}
                    className="internal-link"
                  >
                    {children}
                  </a>
                )
              }
              return (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              )
            },
            code: ({ inline, className, children, ...props }) => {
              if (inline) {
                return <code className="inline-code" {...props}>{children}</code>
              }
              return (
                <pre className="code-block">
                  <code className={className} {...props}>{children}</code>
                </pre>
              )
            }
          }}
        >
          {processContent(file.content)}
        </ReactMarkdown>
      </article>
    </main>
  )
}
