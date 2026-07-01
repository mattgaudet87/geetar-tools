import { Link } from 'react-router-dom'
import { Brand } from './Brand'

/*
 * Shared header for every tool page: a "back to hub" button plus the brand
 * mark. Using this in each tool keeps the back affordance consistent, and any
 * future tool gets it automatically.
 */
export function ToolHeader({ wordmark }: { wordmark?: string }) {
  return (
    <header className="gt-toolhead">
      <Link to="/" className="gt-back" aria-label="Back to all tools">
        <span aria-hidden>←</span> All tools
      </Link>
      <Brand wordmark={wordmark} />
    </header>
  )
}
